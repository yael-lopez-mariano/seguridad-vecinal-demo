// src/services/qrPersonal.api.js
import { http } from "./http";

const BASE = "/QRPersonal";

const QRPersonalAPI = {
  /**
   * Genera (o regenera) un QR para un usuario.
   * POST /api/QRPersonal/generar
   */
  generar(usuarioID) {
    return http.post(`${BASE}/generar`, { usuarioID });
  },

  /**
   * Obtiene la info del QR de un usuario.
   * GET /api/QRPersonal/usuario/{usuarioId}
   */
  getByUsuario(usuarioId) {
    return http.get(`${BASE}/usuario/${usuarioId}`);
  },

  /**
   * Actualiza el estado (activo / inactivo) del QR.
   * PUT /api/QRPersonal/{id}/estado
   */
  actualizarEstado(id, activo) {
    return http.put(`${BASE}/${id}/estado`, { activo });
  },
};

export default QRPersonalAPI;
