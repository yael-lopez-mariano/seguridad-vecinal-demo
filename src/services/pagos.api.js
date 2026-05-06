// src/services/pagos.api.js
// Servicio de Pagos (fetch wrapper propio de http.js)

import http, { dateUtils } from "./http";

/**
 * =========================
 * Modelos (JSDoc para tipado)
 * =========================
 */

/**
 * @typedef {Object} CargoMantenimiento
 * @property {number} cargoMantenimientoID
 * @property {string} concepto
 * @property {number} monto
 * @property {number} [montoPagado]
 * @property {number} saldoPendiente
 * @property {"Pendiente"|"Pagado"|"Parcial"} estado
 * @property {string|Date} [fechaVencimiento]
 * @property {string|Date} [fechaCreacion]
 */

/**
 * @typedef {Object} CargoServicioSolicitud
 * @property {number} solicitudID
 * @property {string} descripcion
 */

/**
 * @typedef {Object} CargoServicio
 * @property {number} cargoServicioID
 * @property {string} concepto
 * @property {number} monto
 * @property {number} [montoPagado]
 * @property {number} saldoPendiente
 * @property {"Pendiente"|"Pagado"|"Parcial"} estado
 * @property {string|Date} [fechaCreacion]
 * @property {CargoServicioSolicitud} [solicitud]
 */

/**
 * @typedef {Object} CuentaUsuario
 * @property {number} cuentaID
 * @property {number} saldoMantenimiento
 * @property {number} saldoServicios
 * @property {number} saldoTotal
 * @property {string|Date|null} ultimaActualizacion
 * @property {CargoMantenimiento[]} cargosMantenimiento
 * @property {CargoServicio[]} cargosServicios
 */

/**
 * @typedef {Object} DetallePago
 * @property {"Mantenimiento"|"Servicio"} tipo
 * @property {number} referenciaID         // ID del cargo (mantenimiento o servicio)
 * @property {number} monto
 */

/**
 * @typedef {Object} Pago
 * @property {number} pagoID
 * @property {number} usuarioID
 * @property {number|null} cargoMantenimientoID
 * @property {number|null} cargoServicioID
 * @property {string} folioUnico
 * @property {number} montoTotal
 * @property {"Tarjeta"|"Efectivo"|"Transferencia"} tipoPago
 * @property {string|Date} fechaPago
 * @property {"Crédito"|"Débito"|"SPEI"|"Efectivo"} metodoPago
 * @property {string|null} ultimosDigitosTarjeta
 * @property {DetallePago[]} [detallesPago]
 */

/**
 * @typedef {Object} PagoCreate
 * @property {number} usuarioID
 * @property {number} [cargoMantenimientoID]
 * @property {number} [cargoServicioID]
 * @property {number} montoTotal
 * @property {"Tarjeta"|"Efectivo"|"Transferencia"} tipoPago
 * @property {"Crédito"|"Débito"|"SPEI"|"Efectivo"} metodoPago
 * @property {string} [ultimosDigitosTarjeta]   // ej: "8888"
 * @property {DetallePago[]} [detallesPago]
 * @property {string|Date} [fechaPago]          // opcional si el backend lo acepta
 */

/**
 * =========================
 * Mappers
 * =========================
 */
const toDateIf = (v) => (typeof v === "string" ? new Date(v) : v ?? null);

const mapCargoMantenimiento = (x) => ({
  cargoMantenimientoID: x.cargoMantenimientoID,
  concepto: x.concepto,
  monto: Number(x.monto),
  montoPagado: x.montoPagado != null ? Number(x.montoPagado) : undefined,
  saldoPendiente: Number(x.saldoPendiente),
  estado: x.estado,
  fechaVencimiento: x.fechaVencimiento
    ? toDateIf(x.fechaVencimiento)
    : undefined,
  fechaCreacion: x.fechaCreacion ? toDateIf(x.fechaCreacion) : undefined,
});

const mapCargoServicio = (x) => ({
  cargoServicioID: x.cargoServicioID,
  concepto: x.concepto,
  monto: Number(x.monto),
  montoPagado: x.montoPagado != null ? Number(x.montoPagado) : undefined,
  saldoPendiente: Number(x.saldoPendiente),
  estado: x.estado,
  fechaCreacion: x.fechaCreacion ? toDateIf(x.fechaCreacion) : undefined,
  solicitud: x.solicitud
    ? {
        solicitudID: x.solicitud.solicitudID,
        descripcion: x.solicitud.descripcion,
      }
    : undefined,
});

const mapCuenta = (x) => ({
  cuentaID: x.cuentaID,
  saldoMantenimiento: Number(x.saldoMantenimiento),
  saldoServicios: Number(x.saldoServicios),
  saldoTotal: Number(x.saldoTotal),
  ultimaActualizacion: x.ultimaActualizacion
    ? toDateIf(x.ultimaActualizacion)
    : null,
  cargosMantenimiento: Array.isArray(x.cargosMantenimiento)
    ? x.cargosMantenimiento.map(mapCargoMantenimiento)
    : [],
  cargosServicios: Array.isArray(x.cargosServicios)
    ? x.cargosServicios.map(mapCargoServicio)
    : [],
});

const mapDetallePago = (d) => ({
  tipo: d.tipo,
  referenciaID: Number(d.referenciaID),
  monto: Number(d.monto),
});

const mapPago = (x) => ({
  pagoID: x.pagoID,
  usuarioID: x.usuarioID,
  cargoMantenimientoID: x.cargoMantenimientoID ?? null,
  cargoServicioID: x.cargoServicioID ?? null,
  folioUnico: x.folioUnico,
  montoTotal: Number(x.montoTotal),
  tipoPago: x.tipoPago,
  fechaPago: toDateIf(x.fechaPago),
  metodoPago: x.metodoPago,
  ultimosDigitosTarjeta: x.ultimosDigitosTarjeta ?? null,
  detallesPago: Array.isArray(x.detallesPago)
    ? x.detallesPago.map(mapDetallePago)
    : [],
});

/**
 * =========================
 * Endpoints
 * =========================
 */

// Cuenta del usuario
export async function getCuenta(usuarioId) {
  const data = await http.get(`/Pagos/cuenta/${usuarioId}`);
  return mapCuenta(data);
}

// Cargos de mantenimiento del usuario
export async function getCargosMantenimiento(usuarioId) {
  const data = await http.get(`/Pagos/cargos/mantenimiento/${usuarioId}`);
  return Array.isArray(data) ? data.map(mapCargoMantenimiento) : [];
}

// Cargos de servicio del usuario
export async function getCargosServicio(usuarioId) {
  const data = await http.get(`/Pagos/cargos/servicio/${usuarioId}`);
  return Array.isArray(data) ? data.map(mapCargoServicio) : [];
}

// Crear pago
/** @param {PagoCreate} payload */
export async function createPago(payload) {
  const body = {
    usuarioID: payload.usuarioID,
    cargoMantenimientoID: payload.cargoMantenimientoID ?? null,
    cargoServicioID: payload.cargoServicioID ?? null,
    montoTotal: payload.montoTotal,
    tipoPago: payload.tipoPago,
    metodoPago: payload.metodoPago,
    ultimosDigitosTarjeta: payload.ultimosDigitosTarjeta ?? null,
    detallesPago: Array.isArray(payload.detallesPago)
      ? payload.detallesPago.map((d) => ({
          tipo: d.tipo,
          referenciaID: d.referenciaID,
          monto: d.monto,
        }))
      : undefined,
    // si mandas fecha explícita:
    fechaPago: payload.fechaPago
      ? dateUtils.toIsoDateTime(payload.fechaPago)
      : undefined,
  };

  const data = await http.post(`/Pagos`, body);
  return mapPago(data);
}

// Obtener pago por ID
export async function getPagoById(pagoId) {
  const data = await http.get(`/Pagos/${pagoId}`);
  return mapPago(data);
}

// Pagos de un usuario
export async function getPagosByUsuario(usuarioId) {
  const data = await http.get(`/Pagos/usuario/${usuarioId}`);
  return Array.isArray(data) ? data.map(mapPago) : [];
}

// Descargar comprobante (PDF/imagen) por ID
export async function downloadComprobante(
  comprobanteId,
  filename = "comprobante"
) {
  // usa el helper download de http.js para guardar el blob
  return http.download(`/Pagos/comprobante/${comprobanteId}`, { filename });
}

/**
 * =========================
 * Export agrupado (opcional)
 * =========================
 */
const PagosAPI = {
  // modelos vacíos para inicializar estados en UI
  models: {
    emptyCuenta: /** @type {CuentaUsuario} */ ({
      cuentaID: 0,
      saldoMantenimiento: 0,
      saldoServicios: 0,
      saldoTotal: 0,
      ultimaActualizacion: null,
      cargosMantenimiento: [],
      cargosServicios: [],
    }),
    emptyPagoCreate: /** @type {PagoCreate} */ ({
      usuarioID: 0,
      montoTotal: 0,
      tipoPago: "Tarjeta",
      metodoPago: "Débito",
      ultimosDigitosTarjeta: "",
      detallesPago: [],
    }),
  },

  getCuenta,
  getCargosMantenimiento,
  getCargosServicio,
  createPago,
  getPagoById,
  getPagosByUsuario,
  downloadComprobante,
};

export default PagosAPI;
