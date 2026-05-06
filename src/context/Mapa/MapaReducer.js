import { GET_MARCADOR, GET_MARCADORES, ADD_MARCADOR, UPDATE_MARCADOR, DELETE_MARCADOR, SET_ERROR, SET_LOADING, CLEAR_ERROR } from "./ActionsTypes";

export const MapaReducer = (state, action) => {
    const { payload, type } = action;

    switch (type) {
        case GET_MARCADORES:
            return {
                ...state,
                marcadores: payload,
                loading: false,
                error: null,
            };
        case GET_MARCADOR:
            return {
                ...state,
                selectedMarcador: payload,
                loading: false,
                error: null,
            };
        case ADD_MARCADOR:
            return {
                ...state,
                marcadores: [...state.marcadores, payload],
                apiResponse: payload,
                loading: false,
                error: null,
            };
        case UPDATE_MARCADOR:
            return {
                ...state,
                marcadores: state.marcadores.map((marcador) =>
                    marcador.marcadorID === payload.marcadorID ? payload : marcador
                ),
                selectedMarcador: payload,
                apiResponse: payload,
                loading: false,
                error: null,
            };
        case DELETE_MARCADOR:
            return {
                ...state,
                marcadores: state.marcadores.filter(
                    (marcador) => marcador.marcadorID !== payload
                ),
                selectedMarcador: null,
                apiResponse: { deletedId: payload },
                loading: false,
                error: null,
            };
        case SET_LOADING:
            return {
                ...state,
                loading: payload,
            };
        case SET_ERROR:
            return {
                ...state,
                error: payload,
                loading: false,
            };
        case CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};