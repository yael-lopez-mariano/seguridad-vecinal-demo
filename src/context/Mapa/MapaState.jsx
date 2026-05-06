import React, { useReducer } from "react";
import MapaContext from "./MapaContext";
import {
  GET_MARCADORES,
  GET_MARCADOR,
  ADD_MARCADOR,
  UPDATE_MARCADOR,
  DELETE_MARCADOR,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
} from "./ActionsTypes";
import { MapaReducer } from "./MapaReducer";
import axios from "axios";

// Estado inicial
const initialState = {
  marcadores: [],
  selectedMarcador: null,
  apiResponse: null,
  loading: false,
  error: null,
};

const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5165/api";

// Provider
const MapaState = (props) => {
  const [state, dispatch] = useReducer(MapaReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: CLEAR_ERROR });
  };

  const getMarcadores = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Mapa/marcadores`);
      const activos = (res.data || []).filter((m) => m.activo !== false);

      dispatch({
        type: GET_MARCADORES,
        payload: activos,
      });

      return activos;
    } catch (error) {
      console.error("Error al obtener marcadores:", error);
      setError("No se pudieron cargar los marcadores del mapa.");
      return [];
    }
  };

  const getMarcador = async (marcadorID) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Mapa/marcadores/${marcadorID}`);

      dispatch({
        type: GET_MARCADOR,
        payload: res.data,
      });

      return res.data;
    } catch (error) {
      console.error("Error al obtener marcador:", error);
      setError("Error al cargar el marcador.");
      return null;
    }
  };

  const addMarcador = async (marcadorData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/Mapa/marcadores`, marcadorData);

      dispatch({
        type: ADD_MARCADOR,
        payload: res.data,
      });

      return res.data;
    } catch (error) {
      console.error("Error al crear marcador:", error);
      setError("Ocurrió un error al crear el marcador.");
      return null;
    }
  };

  const updateMarcador = async (marcadorData) => {
    try {
      setLoading(true);

      const res = await axios.put(`${API}/Mapa/marcadores`, marcadorData);

      dispatch({
        type: UPDATE_MARCADOR,
        payload: res.data,
      });

      getMarcadores();
      return res.data;
    } catch (error) {
      console.error("Error al actualizar marcador:", error);
      setError("Ocurrió un error al actualizar el marcador.");
      return null;
    }
  };

  const deleteMarcador = async (marcadorID) => {
    try {
      setLoading(true);
      await axios.delete(`${API}/Mapa/marcadores/${marcadorID}`);

      dispatch({
        type: DELETE_MARCADOR,
        payload: marcadorID,
      });

      return marcadorID;
    } catch (error) {
      console.error("Error al eliminar marcador:", error);
      setError("No se pudo eliminar el marcador.");
      return null;
    }
  };

  const clearSelectedMarcador = () => {
    dispatch({
      type: GET_MARCADOR,
      payload: null,
    });
  };

  const clearApiResponse = () => {
    dispatch({
      type: ADD_MARCADOR,
      payload: null,
    });
  };

  return (
    <MapaContext.Provider
      value={{
        marcadores: state.marcadores,
        selectedMarcador: state.selectedMarcador,
        apiResponse: state.apiResponse,
        loading: state.loading,
        error: state.error,

        getMarcadores,
        getMarcador,
        addMarcador,
        updateMarcador,
        deleteMarcador,
        clearSelectedMarcador,
        clearApiResponse,
        setError,
        clearError,
      }}
    >
      {props.children}
    </MapaContext.Provider>
  );
};

export default MapaState;
