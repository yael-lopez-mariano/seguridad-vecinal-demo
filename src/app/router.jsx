// src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/auth/Login";

import Dashboard from "../pages/dashboard/Dashboard";
import Avisos from "../pages/avisos/Avisos";
import Reportes from "../pages/reportes/Reportes";
import ReporteDetail from "../pages/reportes/ReporteDetail";

// Alertas
import AdminAlertasPage from "../pages/alertas/AdminAlertasPage";
import AdminAlertaDetalle from "../pages/alertas/AdminAlertaDetalle";

// Finanzas
import CargosMantenimiento from "../pages/finanzas/CargosMantenimiento";
import CargosServicios from "../pages/finanzas/CargosServicios";

// Usuarios
import UsuariosList from "../pages/usuarios/UsuariosList";
import MiPerfil from "../pages/usuarios/MiPerfil";

// Invitados
import InvitadosList from "../pages/invitados/InvitadosList";

// QR personales
import QRPersonalList from "../pages/qr/QrPersonalesList";

// Mapa
import MapaAdmin from "../pages/mapa/MapaAdmin";

// Servicios - catálogo
import ServicesList from "../pages/servicios/ServicesList";

// Personal de mantenimiento
import PersonalMantenimientoList from "../pages/servicios/PersonalMantenimientoList";

// Solicitudes de servicio
import SolicitudesList from "../pages/servicios/SolicitudesList";

// *** Amenidades ***
import AmenidadesList from "../pages/amenidades/AmenidadesList";

// *** Reservas de amenidades ***
import ReservasList from "../pages/reservas/ReservasList";

import NotFound from "../pages/misc/NotFound";

export const router = createBrowserRouter([
  // Público
  { path: "/auth/login", element: <Login /> },

  // Área protegida (admin)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      // Redirecciones base
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "admin", element: <Navigate to="/admin/dashboard" replace /> },

      // Dashboard
      { path: "admin/dashboard", element: <Dashboard /> },

      // Perfil del usuario logeado
      { path: "admin/perfil", element: <MiPerfil /> },

      // Usuarios residentes
      {
        path: "admin/usuarios/residentes",
        element: <UsuariosList />,
      },

      //  Personal de mantenimiento
      {
        path: "admin/usuarios/personal",
        element: <PersonalMantenimientoList />,
      },

      // Invitados (vista admin: todas las invitaciones)
      {
        path: "admin/accesos/invitados",
        element: <InvitadosList />,
      },

      // QR personales
      {
        path: "admin/accesos/qr-personales",
        element: <QRPersonalList />,
      },

      // Mapa
      {
        path: "admin/mapa",
        element: <MapaAdmin />,
      },

      // *** Amenidades (ruta para el sidebar) ***
      {
        path: "admin/amenidades",
        element: <AmenidadesList />,
      },

      // *** Reservas de amenidades ***
      {
        path: "admin/amenidades/reservas",
        element: <ReservasList />,
      },

      // Avisos
      { path: "admin/avisos", element: <Avisos /> },

      // Reportes (lista + detalle)
      { path: "admin/reportes", element: <Reportes /> },
      { path: "admin/reportes/:id", element: <ReporteDetail /> },

      // Finanzas
      {
        path: "admin/finanzas/cargos-mantenimiento",
        element: <CargosMantenimiento />,
      },
      {
        path: "admin/finanzas/cargos-servicios",
        element: <CargosServicios />,
      },

      // Servicios - Catálogo
      {
        path: "admin/servicios/catalogo",
        element: <ServicesList />,
      },

      // Servicios - Solicitudes
      {
        path: "admin/servicios/solicitudes",
        element: <SolicitudesList />,
      },

      // Alertas
      { path: "admin/alertas", element: <AdminAlertasPage /> },
      { path: "admin/alertas/:id", element: <AdminAlertaDetalle /> },

      // 404 interno
      { path: "*", element: <NotFound /> },
    ],
  },

  // 404 global
  { path: "*", element: <NotFound /> },
]);

export default router;
