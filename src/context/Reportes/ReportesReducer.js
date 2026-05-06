// src/context/Reportes/ReportesReducer.js
import {
  GET_REPORTES_REQUEST,
  GET_REPORTES_SUCCESS,
  GET_REPORTES_ERROR,
  GET_REPORTE_REQUEST,
  GET_REPORTE_SUCCESS,
  GET_REPORTE_ERROR,
  GET_REPORTES_USUARIO_SUCCESS,
  GET_TIPOS_REPORTE_SUCCESS,
  CREATE_REPORTE_REQUEST,
  CREATE_REPORTE_SUCCESS,
  CREATE_REPORTE_ERROR,
  MARCAR_VISTO_SUCCESS,
  CAMBIAR_ANONIMATO_SUCCESS,
  CLEAR_ERROR,
} from "./ActionsTypes";

export const initialState = {
  reportes: [],
  reportesUsuario: [],
  reporteActual: null,
  tiposReporte: [],
  loading: false,
  error: null,
};

export default function ReportesReducer(state, action) {
  switch (action.type) {
    case GET_REPORTES_REQUEST:
    case GET_REPORTE_REQUEST:
    case CREATE_REPORTE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_REPORTES_SUCCESS:
      return {
        ...state,
        loading: false,
        reportes: action.payload,
      };

    case GET_REPORTES_USUARIO_SUCCESS:
      return {
        ...state,
        loading: false,
        reportesUsuario: action.payload,
      };

    case GET_REPORTE_SUCCESS:
      return {
        ...state,
        loading: false,
        reporteActual: action.payload,
      };

    case GET_TIPOS_REPORTE_SUCCESS:
      return {
        ...state,
        tiposReporte: action.payload,
      };

    case CREATE_REPORTE_SUCCESS:
      return {
        ...state,
        loading: false,
        // lo agregamos al inicio de la lista general
        reportes: [action.payload, ...state.reportes],
      };

    case MARCAR_VISTO_SUCCESS:
      return {
        ...state,
        reportes: state.reportes.map((r) =>
          r.reporteID === action.payload ? { ...r, visto: true } : r
        ),
        reporteActual:
          state.reporteActual &&
          state.reporteActual.reporteID === action.payload
            ? { ...state.reporteActual, visto: true }
            : state.reporteActual,
      };

    case CAMBIAR_ANONIMATO_SUCCESS:
      return {
        ...state,
        reportes: state.reportes.map((r) =>
          r.reporteID === action.payload.id
            ? { ...r, esAnonimo: action.payload.esAnonimo }
            : r
        ),
        reporteActual:
          state.reporteActual &&
          state.reporteActual.reporteID === action.payload.id
            ? {
                ...state.reporteActual,
                esAnonimo: action.payload.esAnonimo,
              }
            : state.reporteActual,
      };

    case GET_REPORTES_ERROR:
    case GET_REPORTE_ERROR:
    case CREATE_REPORTE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload || "Ocurrió un error",
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
