import { useEffect, useState } from "react";

const emptyForm = {
  usuarioID: "",
  tipoReporteID: "",
  titulo: "",
  descripcion: "",
  prioridad: "Media",
  estado: "Pendiente",
  direccionTexto: "",
  latitud: "20.67361",
  longitud: "-103.34412",
  fechaCreacion: "",
  esAnonimo: false,
};

const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

const fromInputDateTime = (value) => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

export default function ReporteForm({
  initial,
  usuarios = [],
  tiposReporte = [],
  estados = [],
  prioridades = [],
  saving = false,
  mode = "create",
  onClose,
  onSubmit,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initial) {
      setForm({
        usuarioID: initial.usuarioID || "",
        tipoReporteID: initial.tipoReporteID || "",
        titulo: initial.titulo || "",
        descripcion: initial.descripcion || "",
        prioridad: initial.prioridad || "Media",
        estado: initial.estado || (initial.visto ? "Resuelto" : "Pendiente"),
        direccionTexto: initial.direccionTexto || "",
        latitud: String(initial.latitud ?? "20.67361"),
        longitud: String(initial.longitud ?? "-103.34412"),
        fechaCreacion: toInputDateTime(initial.fechaCreacion),
        esAnonimo: initial.esAnonimo === true,
      });
      return;
    }

    setForm({
      ...emptyForm,
      fechaCreacion: toInputDateTime(new Date().toISOString()),
    });
  }, [initial]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isView) return;

    onSubmit({
      ...form,
      usuarioID: form.esAnonimo ? null : Number(form.usuarioID),
      tipoReporteID: Number(form.tipoReporteID),
      latitud: Number(form.latitud),
      longitud: Number(form.longitud),
      fechaCreacion: fromInputDateTime(form.fechaCreacion),
    });
  };

  const title = isView
    ? "Detalle del reporte"
    : isEdit
    ? "Editar reporte"
    : "Nuevo reporte";

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Titulo
              </label>
              <input
                value={form.titulo}
                onChange={(e) => updateField("titulo", e.target.value)}
                disabled={isView || saving}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tipo de reporte
              </label>
              <select
                value={form.tipoReporteID}
                onChange={(e) => updateField("tipoReporteID", e.target.value)}
                disabled={isView || saving}
                className={inputClass}
              >
                <option value="">Selecciona un tipo</option>
                {tiposReporte.map((tipo) => (
                  <option key={tipo.tipoReporteID} value={tipo.tipoReporteID}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Prioridad
              </label>
              <select
                value={form.prioridad}
                onChange={(e) => updateField("prioridad", e.target.value)}
                disabled={isView || saving}
                className={inputClass}
              >
                <option value="">Selecciona prioridad</option>
                {prioridades.map((prioridad) => (
                  <option key={prioridad.value} value={prioridad.value}>
                    {prioridad.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Estado
              </label>
              <select
                value={form.estado}
                onChange={(e) => updateField("estado", e.target.value)}
                disabled={isView || saving}
                className={inputClass}
              >
                <option value="">Selecciona estado</option>
                {estados.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Residente
              </label>
              <select
                value={form.usuarioID}
                onChange={(e) => updateField("usuarioID", e.target.value)}
                disabled={isView || saving || form.esAnonimo}
                className={inputClass}
              >
                <option value="">Selecciona residente</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.usuarioID} value={usuario.usuarioID}>
                    {[
                      usuario.nombre,
                      usuario.apellidoPaterno ?? usuario.apellidoP,
                      usuario.apellidoMaterno ?? usuario.apellidoM,
                    ]
                      .filter(Boolean)
                      .join(" ") || usuario.usuario}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Fecha del reporte
              </label>
              <input
                type="datetime-local"
                value={form.fechaCreacion}
                onChange={(e) => updateField("fechaCreacion", e.target.value)}
                disabled={isView || saving}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Descripcion
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => updateField("descripcion", e.target.value)}
              disabled={isView || saving}
              className={`${inputClass} min-h-28 resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Ubicacion
              </label>
              <input
                value={form.direccionTexto}
                onChange={(e) => updateField("direccionTexto", e.target.value)}
                disabled={isView || saving}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Latitud
              </label>
              <input
                type="number"
                step="0.000001"
                value={form.latitud}
                onChange={(e) => updateField("latitud", e.target.value)}
                disabled={isView || saving}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Longitud
              </label>
              <input
                type="number"
                step="0.000001"
                value={form.longitud}
                onChange={(e) => updateField("longitud", e.target.value)}
                disabled={isView || saving}
                className={inputClass}
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.esAnonimo}
              onChange={(e) => updateField("esAnonimo", e.target.checked)}
              disabled={isView || saving}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Reporte anonimo
          </label>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
            >
              {isView ? "Cerrar" : "Cancelar"}
            </button>

            {!isView && (
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Guardando..." : "Guardar reporte"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
