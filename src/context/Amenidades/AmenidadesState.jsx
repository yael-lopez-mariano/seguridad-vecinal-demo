// src/context/Amenidades/AmenidadesState.jsx
import { useCallback, useMemo, useReducer } from "react";
import AmenidadesContext from "./AmenidadesContext";
import { AmenidadesReducer } from "./AmenidadesReducer";
import {
  AMENIDADES_LOADING,
  AMENIDADES_ERROR,
  CLEAR_AMENIDADES_ERROR,
  GET_AMENIDADES_SUCCESS,
  GET_TIPOS_AMENIDAD_SUCCESS,
  SET_SELECTED_AMENIDAD,
  CREATE_AMENIDAD_SUCCESS,
  UPDATE_AMENIDAD_SUCCESS,
} from "./ActionsTypes";
import { AmenidadesAPI } from "../../services/amenidades.api";

const initialState = {
  amenidades: [],
  tiposAmenidad: [],
  selectedAmenidad: null,
  loading: false,
  error: null,
};

const AmenidadesState = ({ children }) => {
  const [state, dispatch] = useReducer(AmenidadesReducer, initialState);

  const setLoading = useCallback(
    () => dispatch({ type: AMENIDADES_LOADING }),
    [dispatch]
  );

  const setError = useCallback(
    (message) =>
      dispatch({
        type: AMENIDADES_ERROR,
        payload: message,
      }),
    [dispatch]
  );

  const clearError = useCallback(
    () => dispatch({ type: CLEAR_AMENIDADES_ERROR }),
    [dispatch]
  );

  const cargarAmenidades = useCallback(async () => {
    try {
      setLoading();
      const data = await AmenidadesAPI.getAll();
      dispatch({
        type: GET_AMENIDADES_SUCCESS,
        payload: data,
      });
    } catch (err) {
      console.error("Error al cargar amenidades:", err);
      setError(err.message || "Error al cargar amenidades");
    }
  }, [setLoading, setError]);

  const cargarTiposAmenidad = useCallback(async () => {
    try {
      setLoading();
      const data = await AmenidadesAPI.getTiposAmenidad();
      dispatch({
        type: GET_TIPOS_AMENIDAD_SUCCESS,
        payload: data,
      });
    } catch (err) {
      console.error("Error al cargar tipos de amenidad:", err);
      setError(err.message || "Error al cargar tipos de amenidad");
    }
  }, [setLoading, setError]);

  const seleccionarAmenidad = useCallback(
    (amenidad) =>
      dispatch({
        type: SET_SELECTED_AMENIDAD,
        payload: amenidad,
      }),
    [dispatch]
  );

  // ➕ Crear amenidad y traerla completa
  const crearAmenidad = useCallback(
    async (payload) => {
      try {
        setLoading();
        const res = await AmenidadesAPI.create(payload); // { id, message }
        const fullAmenidad = await AmenidadesAPI.getById(res.id);

        dispatch({
          type: CREATE_AMENIDAD_SUCCESS,
          payload: fullAmenidad,
        });

        return fullAmenidad;
      } catch (err) {
        console.error("Error al crear amenidad:", err);
        setError(err.message || "Error al crear amenidad");
        throw err;
      }
    },
    [setLoading, setError]
  );

  // ✏️ Actualizar amenidad y refrescar solo esa fila
  const actualizarAmenidad = useCallback(
    async (id, payload) => {
      try {
        setLoading();
        await AmenidadesAPI.update(id, payload);
        const fullAmenidad = await AmenidadesAPI.getById(id);

        dispatch({
          type: UPDATE_AMENIDAD_SUCCESS,
          payload: fullAmenidad,
        });

        return fullAmenidad;
      } catch (err) {
        console.error("Error al actualizar amenidad:", err);
        setError(err.message || "Error al actualizar amenidad");
        throw err;
      }
    },
    [setLoading, setError]
  );

  const value = useMemo(
    () => ({
      amenidades: state.amenidades,
      tiposAmenidad: state.tiposAmenidad,
      selectedAmenidad: state.selectedAmenidad,
      loading: state.loading,
      error: state.error,
      cargarAmenidades,
      cargarTiposAmenidad,
      seleccionarAmenidad,
      crearAmenidad,
      actualizarAmenidad,
      clearError,
    }),
    [
      state.amenidades,
      state.tiposAmenidad,
      state.selectedAmenidad,
      state.loading,
      state.error,
      cargarAmenidades,
      cargarTiposAmenidad,
      seleccionarAmenidad,
      crearAmenidad,
      actualizarAmenidad,
      clearError,
    ]
  );

  return (
    <AmenidadesContext.Provider value={value}>
      {children}
    </AmenidadesContext.Provider>
  );
};

export default AmenidadesState;
