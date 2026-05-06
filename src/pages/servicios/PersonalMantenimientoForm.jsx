// src/pages/servicios/PersonalMantenimientoForm.jsx
import { useEffect, useState } from "react";

export default function PersonalMantenimientoForm({
  open,
  onClose,
  onSubmit,
  initial,
}) {
  const [form, setForm] = useState({
    personaID: "",
    puesto: "",
    fechaContratacion: "",
    sueldo: "",
    tipoContrato: "",
    turno: "",
    diasLaborales: "",
    notas: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        personaID: initial.personaID ?? "",
        puesto: initial.puesto ?? "",
        fechaContratacion: initial.fechaContratacion?.slice(0, 10) ?? "",
        sueldo: initial.sueldo ?? "",
        tipoContrato: initial.tipoContrato ?? "",
        turno: initial.turno ?? "",
        diasLaborales: initial.diasLaborales ?? "",
        notas: initial.notas ?? "",
      });
    } else {
      setForm({
        personaID: "",
        puesto: "",
        fechaContratacion: "",
        sueldo: "",
        tipoContrato: "",
        turno: "",
        diasLaborales: "",
        notas: "",
      });
    }
  }, [initial, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.personaID) newErrors.personaID = "PersonaID requerido";
    if (!form.puesto.trim()) newErrors.puesto = "Puesto requerido";
    if (!form.fechaContratacion)
      newErrors.fechaContratacion = "Fecha requerida";
    if (!form.sueldo) newErrors.sueldo = "Sueldo requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      personaID: Number(form.personaID),
      puesto: form.puesto.trim(),
      fechaContratacion: form.fechaContratacion,
      sueldo: Number(form.sueldo),
      tipoContrato: form.tipoContrato.trim(),
      turno: form.turno.trim(),
      diasLaborales: form.diasLaborales.trim(),
      notas: form.notas.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-slate-800 text-sm md:text-base">
            {initial ? "Editar personal" : "Nuevo personal de mantenimiento"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                PersonaID
              </label>
              <input
                type="number"
                name="personaID"
                value={form.personaID}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              />
              {errors.personaID && (
                <p className="text-xs text-red-600 mt-1">{errors.personaID}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Puesto
              </label>
              <input
                type="text"
                name="puesto"
                value={form.puesto}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              />
              {errors.puesto && (
                <p className="text-xs text-red-600 mt-1">{errors.puesto}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Fecha de contratación
              </label>
              <input
                type="date"
                name="fechaContratacion"
                value={form.fechaContratacion}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              />
              {errors.fechaContratacion && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.fechaContratacion}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Sueldo
              </label>
              <input
                type="number"
                name="sueldo"
                value={form.sueldo}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              />
              {errors.sueldo && (
                <p className="text-xs text-red-600 mt-1">{errors.sueldo}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Tipo de contrato
              </label>
              <input
                type="text"
                name="tipoContrato"
                value={form.tipoContrato}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Turno
              </label>
              <input
                type="text"
                name="turno"
                value={form.turno}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Días laborales
            </label>
            <input
              type="text"
              name="diasLaborales"
              value={form.diasLaborales}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Notas
            </label>
            <textarea
              name="notas"
              value={form.notas}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs md:text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs md:text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
