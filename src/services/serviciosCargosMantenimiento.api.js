// src/services/serviciosCargosMantenimiento.api.js
import { http } from "./http";

const BASE = "/Servicios/cargos/mantenimiento";

export const ServiciosCargosMantenimientoApi = {
  // GET /api/Servicios/cargos/mantenimiento
  getAll() {
    return http.get(BASE);
  },

  // GET /api/Servicios/cargos/mantenimiento/usuario/{usuarioId}
  getByUsuario(usuarioId) {
    return http.get(`${BASE}/usuario/${usuarioId}`);
  },

  // POST /api/Servicios/cargos/mantenimiento
  create(payload) {
    return http.post(BASE, payload);
  },

  // PUT /api/Servicios/cargos/mantenimiento/{id}
  update(id, payload) {
    return http.put(`${BASE}/${id}`, payload);
  },
};
