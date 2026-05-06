// src/services/serviciosTipos.api.js
import { http } from "./http";

const BASE = "/Servicios";

export const ServiciosTiposApi = {
  // GET /api/Servicios/tipos-servicio
  getAll() {
    return http.get(`${BASE}/tipos-servicio`);
  },

  // GET /api/Servicios/tipos-servicio/{id}
  getById(id) {
    return http.get(`${BASE}/tipos-servicio/${id}`);
  },
};
