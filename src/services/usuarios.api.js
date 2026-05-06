// src/app/services/usuarios.api.js
import { http } from "./http";
import demoStorage from "./demoStorage";

const base = "/Usuarios";
const DEMO_MODE = true;

export const UsuariosAPI = {
  // --- LOGIN (POST /Usuarios/login)
  login: ({ email, password }) =>
    DEMO_MODE
      ? Promise.resolve(demoStorage.validateCredentials(email, password))
      : http.post(`${base}/login`, { email, password }),

  // --- REGISTER (POST /Usuarios/register)
  register: (payload) =>
    DEMO_MODE
      ? Promise.resolve(demoStorage.registerUser(payload))
      : http.post(`${base}/register`, payload),

  // --- UPDATE (PUT /Usuarios/update)
  update: (payload) =>
    DEMO_MODE
      ? Promise.resolve(demoStorage.updateUser(payload))
      : http.put(`${base}/update`, payload),

  // --- LISTA DE USUARIOS (GET /Usuarios)
  list: () =>
    DEMO_MODE ? Promise.resolve(demoStorage.listUsers()) : http.get(base),

  // --- DETALLE POR ID (GET /Usuarios/{id})
  getById: (id) =>
    DEMO_MODE
      ? Promise.resolve(demoStorage.getUserById(id))
      : http.get(`${base}/${id}`),

  // --- TIPOS DE USUARIO (GET /Usuarios/tipos-usuario)
  tipos: () =>
    DEMO_MODE
      ? Promise.resolve(demoStorage.getDemoUserTypes())
      : http.get(`${base}/tipos-usuario`),

  // --- BAJA LOGICA DEMO (mantiene historial con activo=false)
  delete: (id) =>
    DEMO_MODE
      ? Promise.resolve(demoStorage.deactivateUser(id))
      : http.del(`${base}/${id}`),

  activate: (id) =>
    DEMO_MODE
      ? Promise.resolve(demoStorage.activateUser(id))
      : http.put(`${base}/${id}/activar`),

  deactivate: (id) =>
    DEMO_MODE
      ? Promise.resolve(demoStorage.deactivateUser(id))
      : http.put(`${base}/${id}/desactivar`),
};
