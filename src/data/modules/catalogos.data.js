import { DEMO_TIPOS_USUARIO } from "./usuarios.data";

export const DEMO_ROLES = DEMO_TIPOS_USUARIO.map((tipo) => ({
  rolID: tipo.tipoUsuarioID,
  nombre: tipo.nombre,
  descripcion: tipo.descripcion,
  activo: true,
}));

export const DEMO_TIPOS_REPORTE = [
  { tipoReporteID: 1, nombre: "Robo", activo: true },
  { tipoReporteID: 2, nombre: "Vandalismo", activo: true },
  { tipoReporteID: 3, nombre: "Incendio", activo: true },
  { tipoReporteID: 4, nombre: "Ruido", activo: true },
  { tipoReporteID: 5, nombre: "Sospechoso", activo: true },
  { tipoReporteID: 6, nombre: "Otro", activo: true },
];

export const DEMO_TIPOS_ALERTA = [
  {
    tipoAlertaID: 1,
    nombre: "Panico",
    descripcion: "Alerta de panico enviada por un usuario",
    activo: true,
  },
];

export const DEMO_TIPOS_AMENIDAD = [
  {
    tipoAmenidadID: 1,
    nombre: "Gimnasio",
    horarioInicio: "06:00:00",
    horarioFin: "22:00:00",
    activo: true,
  },
  {
    tipoAmenidadID: 2,
    nombre: "Alberca",
    horarioInicio: "08:00:00",
    horarioFin: "20:00:00",
    activo: true,
  },
  {
    tipoAmenidadID: 3,
    nombre: "Salon de eventos",
    horarioInicio: "09:00:00",
    horarioFin: "23:00:00",
    activo: true,
  },
  {
    tipoAmenidadID: 4,
    nombre: "Cancha",
    horarioInicio: "07:00:00",
    horarioFin: "21:00:00",
    activo: true,
  },
];

export const DEMO_TIPOS_SERVICIO = [
  {
    tipoServicioID: 1,
    nombre: "Mantenimiento",
    descripcion: "Reparaciones y mantenimiento general",
    activo: true,
  },
  {
    tipoServicioID: 2,
    nombre: "Limpieza",
    descripcion: "Limpieza de areas comunes",
    activo: true,
  },
  {
    tipoServicioID: 3,
    nombre: "Jardineria",
    descripcion: "Cuidado de areas verdes",
    activo: true,
  },
  {
    tipoServicioID: 4,
    nombre: "Seguridad",
    descripcion: "Apoyo del personal de seguridad",
    activo: true,
  },
];

export const DEMO_CATEGORIAS_AVISO = [
  { categoriaID: 1, nombre: "Urgente", prioridad: 1, activo: true },
  { categoriaID: 2, nombre: "Seguridad", prioridad: 2, activo: true },
  { categoriaID: 3, nombre: "Mantenimiento", prioridad: 3, activo: true },
  { categoriaID: 4, nombre: "Pagos", prioridad: 4, activo: true },
  { categoriaID: 5, nombre: "Eventos", prioridad: 5, activo: true },
  { categoriaID: 6, nombre: "General", prioridad: 6, activo: true },
];

export const DEMO_TIPOS_VISITANTE = [
  { tipoVisitanteID: 1, nombre: "Visitante", activo: true },
  { tipoVisitanteID: 2, nombre: "Familiar", activo: true },
  { tipoVisitanteID: 3, nombre: "Proveedor", activo: true },
  { tipoVisitanteID: 4, nombre: "Repartidor", activo: true },
];

export const DEMO_CATALOGOS = {
  roles: DEMO_ROLES,
  tiposUsuario: DEMO_TIPOS_USUARIO,
  tiposReporte: DEMO_TIPOS_REPORTE,
  tiposAlerta: DEMO_TIPOS_ALERTA,
  tiposAmenidad: DEMO_TIPOS_AMENIDAD,
  tiposServicio: DEMO_TIPOS_SERVICIO,
  categoriasAviso: DEMO_CATEGORIAS_AVISO,
  tiposVisitante: DEMO_TIPOS_VISITANTE,
};
