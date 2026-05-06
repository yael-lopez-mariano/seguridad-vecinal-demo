// src/services/servicios.api.js
import http from "./http";

// API para todo lo relacionado con Servicios (catálogo + tipos)
export const ServiciosAPI = {
  // ---------- TIPOS DE SERVICIO ----------

  // GET /api/Servicios/tipos-servicio
  getTiposServicio() {
    return http.get("/api/Servicios/tipos-servicio");
  },

  // GET /api/Servicios/tipos-servicio/{id}
  getTipoServicioById(id) {
    return http.get(`/api/Servicios/tipos-servicio/${id}`);
  },

  // ---------- CATÁLOGO DE SERVICIOS ----------

  // GET /api/Servicios/catalogo
  getCatalogoServicios() {
    return http.get("/api/Servicios/catalogo");
  },

  // GET /api/Servicios/catalogo/{id}
  getServicioById(id) {
    return http.get(`/api/Servicios/catalogo/${id}`);
  },

  // POST /api/Servicios/catalogo
  // body esperado:
  // {
  //   "tipoServicioID": number,
  //   "nombreEncargado": string,
  //   "telefono": string,
  //   "email": string,
  //   "notasInternas": string | null,
  //   "disponible": boolean
  // }
  crearServicio(data) {
    return http.post("/api/Servicios/catalogo", data);
  },

  // PUT /api/Servicios/catalogo/{id}
  actualizarServicio(id, data) {
    return http.put(`/api/Servicios/catalogo/${id}`, data);
  },

  // PUT /api/Servicios/catalogo/{id}/disponibilidad
  // body: { "disponible": boolean }
  actualizarDisponibilidad(id, disponible) {
    return http.put(`/api/Servicios/catalogo/${id}/disponibilidad`, {
      disponible,
    });
  },

  // ---------- PERSONAL DE MANTENIMIENTO ----------

  // GET /api/Servicios/personal-mantenimiento
  getPersonalMantenimiento() {
    return http.get("/api/Servicios/personal-mantenimiento");
  },

  // GET /api/Servicios/personal-mantenimiento/{id}
  getPersonalMantenimientoById(id) {
    return http.get(`/api/Servicios/personal-mantenimiento/${id}`);
  },

  // POST /api/Servicios/personal-mantenimiento
  // body esperado:
  // {
  //   "personaID": number,
  //   "puesto": string,
  //   "fechaContratacion": "YYYY-MM-DD",
  //   "sueldo": number,
  //   "tipoContrato": string,
  //   "turno": string,
  //   "diasLaborales": string,
  //   "notas": string | null
  // }
  crearPersonalMantenimiento(data) {
    return http.post("/api/Servicios/personal-mantenimiento", data);
  },

  // ---------- SOLICITUDES DE SERVICIO ----------

  // POST /api/Servicios/solicitud
  // body esperado:
  // {
  //   "usuarioID": number,
  //   "tipoServicioID": number,
  //   "descripcion": string,
  //   "urgencia": "Baja" | "Media" | "Alta",
  //   "fechaPreferida": "YYYY-MM-DD",
  //   "horaPreferida": "HH:mm:ss"
  // }
  crearSolicitudServicio(data) {
    return http.post("/api/Servicios/solicitud", data);
  },

  // GET /api/Servicios/solicitudes
  getSolicitudesServicios() {
    return http.get("/api/Servicios/solicitudes");
  },

  // GET /api/Servicios/solicitud/{id}
  getSolicitudServicioById(id) {
    return http.get(`/api/Servicios/solicitud/${id}`);
  },

  // GET /api/Servicios/solicitud/usuario/{usuarioId}
  getSolicitudesServicioByUsuario(usuarioId) {
    return http.get(`/api/Servicios/solicitud/usuario/${usuarioId}`);
  },

  // PUT /api/Servicios/solicitud/{id}/asignar
  // body: { "personaAsignado": number }
  asignarSolicitudServicio(id, personaAsignado) {
    return http.put(`/api/Servicios/solicitud/${id}/asignar`, {
      personaAsignado,
    });
  },

  // PUT /api/Servicios/solicitud/{id}/estado
  // body: { "estado": string }  // Ej: "Pendiente", "En proceso", "Completado", etc.
  actualizarEstadoSolicitud(id, estado) {
    return http.put(`/api/Servicios/solicitud/${id}/estado`, {
      estado,
    });
  },

  // PUT /api/Servicios/solicitud/{id}/completar
  // body: { "notasAdmin": string | null }
  completarSolicitudServicio(id, notasAdmin) {
    return http.put(`/api/Servicios/solicitud/${id}/completar`, {
      notasAdmin,
    });
  },
};

export default ServiciosAPI;
