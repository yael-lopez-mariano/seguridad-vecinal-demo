import React, { useReducer } from "react";
import PagosContext from "./PagosContext";
import {
  GET_CARGOS_MANTENIMIENTO,
  GET_CARGOS_MANTENIMIENTO_USER,
  GET_CARGOS_SERVICIOS,
  GET_CARGOS_SERVICIOS_USER,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
} from "./ActionsTypes";

import { PagosReducer } from "./PagosReducer";
import axios from "axios";

const initialState = {
  cargosMantenimiento: [],
  cargosMantenimientoUser: [],
  cargosServicios: [],
  cargosServiciosUser: [],
  loading: false,
  error: null,
};

const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5165/api";

const PagosState = (props) => {
  const [state, dispatch] = useReducer(PagosReducer, initialState);

  const setLoading = (value) => dispatch({ type: SET_LOADING, payload: value });

  const setError = (error) => dispatch({ type: SET_ERROR, payload: error });

  const clearError = () => dispatch({ type: CLEAR_ERROR });

  const getCargosMantenimiento = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/Pagos/cargos/mantenimiento/${userId}`
      );

      dispatch({
        type: GET_CARGOS_MANTENIMIENTO_USER,
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      console.error(err);
      setError("No se pudieron obtener los cargos de mantenimiento.");
      return [];
    }
  };

  const getAllCargosMantenimiento = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Pagos/cargos/mantenimiento`);

      dispatch({
        type: GET_CARGOS_MANTENIMIENTO,
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      console.error(err);
      setError("Error obteniendo todos los cargos de mantenimiento.");
      return [];
    }
  };

  const getCargosServicios = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Pagos/cargos/servicio/${userId}`);

      dispatch({
        type: GET_CARGOS_SERVICIOS_USER,
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      console.error(err);
      setError("No se pudieron obtener los cargos de servicios.");
      return [];
    }
  };

  const getAllCargosServicios = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Pagos/cargos/servicio`);

      dispatch({
        type: GET_CARGOS_SERVICIOS,
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      console.error(err);
      setError("Error obteniendo todos los cargos de servicios.");
      return [];
    }
  };

  const obtenerTodosLosPagos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Pagos`); // Necesitas crear este endpoint

      return res.data;
    } catch (err) {
      console.error(err);
      setError("Error obteniendo todos los pagos.");
      return [];
    }
  };

  return (
    <PagosContext.Provider
      value={{
        cargosMantenimiento: state.cargosMantenimiento,
        cargosMantenimientoUser: state.cargosMantenimientoUser,
        cargosServicios: state.cargosServicios,
        cargosServiciosUser: state.cargosServiciosUser,

        loading: state.loading,
        error: state.error,

        // Métodos
        getCargosMantenimiento,
        getAllCargosMantenimiento,
        getCargosServicios,
        getAllCargosServicios,
        obtenerTodosLosPagos,
        setError,
        clearError,
      }}
    >
      {props.children}
    </PagosContext.Provider>
  );
};

export default PagosState;
