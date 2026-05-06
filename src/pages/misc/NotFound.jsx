// src/pages/misc/NotFound.jsx
import { Link, useNavigate } from "react-router-dom";
import Placeholder from "../../components/misc/Placeholder";

export default function NotFound() {
  const nav = useNavigate();

  return (
    <Placeholder title="404" subtitle="Página no encontrada.">
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => nav(-1)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-100"
        >
          Volver
        </button>
        <Link
          to="/admin/dashboard"
          className="px-3 py-2 text-sm rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          Ir al dashboard
        </Link>
      </div>
    </Placeholder>
  );
}
