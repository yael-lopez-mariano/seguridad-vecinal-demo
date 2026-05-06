// src/pages/avisos/AvisosList.jsx
export default function AvisosList({
  loading,
  error,
  data,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  catMap = {},
}) {
  const { items = [], total = 0, page = 1, pageSize = 10 } = data || {};

  const errStatus =
    error && typeof error === "object" && "status" in error
      ? error.status
      : undefined;
  const hasServerError =
    (typeof errStatus === "number" && errStatus >= 500) ||
    (typeof error === "string" && error.length > 0);

  const formatDateTime = (v) => (v ? new Date(v).toLocaleString("es-MX") : "-");

  const catBadgeCls = (name = "") => {
    const n = String(name).toLowerCase();
    if (n.includes("urgente") || n.includes("seguridad"))
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    if (n.includes("evento"))
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    if (n.includes("pago"))
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full table-auto text-sm text-slate-700">
          <thead className="bg-emerald-700 text-white">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-semibold md:text-sm">Titulo</th>
              <th className="px-4 py-3 text-xs font-semibold md:text-sm">Descripcion</th>
              <th className="px-4 py-3 text-xs font-semibold md:text-sm">Categoria</th>
              <th className="px-4 py-3 text-xs font-semibold md:text-sm">Fecha evento</th>
              <th className="px-4 py-3 text-xs font-semibold md:text-sm">Publicado</th>
              <th className="px-4 py-3 text-xs font-semibold md:text-sm">Autor</th>
              <th className="px-4 py-3 text-right text-xs font-semibold md:text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : hasServerError ? (
              <tr>
                <td colSpan={7} className="px-3 py-3">
                  <div className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                    <span className="text-xs">Error del servidor</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  Sin resultados
                </td>
              </tr>
            ) : (
              items.map((a, idx) => {
                const catName =
                  a.categoriaNombre ||
                  a.categoria?.nombre ||
                  catMap[String(a.categoriaID)] ||
                  "-";

                return (
                  <tr
                    key={a.avisoID}
                    className={`transition-colors ${
                      idx % 2 ? "bg-white" : "bg-slate-50/40"
                    } hover:bg-emerald-50/70`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {a.titulo}
                    </td>
                    <td className="max-w-[360px] px-4 py-3">
                      <p className="line-clamp-2">{a.descripcion}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ring-1 ${catBadgeCls(
                          catName
                        )}`}
                      >
                        {catName}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDateTime(a.fechaEvento)}</td>
                    <td className="px-4 py-3">
                      {formatDateTime(a.fechaPublicacion)}
                    </td>
                    <td className="px-4 py-3">
                      {a.usuarioNombre || a.usuario?.nombre || "Admin"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onView(a)}
                          className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(a)}
                          className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(a)}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          {items.length
            ? `Mostrando ${(page - 1) * pageSize + 1}-${Math.min(
                page * pageSize,
                total
              )} de ${total}`
            : `0 de ${total}`}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-full bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={page * pageSize >= total}
            onClick={() => onPageChange(page + 1)}
            className="rounded-full bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
