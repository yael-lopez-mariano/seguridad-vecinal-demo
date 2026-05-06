// src/services/serviciosCargosServicios.api.js
import { http } from "./http";

const BASE = "/Servicios/cargos/servicios";

export const ServiciosCargosServiciosApi = {
  // GET /api/Servicios/cargos/servicios
  getAll() {
    return http.get(BASE);
  },

  // GET /api/Servicios/cargos/servicios/usuario/{usuarioId}
  getByUsuario(usuarioId) {
    return http.get(`${BASE}/usuario/${usuarioId}`);
  },

  // GET /api/Servicios/cargos/servicios/solicitud/{solicitudId}
  getBySolicitud(solicitudId) {
    return http.get(`${BASE}/solicitud/${solicitudId}`);
  },

  // POST /api/Servicios/cargos/servicios
  create(payload) {
    return http.post(BASE, payload);
  },
};
