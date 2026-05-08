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
  GET_ESTADOS_REPORTE_SUCCESS,
  GET_PRIORIDADES_REPORTE_SUCCESS,
  CREATE_REPORTE_REQUEST,
  CREATE_REPORTE_SUCCESS,
  CREATE_REPORTE_ERROR,
  MARCAR_VISTO_SUCCESS,
  CAMBIAR_ANONIMATO_SUCCESS,
  UPDATE_REPORTE_SUCCESS,
  DELETE_REPORTE_SUCCESS,
  CHANGE_ESTADO_REPORTE_SUCCESS,
  CLEAR_ERROR,
} from "./ActionsTypes";

export const initialState = {
  reportes: [],
  reportesUsuario: [],
  reporteActual: null,
  tiposReporte: [],
  estadosReporte: [],
  prioridadesReporte: [],
  loading: false,
  error: null,
};

const mergeReporte = (state, payload) => ({
  ...state,
  loading: false,
  reportes: state.reportes.map((r) =>
    r.reporteID === payload.reporteID ? payload : r
  ),
  reporteActual:
    state.reporteActual &&
    state.reporteActual.reporteID === payload.reporteID
      ? payload
      : state.reporteActual,
});

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

    case GET_ESTADOS_REPORTE_SUCCESS:
      return {
        ...state,
        estadosReporte: action.payload,
      };

    case GET_PRIORIDADES_REPORTE_SUCCESS:
      return {
        ...state,
        prioridadesReporte: action.payload,
      };

    case CREATE_REPORTE_SUCCESS:
      return {
        ...state,
        loading: false,
        // lo agregamos al inicio de la lista general
        reportes: [action.payload, ...state.reportes],
      };

    case UPDATE_REPORTE_SUCCESS:
    case CHANGE_ESTADO_REPORTE_SUCCESS:
      return mergeReporte(state, action.payload);

    case MARCAR_VISTO_SUCCESS:
      return mergeReporte(state, action.payload);

    case CAMBIAR_ANONIMATO_SUCCESS:
      return mergeReporte(state, action.payload);

    case DELETE_REPORTE_SUCCESS:
      return {
        ...state,
        loading: false,
        reportes: state.reportes.filter(
          (r) => r.reporteID !== Number(action.payload)
        ),
        reporteActual:
          state.reporteActual &&
          state.reporteActual.reporteID === Number(action.payload)
            ? null
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
