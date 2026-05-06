// src/pages/amenidades/AmenidadForm.jsx
import { useEffect, useMemo, useState } from "react";
import { showWarning } from "../../utils/swal";

export default function AmenidadForm({
  open,
  onClose,
  onSubmit,
  tiposAmenidad = [],
  initial,
  saving = false,
  mode = "create",
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    tipoAmenidadID: "",
    nombre: "",
    ubicacion: "",
    capacidad: "",
  });

  const [errors, setErrors] = useState({});

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

  const tipoSeleccionado = useMemo(
    () =>
      tiposAmenidad.find(
        (t) => Number(t.tipoAmenidadID) === Number(form.tipoAmenidadID)
      ),
    [tiposAmenidad, form.tipoAmenidadID]
  );

  const title = isView
    ? "Ver amenidad"
    : isEdit
    ? "Editar amenidad"
    : "Nueva amenidad";

  const fieldCls =
    "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600";

  const handleChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "capacidad" ? value.replace(/\D/g, "") : value,
    }));
  };

  const validar = async () => {
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

    const firstMessage = Object.values(errs)[0];
    if (firstMessage) {
      await showWarning("Datos incompletos", firstMessage);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    if (!(await validar())) return;

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-emerald-600 px-5 py-3 text-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none hover:bg-emerald-700"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tipo de amenidad
            </label>
            <select
              name="tipoAmenidadID"
              value={form.tipoAmenidadID}
              onChange={handleChange}
              disabled={saving || isView}
              className={fieldCls}
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              disabled={saving || isView}
              className={fieldCls}
              placeholder="Ej. Gimnasio Central"
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-rose-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              disabled={saving || isView}
              className={fieldCls}
              placeholder="Ej. Planta baja, exterior, etc."
            />
            {errors.ubicacion && (
              <p className="mt-1 text-xs text-rose-600">{errors.ubicacion}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Capacidad (personas)
            </label>
            <input
              type="text"
              name="capacidad"
              value={form.capacidad}
              onChange={handleChange}
              disabled={saving || isView}
              className={fieldCls}
              placeholder="Ej. 20"
            />
            {errors.capacidad && (
              <p className="mt-1 text-xs text-rose-600">{errors.capacidad}</p>
            )}
          </div>

          {tipoSeleccionado && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold">Horario sugerido: </span>
                {tipoSeleccionado.horarioInicio?.slice(0, 5)} -{" "}
                {tipoSeleccionado.horarioFin?.slice(0, 5)}
              </p>
              <p className="mt-1">
                El horario se toma del tipo de amenidad configurado en el
                sistema.
              </p>
            </div>
          )}

          <div className="sticky bottom-0 flex items-center justify-end gap-3 bg-white pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
              disabled={saving}
            >
              {isView ? "Cerrar" : "Cancelar"}
            </button>
            {!isView && (
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : isEdit
                  ? "Guardar cambios"
                  : "Registrar amenidad"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
