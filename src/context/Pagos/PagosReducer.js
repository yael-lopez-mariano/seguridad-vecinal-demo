import {
    GET_CARGOS_MANTENIMIENTO,
    GET_CARGOS_MANTENIMIENTO_USER,
    GET_CARGOS_SERVICIOS,
    GET_CARGOS_SERVICIOS_USER,
    SET_LOADING,
    SET_ERROR,
    CLEAR_ERROR,
} from "./ActionsTypes";

export const PagosReducer = (state, action) => {
    const { payload, type } = action;

    switch (type) {
        case GET_CARGOS_MANTENIMIENTO:
            return {
                ...state,
                cargosMantenimiento: payload,
                loading: false,
                error: null,
            };

        case GET_CARGOS_MANTENIMIENTO_USER:
            return {
                ...state,
                cargosMantenimientoUser: payload,
                loading: false,
                error: null,
            };

        case GET_CARGOS_SERVICIOS:
            return {
                ...state,
                cargosServicios: payload,
                loading: false,
                error: null,
            };

        case GET_CARGOS_SERVICIOS_USER:
            return {
                ...state,
                cargosServiciosUser: payload,
                loading: false,
                error: null,
            };

        case SET_LOADING:
            return { ...state, loading: payload };

        case SET_ERROR:
            return { ...state, error: payload, loading: false };

        case CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};
