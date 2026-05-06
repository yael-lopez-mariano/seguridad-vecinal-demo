// src/pages/servicios/ServicioForm.jsx
import { useEffect, useState } from "react";

export default function ServicioForm({
  open,
  onClose,
  onSubmit,
  tiposServicio = [],
  initial,
}) {
  const [form, setForm] = useState({
    tipoServicioID: "",
    nombreEncargado: "",
    telefono: "",
    email: "",
    notasInternas: "",
    disponible: true,
  });

  const [errors, setErrors] = useState({});

  // Cargar datos cuando sea edición
  useEffect(() => {
    if (initial) {
      setForm({
        tipoServicioID: initial.tipoServicioID
          ? String(initial.tipoServicioID)
          : "",
        nombreEncargado: initial.nombreEncargado || "",
        telefono: initial.telefono || "",
        email: initial.email || "",
        notasInternas: initial.notasInternas || "",
        disponible:
          typeof initial.disponible === "boolean" ? initial.disponible : true,
      });
    } else {
      setForm({
        tipoServicioID:
          tiposServicio.length > 0
            ? String(tiposServicio[0].tipoServicioID)
            : "",
        nombreEncargado: "",
        telefono: "",
        email: "",
        notasInternas: "",
        disponible: true,
      });
    }
    setErrors({});
  }, [initial, tiposServicio, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};

    if (!form.tipoServicioID) e.tipoServicioID = "Selecciona un tipo.";
    if (!form.nombreEncargado.trim())
      e.nombreEncargado = "Nombre del encargado requerido.";
    if (!form.telefono.trim()) e.telefono = "Teléfono requerido.";
    if (!form.email.trim()) e.email = "Correo electrónico requerido.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (!validate()) return;

    // Adaptar a payload esperado por la API
    const payload = {
      tipoServicioID: Number(form.tipoServicioID),
      nombreEncargado: form.nombreEncargado.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      notasInternas: form.notasInternas.trim() || null,
      disponible: form.disponible,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold text-slate-800">
            {initial ? "Editar servicio" : "Nuevo servicio"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Tipo de servicio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de servicio
            </label>
            <select
              name="tipoServicioID"
              value={form.tipoServicioID}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecciona una opción</option>
              {tiposServicio.map((t) => (
                <option key={t.tipoServicioID} value={t.tipoServicioID}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {errors.tipoServicioID && (
              <p className="text-xs text-red-500 mt-1">
                {errors.tipoServicioID}
              </p>
            )}
          </div>

          {/* Nombre encargado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del encargado
            </label>
            <input
              type="text"
              name="nombreEncargado"
              value={form.nombreEncargado}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.nombreEncargado && (
              <p className="text-xs text-red-500 mt-1">
                {errors.nombreEncargado}
              </p>
            )}
          </div>

          {/* Teléfono y correo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.telefono && (
                <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Notas internas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas internas
            </label>
            <textarea
              name="notasInternas"
              rows={3}
              value={form.notasInternas}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Disponible */}
          <div className="flex items-center gap-2">
            <input
              id="disponible"
              type="checkbox"
              name="disponible"
              checked={form.disponible}
              onChange={handleChange}
              className="h-4 w-4 text-emerald-600 border-slate-300 rounded"
            />
            <label
              htmlFor="disponible"
              className="text-sm text-slate-700 select-none"
            >
              Servicio disponible para asignación
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {initial ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
