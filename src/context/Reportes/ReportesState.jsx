// src/context/Reportes/ReportesState.jsx
import { useReducer } from "react";
import ReportesContext from "./ReportesContext";
import ReportesReducer, { initialState } from "./ReportesReducer";
import ReportesAPI from "../../services/reportes.api";

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

export default function ReportesState({ children }) {
  const [state, dispatch] = useReducer(ReportesReducer, initialState);

  // ---------------- ACCIONES ----------------

  const clearError = () => dispatch({ type: CLEAR_ERROR });

  const fetchReportes = async () => {
    dispatch({ type: GET_REPORTES_REQUEST });
    try {
      const data = await ReportesAPI.list();
      dispatch({ type: GET_REPORTES_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
      dispatch({
        type: GET_REPORTES_ERROR,
        payload: err.message || "Error al cargar reportes",
      });
    }
  };

  const fetchReporteById = async (id) => {
    dispatch({ type: GET_REPORTE_REQUEST });
    try {
      const data = await ReportesAPI.getById(id);
      dispatch({ type: GET_REPORTE_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
      dispatch({
        type: GET_REPORTE_ERROR,
        payload: err.message || "Error al cargar el reporte",
      });
    }
  };

  const fetchReportesByUsuario = async (usuarioId) => {
    dispatch({ type: GET_REPORTES_REQUEST });
    try {
      const data = await ReportesAPI.listByUsuario(usuarioId);
      dispatch({ type: GET_REPORTES_USUARIO_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
      dispatch({
        type: GET_REPORTES_ERROR,
        payload: err.message || "Error al cargar reportes del usuario",
      });
    }
  };

  const fetchTiposReporte = async () => {
    try {
      const data = await ReportesAPI.tiposReporte();
      dispatch({ type: GET_TIPOS_REPORTE_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
      // no marcamos loading/error porque es algo auxiliar
    }
  };

  const fetchEstadosReporte = async () => {
    try {
      const data = await ReportesAPI.getEstados();
      dispatch({ type: GET_ESTADOS_REPORTE_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrioridadesReporte = async () => {
    try {
      const data = await ReportesAPI.getPrioridades();
      dispatch({ type: GET_PRIORIDADES_REPORTE_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
    }
  };

  const createReporte = async (data) => {
    dispatch({ type: CREATE_REPORTE_REQUEST });
    try {
      const created = await ReportesAPI.create(data);
      dispatch({ type: CREATE_REPORTE_SUCCESS, payload: created });
      return created;
    } catch (err) {
      console.error(err);
      dispatch({
        type: CREATE_REPORTE_ERROR,
        payload: err.message || "Error al crear el reporte",
      });
      throw err;
    }
  };

  const updateReporte = async (id, data) => {
    dispatch({ type: CREATE_REPORTE_REQUEST });
    try {
      const updated = await ReportesAPI.update(id, data);
      dispatch({ type: UPDATE_REPORTE_SUCCESS, payload: updated });
      return updated;
    } catch (err) {
      console.error(err);
      dispatch({
        type: CREATE_REPORTE_ERROR,
        payload: err.message || "Error al actualizar el reporte",
      });
      throw err;
    }
  };

  const removeReporte = async (id) => {
    await ReportesAPI.remove(id);
    dispatch({ type: DELETE_REPORTE_SUCCESS, payload: id });
  };

  const cambiarEstado = async (id, estado) => {
    const updated = await ReportesAPI.cambiarEstado(id, estado);
    dispatch({ type: CHANGE_ESTADO_REPORTE_SUCCESS, payload: updated });
    return updated;
  };

  const marcarVisto = async (id, visto = true) => {
    const updated = await ReportesAPI.marcarVisto(id, visto);
    dispatch({ type: MARCAR_VISTO_SUCCESS, payload: updated });
    return updated;
  };

  const cambiarAnonimato = async (id, esAnonimo) => {
    const updated = await ReportesAPI.setAnonimato(id, esAnonimo);
    dispatch({ type: CAMBIAR_ANONIMATO_SUCCESS, payload: updated });
    return updated;
  };

  // --------------- PROVIDER ------------------

  return (
    <ReportesContext.Provider
      value={{
        ...state,
        clearError,
        fetchReportes,
        fetchReporteById,
        fetchReportesByUsuario,
        fetchTiposReporte,
        fetchEstadosReporte,
        fetchPrioridadesReporte,
        createReporte,
        updateReporte,
        removeReporte,
        cambiarEstado,
        marcarVisto,
        cambiarAnonimato,
      }}
    >
      {children}
    </ReportesContext.Provider>
  );
}
