import { USUARIOS_ACTIONS } from "./ActionsTypes";

export default function UsuariosReducer(state, action) {
    switch (action.type) {
        case USUARIOS_ACTIONS.LISTAR:
            return {
                ...state,
                usuarios: action.payload,
                error: null
            };

        case USUARIOS_ACTIONS.OBTENER:
            return {
                ...state,
                usuarioSeleccionado: action.payload,
                error: null
            };

        case USUARIOS_ACTIONS.REGISTRAR:
            return {
                ...state,
                usuarios: [...state.usuarios, action.payload],
                error: null
            };

        case USUARIOS_ACTIONS.ACTUALIZAR:
            return {
                ...state,
                usuarios: state.usuarios.map((u) =>
                    u.usuarioID === action.payload.usuarioID ? action.payload : u
                ),
                error: null
            };

        case USUARIOS_ACTIONS.TIPOS_USUARIO:
            return {
                ...state,
                tiposUsuario: action.payload,
                error: null
            };

        case USUARIOS_ACTIONS.ERROR:
            return {
                ...state,
                error: action.payload
            };

        default:
            return state;
    }
}
