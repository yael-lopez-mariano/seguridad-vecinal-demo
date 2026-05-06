// src/pages/invitados/InvitadosList.jsx
import { useEffect, useMemo, useState } from "react";
import InvitadosAPI from "../../services/invitados.api";

export default function InvitadosList() {
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // 🔹 Cargar SIEMPRE todos los invitados (modo admin)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await InvitadosAPI.getAll(); // http.get → data directo
        console.log("INVITADOS =>", data);
        setInvitados(data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las invitaciones.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const invitadosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invitados;
    return invitados.filter((inv) => {
      const fullName =
        `${inv.nombreInvitado} ${inv.apellidoPaternoInvitado} ${inv.apellidoMaternoInvitado}`.toLowerCase();
      const residente = (inv.nombreResidente || "").toLowerCase();
      const casa = (inv.numeroCasa || "").toLowerCase();
      const codigo = (inv.codigoQR || "").toLowerCase();
      const estado = (inv.estado || "").toLowerCase();
      return (
        fullName.includes(q) ||
        residente.includes(q) ||
        casa.includes(q) ||
        codigo.includes(q) ||
        estado.includes(q)
      );
    });
  }, [search, invitados]);

  const handleCancelar = async (id) => {
    const ok = window.confirm("¿Seguro que deseas cancelar esta invitación?");
    if (!ok) return;
    try {
      await InvitadosAPI.cancelar(id);
      const data = await InvitadosAPI.getAll();
      setInvitados(data || []);
    } catch (err) {
      console.error(err);
      alert("No se pudo cancelar la invitación.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con buscador */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Invitaciones de acceso
          </h1>
          <p className="text-sm text-slate-500">
            Como administrador puedes revisar todas las invitaciones de los
            residentes.
          </p>
        </div>

        <div className="relative">
          <input
            placeholder="Buscar por invitado, residente, casa, código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 rounded-lg border border-slate-200 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            🔍
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Todas las invitaciones
          </h2>
          {loading && (
            <span className="text-xs text-slate-400">Cargando...</span>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-2">Código</th>
                <th className="px-4 py-2">Invitado</th>
                <th className="px-4 py-2">Residente</th>
                <th className="px-4 py-2">Casa</th>
                <th className="px-4 py-2">Generación</th>
                <th className="px-4 py-2">Vencimiento</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invitadosFiltrados.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No hay invitaciones registradas.
                  </td>
                </tr>
              )}

              {invitadosFiltrados.map((inv) => (
                <tr
                  key={inv.invitadoID}
                  className="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-2 text-xs font-mono">
                    {inv.codigoQR}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-slate-800">
                      {inv.nombreInvitado} {inv.apellidoPaternoInvitado}{" "}
                      {inv.apellidoMaternoInvitado}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-slate-700">
                      {inv.nombreResidente || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {inv.numeroCasa || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {inv.fechaGeneracion
                      ? inv.fechaGeneracion.substring(0, 10)
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {inv.fechaVencimiento
                      ? inv.fechaVencimiento.substring(0, 10)
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                        (inv.estado === "Pendiente"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : inv.estado === "Expirado"
                          ? "bg-slate-50 text-slate-500 border border-slate-100"
                          : inv.estado === "Cancelado"
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100")
                      }
                    >
                      {inv.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleCancelar(inv.invitadoID)}
                      disabled={
                        inv.estado === "Cancelado" || inv.estado === "Expirado"
                      }
                      className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
