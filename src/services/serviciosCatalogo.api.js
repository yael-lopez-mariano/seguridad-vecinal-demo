// src/services/serviciosCatalogo.api.js
import { http } from "./http";

const BASE = "/Servicios/catalogo";

export const ServiciosCatalogoApi = {
  // GET /api/Servicios/catalogo
  getAll() {
    return http.get(BASE);
  },

  // GET /api/Servicios/catalogo/{id}
  getById(id) {
    return http.get(`${BASE}/${id}`);
  },

  // POST /api/Servicios/catalogo
  create(payload) {
    return http.post(BASE, payload);
  },

  // PUT /api/Servicios/catalogo/{id}
  update(id, payload) {
    return http.put(`${BASE}/${id}`, payload);
  },

  // PUT /api/Servicios/catalogo/{id}/disponibilidad
  updateDisponibilidad(id, disponible) {
    return http.put(`${BASE}/${id}/disponibilidad`, { disponible });
  },
};
