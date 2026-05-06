// src/services/reservas.api.js
import { DEMO_DATA } from "../data/demoData";
import { http } from "./http";

const DEMO_MODE = true;
const BASE_URL = "/Reservas";
const STORAGE_KEY = "rsv_demo_reservas";
const AMENIDADES_STORAGE_KEY = "rsv_demo_amenidades";
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

const normalizeTime = (value) => {
  if (!value) return "";
  if (String(value).length === 5) return `${value}:00`;
  return String(value);
};

const getStoredAmenidades = () =>
  parseJson(localStorage.getItem(AMENIDADES_STORAGE_KEY), DEMO_DATA.amenidades);

const getStoredUsuarios = () =>
  parseJson(localStorage.getItem(USUARIOS_STORAGE_KEY), DEMO_DATA.usuarios);

const getTipoAmenidad = (tipoAmenidadID) =>
  (DEMO_DATA.catalogos.tiposAmenidad || []).find(
    (tipo) => Number(tipo.tipoAmenidadID) === Number(tipoAmenidadID)
  );

const normalizeAmenidad = (amenidad) => {
  const tipo = getTipoAmenidad(amenidad.tipoAmenidadID) || {};
  const amenidadID = Number(amenidad.amenidadID ?? amenidad.id);

  return {
    ...amenidad,
    amenidadID,
    id: amenidadID,
    tipoAmenidadID: Number(amenidad.tipoAmenidadID || tipo.tipoAmenidadID || 1),
    nombre: amenidad.nombre || "",
    activo: amenidad.activo !== false,
    tipoAmenidadNombre: amenidad.tipoAmenidadNombre ?? tipo.nombre ?? "",
  };
};

const normalizeUsuario = (usuario) => {
  const usuarioID = Number(usuario.usuarioID ?? usuario.id ?? usuario.userId);
  const nombreCompleto = [
    usuario.nombre,
    usuario.apellidoPaterno ?? usuario.apellidoP,
    usuario.apellidoMaterno ?? usuario.apellidoM,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...usuario,
    usuarioID,
    id: usuarioID,
    nombreUsuario: nombreCompleto || usuario.usuario || `Usuario #${usuarioID}`,
    numeroCasa: usuario.numeroCasa || "",
  };
};

const getAmenidadesDemo = () => getStoredAmenidades().map(normalizeAmenidad);
const getUsuariosDemo = () => getStoredUsuarios().map(normalizeUsuario);

const getAmenidadById = (amenidadID) =>
  getAmenidadesDemo().find(
    (amenidad) => Number(amenidad.amenidadID) === Number(amenidadID)
  );

const getUsuarioById = (usuarioID) =>
  getUsuariosDemo().find(
    (usuario) => Number(usuario.usuarioID) === Number(usuarioID)
  );

const normalizeReserva = (reserva) => {
  const reservaID = Number(reserva.reservaID ?? reserva.id);
  const amenidadID = Number(reserva.amenidadID);
  const usuarioID = Number(reserva.usuarioID);
  const amenidad = getAmenidadById(amenidadID) || {};
  const usuario = getUsuarioById(usuarioID) || {};

  return {
    ...reserva,
    reservaID,
    id: reservaID,
    amenidadID,
    usuarioID,
    amenidadNombre: reserva.amenidadNombre ?? amenidad.nombre ?? "",
    tipoAmenidad:
      reserva.tipoAmenidad ??
      amenidad.tipoAmenidadNombre ??
      amenidad.tipoAmenidad?.nombre ??
      "",
    nombreUsuario:
      reserva.nombreUsuario ?? usuario.nombreUsuario ?? `Usuario #${usuarioID}`,
    numeroCasa: reserva.numeroCasa ?? usuario.numeroCasa ?? "",
    fechaReserva: reserva.fechaReserva
      ? String(reserva.fechaReserva).slice(0, 10)
      : "",
    horaInicio: normalizeTime(reserva.horaInicio),
    horaFin: normalizeTime(reserva.horaFin),
    motivo: String(reserva.motivo || "").trim(),
    estado: reserva.estado || "Pendiente",
    observaciones: reserva.observaciones || "",
    fechaCreacion: reserva.fechaCreacion || new Date().toISOString(),
  };
};

function initializeReservas(force = false) {
  const hasReservas = localStorage.getItem(STORAGE_KEY);
  if (force || !hasReservas) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(clone(DEMO_DATA.reservas || []))
    );
  }
}

function getReservas() {
  initializeReservas();
  return parseJson(localStorage.getItem(STORAGE_KEY), [])
    .map(normalizeReserva)
    .sort(
      (a, b) =>
        new Date(`${b.fechaReserva}T${b.horaInicio || "00:00:00"}`) -
        new Date(`${a.fechaReserva}T${a.horaInicio || "00:00:00"}`)
    );
}

function saveReservas(reservas) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify((reservas || []).map(normalizeReserva))
  );
  return getReservas();
}

function validateReserva(payload, editingId = null) {
  if (!payload.usuarioID) throw new Error("El usuario es obligatorio.");
  if (!payload.amenidadID) throw new Error("Selecciona una amenidad.");
  if (!payload.fechaReserva) throw new Error("La fecha es obligatoria.");
  if (Number.isNaN(new Date(`${payload.fechaReserva}T00:00:00`).getTime())) {
    throw new Error("La fecha de la reserva no es valida.");
  }
  if (!payload.horaInicio) throw new Error("La hora de inicio es obligatoria.");
  if (!payload.horaFin) throw new Error("La hora de fin es obligatoria.");
  if (payload.horaFin <= payload.horaInicio) {
    throw new Error("La hora de fin debe ser mayor que la hora de inicio.");
  }
  if (!payload.motivo?.trim()) throw new Error("Describe brevemente el motivo.");

  const amenidad = getAmenidadById(payload.amenidadID);
  if (!amenidad || amenidad.activo === false) {
    throw new Error("Selecciona una amenidad activa.");
  }

  const usuario = getUsuarioById(payload.usuarioID);
  if (!usuario) throw new Error("El usuario no existe en la demo.");

  const reservas = getReservas();
  const hasConflict = reservas.some((reserva) => {
    if (Number(reserva.reservaID) === Number(editingId)) return false;
    if (Number(reserva.amenidadID) !== Number(payload.amenidadID)) return false;
    if (reserva.fechaReserva !== payload.fechaReserva) return false;
    if (["Cancelada", "Rechazada"].includes(reserva.estado)) return false;

    return payload.horaInicio < reserva.horaFin && payload.horaFin > reserva.horaInicio;
  });

  if (hasConflict) {
    throw new Error("Ya existe una reserva activa en ese horario.");
  }
}

export const ReservasAPI = {
  async getAll(signal) {
    if (DEMO_MODE) return getReservas();
    return await http.get(BASE_URL, { signal });
  },

  async getByUsuario(usuarioId, signal) {
    if (DEMO_MODE) {
      return getReservas().filter(
        (reserva) => Number(reserva.usuarioID) === Number(usuarioId)
      );
    }
    return await http.get(`${BASE_URL}/usuario/${usuarioId}`, { signal });
  },

  async getById(id, signal) {
    if (DEMO_MODE) {
      const reserva = getReservas().find(
        (item) => Number(item.reservaID) === Number(id)
      );
      if (!reserva) throw new Error("Reserva no encontrada");
      return reserva;
    }
    return await http.get(`${BASE_URL}/${id}`, { signal });
  },

  async create(body) {
    const payload = {
      usuarioID: Number(body.usuarioID),
      amenidadID: Number(body.amenidadID),
      fechaReserva: String(body.fechaReserva || "").slice(0, 10),
      horaInicio: normalizeTime(body.horaInicio),
      horaFin: normalizeTime(body.horaFin),
      motivo: body.motivo?.trim(),
      estado: body.estado || "Pendiente",
      observaciones: body.observaciones || "",
    };

    if (!DEMO_MODE) return await http.post(BASE_URL, payload);

    validateReserva(payload);

    const reservas = getReservas();
    const nextId =
      reservas.reduce(
        (max, reserva) => Math.max(max, Number(reserva.reservaID)),
        0
      ) + 1;

    const nueva = normalizeReserva({
      ...payload,
      reservaID: nextId,
      fechaCreacion: new Date().toISOString(),
    });

    saveReservas([...reservas, nueva]);
    return nueva;
  },

  async update(id, body) {
    const payload = {
      usuarioID: Number(body.usuarioID),
      amenidadID: Number(body.amenidadID),
      fechaReserva: String(body.fechaReserva || "").slice(0, 10),
      horaInicio: normalizeTime(body.horaInicio),
      horaFin: normalizeTime(body.horaFin),
      motivo: body.motivo?.trim(),
      estado: body.estado,
      observaciones: body.observaciones || "",
    };

    if (!DEMO_MODE) return await http.put(`${BASE_URL}/${id}`, payload);

    validateReserva(payload, id);

    const reservas = getReservas();
    const index = reservas.findIndex(
      (reserva) => Number(reserva.reservaID) === Number(id)
    );
    if (index < 0) throw new Error("Reserva no encontrada");

    const actualizada = normalizeReserva({
      ...reservas[index],
      ...payload,
      estado: payload.estado || reservas[index].estado,
      reservaID: Number(id),
    });

    reservas[index] = actualizada;
    saveReservas(reservas);
    return actualizada;
  },

  async cancelar(id) {
    if (!DEMO_MODE) return await http.put(`${BASE_URL}/${id}/cancelar`);
    return await this.actualizarEstado(id, "Cancelada");
  },

  async actualizarEstado(id, estado) {
    if (!DEMO_MODE) {
      return await http.put(`${BASE_URL}/${id}/estado`, { estado });
    }

    const reservas = getReservas();
    const index = reservas.findIndex(
      (reserva) => Number(reserva.reservaID) === Number(id)
    );
    if (index < 0) throw new Error("Reserva no encontrada");

    reservas[index] = normalizeReserva({
      ...reservas[index],
      estado,
    });

    saveReservas(reservas);
    return reservas[index];
  },

  async remove(id) {
    if (!DEMO_MODE) return await http.delete(`${BASE_URL}/${id}`);
    return await this.cancelar(id);
  },

  async getEstados() {
    if (DEMO_MODE) return clone(DEMO_DATA.estados.reservas || []);
    return [];
  },

  async getAmenidadesDisponibles() {
    if (DEMO_MODE) return getAmenidadesDemo().filter((a) => a.activo !== false);
    return await http.get("/Amenidades");
  },

  restoreDemoReservas() {
    initializeReservas(true);
    return getReservas();
  },
};

export default ReservasAPI;
