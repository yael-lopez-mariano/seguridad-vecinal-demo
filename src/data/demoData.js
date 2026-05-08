import { DEMO_TIPOS_USUARIO, DEMO_USERS } from "./modules/usuarios.data";
import { createDemoAvisos } from "./modules/avisos.data";
import { createDemoAmenidades } from "./modules/amenidades.data";
import { createDemoReservas } from "./modules/reservas.data";
import { createDemoInvitados } from "./modules/invitados.data";
import { createDemoQrPersonales } from "./modules/qrPersonales.data";
import { createDemoReportes } from "./modules/reportes.data";
import {
  DEMO_CATALOGOS,
  DEMO_CATEGORIAS_AVISO,
  DEMO_ROLES,
  DEMO_TIPOS_ALERTA,
  DEMO_TIPOS_AMENIDAD,
  DEMO_TIPOS_REPORTE,
  DEMO_TIPOS_SERVICIO,
  DEMO_TIPOS_VISITANTE,
} from "./modules/catalogos.data";
import {
  DEMO_ESTADOS,
  DEMO_ESTADOS_ALERTA,
  DEMO_ESTADOS_AMENIDAD,
  DEMO_ESTADOS_COMUNES,
  DEMO_ESTADOS_INVITADO,
  DEMO_ESTADOS_PAGO,
  DEMO_ESTADOS_REPORTE,
  DEMO_ESTADOS_RESERVA,
  DEMO_ESTADOS_QR,
  DEMO_ESTADOS_SERVICIO,
  DEMO_ESTADOS_USUARIO,
  DEMO_INDICADORES_MAPA,
  DEMO_METODOS_PAGO,
  DEMO_PRIORIDADES,
} from "./modules/estados.data";

const DEMO_AVISOS = createDemoAvisos(DEMO_CATEGORIAS_AVISO);
const DEMO_AMENIDADES = createDemoAmenidades(DEMO_TIPOS_AMENIDAD);
const DEMO_RESERVAS = createDemoReservas();
const DEMO_INVITADOS = createDemoInvitados();
const DEMO_QR_PERSONALES = createDemoQrPersonales();
const DEMO_REPORTES = createDemoReportes(DEMO_TIPOS_REPORTE, DEMO_USERS);

export {
  DEMO_AMENIDADES,
  DEMO_CATALOGOS,
  DEMO_AVISOS,
  DEMO_INVITADOS,
  DEMO_QR_PERSONALES,
  DEMO_REPORTES,
  DEMO_RESERVAS,
  DEMO_CATEGORIAS_AVISO,
  DEMO_ESTADOS,
  DEMO_ESTADOS_ALERTA,
  DEMO_ESTADOS_AMENIDAD,
  DEMO_ESTADOS_COMUNES,
  DEMO_ESTADOS_INVITADO,
  DEMO_ESTADOS_PAGO,
  DEMO_ESTADOS_REPORTE,
  DEMO_ESTADOS_RESERVA,
  DEMO_ESTADOS_QR,
  DEMO_ESTADOS_SERVICIO,
  DEMO_ESTADOS_USUARIO,
  DEMO_INDICADORES_MAPA,
  DEMO_METODOS_PAGO,
  DEMO_PRIORIDADES,
  DEMO_ROLES,
  DEMO_TIPOS_ALERTA,
  DEMO_TIPOS_AMENIDAD,
  DEMO_TIPOS_REPORTE,
  DEMO_TIPOS_SERVICIO,
  DEMO_TIPOS_USUARIO,
  DEMO_TIPOS_VISITANTE,
  DEMO_USERS,
};

export const DEMO_DATA = {
  usuarios: DEMO_USERS,
  tiposUsuario: DEMO_TIPOS_USUARIO,
  avisos: DEMO_AVISOS,
  amenidades: DEMO_AMENIDADES,
  reservas: DEMO_RESERVAS,
  invitados: DEMO_INVITADOS,
  qrPersonales: DEMO_QR_PERSONALES,
  reportes: DEMO_REPORTES,
  catalogos: DEMO_CATALOGOS,
  estados: DEMO_ESTADOS,
};
