// src/services/serviciosPersonal.api.js
import { http } from "./http";

const BASE = "/Servicios/personal-mantenimiento";

export const ServiciosPersonalApi = {
  // GET /api/Servicios/personal-mantenimiento
  getAll() {
    return http.get(BASE);
  },

  // GET /api/Servicios/personal-mantenimiento/{id}
  getById(id) {
    return http.get(`${BASE}/${id}`);
  },

  // POST /api/Servicios/personal-mantenimiento
  create(payload) {
    return http.post(BASE, payload);
  },
};
