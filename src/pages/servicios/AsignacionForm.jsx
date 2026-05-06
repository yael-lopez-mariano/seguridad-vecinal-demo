// src/pages/servicios/AsignacionForm.jsx
import { useState, useEffect } from "react";

export default function AsignacionForm({ open, onClose, onSubmit, personal }) {
  const [personaAsignado, setPersonaAsignado] = useState("");

  useEffect(() => {
    if (open) setPersonaAsignado("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personaAsignado) return;
    onSubmit(Number(personaAsignado));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-slate-800 text-sm md:text-base">
            Asignar solicitud
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Personal de mantenimiento
            </label>
            <select
              value={personaAsignado}
              onChange={(e) => setPersonaAsignado(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
            >
              <option value="">Selecciona una persona</option>
              {personal?.map((p) => (
                <option
                  key={p.personalMantenimientoID}
                  value={p.personalMantenimientoID}
                >
                  #{p.personalMantenimientoID} - {p.puesto}
                </option>
              ))}
            </select>
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
              Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
