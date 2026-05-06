// src/context/Servicios/ServiciosState.jsx
import React, { useReducer } from "react";
import ServiciosContext from "./ServiciosContext";
import ServiciosReducer from "./ServiciosReducer";

import {
  SERVICIOS_SET_LOADING,
  SERVICIOS_SET_ERROR,
  SERVICIOS_SET_TIPOS,
  SERVICIOS_SET_CATALOGO,
  SERVICIOS_SET_PERSONAL,
  SERVICIOS_SET_SOLICITUDES,
  SERVICIOS_SET_SOLICITUD_ACTUAL,
  SERVICIOS_SET_CARGOS_SERVICIOS,
  SERVICIOS_SET_CARGOS_MANT,
} from "./ActionsTypes";

// APIs
import { ServiciosTiposApi } from "../../services/serviciosTipos.api";
import { ServiciosCatalogoApi } from "../../services/serviciosCatalogo.api";
import { ServiciosPersonalApi } from "../../services/serviciosPersonal.api";
import { ServiciosSolicitudesApi } from "../../services/serviciosSolicitudes.api";
import { ServiciosCargosServiciosApi } from "../../services/serviciosCargosServicios.api";
import { ServiciosCargosMantenimientoApi } from "../../services/serviciosCargosMantenimiento.api";

const ServiciosState = ({ children }) => {
  const initialState = {
    tiposServicio: [],
    catalogoServicios: [],
    personalMantenimiento: [],
    solicitudes: [],
    solicitudActual: null,
    cargosServicios: [],
    cargosMantenimiento: [],
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(ServiciosReducer, initialState);

  const handleError = (err, mensajeDefault) => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      mensajeDefault ||
      "Error en servicios";
    dispatch({ type: SERVICIOS_SET_ERROR, payload: msg });
  };

  // =========================
  // TIPO SERVICIO
  // =========================
  const cargarTiposServicio = async () => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosTiposApi.getAll();
      dispatch({ type: SERVICIOS_SET_TIPOS, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar tipos de servicio");
    }
  };

  // =========================
  // CATÁLOGO SERVICIOS
  // =========================
  const cargarCatalogoServicios = async () => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosCatalogoApi.getAll();
      dispatch({ type: SERVICIOS_SET_CATALOGO, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar catálogo de servicios");
    }
  };

  const crearServicioCatalogo = async (payload) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosCatalogoApi.create(payload);
      await cargarCatalogoServicios();
    } catch (err) {
      handleError(err, "Error al registrar servicio");
    }
  };

  const actualizarServicioCatalogo = async (id, payload) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosCatalogoApi.update(id, payload);
      await cargarCatalogoServicios();
    } catch (err) {
      handleError(err, "Error al actualizar servicio");
    }
  };

  const cambiarDisponibilidadServicio = async (id, disponible) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosCatalogoApi.updateDisponibilidad(id, disponible);
      await cargarCatalogoServicios();
    } catch (err) {
      handleError(err, "Error al cambiar disponibilidad");
    }
  };

  // =========================
  // PERSONAL MANTENIMIENTO
  // =========================
  const cargarPersonalMantenimiento = async () => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosPersonalApi.getAll();
      dispatch({ type: SERVICIOS_SET_PERSONAL, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar personal de mantenimiento");
    }
  };

  const crearPersonalMantenimiento = async (payload) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosPersonalApi.create(payload);
      await cargarPersonalMantenimiento();
    } catch (err) {
      handleError(err, "Error al registrar personal de mantenimiento");
    }
  };

  // =========================
  // SOLICITUDES
  // =========================
  const crearSolicitudServicio = async (payload) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosSolicitudesApi.create(payload);
      await cargarSolicitudes();
    } catch (err) {
      handleError(err, "Error al registrar solicitud");
    }
  };

  const cargarSolicitudes = async () => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosSolicitudesApi.getAll();
      dispatch({ type: SERVICIOS_SET_SOLICITUDES, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar solicitudes");
    }
  };

  const cargarSolicitudPorId = async (id) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosSolicitudesApi.getById(id);
      dispatch({ type: SERVICIOS_SET_SOLICITUD_ACTUAL, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar solicitud");
    }
  };

  const cargarSolicitudesPorUsuario = async (usuarioId) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosSolicitudesApi.getByUsuario(usuarioId);
      dispatch({ type: SERVICIOS_SET_SOLICITUDES, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar solicitudes del usuario");
    }
  };

  const asignarSolicitud = async (id, personaAsignado) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosSolicitudesApi.asignarPersona(id, personaAsignado);
      await cargarSolicitudes();
    } catch (err) {
      handleError(err, "Error al asignar solicitud");
    }
  };

  const cambiarEstadoSolicitud = async (id, estado) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosSolicitudesApi.cambiarEstado(id, estado);
      await cargarSolicitudes();
    } catch (err) {
      handleError(err, "Error al cambiar estado de solicitud");
    }
  };

  const completarSolicitud = async (id, notasAdmin) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosSolicitudesApi.completar(id, notasAdmin);
      await cargarSolicitudes();
    } catch (err) {
      handleError(err, "Error al completar solicitud");
    }
  };

  // =========================
  // CARGOS SERVICIOS
  // =========================
  const cargarCargosServicios = async () => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosCargosServiciosApi.getAll();
      dispatch({ type: SERVICIOS_SET_CARGOS_SERVICIOS, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar cargos de servicios");
    }
  };

  const cargarCargosServiciosPorUsuario = async (usuarioId) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosCargosServiciosApi.getByUsuario(
        usuarioId
      );
      dispatch({ type: SERVICIOS_SET_CARGOS_SERVICIOS, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar cargos de servicios por usuario");
    }
  };

  const cargarCargosServiciosPorSolicitud = async (solicitudId) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosCargosServiciosApi.getBySolicitud(
        solicitudId
      );
      dispatch({ type: SERVICIOS_SET_CARGOS_SERVICIOS, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar cargos de servicios por solicitud");
    }
  };

  const crearCargoServicio = async (payload) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosCargosServiciosApi.create(payload);
      await cargarCargosServicios();
    } catch (err) {
      handleError(err, "Error al crear cargo de servicio");
    }
  };

  // =========================
  // CARGOS MANTENIMIENTO
  // =========================
  const cargarCargosMantenimiento = async () => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosCargosMantenimientoApi.getAll();
      dispatch({ type: SERVICIOS_SET_CARGOS_MANT, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar cargos de mantenimiento");
    }
  };

  const cargarCargosMantenimientoPorUsuario = async (usuarioId) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      const { data } = await ServiciosCargosMantenimientoApi.getByUsuario(
        usuarioId
      );
      dispatch({ type: SERVICIOS_SET_CARGOS_MANT, payload: data });
    } catch (err) {
      handleError(err, "Error al cargar cargos de mantenimiento por usuario");
    }
  };

  const crearCargoMantenimiento = async (payload) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosCargosMantenimientoApi.create(payload);
      await cargarCargosMantenimiento();
    } catch (err) {
      handleError(err, "Error al crear cargo de mantenimiento");
    }
  };

  const actualizarCargoMantenimiento = async (id, payload) => {
    dispatch({ type: SERVICIOS_SET_LOADING });
    try {
      await ServiciosCargosMantenimientoApi.update(id, payload);
      await cargarCargosMantenimiento();
    } catch (err) {
      handleError(err, "Error al actualizar cargo de mantenimiento");
    }
  };

  const clearError = () => {
    dispatch({ type: SERVICIOS_SET_ERROR, payload: null });
  };

  return (
    <ServiciosContext.Provider
      value={{
        // state
        tiposServicio: state.tiposServicio,
        catalogoServicios: state.catalogoServicios,
        personalMantenimiento: state.personalMantenimiento,
        solicitudes: state.solicitudes,
        solicitudActual: state.solicitudActual,
        cargosServicios: state.cargosServicios,
        cargosMantenimiento: state.cargosMantenimiento,
        loading: state.loading,
        error: state.error,

        // acciones
        cargarTiposServicio,
        cargarCatalogoServicios,
        crearServicioCatalogo,
        actualizarServicioCatalogo,
        cambiarDisponibilidadServicio,
        cargarPersonalMantenimiento,
        crearPersonalMantenimiento,
        crearSolicitudServicio,
        cargarSolicitudes,
        cargarSolicitudPorId,
        cargarSolicitudesPorUsuario,
        asignarSolicitud,
        cambiarEstadoSolicitud,
        completarSolicitud,
        cargarCargosServicios,
        cargarCargosServiciosPorUsuario,
        cargarCargosServiciosPorSolicitud,
        crearCargoServicio,
        cargarCargosMantenimiento,
        cargarCargosMantenimientoPorUsuario,
        crearCargoMantenimiento,
        actualizarCargoMantenimiento,
        clearError,
      }}
    >
      {children}
    </ServiciosContext.Provider>
  );
};

export default ServiciosState;
