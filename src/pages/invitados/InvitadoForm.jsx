// src/pages/invitados/InvitadoForm.jsx
import { useEffect, useState } from "react";

export default function InvitadoForm({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({
    nombreInvitado: "",
    apellidoPaternoInvitado: "",
    apellidoMaternoInvitado: "",
    fechaVisita: "", // yyyy-mm-dd
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        nombreInvitado: initial.nombreInvitado || "",
        apellidoPaternoInvitado: initial.apellidoPaternoInvitado || "",
        apellidoMaternoInvitado: initial.apellidoMaternoInvitado || "",
        fechaVisita: initial.fechaVisita
          ? initial.fechaVisita.substring(0, 10)
          : "",
      });
    } else {
      setForm({
        nombreInvitado: "",
        apellidoPaternoInvitado: "",
        apellidoMaternoInvitado: "",
        fechaVisita: "",
      });
    }
    setErrors({});
  }, [initial, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombreInvitado.trim())
      e.nombreInvitado = "Nombre del invitado es obligatorio";
    if (!form.apellidoPaternoInvitado.trim())
      e.apellidoPaternoInvitado = "Apellido paterno es obligatorio";
    if (!form.fechaVisita) e.fechaVisita = "Selecciona la fecha de visita";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Nueva invitación
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nombre del invitado
            </label>
            <input
              name="nombreInvitado"
              value={form.nombreInvitado}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.nombreInvitado && (
              <p className="mt-1 text-xs text-red-500">
                {errors.nombreInvitado}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Apellido paterno
              </label>
              <input
                name="apellidoPaternoInvitado"
                value={form.apellidoPaternoInvitado}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.apellidoPaternoInvitado && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.apellidoPaternoInvitado}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Apellido materno
              </label>
              <input
                name="apellidoMaternoInvitado"
                value={form.apellidoMaternoInvitado}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Fecha de visita
            </label>
            <input
              type="date"
              name="fechaVisita"
              value={form.fechaVisita}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.fechaVisita && (
              <p className="mt-1 text-xs text-red-500">{errors.fechaVisita}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Guardar invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
