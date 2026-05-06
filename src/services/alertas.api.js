// src/services/alertas.api.js
import { http } from "./http";

const AlertasAPI = {
  // GET /api/Alertas
  getAll: () => http.get("/Alertas"),

  // GET /api/Alertas/usuario/{userId}
  getByUser: (userId) => http.get(`/Alertas/usuario/${userId}`),

  // GET /api/Alertas/{id}
  getById: (id) => http.get(`/Alertas/${id}`),

  // SOLO CATEGORÍAS
  getCategorias: () => http.get("/Avisos/categorias-aviso"),

  // POST /api/Alertas
  crear: (payload) => http.post("/Alertas", payload),

  // PUT /api/Alertas/{id}/estado   -> { activa: false } = atendida
  updateEstado: (id, activa) => http.put(`/Alertas/${id}/estado`, { activa }),
};

export default AlertasAPI; // permite: import AlertasAPI from "...";
export { AlertasAPI }; // opcional: import { AlertasAPI } from "...";
