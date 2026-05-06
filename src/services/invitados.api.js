// src/services/invitados.api.js
import http from "./http";

const InvitadosAPI = {
  // 🔹 Admin: trae TODAS las invitaciones
  getAll: () => http.get("/Invitados"),

  // 🔹 Invitados por usuario (cuando lo uses para residentes)
  getByUsuario: (usuarioId) => http.get(`/Invitados/usuario/${usuarioId}`),

  /* 🔹 Crear nueva invitación
    body:
    {
      usuarioID: number,
      nombreInvitado: string,
      apellidoPaternoInvitado: string,
      apellidoMaternoInvitado: string,
      fechaVisita: string (ISO)
    }
  */
  crear: (data) => http.post("/Invitados", data),

  // 🔹 Cancelar invitación
  cancelar: (id) => http.put(`/Invitados/${id}/cancelar`),
};

export default InvitadosAPI;
