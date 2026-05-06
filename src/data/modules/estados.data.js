export const DEMO_ESTADOS_COMUNES = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Completado", label: "Completado" },
  { value: "Cancelado", label: "Cancelado" },
];

export const DEMO_PRIORIDADES = [
  { value: "Alta", label: "Alta", nivel: 1 },
  { value: "Media", label: "Media", nivel: 2 },
  { value: "Baja", label: "Baja", nivel: 3 },
];

export const DEMO_ESTADOS_USUARIO = [
  { value: "activos", label: "Activos", activo: true },
  { value: "inactivos", label: "Inactivos", activo: false },
];

export const DEMO_ESTADOS_RESERVA = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Aprobada", label: "Aprobada" },
  { value: "Rechazada", label: "Rechazada" },
  { value: "Cancelada", label: "Cancelada" },
];

export const DEMO_ESTADOS_PAGO = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Pagado", label: "Pagado" },
  { value: "Completado", label: "Completado" },
];

export const DEMO_METODOS_PAGO = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Tarjeta", label: "Tarjeta" },
  { value: "Transferencia", label: "Transferencia" },
];

export const DEMO_ESTADOS_REPORTE = [
  { value: "pendiente", label: "Pendiente", visto: false },
  { value: "atendido", label: "Atendido", visto: true },
];

export const DEMO_ESTADOS_ALERTA = [
  { value: "Activa", label: "Activa", activa: true },
  { value: "Atendida", label: "Atendida", activa: false },
];

export const DEMO_ESTADOS_INVITADO = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Autorizado", label: "Autorizado" },
  { value: "Rechazado", label: "Rechazado" },
  { value: "Ingresó", label: "Ingresó" },
  { value: "Salió", label: "Salió" },
  { value: "Expirado", label: "Expirado" },
  { value: "Cancelado", label: "Cancelado" },
];

export const DEMO_ESTADOS_SERVICIO = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "En proceso", label: "En proceso" },
  { value: "Completado", label: "Completado" },
];

export const DEMO_ESTADOS_AMENIDAD = [
  { value: "Activa", label: "Activa", activo: true },
  { value: "Inactiva", label: "Inactiva", activo: false },
];

export const DEMO_INDICADORES_MAPA = [
  { value: "Peligroso", label: "Zona peligrosa", color: "#ef4444" },
  { value: "Alerta", label: "Zona de alerta", color: "#f59e0b" },
  { value: "Mantenimiento", label: "Zona de mantenimiento", color: "#22c55e" },
];

export const DEMO_ESTADOS_QR = [
  { value: "Activo", label: "Activo", activo: true },
  { value: "Vencido", label: "Vencido", activo: false },
  { value: "Cancelado", label: "Cancelado", activo: false },
  { value: "Usado", label: "Usado", activo: false },
  { value: "Pendiente", label: "Pendiente", activo: false },
];

export const DEMO_ESTADOS = {
  comunes: DEMO_ESTADOS_COMUNES,
  prioridades: DEMO_PRIORIDADES,
  usuarios: DEMO_ESTADOS_USUARIO,
  reservas: DEMO_ESTADOS_RESERVA,
  pagos: DEMO_ESTADOS_PAGO,
  metodosPago: DEMO_METODOS_PAGO,
  reportes: DEMO_ESTADOS_REPORTE,
  alertas: DEMO_ESTADOS_ALERTA,
  invitados: DEMO_ESTADOS_INVITADO,
  servicios: DEMO_ESTADOS_SERVICIO,
  amenidades: DEMO_ESTADOS_AMENIDAD,
  qrPersonales: DEMO_ESTADOS_QR,
  indicadoresMapa: DEMO_INDICADORES_MAPA,
};
