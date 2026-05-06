// src/context/Reservas/ReservasState.jsx
import { useCallback, useReducer } from "react";
import ReservasContext from "./ReservasContext";
import ReservasReducer, { initialState } from "./ReservasReducer";
import Types from "./ActionsTypes";
import ReservasAPI from "../../services/reservas.api";

export default function ReservasState({ children }) {
  const [state, dispatch] = useReducer(ReservasReducer, initialState);

  const setLoading = (value) =>
    dispatch({ type: Types.SET_LOADING, payload: value });

  const setError = (err) =>
    dispatch({
      type: Types.SET_ERROR,
      payload:
        err?.response?.data?.message ||
        err?.message ||
        "Ocurrió un error con las reservas",
    });

  // ==========================
  // Leer reservas
  // ==========================
  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ReservasAPI.getAll();
      dispatch({ type: Types.SET_RESERVAS, payload: data });
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReservasByUsuario = useCallback(async (usuarioId) => {
    try {
      setLoading(true);
      const data = await ReservasAPI.getByUsuario(usuarioId);
      dispatch({ type: Types.SET_RESERVAS_USUARIO, payload: data });
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================
  // Crear / cancelar / cambiar estado
  // ==========================

  const crearReserva = async (payload) => {
    try {
      setLoading(true);
      await ReservasAPI.create(payload);

      await fetchReservas();
    } catch (err) {
      console.error(err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (id) => {
    try {
      setLoading(true);
      await ReservasAPI.cancelar(id);
      await fetchReservas();
    } catch (err) {
      console.error(err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoReserva = async (id, estado) => {
    try {
      setLoading(true);
      await ReservasAPI.actualizarEstado(id, estado);

      await fetchReservas();
    } catch (err) {
      console.error(err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReservasContext.Provider
      value={{
        ...state,
        fetchReservas,
        fetchReservasByUsuario,
        crearReserva,
        cancelarReserva,
        actualizarEstadoReserva,
      }}
    >
      {children}
    </ReservasContext.Provider>
  );
}
