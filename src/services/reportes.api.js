// src/services/reportes.api.js
import { DEMO_DATA } from "../data/demoData";
import http from "./http";

const DEMO_MODE = true;
const BASE = "/api/Reportes";
const STORAGE_KEY = "rsv_demo_reportes";
const USUARIOS_STORAGE_KEY = "rsv_demo_usuarios";

const clone = (value) => JSON.parse(JSON.stringify(value));

const parseJson = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const normalizeText = (value) => String(value || "").trim();

const normalizeEstado = (estado, visto) => {
  if (estado) {
    const value = normalizeText(estado).toLowerCase();
    if (value === "pendiente") return "Pendiente";
    if (value === "en revision" || value === "en revisión") return "En revision";
    if (value === "resuelto" || value === "atendido") return "Resuelto";
    if (value === "cancelado") return "Cancelado";
    if (value === "rechazado") return "Rechazado";
  }
  return visto ? "Resuelto" : "Pendiente";
};

const isVisto = (estado, visto) => {
  const normalized = normalizeEstado(estado, visto);
  return ["Resuelto", "Cancelado", "Rechazado"].includes(normalized);
};

const getStoredUsuarios = () =>
  parseJson(localStorage.getItem(USUARIOS_STORAGE_KEY), DEMO_DATA.usuarios || []);

const getTiposReporteDemo = () =>
  clone(DEMO_DATA.catalogos?.tiposReporte || DEMO_DATA.tiposReporte || []);

const getEstadosReporteDemo = () =>
  clone(DEMO_DATA.estados?.reportes || []).map((estado) => ({
    ...estado,
    label:
      estado.label === "Atendido"
        ? "Resuelto"
        : estado.label || estado.value || "Pendiente",
    value:
      estado.value === "atendido"
        ? "resuelto"
        : estado.value || String(estado.label || "").toLowerCase(),
  }));

const getPrioridadesDemo = () =>
  clone(DEMO_DATA.estados?.prioridades || []).map((prioridad) => ({
    ...prioridad,
    value: prioridad.value || prioridad.label,
    label: prioridad.label || prioridad.value,
  }));

const getUsuarioId = (usuario) =>
  Number(usuario?.usuarioID ?? usuario?.id ?? usuario?.userId);

const fullName = (item, fallback = "") =>
  [
    item?.nombre,
    item?.apellidoPaterno ?? item?.apellidoP,
    item?.apellidoMaterno ?? item?.apellidoM,
  ]
    .filter(Boolean)
    .join(" ") ||
  fallback ||
  "";

const getUsuarioById = (usuarioID) =>
  getStoredUsuarios().find(
    (usuario) => getUsuarioId(usuario) === Number(usuarioID)
  );

const getTipoReporte = (tipoReporteID) =>
  getTiposReporteDemo().find(
    (tipo) => Number(tipo.tipoReporteID) === Number(tipoReporteID)
  );

const normalizeReporte = (reporte) => {
  const reporteID = Number(reporte.reporteID ?? reporte.id);
  const usuarioID =
    reporte.usuarioID === null || reporte.usuarioID === undefined
      ? null
      : Number(reporte.usuarioID);
  const tipoReporteID = Number(reporte.tipoReporteID || 6);
  const usuario = usuarioID ? getUsuarioById(usuarioID) : null;
  const tipo = getTipoReporte(tipoReporteID) || {};
  const estado = normalizeEstado(reporte.estado, reporte.visto);
  const esAnonimo = reporte.esAnonimo === true;
  const prioridad = reporte.prioridad || "Media";

  return {
    ...reporte,
    id: reporteID,
    reporteID,
    usuarioID,
    tipoReporteID,
    titulo: normalizeText(reporte.titulo),
    descripcion: normalizeText(reporte.descripcion),
    latitud: Number(reporte.latitud ?? 20.67361),
    longitud: Number(reporte.longitud ?? -103.34412),
    direccionTexto: normalizeText(reporte.direccionTexto),
    esAnonimo,
    fechaCreacion: reporte.fechaCreacion || new Date().toISOString(),
    fechaActualizacion: reporte.fechaActualizacion || reporte.fechaCreacion || new Date().toISOString(),
    visto: isVisto(estado, reporte.visto),
    estado,
    prioridad,
    imagen: reporte.imagen || reporte.imagenBase64 || null,
    nombreUsuario: esAnonimo
      ? null
      : reporte.nombreUsuario ||
        (usuario ? fullName(usuario, usuario.usuario) : usuarioID ? `Usuario #${usuarioID}` : ""),
    tipoReporte: reporte.tipoReporte || tipo.nombre || "Otro",
    email: esAnonimo ? "" : reporte.email || usuario?.email || "",
    telefono: esAnonimo ? "" : reporte.telefono || usuario?.telefono || "",
    numeroCasa: esAnonimo ? "" : reporte.numeroCasa || usuario?.numeroCasa || "",
    calle: esAnonimo ? "" : reporte.calle || usuario?.calle || "",
  };
};

function initializeReportes(force = false) {
  const hasReportes = localStorage.getItem(STORAGE_KEY);
  if (force || !hasReportes) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(clone(DEMO_DATA.reportes || []))
    );
  }
}

function getReportes() {
  initializeReportes();
  return parseJson(localStorage.getItem(STORAGE_KEY), [])
    .map(normalizeReporte)
    .sort(
      (a, b) =>
        new Date(b.fechaCreacion || 0).getTime() -
        new Date(a.fechaCreacion || 0).getTime()
    );
}

function saveReportes(reportes) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify((reportes || []).map(normalizeReporte))
  );
  return getReportes();
}

function validateReporte(payload) {
  if (!payload.titulo?.trim()) throw new Error("El titulo es obligatorio.");
  if (!payload.descripcion?.trim()) {
    throw new Error("La descripcion es obligatoria.");
  }
  if (!payload.tipoReporteID) {
    throw new Error("Selecciona un tipo de reporte.");
  }
  if (!payload.prioridad) throw new Error("Selecciona una prioridad.");
  if (!payload.estado) throw new Error("Selecciona un estado.");
  if (!payload.esAnonimo && !payload.usuarioID) {
    throw new Error("Selecciona un residente o marca el reporte como anonimo.");
  }
  if (!payload.direccionTexto?.trim()) {
    throw new Error("La ubicacion es obligatoria.");
  }
  if (
    Number.isNaN(Number(payload.latitud)) ||
    Number.isNaN(Number(payload.longitud))
  ) {
    throw new Error("Las coordenadas deben ser validas.");
  }
  if (
    payload.fechaCreacion &&
    Number.isNaN(new Date(payload.fechaCreacion).getTime())
  ) {
    throw new Error("La fecha del reporte no es valida.");
  }
}

const buildPayload = (data) => {
  const estado = normalizeEstado(data.estado, data.visto);

  return {
    usuarioID: data.esAnonimo ? null : Number(data.usuarioID || 0),
    tipoReporteID: Number(data.tipoReporteID || 0),
    titulo: normalizeText(data.titulo),
    descripcion: normalizeText(data.descripcion),
    latitud: Number(data.latitud),
    longitud: Number(data.longitud),
    direccionTexto: normalizeText(data.direccionTexto),
    esAnonimo: data.esAnonimo === true,
    fechaCreacion: data.fechaCreacion || new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    estado,
    visto: isVisto(estado, data.visto),
    prioridad: data.prioridad || "Media",
    imagen: data.imagenBase64 || data.imagen || null,
  };
};

const updateReporte = (id, data) => {
  const reportes = getReportes();
  const index = reportes.findIndex(
    (item) => Number(item.reporteID) === Number(id)
  );

  if (index < 0) throw new Error("Reporte no encontrado");

  const updated = normalizeReporte({
    ...reportes[index],
    ...data,
    reporteID: Number(id),
    fechaActualizacion: new Date().toISOString(),
  });

  saveReportes([
    ...reportes.slice(0, index),
    updated,
    ...reportes.slice(index + 1),
  ]);

  return updated;
};

const changeStatus = (id, estado) =>
  updateReporte(id, {
    estado,
    visto: isVisto(estado),
  });

export const ReportesAPI = {
  async list() {
    if (DEMO_MODE) return getReportes();
    const res = await http.get(BASE);
    return Array.isArray(res) ? res.map(normalizeReporte) : [];
  },

  async getById(id) {
    if (DEMO_MODE) {
      const reporte = getReportes().find(
        (item) => Number(item.reporteID) === Number(id)
      );
      if (!reporte) throw new Error("Reporte no encontrado");
      return reporte;
    }
    return normalizeReporte(await http.get(`${BASE}/${id}`));
  },

  async listByUsuario(usuarioId) {
    if (DEMO_MODE) {
      return getReportes().filter(
        (item) => Number(item.usuarioID) === Number(usuarioId)
      );
    }
    const res = await http.get(`${BASE}/usuario/${usuarioId}`);
    return Array.isArray(res) ? res.map(normalizeReporte) : [];
  },

  async tiposReporte() {
    if (DEMO_MODE) return getTiposReporteDemo();
    const res = await http.get(`${BASE}/tipos-reporte`);
    return Array.isArray(res)
      ? res.map((t) => ({
          tipoReporteID: t.tipoReporteID,
          nombre: t.nombre,
          activo: t.activo !== false,
        }))
      : [];
  },

  async getTipos() {
    return this.tiposReporte();
  },

  async getTiposReporte() {
    return this.tiposReporte();
  },

  async getEstados() {
    if (DEMO_MODE) return getEstadosReporteDemo();
    return [];
  },

  async getPrioridades() {
    if (DEMO_MODE) return getPrioridadesDemo();
    return [];
  },

  async create(data) {
    const payload = buildPayload(data);

    if (!DEMO_MODE) {
      validateReporte(payload);
      const res = await http.post(BASE, payload);
      return res?.reporteID ? normalizeReporte(res) : res;
    }

    validateReporte(payload);

    const reportes = getReportes();
    const nextId =
      reportes.reduce(
        (max, reporte) => Math.max(max, Number(reporte.reporteID)),
        0
      ) + 1;

    const nuevo = normalizeReporte({
      ...payload,
      reporteID: nextId,
    });

    saveReportes([...reportes, nuevo]);
    return nuevo;
  },

  async update(id, data) {
    const current = await this.getById(id);
    const payload = buildPayload({ ...current, ...data });

    if (!DEMO_MODE) return http.put(`${BASE}/${id}`, payload);

    validateReporte(payload);
    return updateReporte(id, payload);
  },

  async remove(id) {
    if (!DEMO_MODE) return http.delete(`${BASE}/${id}`);

    const reportes = getReportes();
    const next = reportes.filter(
      (item) => Number(item.reporteID) !== Number(id)
    );
    if (next.length === reportes.length) throw new Error("Reporte no encontrado");
    saveReportes(next);
    return true;
  },

  async delete(id) {
    return this.remove(id);
  },

  async cancelar(id) {
    if (!DEMO_MODE) return http.put(`${BASE}/${id}/cancelar`);
    return changeStatus(id, "Cancelado");
  },

  async cambiarEstado(id, estado) {
    if (!DEMO_MODE) return http.put(`${BASE}/${id}/estado`, { estado });
    return changeStatus(id, estado);
  },

  async changeStatus(id, estado) {
    return this.cambiarEstado(id, estado);
  },

  async marcarEnRevision(id) {
    return this.cambiarEstado(id, "En revision");
  },

  async enRevision(id) {
    return this.marcarEnRevision(id);
  },

  async resolver(id) {
    return this.cambiarEstado(id, "Resuelto");
  },

  async resolve(id) {
    return this.resolver(id);
  },

  async rechazar(id) {
    return this.cambiarEstado(id, "Rechazado");
  },

  async reject(id) {
    return this.rechazar(id);
  },

  async marcarVisto(id, visto = true) {
    if (!DEMO_MODE) return http.put(`${BASE}/${id}/estado`, { visto: !!visto });
    return changeStatus(id, visto ? "Resuelto" : "Pendiente");
  },

  async setAnonimato(id, esAnonimo) {
    if (!DEMO_MODE) {
      return http.put(`${BASE}/${id}/anonimato`, { esAnonimo: !!esAnonimo });
    }
    return updateReporte(id, { esAnonimo: !!esAnonimo });
  },

  async fileToBase64(file) {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  restoreDemoReportes() {
    initializeReportes(true);
    return getReportes();
  },
};

export default ReportesAPI;
