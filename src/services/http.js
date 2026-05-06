// src/services/http.js

// Base del backend (ej. http://localhost:5165 o http://localhost:5165/api).
// Usa VITE_API_BASE_URL si existe; si no, por defecto localhost:5165
let API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5165";

// Quita solo el "/" final si existe
API_BASE = API_BASE.replace(/\/$/, "");

// Prefijo por defecto del backend
const RAW_PREFIX = "/api";

// Si la base YA termina en "/api", no agregamos otro "/api"
const API_PREFIX = API_BASE.endsWith("/api") ? "" : RAW_PREFIX;

// Une dos segmentos de forma segura
const join = (a, b) => `${a}${b.startsWith("/") ? "" : "/"}${b}`;

/**
 * Manejo de sesión mínimo vía localStorage.
 * session puede contener { token | accessToken | jwt, role, userId, ... }.
 */
export const auth = {
  /** Obtiene la sesión actual desde localStorage (o null). */
  get() {
    try {
      return JSON.parse(localStorage.getItem("session")) || null;
    } catch {
      return null;
    }
  },
  /** Guarda una sesión (objeto). */
  set(v) {
    localStorage.setItem("session", JSON.stringify(v));
  },
  /** Elimina la sesión. */
  clear() {
    localStorage.removeItem("session");
  },
};

/**
 * Construye una URL hacia el backend, aceptando paths con o sin "/api"
 * y agregando query params (si se pasan).
 */
export function buildUrl(path, params) {
  // Si el path ya viene con "/api", lo dejamos; si no, le anteponemos el prefijo calculado.
  const clean = path.startsWith("/api") ? path : `${API_PREFIX}${path}`;

  const url = new URL(join(API_BASE || window.location.origin, clean));

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  // Si API_BASE es absoluto, regresa absoluto; si no, relativo al origin actual.
  return API_BASE
    ? url.toString()
    : url.toString().replace(`${window.location.origin}`, "");
}

/**
 * Lee la respuesta de fetch y normaliza errores.
 * - 204 → null
 * - 5xx → mensaje genérico "Error del servidor"
 * - JSON/Blob/Text según content-type
 */
async function handle(res) {
  if (res.status === 204) return null;

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const isBlob =
    ct.includes("application/octet-stream") ||
    ct.includes("application/pdf") ||
    ct.includes("image/");

  let data;
  try {
    if (isJson) data = await res.json();
    else if (isBlob) data = await res.blob();
    else data = await res.text();
  } catch {
    data = null;
  }

  if (!res.ok) {
    let msg =
      (isJson && (data?.message || data?.error || data?.title)) ||
      (typeof data === "string" && data) ||
      `HTTP ${res.status}`;

    // Mensaje discreto para errores del servidor
    if (res.status >= 500) msg = "Error del servidor";

    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Construye headers finales para la petición:
 * - Content-Type: application/json (salvo FormData)
 * - Authorization: Bearer <token> si hay sesión con token
 */
function buildHeaders(baseHeaders, body) {
  const headers = { ...(baseHeaders || {}) };

  const isForm = body instanceof FormData;
  if (body != null && !isForm && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const session = auth.get();
  const token = session?.token || session?.accessToken || session?.jwt;
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Cliente fetch genérico con:
 * - Timeout 15s (AbortController)
 * - Soporte responseType "blob" | "text"
 * - Envía FormData sin tocar Content-Type
 */
async function request(
  method,
  path,
  { body, params, headers, signal, credentials, responseType } = {}
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s

  try {
    const isForm = body instanceof FormData;
    const res = await fetch(buildUrl(path, params), {
      method,
      headers: buildHeaders(headers, body),
      body: body != null && !isForm ? JSON.stringify(body) : body,
      signal: signal || controller.signal,
      credentials: credentials || "same-origin", // usa 'include' si hay cookies cross-site
    });

    if (responseType === "blob") return await res.blob();
    if (responseType === "text") return await res.text();
    return await handle(res);
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Tiempo de espera agotado");
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * API pública: métodos HTTP, upload y download.
 */
export const http = {
  /** GET con opciones (params, headers, signal...). */
  get: (path, opts) => request("GET", path, opts),

  /** POST con body (objeto o FormData si usas http.upload). */
  post: (path, body, opts) => request("POST", path, { ...opts, body }),

  /** PUT con body (objeto). */
  put: (path, body, opts) => request("PUT", path, { ...opts, body }),

  /** PATCH con body (objeto). */
  patch: (path, body, opts) => request("PATCH", path, { ...opts, body }),

  /** DELETE simple (nombre corto). */
  del: (path, opts) => request("DELETE", path, opts),

  //  Alias estilo Axios para que funcione http.delete(...)
  delete: (path, opts) => request("DELETE", path, opts),

  /** Subida de archivos con FormData (no se fuerza Content-Type). */
  upload: (path, formData, opts) =>
    request("POST", path, { ...(opts || {}), body: formData }),

  /** Descarga como Blob y dispara guardado en navegador. */
  download: (path, { params, headers, filename } = {}) =>
    request("GET", path, { params, headers, responseType: "blob" }).then(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return true;
      }
    ),
};

/**
 * Utilidades de fecha para normalizar a ISO (útil en services).
 */
export const dateUtils = {
  /** Convierte a 'YYYY-MM-DD' (o null). */
  toIsoDate(d) {
    if (!d) return null;
    const x = typeof d === "string" ? new Date(d) : d;
    return x.toISOString().slice(0, 10);
  },
  /** Convierte a ISO completo (o null). */
  toIsoDateTime(d) {
    if (!d) return null;
    const x = typeof d === "string" ? new Date(d) : d;
    return x.toISOString();
  },
};

// 🔹 Export default para que funcione: import http from "./http";
export default http;
