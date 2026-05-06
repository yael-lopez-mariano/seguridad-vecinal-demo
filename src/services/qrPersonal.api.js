// src/services/qrPersonal.api.js
import { DEMO_DATA } from "../data/demoData";
import { http } from "./http";

const DEMO_MODE = true;
const BASE = "/QRPersonal";
const STORAGE_KEY = "rsv_demo_qr_personales";
const USUARIOS_STORAGE_KEY = "rsv_demo_usuarios";
const INVITADOS_STORAGE_KEY = "rsv_demo_invitados";

const clone = (value) => JSON.parse(JSON.stringify(value));

const parseJson = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const normalizeDateOnly = (value) => (value ? String(value).slice(0, 10) : "");

const normalizeDateTime = (value, fallbackDate) => {
  if (value) return new Date(value).toISOString();
  if (fallbackDate) return new Date(`${fallbackDate}T23:59:00`).toISOString();
  return null;
};

const getStoredUsuarios = () =>
  parseJson(localStorage.getItem(USUARIOS_STORAGE_KEY), DEMO_DATA.usuarios || []);

const getStoredInvitados = () =>
  parseJson(localStorage.getItem(INVITADOS_STORAGE_KEY), DEMO_DATA.invitados || []);

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

const invitadoName = (item) =>
  [
    item?.nombreInvitado,
    item?.apellidoPaternoInvitado,
    item?.apellidoMaternoInvitado,
  ]
    .filter(Boolean)
    .join(" ");

const getUsuarioById = (usuarioID) =>
  getStoredUsuarios().find(
    (usuario) => Number(usuario.usuarioID ?? usuario.id) === Number(usuarioID)
  );

const getInvitadoById = (invitadoID) =>
  getStoredInvitados().find(
    (invitado) => Number(invitado.invitadoID ?? invitado.id) === Number(invitadoID)
  );

const generateCodigo = (id) => `RSV-QR-2026-${String(id).padStart(4, "0")}`;

const resolveEstado = (qr) => {
  if (qr.estado === "Cancelado" || qr.estado === "Usado" || qr.estado === "Pendiente") {
    return qr.estado;
  }

  const vencimiento = qr.fechaVencimiento ? new Date(qr.fechaVencimiento) : null;
  if (vencimiento && !Number.isNaN(vencimiento.getTime()) && vencimiento < new Date()) {
    return "Vencido";
  }

  return qr.activo === false ? qr.estado || "Cancelado" : qr.estado || "Activo";
};

const normalizeQr = (qr) => {
  const qrid = Number(qr.qrid ?? qr.qrID ?? qr.id);
  const usuarioID = qr.usuarioID == null ? null : Number(qr.usuarioID);
  const invitadoID = qr.invitadoID == null ? null : Number(qr.invitadoID);
  const usuario = usuarioID ? getUsuarioById(usuarioID) : null;
  const invitado = invitadoID ? getInvitadoById(invitadoID) : null;
  const fechaInicio = normalizeDateOnly(qr.fechaInicio || qr.fechaGeneracion);
  const fechaVencimiento = normalizeDateTime(qr.fechaVencimiento, qr.fechaVencimiento);
  const codigoQR = qr.codigoQR || qr.codigo || generateCodigo(qrid);
  const base = {
    ...qr,
    qrid,
    qrID: qrid,
    id: qrid,
    usuarioID,
    invitadoID,
    tipoQR: qr.tipoQR || (invitadoID ? "Invitado" : "Personal"),
    descripcion: qr.descripcion || "",
    codigoQR,
    codigo: codigoQR,
    fechaGeneracion: qr.fechaGeneracion || new Date().toISOString(),
    fechaInicio,
    fechaVencimiento,
    usosPermitidos: Number(qr.usosPermitidos || 0),
    usosRealizados: Number(qr.usosRealizados || 0),
    observaciones: qr.observaciones || "",
    usuarioNombre:
      qr.usuarioNombre ||
      (usuario ? fullName(usuario, usuario.usuario) : usuarioID ? `Usuario #${usuarioID}` : ""),
    invitadoNombre:
      qr.invitadoNombre || (invitado ? invitadoName(invitado) : ""),
  };

  const estado = resolveEstado(base);

  return {
    ...base,
    estado,
    activo: estado === "Activo",
  };
};

function initializeQr(force = false) {
  const hasQr = localStorage.getItem(STORAGE_KEY);
  if (force || !hasQr) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(clone(DEMO_DATA.qrPersonales || []))
    );
  }
}

function getQrList() {
  initializeQr();
  return parseJson(localStorage.getItem(STORAGE_KEY), [])
    .map(normalizeQr)
    .sort((a, b) => Number(a.qrid) - Number(b.qrid));
}

function saveQrList(rows) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify((rows || []).map(normalizeQr))
  );
  return getQrList();
}

function validateQr(payload, editingId = null) {
  if (!payload.usuarioID && !payload.invitadoID) {
    throw new Error("Selecciona un usuario o invitado.");
  }
  if (!payload.tipoQR) throw new Error("Selecciona un tipo de QR.");
  if (!payload.fechaInicio) throw new Error("Selecciona la fecha de inicio.");
  if (!payload.fechaVencimiento) {
    throw new Error("Selecciona la fecha de vencimiento.");
  }
  if (new Date(payload.fechaVencimiento) <= new Date(`${payload.fechaInicio}T00:00:00`)) {
    throw new Error("La fecha de vencimiento debe ser posterior al inicio.");
  }
  if (
    payload.codigoQR &&
    getQrList().some(
      (qr) =>
        Number(qr.qrid) !== Number(editingId) &&
        qr.codigoQR.toLowerCase() === payload.codigoQR.toLowerCase()
    )
  ) {
    throw new Error("Ya existe un QR con ese codigo.");
  }
}

const QRPersonalAPI = {
  async list() {
    if (DEMO_MODE) return getQrList();
    return http.get(BASE);
  },

  async getById(id) {
    if (DEMO_MODE) {
      const qr = getQrList().find((item) => Number(item.qrid) === Number(id));
      if (!qr) throw new Error("QR no encontrado");
      return qr;
    }
    return http.get(`${BASE}/${id}`);
  },

  generar(usuarioID, payload = {}) {
    if (!DEMO_MODE) return http.post(`${BASE}/generar`, { usuarioID });

    const rows = getQrList();
    const nextId = rows.reduce((max, qr) => Math.max(max, Number(qr.qrid)), 0) + 1;
    const today = new Date().toISOString().slice(0, 10);
    const vencimiento = new Date();
    vencimiento.setFullYear(vencimiento.getFullYear() + 1);

    const nuevo = normalizeQr({
      qrid: nextId,
      qrID: nextId,
      usuarioID: Number(payload.usuarioID ?? usuarioID),
      invitadoID: payload.invitadoID ? Number(payload.invitadoID) : null,
      tipoQR: payload.tipoQR || "Personal",
      descripcion: payload.descripcion || "QR generado desde la demo",
      codigoQR: generateCodigo(nextId),
      estado: payload.estado || "Activo",
      fechaGeneracion: new Date().toISOString(),
      fechaInicio: payload.fechaInicio || today,
      fechaVencimiento:
        payload.fechaVencimiento || vencimiento.toISOString(),
      usosPermitidos: Number(payload.usosPermitidos || 0),
      usosRealizados: Number(payload.usosRealizados || 0),
      activo: true,
      observaciones: payload.observaciones || "",
    });

    validateQr(nuevo);
    saveQrList([...rows, nuevo]);
    return nuevo;
  },

  async create(payload) {
    if (!DEMO_MODE) return http.post(BASE, payload);
    return this.generar(payload.usuarioID, payload);
  },

  async update(id, payload) {
    if (!DEMO_MODE) return http.put(`${BASE}/${id}`, payload);

    const rows = getQrList();
    const index = rows.findIndex((item) => Number(item.qrid) === Number(id));
    if (index < 0) throw new Error("QR no encontrado");

    const updated = normalizeQr({
      ...rows[index],
      ...payload,
      qrid: Number(id),
      qrID: Number(id),
      fechaVencimiento: normalizeDateTime(payload.fechaVencimiento || rows[index].fechaVencimiento),
    });

    validateQr(updated, id);
    rows[index] = updated;
    saveQrList(rows);
    return updated;
  },

  getByUsuario(usuarioId) {
    if (!DEMO_MODE) return http.get(`${BASE}/usuario/${usuarioId}`);
    const rows = getQrList()
      .filter((item) => Number(item.usuarioID) === Number(usuarioId))
      .sort((a, b) => Number(b.qrid) - Number(a.qrid));
    return Promise.resolve(rows[0] || null);
  },

  actualizarEstado(id, activo) {
    if (!DEMO_MODE) return http.put(`${BASE}/${id}/estado`, { activo });
    return this.update(id, {
      activo: !!activo,
      estado: activo ? "Activo" : "Cancelado",
    });
  },

  async cancelar(id) {
    return this.update(id, { activo: false, estado: "Cancelado" });
  },

  async remove(id) {
    if (!DEMO_MODE) return http.delete(`${BASE}/${id}`);
    const rows = getQrList();
    const next = rows.filter((item) => Number(item.qrid) !== Number(id));
    if (next.length === rows.length) throw new Error("QR no encontrado");
    saveQrList(next);
    return true;
  },

  async renew(id, months = 12) {
    const qr = await this.getById(id);
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + Number(months || 12));
    return this.update(id, {
      ...qr,
      estado: "Activo",
      activo: true,
      fechaVencimiento: baseDate.toISOString(),
    });
  },

  generateCode() {
    const rows = getQrList();
    const nextId = rows.reduce((max, qr) => Math.max(max, Number(qr.qrid)), 0) + 1;
    return generateCodigo(nextId);
  },

  async getEstados() {
    if (DEMO_MODE) return clone(DEMO_DATA.estados.qrPersonales || []);
    return [];
  },

  restoreDemoQr() {
    initializeQr(true);
    return getQrList();
  },
};

export default QRPersonalAPI;
