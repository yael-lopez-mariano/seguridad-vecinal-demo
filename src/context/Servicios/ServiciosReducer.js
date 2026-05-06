// src/context/Servicios/ServiciosReducer.js
import {
  SERVICIOS_SET_LOADING,
  SERVICIOS_SET_ERROR,
  SERVICIOS_SET_TIPOS,
  SERVICIOS_SET_CATALOGO,
  SERVICIOS_SET_PERSONAL,
  SERVICIOS_SET_SOLICITUDES,
  SERVICIOS_SET_SOLICITUD_ACTUAL,
  SERVICIOS_SET_CARGOS_SERVICIOS,
  SERVICIOS_SET_CARGOS_MANT,
} from "./ActionsTypes";

export default function ServiciosReducer(state, action) {
  switch (action.type) {
    case SERVICIOS_SET_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SERVICIOS_SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SERVICIOS_SET_TIPOS:
      return {
        ...state,
        loading: false,
        tiposServicio: action.payload || [],
      };

    case SERVICIOS_SET_CATALOGO:
      return {
        ...state,
        loading: false,
        catalogoServicios: action.payload || [],
      };

    case SERVICIOS_SET_PERSONAL:
      return {
        ...state,
        loading: false,
        personalMantenimiento: action.payload || [],
      };

    case SERVICIOS_SET_SOLICITUDES:
      return {
        ...state,
        loading: false,
        solicitudes: action.payload || [],
      };

    case SERVICIOS_SET_SOLICITUD_ACTUAL:
      return {
        ...state,
        loading: false,
        solicitudActual: action.payload || null,
      };

    case SERVICIOS_SET_CARGOS_SERVICIOS:
      return {
        ...state,
        loading: false,
        cargosServicios: action.payload || [],
      };

    case SERVICIOS_SET_CARGOS_MANT:
      return {
        ...state,
        loading: false,
        cargosMantenimiento: action.payload || [],
      };

    default:
      return state;
  }
}
