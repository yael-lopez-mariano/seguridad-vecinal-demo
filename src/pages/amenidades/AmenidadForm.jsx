// src/pages/amenidades/AmenidadForm.jsx
import { useEffect, useMemo, useState } from "react";

export default function AmenidadForm({
  open,
  onClose,
  onSubmit,
  tiposAmenidad = [],
  initial,
  saving = false,
}) {
  const [form, setForm] = useState({
    tipoAmenidadID: "",
    nombre: "",
    ubicacion: "",
    capacidad: "",
  });

  const [errors, setErrors] = useState({});

  // Carga inicial / edición
  useEffect(() => {
    if (initial) {
      setForm({
        tipoAmenidadID: initial.tipoAmenidadID ?? "",
        nombre: initial.nombre ?? "",
        ubicacion: initial.ubicacion ?? "",
        capacidad: initial.capacidad ?? "",
      });
    } else {
      setForm({
        tipoAmenidadID: "",
        nombre: "",
        ubicacion: "",
        capacidad: "",
      });
    }
    setErrors({});
  }, [initial, open]);

  // Tipo seleccionado para mostrar horario sugerido
  const tipoSeleccionado = useMemo(
    () =>
      tiposAmenidad.find(
        (t) => t.tipoAmenidadID === Number(form.tipoAmenidadID)
      ),
    [tiposAmenidad, form.tipoAmenidadID]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "capacidad" ? value.replace(/\D/g, "") : value,
    }));
  };

  const validar = () => {
    const errs = {};

    if (!form.tipoAmenidadID) errs.tipoAmenidadID = "Selecciona un tipo.";
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.ubicacion.trim()) errs.ubicacion = "La ubicación es obligatoria.";
    if (!form.capacidad) {
      errs.capacidad = "La capacidad es obligatoria.";
    } else if (Number(form.capacidad) <= 0) {
      errs.capacidad = "La capacidad debe ser mayor a 0.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    const payload = {
      tipoAmenidadID: Number(form.tipoAmenidadID),
      nombre: form.nombre.trim(),
      ubicacion: form.ubicacion.trim(),
      capacidad: Number(form.capacidad),
    };

    await onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-3">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {initial ? "Editar amenidad" : "Nueva amenidad"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            disabled={saving}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Tipo de amenidad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de amenidad
            </label>
            <select
              name="tipoAmenidadID"
              value={form.tipoAmenidadID}
              onChange={handleChange}
              disabled={saving}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Selecciona un tipo...</option>
              {tiposAmenidad.map((t) => (
                <option key={t.tipoAmenidadID} value={t.tipoAmenidadID}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {errors.tipoAmenidadID && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.tipoAmenidadID}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              disabled={saving}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ej. Gimnasio Central"
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-rose-600">{errors.nombre}</p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              disabled={saving}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ej. Planta baja, exterior, etc."
            />
            {errors.ubicacion && (
              <p className="mt-1 text-xs text-rose-600">{errors.ubicacion}</p>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Capacidad (personas)
            </label>
            <input
              type="text"
              name="capacidad"
              value={form.capacidad}
              onChange={handleChange}
              disabled={saving}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ej. 20"
            />
            {errors.capacidad && (
              <p className="mt-1 text-xs text-rose-600">{errors.capacidad}</p>
            )}
          </div>

          {/* Horario (solo lectura desde el tipo) */}
          {tipoSeleccionado && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold">Horario sugerido: </span>
                {tipoSeleccionado.horarioInicio?.slice(0, 5)} -{" "}
                {tipoSeleccionado.horarioFin?.slice(0, 5)}
              </p>
              <p className="mt-1">
                (El horario se toma del tipo de amenidad configurado en el
                sistema.)
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : initial
                ? "Guardar cambios"
                : "Registrar amenidad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
