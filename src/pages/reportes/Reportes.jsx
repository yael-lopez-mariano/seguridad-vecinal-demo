// src/pages/reportes/Reportes.jsx
import { Link } from "react-router-dom";
import ReportesList from "./ReportesList";

export default function Reportes() {
  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumb principal de la sección */}
      <div className="mb-5 text-sm text-slate-500 flex items-center gap-2">
        <Link
          to="/admin/dashboard"
          className="hover:text-emerald-600 transition-colors"
        >
          Inicio
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Reportes</span>
      </div>

      {/* Título y subtítulo de la sección */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
          Administración de reportes
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Como administrador puedes revisar, atender y cambiar el estado de los
          reportes enviados por los vecinos.
        </p>
      </div>

      {/* Contenido: la lista completa con filtros y acciones */}
      <ReportesList />
    </div>
  );
}
