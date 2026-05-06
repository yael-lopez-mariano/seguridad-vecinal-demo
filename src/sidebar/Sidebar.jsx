import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "./Icons";

const navGroups = [
  {
    label: "Inicio",
    items: [{ to: "/admin/dashboard", title: "Dashboard", icon: Icon.home }],
  },
  {
    label: "Seguridad comunitaria",
    items: [
      { to: "/admin/reportes", title: "Reportes", icon: Icon.warn },
      { to: "/admin/alertas", title: "Alertas de panico", icon: Icon.bell },
      { to: "/admin/avisos", title: "Avisos", icon: Icon.file },
      { to: "/admin/mapa", title: "Mapa", icon: Icon.map },
    ],
  },
  {
    label: "Accesos",
    items: [
      { to: "/admin/accesos/qr-personales", title: "QR personales", icon: Icon.qr },
      { to: "/admin/accesos/invitados", title: "Invitados", icon: Icon.people },
    ],
  },
  {
    label: "Amenidades",
    items: [
      { to: "/admin/amenidades", title: "Amenidades", icon: Icon.building },
      { to: "/admin/amenidades/reservas", title: "Reservas", icon: Icon.calendar },
    ],
  },
  {
    label: "Servicios",
    items: [
      { to: "/admin/servicios/catalogo", title: "Catalogo", icon: Icon.toolbox },
      { to: "/admin/servicios/solicitudes", title: "Solicitudes", icon: Icon.file },
    ],
  },
  {
    label: "Finanzas",
    items: [
      {
        to: "/admin/finanzas/cargos-mantenimiento",
        title: "Cargos mantenimiento",
        icon: Icon.receipt,
      },
      {
        to: "/admin/finanzas/cargos-servicios",
        title: "Cargos de servicios",
        icon: Icon.file,
      },
    ],
  },
  {
    label: "Usuarios",
    items: [
      { to: "/admin/usuarios/residentes", title: "Usuarios", icon: Icon.user },
      {
        to: "/admin/usuarios/personal",
        title: "Personal mantenimiento",
        icon: Icon.toolbox,
      },
    ],
  },
  {
    label: "Configuracion",
    items: [
      { to: "/admin/config/catalogos", title: "Catalogos & SLA", icon: Icon.file },
      { to: "/admin/perfil", title: "Perfil", icon: Icon.user },
    ],
  },
];

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout: authLogout } = useAuth();

  const logout = () => {
    authLogout();
    onMobileClose?.();
    navigate("/auth/login", { replace: true });
  };

  const linkCls = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
      "text-ink/90 hover:bg-emerald-50 hover:text-ink",
      isActive ? "bg-emerald-100 font-semibold text-ink" : "",
      collapsed ? "lg:justify-center" : "",
    ].join(" ");

  const sidebar = (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-hidden bg-white shadow-card",
        "lg:sticky lg:top-0 lg:z-auto",
        collapsed ? "lg:w-[84px]" : "lg:w-[260px]",
        "w-[82vw] max-w-[300px] sm:w-[300px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "transition-[transform,width] duration-200",
      ].join(" ")}
    >
      <header className="relative shrink-0">
        <div className="flex h-24 items-center justify-between border-b border-white/20 bg-gradient-to-br from-[#047857] to-[#10B981] px-4 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-emerald-200 bg-white">
              <img
                src="/logo/imagen_2025-10-26_192500425-removebg-preview-removebg-preview.png"
                alt="Red de Seguridad Vecinal"
                className="h-10 w-10 object-contain p-1"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="truncate text-lg font-extrabold">
                  {user.nombre} {user.apellidoP}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/90">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      user.online
                        ? "bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,.9)]"
                        : "bg-slate-300"
                    }`}
                    aria-label={user.online ? "En linea" : "Desconectado"}
                    title={user.online ? "En linea" : "Desconectado"}
                  />
                  <span>{user.online ? "Online" : "Offline"}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="hidden rounded-lg p-2 hover:bg-white/10 lg:inline-flex"
              title={collapsed ? "Expandir" : "Colapsar"}
            >
              {Icon.menu}
            </button>
            <button
              type="button"
              onClick={onMobileClose}
              className="rounded-lg px-2 py-1 text-xl leading-none hover:bg-white/10 lg:hidden"
              title="Cerrar menu"
            >
              x
            </button>
          </div>
        </div>
        <div className="h-[6px] bg-emerald-200/70" />
      </header>

      <nav className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkCls}
                title={item.title}
                onClick={onMobileClose}
              >
                <span className="text-emerald-700">{item.icon}</span>
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        ))}

        <button
          type="button"
          onClick={logout}
          className={[
            "flex w-full items-center gap-3 rounded-lg px-3 py-2",
            "bg-red-50 text-red-600 hover:bg-red-100",
            collapsed ? "lg:justify-center" : "",
          ].join(" ")}
          title="Cerrar sesion"
        >
          {Icon.power}
          {!collapsed && <span>Cerrar sesion</span>}
        </button>
      </nav>
    </aside>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/45 lg:hidden"
        />
      )}
      {sidebar}
    </>
  );
}
