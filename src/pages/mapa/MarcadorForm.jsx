// src/pages/mapa/MarcadorForm.jsx

export default function MarcadorForm({
  open,
  mode,
  form,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-md p-4 text-xs">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-slate-800">
          {mode === "create" ? "Nuevo marcador" : "Editar marcador"}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-xs"
        >
          ✕
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        Haz clic en el mapa para elegir la posición. Luego completa la
        información de la zona.
      </p>

      <form onSubmit={onSubmit} className="space-y-2">
        <div>
          <label className="block mb-1 text-[11px] font-medium text-slate-700">
            Indicador
          </label>
          <select
            name="indicador"
            value={form.indicador}
            onChange={onChange}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Peligroso">Peligroso</option>
            <option value="Alerta">Alerta</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-[11px] font-medium text-slate-700">
            Comentario
          </label>
          <textarea
            name="comentario"
            value={form.comentario}
            onChange={onChange}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Ej. Zona oscura, robos recientes, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1 text-[11px] font-medium text-slate-700">
              Latitud
            </label>
            <input
              type="number"
              step="0.000001"
              name="latitud"
              value={form.latitud}
              onChange={onChange}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-[11px] font-medium text-slate-700">
              Longitud
            </label>
            <input
              type="number"
              step="0.000001"
              name="longitud"
              value={form.longitud}
              onChange={onChange}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : mode === "create"
            ? "Guardar marcador"
            : "Actualizar marcador"}
        </button>
      </form>
    </div>
  );
}
