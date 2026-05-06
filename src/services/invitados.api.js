// src/services/invitados.api.js
import { DEMO_DATA } from "../data/demoData";
import http from "./http";

const DEMO_MODE = true;
const STORAGE_KEY = "rsv_demo_invitados";
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

const getStoredUsuarios = () =>
  parseJson(localStorage.getItem(USUARIOS_STORAGE_KEY), DEMO_DATA.usuarios || []);

const getTiposVisitanteDemo = () => clone(DEMO_DATA.catalogos.tiposVisitante || []);

const getTipoVisitante = (tipoVisitanteID) =>
  getTiposVisitanteDemo().find(
    (tipo) => Number(tipo.tipoVisitanteID) === Number(tipoVisitanteID)
  );

const normalizeUsuario = (usuario) => {
  const usuarioID = Number(usuario.usuarioID ?? usuario.id ?? usuario.userId);
  const nombreResidente = [
    usuario.nombre,
    usuario.apellidoPaterno ?? usuario.apellidoP,
    usuario.apellidoMaterno ?? usuario.apellidoM,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...usuario,
    usuarioID,
    nombreResidente: nombreResidente || usuario.usuario || `Usuario #${usuarioID}`,
    numeroCasa: usuario.numeroCasa || "",
  };
};

const getUsuariosDemo = () => getStoredUsuarios().map(normalizeUsuario);

const getUsuarioById = (usuarioID) =>
  getUsuariosDemo().find(
    (usuario) => Number(usuario.usuarioID) === Number(usuarioID)
  );

const buildCodigoAcceso = (id) => `INV-2026-${String(id).padStart(4, "0")}`;

const normalizeInvitado = (invitado) => {
  const invitadoID = Number(invitado.invitadoID ?? invitado.id);
  const usuarioID = Number(invitado.usuarioID);
  const tipoVisitanteID = Number(invitado.tipoVisitanteID || 1);
  const usuario = getUsuarioById(usuarioID) || {};
  const tipoVisitante = getTipoVisitante(tipoVisitanteID) || {};
  const fechaVisita = invitado.fechaVisita
    ? String(invitado.fechaVisita).slice(0, 10)
    : "";

  return {
    ...invitado,
    invitadoID,
    id: invitadoID,
    usuarioID,
    tipoVisitanteID,
    tipoVisitanteNombre:
      invitado.tipoVisitanteNombre ?? tipoVisitante.nombre ?? "Visitante",
    nombreInvitado: normalizeText(invitado.nombreInvitado),
    apellidoPaternoInvitado: normalizeText(invitado.apellidoPaternoInvitado),
    apellidoMaternoInvitado: normalizeText(invitado.apellidoMaternoInvitado),
    fechaVisita,
    fechaGeneracion: invitado.fechaGeneracion || new Date().toISOString(),
    fechaVencimiento:
      invitado.fechaVencimiento ||
      (fechaVisita ? `${fechaVisita}T23:59:00.000Z` : null),
    estado: invitado.estado || "Pendiente",
    codigoQR: invitado.codigoQR || invitado.codigoAcceso || buildCodigoAcceso(invitadoID),
    codigoAcceso:
      invitado.codigoAcceso || invitado.codigoQR || buildCodigoAcceso(invitadoID),
    qr: invitado.qr || invitado.codigoQR || buildCodigoAcceso(invitadoID),
    nombreResidente:
      invitado.nombreResidente ?? usuario.nombreResidente ?? `Usuario #${usuarioID}`,
    numeroCasa: invitado.numeroCasa ?? usuario.numeroCasa ?? "",
    horaEntrada: invitado.horaEntrada || null,
    horaSalida: invitado.horaSalida || null,
    observaciones: invitado.observaciones || "",
  };
};

function initializeInvitados(force = false) {
  const hasInvitados = localStorage.getItem(STORAGE_KEY);
  if (force || !hasInvitados) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(clone(DEMO_DATA.invitados || []))
    );
  }
}

function getInvitados() {
  initializeInvitados();
  return parseJson(localStorage.getItem(STORAGE_KEY), [])
    .map(normalizeInvitado)
    .sort(
      (a, b) =>
        new Date(b.fechaGeneracion || 0) - new Date(a.fechaGeneracion || 0)
    );
}

function saveInvitados(invitados) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify((invitados || []).map(normalizeInvitado))
  );
  return getInvitados();
}

function validateInvitado(payload) {
  if (!payload.usuarioID) throw new Error("Selecciona un residente.");
  if (!payload.tipoVisitanteID) throw new Error("Selecciona un tipo de visitante.");
  if (!payload.nombreInvitado?.trim()) {
    throw new Error("El nombre del invitado es obligatorio.");
  }
  if (!payload.apellidoPaternoInvitado?.trim()) {
    throw new Error("El apellido paterno es obligatorio.");
  }
  if (!payload.fechaVisita) throw new Error("Selecciona la fecha de visita.");
  if (Number.isNaN(new Date(`${payload.fechaVisita}T00:00:00`).getTime())) {
    throw new Error("La fecha de visita no es valida.");
  }
}

const updateEstado = (id, estado, extra = {}) => {
  const invitados = getInvitados();
  const index = invitados.findIndex(
    (item) => Number(item.invitadoID) === Number(id)
  );
  if (index < 0) throw new Error("Invitado no encontrado");

  invitados[index] = normalizeInvitado({
    ...invitados[index],
    ...extra,
    estado,
  });

  saveInvitados(invitados);
  return invitados[index];
};

const InvitadosAPI = {
  getAll: async () => {
    if (DEMO_MODE) return getInvitados();
    return http.get("/Invitados");
  },

  getByUsuario: async (usuarioId) => {
    if (DEMO_MODE) {
      return getInvitados().filter(
        (item) => Number(item.usuarioID) === Number(usuarioId)
      );
    }
    return http.get(`/Invitados/usuario/${usuarioId}`);
  },

  getById: async (id) => {
    if (DEMO_MODE) {
      const invitado = getInvitados().find(
        (item) => Number(item.invitadoID) === Number(id)
      );
      if (!invitado) throw new Error("Invitado no encontrado");
      return invitado;
    }
    return http.get(`/Invitados/${id}`);
  },

  crear: async (data) => {
    const payload = {
      usuarioID: Number(data.usuarioID),
      tipoVisitanteID: Number(data.tipoVisitanteID || 1),
      nombreInvitado: data.nombreInvitado?.trim(),
      apellidoPaternoInvitado: data.apellidoPaternoInvitado?.trim(),
      apellidoMaternoInvitado: data.apellidoMaternoInvitado?.trim() || "",
      fechaVisita: data.fechaVisita ? String(data.fechaVisita).slice(0, 10) : "",
      observaciones: data.observaciones || "",
      estado: data.estado || "Pendiente",
    };

    if (!DEMO_MODE) return http.post("/Invitados", payload);

    validateInvitado(payload);

    const invitados = getInvitados();
    const nextId =
      invitados.reduce(
        (max, invitado) => Math.max(max, Number(invitado.invitadoID)),
        0
      ) + 1;

    const nuevo = normalizeInvitado({
      ...payload,
      invitadoID: nextId,
      codigoQR: buildCodigoAcceso(nextId),
      fechaGeneracion: new Date().toISOString(),
      fechaVencimiento: `${payload.fechaVisita}T23:59:00.000Z`,
    });

    saveInvitados([...invitados, nuevo]);
    return nuevo;
  },

  update: async (id, data) => {
    const payload = {
      usuarioID: Number(data.usuarioID),
      tipoVisitanteID: Number(data.tipoVisitanteID || 1),
      nombreInvitado: data.nombreInvitado?.trim(),
      apellidoPaternoInvitado: data.apellidoPaternoInvitado?.trim(),
      apellidoMaternoInvitado: data.apellidoMaternoInvitado?.trim() || "",
      fechaVisita: data.fechaVisita ? String(data.fechaVisita).slice(0, 10) : "",
      observaciones: data.observaciones || "",
      estado: data.estado,
    };

    if (!DEMO_MODE) return http.put(`/Invitados/${id}`, payload);

    validateInvitado(payload);

    const invitados = getInvitados();
    const index = invitados.findIndex(
      (item) => Number(item.invitadoID) === Number(id)
    );
    if (index < 0) throw new Error("Invitado no encontrado");

    invitados[index] = normalizeInvitado({
      ...invitados[index],
      ...payload,
      estado: payload.estado || invitados[index].estado,
      invitadoID: Number(id),
      fechaVencimiento: `${payload.fechaVisita}T23:59:00.000Z`,
    });

    saveInvitados(invitados);
    return invitados[index];
  },

  cancelar: async (id) => {
    if (!DEMO_MODE) return http.put(`/Invitados/${id}/cancelar`);
    return updateEstado(id, "Cancelado");
  },

  autorizar: async (id) => {
    if (!DEMO_MODE) return http.put(`/Invitados/${id}/autorizar`);
    return updateEstado(id, "Autorizado");
  },

  rechazar: async (id) => {
    if (!DEMO_MODE) return http.put(`/Invitados/${id}/rechazar`);
    return updateEstado(id, "Rechazado");
  },

  registrarEntrada: async (id) => {
    if (!DEMO_MODE) return http.put(`/Invitados/${id}/entrada`);
    return updateEstado(id, "Ingresó", { horaEntrada: new Date().toISOString() });
  },

  registrarSalida: async (id) => {
    if (!DEMO_MODE) return http.put(`/Invitados/${id}/salida`);
    return updateEstado(id, "Salió", { horaSalida: new Date().toISOString() });
  },

  generarQR: async (id) => {
    if (!DEMO_MODE) return http.post(`/Invitados/${id}/qr`);
    const invitado = await InvitadosAPI.getById(id);
    return invitado.codigoQR;
  },

  getEstados: async () => {
    if (DEMO_MODE) return clone(DEMO_DATA.estados.invitados || []);
    return [];
  },

  getTiposVisitante: async () => {
    if (DEMO_MODE) return getTiposVisitanteDemo();
    return http.get("/Invitados/tipos-visitante");
  },

  restoreDemoInvitados: () => {
    initializeInvitados(true);
    return getInvitados();
  },
};

export default InvitadosAPI;
