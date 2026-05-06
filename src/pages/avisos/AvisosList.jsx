// src/pages/avisos/AvisosList.jsx
export default function AvisosList({
  loading,
  error,
  data,
  onEdit,
  onDelete,
  onPageChange,
  catMap = {}, // ← nuevo: diccionario { "2": "Evento", "3": "Alerta", ... }
}) {
  const { items = [], total = 0, page = 1, pageSize = 10 } = data || {};

  // Normaliza error para decidir qué mostrar
  const errStatus =
    error && typeof error === "object" && "status" in error
      ? error.status
      : undefined;
  const hasServerError =
    (typeof errStatus === "number" && errStatus >= 500) ||
    (typeof error === "string" && error.length > 0);

  const formatDateTime = (v) => (v ? new Date(v).toLocaleString("es-MX") : "—");

  const catBadgeCls = (name = "") => {
    const n = String(name).toLowerCase();
    if (n.includes("alerta"))
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    if (n.includes("evento"))
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"; // AvisoGeneral/otros
  };

  return (
    <div className="bg-white rounded-2xl shadow p-3 border border-slate-200 overflow-x-auto">
      <table className="min-w-full text-sm text-slate-700">
        <thead>
          <tr className="text-left bg-slate-50 text-slate-600 border-b">
            <th className="py-2 px-3 font-semibold">Título</th>
            <th className="py-2 px-3 font-semibold">Descripción</th>
            <th className="py-2 px-3 font-semibold">Categoría</th>
            <th className="py-2 px-3 font-semibold">Fecha evento</th>
            <th className="py-2 px-3 font-semibold">Publicado</th>
            <th className="py-2 px-3 font-semibold">Autor</th>
            <th className="py-2 px-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="py-6 text-center text-slate-500">
                Cargando…
              </td>
            </tr>
          ) : hasServerError ? (
            <tr>
              <td colSpan={7} className="py-3 px-3">
                <div className="w-full rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2">
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
              // Resolver nombre de categoría de la forma más robusta posible:
              const catName =
                a.categoriaNombre ||
                a.categoria?.nombre ||
                catMap[String(a.categoriaID)] ||
                "—";

              return (
                <tr
                  key={a.avisoID}
                  className={`border-b last:border-0 ${
                    idx % 2 ? "bg-white" : "bg-slate-50/50"
                  } hover:bg-emerald-50/50`}
                >
                  <td className="py-2 px-3 font-medium text-slate-800">
                    {a.titulo}
                  </td>
                  <td className="py-2 px-3">{a.descripcion}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ring-1 ${catBadgeCls(
                        catName
                      )}`}
                    >
                      {catName}
                    </span>
                  </td>
                  <td className="py-2 px-3">{formatDateTime(a.fechaEvento)}</td>
                  <td className="py-2 px-3">
                    {formatDateTime(a.fechaPublicacion)}
                  </td>
                  <td className="py-2 px-3">
                    {a.usuarioNombre || a.usuario?.nombre || "Admin"}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEdit(a)}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(a)}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
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

      {/* Paginación */}
      <div className="flex items-center justify-between mt-3">
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
            className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50 hover:bg-slate-50"
          >
            Anterior
          </button>
          <button
            disabled={page * pageSize >= total}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50 hover:bg-slate-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
