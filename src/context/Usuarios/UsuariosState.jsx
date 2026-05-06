import React, { useReducer } from "react";
import axios from "axios";

import UsuariosContext from "./UsuariosContext";
import UsuariosReducer from "./UsuariosReducer";
import { USUARIOS_ACTIONS } from "./ActionsTypes";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5165/api";

const UsuariosState = ({ children }) => {
  const initialState = {
    usuarios: [],
    usuarioSeleccionado: null,
    tiposUsuario: [],
    error: null,
  };

  const [state, dispatch] = useReducer(UsuariosReducer, initialState);

  const listarUsuarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/Usuarios`);
      dispatch({
        type: USUARIOS_ACTIONS.LISTAR,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: USUARIOS_ACTIONS.ERROR,
        payload: err.message,
      });
    }
  };

  // Obtener usuario por ID
  const obtenerUsuario = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/Usuarios/${id}`);
      dispatch({
        type: USUARIOS_ACTIONS.OBTENER,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: USUARIOS_ACTIONS.ERROR,
        payload: err.message,
      });
    }
  };

  // Registrar usuario
  const registrarUsuario = async (usuario) => {
    try {
      const res = await axios.post(`${API_URL}/Usuarios/register`, usuario);

      dispatch({
        type: USUARIOS_ACTIONS.REGISTRAR,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: USUARIOS_ACTIONS.ERROR,
        payload: err.message,
      });
    }
  };

  // Actualizar usuario
  const actualizarUsuario = async (usuario) => {
    try {
      const res = await axios.put(`${API_URL}/Usuarios/update`, usuario);

      dispatch({
        type: USUARIOS_ACTIONS.ACTUALIZAR,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: USUARIOS_ACTIONS.ERROR,
        payload: err.message,
      });
    }
  };

  // Obtener tipos de usuario
  const obtenerTiposUsuario = async () => {
    try {
      const res = await axios.get(`${API_URL}/Usuarios/tipos-usuario`);
      dispatch({
        type: USUARIOS_ACTIONS.TIPOS_USUARIO,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: USUARIOS_ACTIONS.ERROR,
        payload: err.message,
      });
    }
  };

  return (
    <UsuariosContext.Provider
      value={{
        usuarios: state.usuarios,
        usuarioSeleccionado: state.usuarioSeleccionado,
        tiposUsuario: state.tiposUsuario,
        error: state.error,

        listarUsuarios,
        obtenerUsuario,
        registrarUsuario,
        actualizarUsuario,
        obtenerTiposUsuario,
      }}
    >
      {children}
    </UsuariosContext.Provider>
  );
};

export default UsuariosState;
