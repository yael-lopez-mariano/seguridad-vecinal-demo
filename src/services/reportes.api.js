// services/reportes.api.js
import http from "./http";

const BASE = "/api/Reportes";

/**
 * Mapea un reporte del backend a un modelo plano del frontend.
 * (Útil por si luego cambian nombres o agregas campos derivados)
 */
const mapReporte = (r) => ({
  reporteID: r.reporteID,
  usuarioID: r.usuarioID ?? null,
  tipoReporteID: r.tipoReporteID,
  titulo: r.titulo,
  descripcion: r.descripcion,
  latitud: r.latitud,
  longitud: r.longitud,
  direccionTexto: r.direccionTexto,
  esAnonimo: !!r.esAnonimo,
  fechaCreacion: r.fechaCreacion,
  visto: !!r.visto,
  imagen: r.imagen ?? null,
  // Extras que tu API devuelve en algunos endpoints:
  nombreUsuario: r.nombreUsuario ?? r.nombreCompleto ?? null,
  tipoReporte: r.tipoReporte ?? null,
  email: r.email ?? "",
  telefono: r.telefono ?? "",
  numeroCasa: r.numeroCasa ?? "",
  calle: r.calle ?? "",
});

/**
 * Valida el payload para crear reporte.
 * Lanza Error con mensaje legible si algo falta.
 */
const validateCreate = (data) => {
  const required = [
    "tipoReporteID",
    "titulo",
    "descripcion",
    "latitud",
    "longitud",
    "direccionTexto",
  ];
  for (const k of required) {
    if (
      data[k] === undefined ||
      data[k] === null ||
      (typeof data[k] === "string" && data[k].trim() === "")
    ) {
      throw new Error(`Te falta registrar ${k}`);
    }
  }
  if (typeof data.tipoReporteID !== "number") {
    throw new Error("tipoReporteID debe ser numérico");
  }
  if (typeof data.latitud !== "number" || typeof data.longitud !== "number") {
    throw new Error("latitud y longitud deben ser numéricos");
  }
};

export const ReportesAPI = {
  /**
   * GET /api/Reportes
   */
  async list() {
    const res = await http.get(BASE);
    return Array.isArray(res) ? res.map(mapReporte) : [];
  },

  /**
   * GET /api/Reportes/{id}
   */
  async getById(id) {
    const res = await http.get(`${BASE}/${id}`);
    return mapReporte(res);
  },

  /**
   * GET /api/Reportes/usuario/{usuarioId}
   */
  async listByUsuario(usuarioId) {
    const res = await http.get(`${BASE}/usuario/${usuarioId}`);
    return Array.isArray(res) ? res.map(mapReporte) : [];
  },

  /**
   * GET /api/Reportes/tipos-reporte
   */
  async tiposReporte() {
    const res = await http.get(`${BASE}/tipos-reporte`);
    // Normaliza por si luego quieres mostrar solo activos
    return Array.isArray(res)
      ? res.map((t) => ({
          tipoReporteID: t.tipoReporteID,
          nombre: t.nombre,
          activo: t.activo !== false,
        }))
      : [];
  },

  /**
   * POST /api/Reportes
   * data: {
   *   usuarioID?: number | null,
   *   tipoReporteID: number,
   *   titulo: string,
   *   descripcion: string,
   *   latitud: number,
   *   longitud: number,
   *   direccionTexto: string,
   *   esAnonimo: boolean,
   *   imagenBase64?: string | null
   * }
   */
  async create(data) {
    // Normaliza valores
    const payload = {
      usuarioID: data.esAnonimo ? 0 : Number(data.usuarioID || 0),
      tipoReporteID: Number(data.tipoReporteID),
      titulo: String(data.titulo || "").trim(),
      descripcion: String(data.descripcion || "").trim(),
      latitud: Number(data.latitud),
      longitud: Number(data.longitud),
      direccionTexto: String(data.direccionTexto || "").trim(),
      esAnonimo: !!data.esAnonimo,
      imagenBase64: data.imagenBase64 || null,
    };

    validateCreate(payload);

    const res = await http.post(BASE, payload);
    // la API devuelve 200 OK; si te regresa el objeto creado, lo mapeamos:
    return res && res.reporteID ? mapReporte(res) : res;
  },

  /**
   * PUT /api/Reportes/{id}/estado
   * body: { visto: boolean }
   */
  async marcarVisto(id, visto = true) {
    const res = await http.put(`${BASE}/${id}/estado`, { visto: !!visto });
    // API responde { message: "Estado del reporte actualizado" }
    return res;
  },

  /**
   * PUT /api/Reportes/{id}/anonimato
   * body: { esAnonimo: boolean }
   */
  async setAnonimato(id, esAnonimo) {
    const res = await http.put(`${BASE}/${id}/anonimato`, {
      esAnonimo: !!esAnonimo,
    });
    // API responde { message: "Anonimato del reporte actualizado" }
    return res;
  },

  /**
   * Utilidad: convierte un File/Blob de imagen a Base64 (para imagenBase64).
   * Uso: const b64 = await ReportesAPI.fileToBase64(file);
   */
  async fileToBase64(file) {
    if (!file) return null;
    const asDataURL = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    // tu API acepta "imagenBase64": string (dataURL completo o solo base64, según tu backend)
    return String(asDataURL);
  },
};

export default ReportesAPI;
