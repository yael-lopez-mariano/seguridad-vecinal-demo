// src/context/Reservas/ReservasReducer.js
import Types from "./ActionsTypes";

export const initialState = {
  reservas: [], // todas las reservas (admin)
  reservasUsuario: [], // reservas de un usuario
  loading: false,
  error: null,
};

export default function ReservasReducer(state, action) {
  switch (action.type) {
    case Types.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case Types.SET_ERROR:
      return {
        ...state,
        error: action.payload || "Ocurrió un error al cargar las reservas",
        loading: false,
      };

    case Types.SET_RESERVAS:
      return {
        ...state,
        reservas: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
        error: null,
      };

    case Types.SET_RESERVAS_USUARIO:
      return {
        ...state,
        reservasUsuario: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
        error: null,
      };

    case Types.ADD_RESERVA:
      return {
        ...state,
        reservas: [action.payload, ...(state.reservas || [])],
        loading: false,
      };

    case Types.UPDATE_RESERVA:
      return {
        ...state,
        reservas: (state.reservas || []).map((r) =>
          r.reservaID === action.payload.reservaID ? action.payload : r
        ),
        loading: false,
      };

    default:
      return state;
  }
}
