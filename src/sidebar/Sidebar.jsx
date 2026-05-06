import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "./Icons";

export default function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout: authLogout } = useAuth();

  const logout = () => {
    authLogout();
    navigate("/auth/login", { replace: true });
  };

  const linkCls = ({ isActive }) =>
    [
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
      "text-ink/90 hover:bg-emerald-50 hover:text-ink",
      isActive ? "bg-emerald-100 font-semibold text-ink" : "",
      collapsed ? "justify-center" : "",
    ].join(" ");

  return (
    <aside
      className={[
        "bg-white shadow-card h-screen sticky top-0 flex flex-col",
        collapsed ? "w-[84px]" : "w-[260px]",
        "transition-[width] duration-200",
      ].join(" ")}
    >
      {/* Header verde */}
      <header className="relative">
        <div className="h-24 px-4 flex items-center justify-between text-white bg-gradient-to-br from-[#047857] to-[#10B981] border-b border-white/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-12 h-12 rounded-full border-4 border-emerald-200 bg-white grid place-items-center overflow-hidden">
              <img
                src="/logo/imagen_2025-10-26_192500425-removebg-preview-removebg-preview.png"
                alt="Red de Seguridad Vecinal"
                className="w-10 h-10 object-contain p-1"
              />
            </div>
            {!collapsed && (
              <div className="leading-tight truncate">
                <div className="font-extrabold text-lg truncate">
                  {user.nombre} {user.apellidoP}
                </div>
                <div className="flex items-center gap-2 text-white/90 text-xs">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      user.online
                        ? "bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,.9)]"
                        : "bg-slate-300"
                    }`}
                    aria-label={user.online ? "En línea" : "Desconectado"}
                    title={user.online ? "En línea" : "Desconectado"}
                  />
                  <span>{user.online ? "Online" : "Offline"}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-2 rounded-lg hover:bg-white/10"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {Icon.menu}
          </button>
        </div>
        <div className="h-[6px] bg-emerald-200/70" />
      </header>

      {/* NAV (tus rutas) */}
      <nav className="p-4 space-y-5 flex-1 overflow-y-auto">
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Inicio
            </p>
          )}
          <NavLink to="/admin/dashboard" className={linkCls} title="Dashboard">
            <span className="text-emerald-700">{Icon.home}</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Seguridad comunitaria
            </p>
          )}
          <NavLink to="/admin/reportes" className={linkCls} title="Reportes">
            <span className="text-emerald-700">{Icon.warn}</span>
            {!collapsed && <span>Reportes</span>}
          </NavLink>
          <NavLink
            to="/admin/alertas"
            className={linkCls}
            title="Alertas de pánico"
          >
            <span className="text-emerald-700">{Icon.bell}</span>
            {!collapsed && <span>Alertas de pánico</span>}
          </NavLink>

          <NavLink to="/admin/avisos" className={linkCls} title="Avisos">
            <span className="text-emerald-700">{Icon.file}</span>
            {!collapsed && <span>Avisos</span>}
          </NavLink>
          {/* Mapa de zonas */}
          <NavLink to="/admin/mapa" className={linkCls} title="Mapa de zonas">
            <span className="text-emerald-700">{Icon.map}</span>
            {!collapsed && <span>Mapa</span>}
          </NavLink>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Accesos
            </p>
          )}
          <NavLink
            to="/admin/accesos/qr-personales"
            className={({ isActive }) => linkCls(isActive)}
            title="QR personales"
            end
          >
            <span className="text-emerald-700 text-lg">{Icon.qr}</span>
            {!collapsed && <span>QR personales</span>}
          </NavLink>

          <NavLink
            to="/admin/accesos/invitados"
            className={linkCls}
            title="Invitados"
          >
            <span className="text-emerald-700">{Icon.people}</span>
            {!collapsed && <span>Invitados</span>}
          </NavLink>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Amenidades
            </p>
          )}
          <NavLink
            to="/admin/amenidades"
            className={linkCls}
            title="Amenidades"
          >
            <span className="text-emerald-700">{Icon.building}</span>
            {!collapsed && <span>Amenidades</span>}
          </NavLink>
          <NavLink
            to="/admin/amenidades/reservas"
            className={linkCls}
            title="Reservas"
          >
            <span className="text-emerald-700">{Icon.calendar}</span>
            {!collapsed && <span>Reservas</span>}
          </NavLink>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Servicios
            </p>
          )}
          <NavLink
            to="/admin/servicios/catalogo"
            className={linkCls}
            title="Catálogo de servicios"
          >
            <span className="text-emerald-700">{Icon.toolbox}</span>
            {!collapsed && <span>Catálogo</span>}
          </NavLink>

          <NavLink
            to="/admin/servicios/solicitudes"
            className={linkCls}
            title="Solicitudes de servicio"
          >
            <span className="text-emerald-700">{Icon.file}</span>
            {!collapsed && <span>Solicitudes</span>}
          </NavLink>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Finanzas
            </p>
          )}

          <NavLink
            to="/admin/finanzas/cargos-mantenimiento"
            className={linkCls}
            title="Cargos mantenimiento"
          >
            <span className="text-emerald-700">{Icon.receipt}</span>
            {!collapsed && <span>Cargos mantenimiento</span>}
          </NavLink>
          <NavLink
            to="/admin/finanzas/cargos-servicios"
            className={linkCls}
            title="Cargos de servicios"
          >
            <span className="text-emerald-700">{Icon.file}</span>
            {!collapsed && <span>Cargos de servicios</span>}
          </NavLink>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Usuarios
            </p>
          )}
          <NavLink
            to="/admin/usuarios/residentes"
            className={linkCls}
            title="Residentes"
          >
            <span className="text-emerald-700">{Icon.user}</span>
            {!collapsed && <span>Usuarios</span>}
          </NavLink>

          <NavLink
            to="/admin/usuarios/personal"
            className={linkCls}
            title="Personal mantenimiento"
          >
            <span className="text-emerald-700">{Icon.toolbox}</span>
            {!collapsed && <span>Personal mantenimiento</span>}
          </NavLink>
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Configuración
            </p>
          )}
          <NavLink
            to="/admin/config/catalogos"
            className={linkCls}
            title="Catálogos & SLA"
          >
            <span className="text-emerald-700">{Icon.file}</span>
            {!collapsed && <span>Catálogos & SLA</span>}
          </NavLink>
          <NavLink to="/admin/perfil" className={linkCls} title="Perfil">
            <span className="text-emerald-700">{Icon.user}</span>
            {!collapsed && <span>Perfil</span>}
          </NavLink>
        </div>

        <button
          onClick={logout}
          className={[
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
            "bg-red-50 text-red-600 hover:bg-red-100",
            collapsed ? "justify-center" : "",
          ].join(" ")}
          title="Cerrar sesión"
        >
          {Icon.power}
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </nav>
    </aside>
  );
}
