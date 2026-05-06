// src/services/pagos.api.js
import http from "./http";

// Prefijo base del controlador Pagos en tu backend
const base = "/Pagos";

/* ===========================
   Modeladores (normalizan API)
   =========================== */

// Cargo de servicio (cada fila de /cargos/servicio/{usuarioId})
const modelCargoServicio = (x = {}) => ({
  cargoServicioID: x.cargoServicioID,
  concepto: x.concepto ?? "",
  monto: Number(x.monto ?? 0),
  montoPagado: Number(x.montoPagado ?? 0),
  saldoPendiente:
    x.saldoPendiente != null
      ? Number(x.saldoPendiente)
      : Math.max(Number(x.monto ?? 0) - Number(x.montoPagado ?? 0), 0),
  estado: x.estado ?? "Pendiente",
  fechaCreacion: x.fechaCreacion ?? null,
  solicitud: x.solicitud
    ? {
        solicitudID: x.solicitud.solicitudID,
        descripcion: x.solicitud.descripcion ?? "",
      }
    : null,
});

// (Si ya tenías estos, puedes dejarlos tal cual. Los incluimos por si no están.)
const modelCargoMantenimiento = (x = {}) => ({
  cargoMantenimientoID: x.cargoMantenimientoID,
  concepto: x.concepto ?? "",
  monto: Number(x.monto ?? 0),
  montoPagado: Number(x.montoPagado ?? 0),
  saldoPendiente:
    x.saldoPendiente != null
      ? Number(x.saldoPendiente)
      : Math.max(Number(x.monto ?? 0) - Number(x.montoPagado ?? 0), 0),
  estado: x.estado ?? "Pendiente",
  fechaVencimiento: x.fechaVencimiento ?? null,
  fechaCreacion: x.fechaCreacion ?? null,
});

// Estado de cuenta por usuario
const modelCuenta = (x = {}) => ({
  cuentaID: x.cuentaID,
  saldoMantenimiento: Number(x.saldoMantenimiento ?? 0),
  saldoServicios: Number(x.saldoServicios ?? 0),
  saldoTotal: Number(x.saldoTotal ?? 0),
  ultimaActualizacion: x.ultimaActualizacion ?? null,
  cargosMantenimiento: Array.isArray(x.cargosMantenimiento)
    ? x.cargosMantenimiento.map(modelCargoMantenimiento)
    : [],
  cargosServicios: Array.isArray(x.cargosServicios)
    ? x.cargosServicios.map(modelCargoServicio)
    : [],
});

// Pago (detalle)
const modelPago = (x = {}) => ({
  pagoID: x.pagoID,
  usuarioID: x.usuarioID,
  cargoMantenimientoID: x.cargoMantenimientoID ?? null,
  cargoServicioID: x.cargoServicioID ?? null,
  folioUnico: x.folioUnico ?? "",
  montoTotal: Number(x.montoTotal ?? 0),
  tipoPago: x.tipoPago ?? "",
  fechaPago: x.fechaPago ?? null,
  metodoPago: x.metodoPago ?? "",
  ultimosDigitosTarjeta: x.ultimosDigitosTarjeta ?? "",
  usuario: x.usuario ?? null,
  cargoMantenimiento: x.cargoMantenimiento ?? null,
  cargoServicio: x.cargoServicio ?? null,
  detallesPago: Array.isArray(x.detallesPago) ? x.detallesPago : [],
  comprobante: x.comprobante ?? null,
});

/* ===========================
   Endpoints
   =========================== */

/** 🔹 NUEVO: Cargos de servicios por usuario */
async function getCargosServicio(usuarioId) {
  const data = await http.get(`${base}/cargos/servicio/${usuarioId}`);
  return Array.isArray(data) ? data.map(modelCargoServicio) : [];
}

/** (Opcional) Ya existentes en tu proyecto — los dejamos por si no están */
async function getCargosMantenimiento(usuarioId) {
  const data = await http.get(`${base}/cargos/mantenimiento/${usuarioId}`);
  return Array.isArray(data) ? data.map(modelCargoMantenimiento) : [];
}

async function getCuentaUsuario(usuarioId) {
  const data = await http.get(`${base}/cuenta/${usuarioId}`);
  return modelCuenta(data);
}

async function getPagoById(id) {
  const data = await http.get(`${base}/${id}`);
  return modelPago(data);
}

async function getPagosByUsuario(usuarioId) {
  const data = await http.get(`${base}/usuario/${usuarioId}`);
  return Array.isArray(data) ? data.map(modelPago) : [];
}

async function getComprobante(id) {
  // Devuelve Blob (PDF/imagen) si existe; si 404, http.handle lanzará Error
  return await http.get(`${base}/comprobante/${id}`, { responseType: "blob" });
}

/* ===========================
   API pública
   =========================== */

export const PagosAPI = {
  // NUEVO:
  getCargosServicio,

  // (existentes / complementarios)
  getCargosMantenimiento,
  getCuentaUsuario,
  getPagoById,
  getPagosByUsuario,
  getComprobante,
};

export default PagosAPI; // <- sigues pudiendo: import PagosAPI from "./pagos.api";
