// src/context/Amenidades/AmenidadesReducer.js
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

export const AmenidadesReducer = (state, action) => {
  switch (action.type) {
    case AMENIDADES_LOADING:
      return {
        ...state,
        loading: true,
      };

    case AMENIDADES_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload || "Ocurrió un error en amenidades",
      };

    case CLEAR_AMENIDADES_ERROR:
      return {
        ...state,
        error: null,
      };

    case GET_AMENIDADES_SUCCESS:
      return {
        ...state,
        loading: false,
        amenidades: action.payload || [],
      };

    case GET_TIPOS_AMENIDAD_SUCCESS:
      return {
        ...state,
        loading: false,
        tiposAmenidad: action.payload || [],
      };

    case SET_SELECTED_AMENIDAD:
      return {
        ...state,
        selectedAmenidad: action.payload || null,
      };

    case CREATE_AMENIDAD_SUCCESS:
      return {
        ...state,
        loading: false,
        amenidades: [...state.amenidades, action.payload],
      };

    case UPDATE_AMENIDAD_SUCCESS:
      return {
        ...state,
        loading: false,
        amenidades: state.amenidades.map((a) =>
          a.amenidadID === action.payload.amenidadID ? action.payload : a
        ),
      };

    default:
      return state;
  }
};
