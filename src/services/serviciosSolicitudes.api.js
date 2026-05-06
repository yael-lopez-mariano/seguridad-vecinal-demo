// src/services/serviciosSolicitudes.api.js
import { http } from "./http";

const BASE = "/Servicios";

export const ServiciosSolicitudesApi = {
  // POST /api/Servicios/solicitud
  create(payload) {
    return http.post(`${BASE}/solicitud`, payload);
  },

  // GET /api/Servicios/solicitudes
  getAll() {
    return http.get(`${BASE}/solicitudes`);
  },

  // GET /api/Servicios/solicitud/{id}
  getById(id) {
    return http.get(`${BASE}/solicitud/${id}`);
  },

  // GET /api/Servicios/solicitud/usuario/{usuarioId}
  getByUsuario(usuarioId) {
    return http.get(`${BASE}/solicitud/usuario/${usuarioId}`);
  },

  // PUT /api/Servicios/solicitud/{id}/asignar
  asignarPersona(id, personaAsignado) {
    return http.put(`${BASE}/solicitud/${id}/asignar`, {
      personaAsignado,
    });
  },

  // PUT /api/Servicios/solicitud/{id}/estado
  cambiarEstado(id, estado) {
    return http.put(`${BASE}/solicitud/${id}/estado`, { estado });
  },

  // PUT /api/Servicios/solicitud/{id}/completar
  completar(id, notasAdmin) {
    return http.put(`${BASE}/solicitud/${id}/completar`, { notasAdmin });
  },
};
