// src/pages/reservas/ReservaForm.jsx
import { useEffect, useMemo, useState } from "react";
import { showWarning } from "../../utils/swal";

export default function ReservaForm({
  open,
  onClose,
  onSubmit,
  amenidades = [],
  usuarios = [],
  initial,
  saving = false,
  mode = "create",
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    usuarioID: "",
    amenidadID: "",
    fechaReserva: "",
    horaInicio: "",
    horaFin: "",
    motivo: "",
  });

  const [errors, setErrors] = useState({});
  const [usuarioSearch, setUsuarioSearch] = useState("");

  const getUserLabel = (usuario) =>
    [
      usuario.nombre,
      usuario.apellidoPaterno ?? usuario.apellidoP,
      usuario.apellidoMaterno ?? usuario.apellidoM,
    ]
      .filter(Boolean)
      .join(" ") ||
    usuario.usuario ||
    usuario.email ||
    `Usuario #${usuario.usuarioID ?? usuario.id}`;

  useEffect(() => {
    if (!open) return;

    if (initial) {
      const initialUser = usuarios.find(
        (u) => Number(u.usuarioID ?? u.id) === Number(initial.usuarioID)
      );
      setForm({
        usuarioID: initial.usuarioID ?? "",
        amenidadID: initial.amenidadID ? String(initial.amenidadID) : "",
        fechaReserva: initial.fechaReserva
          ? String(initial.fechaReserva).slice(0, 10)
          : "",
        horaInicio: initial.horaInicio?.slice(0, 5) ?? "",
        horaFin: initial.horaFin?.slice(0, 5) ?? "",
        motivo: initial.motivo ?? "",
      });
      setUsuarioSearch(initialUser ? getUserLabel(initialUser) : initial.nombreUsuario ?? "");
    } else {
      const hoy = new Date().toISOString().slice(0, 10);
      setForm({
        usuarioID: "",
        amenidadID: "",
        fechaReserva: hoy,
        horaInicio: "",
        horaFin: "",
        motivo: "",
      });
      setUsuarioSearch("");
    }
    setErrors({});
  }, [open, initial, usuarios]);

  if (!open) return null;

  const title = isView ? "Ver reserva" : isEdit ? "Editar reserva" : "Nueva reserva";

  const fieldCls =
    "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600";

  const handleChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const usuariosFiltrados = useMemo(() => {
    const term = usuarioSearch.trim().toLowerCase();
    const activos = usuarios.filter((u) => u.activo !== false);
    if (!term) return activos;

    return activos.filter((u) => {
      const text = [
        getUserLabel(u),
        u.usuario,
        u.email,
        u.numeroCasa,
        u.calle,
        u.tipoUsuario,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [usuarioSearch, usuarios]);

  const handleUserSearch = (e) => {
    if (isView) return;
    setUsuarioSearch(e.target.value);
  };

  const handleUserSelect = (e) => {
    if (isView) return;
    const selectedId = e.target.value;
    const selectedUser = usuarios.find(
      (u) => Number(u.usuarioID ?? u.id) === Number(selectedId)
    );

    setForm((f) => ({ ...f, usuarioID: selectedId }));
    setUsuarioSearch(selectedUser ? getUserLabel(selectedUser) : usuarioSearch);
  };

  const validate = async () => {
    const e = {};
    if (!form.usuarioID) e.usuarioID = "El usuario es obligatorio.";
    if (!form.amenidadID) e.amenidadID = "Selecciona una amenidad.";
    if (!form.fechaReserva) e.fechaReserva = "La fecha es obligatoria.";
    if (
      form.fechaReserva &&
      Number.isNaN(new Date(`${form.fechaReserva}T00:00:00`).getTime())
    ) {
      e.fechaReserva = "La fecha de la reserva no es válida.";
    }
    if (!form.horaInicio) e.horaInicio = "La hora de inicio es obligatoria.";
    if (!form.horaFin) e.horaFin = "La hora de fin es obligatoria.";
    if (form.horaInicio && form.horaFin && form.horaFin <= form.horaInicio) {
      e.horaFin = "La hora de fin debe ser mayor que la hora de inicio.";
    }
    if (!form.motivo || form.motivo.trim().length < 3) {
      e.motivo = "Describe brevemente el motivo.";
    }

    setErrors(e);

    const firstMessage = Object.values(e)[0];
    if (firstMessage) {
      await showWarning("Datos incompletos", firstMessage);
      return false;
    }

    return true;
  };

  const normalizeTime = (t) => {
    if (!t) return "";
    if (t.length === 8) return t;
    if (t.length === 5) return `${t}:00`;
    return t;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    if (!(await validate())) return;

    const payload = {
      usuarioID: Number(form.usuarioID),
      amenidadID: Number(form.amenidadID),
      fechaReserva: form.fechaReserva,
      horaInicio: normalizeTime(form.horaInicio),
      horaFin: normalizeTime(form.horaFin),
      motivo: form.motivo.trim(),
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-3">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-lg leading-none hover:bg-emerald-700"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Usuario / residente
              </label>
              <input
                type="text"
                value={usuarioSearch}
                onChange={handleUserSearch}
                disabled={saving || isView}
                className={fieldCls}
                placeholder="Buscar por nombre, correo o casa..."
              />
              <select
                name="usuarioID"
                value={form.usuarioID}
                onChange={handleUserSelect}
                disabled={saving || isView}
                className={fieldCls}
              >
                <option value="">Selecciona un usuario</option>
                {usuariosFiltrados.map((u) => {
                  const userId = u.usuarioID ?? u.id;
                  return (
                    <option key={userId} value={userId}>
                      {getUserLabel(u)}
                      {u.numeroCasa ? ` - Casa ${u.numeroCasa}` : ""}
                      {u.tipoUsuario ? ` (${u.tipoUsuario})` : ""}
                    </option>
                  );
                })}
              </select>
              {errors.usuarioID && (
                <p className="mt-1 text-xs text-red-600">{errors.usuarioID}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Amenidad
              </label>
              <select
                name="amenidadID"
                value={form.amenidadID}
                onChange={handleChange}
                disabled={saving || isView}
                className={fieldCls}
              >
                <option value="">Selecciona una amenidad</option>
                {amenidades
                  .filter((a) => a.activo !== false || Number(a.amenidadID) === Number(form.amenidadID))
                  .map((a) => (
                    <option key={a.amenidadID} value={a.amenidadID}>
                      {a.nombre}{" "}
                      {a.tipoAmenidadNombre ? `(${a.tipoAmenidadNombre})` : ""}
                    </option>
                  ))}
              </select>
              {errors.amenidadID && (
                <p className="mt-1 text-xs text-red-600">{errors.amenidadID}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Fecha
              </label>
              <input
                type="date"
                name="fechaReserva"
                value={form.fechaReserva}
                onChange={handleChange}
                disabled={saving || isView}
                className={fieldCls}
              />
              {errors.fechaReserva && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.fechaReserva}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Hora inicio
              </label>
              <input
                type="time"
                name="horaInicio"
                value={form.horaInicio}
                onChange={handleChange}
                disabled={saving || isView}
                className={fieldCls}
              />
              {errors.horaInicio && (
                <p className="mt-1 text-xs text-red-600">{errors.horaInicio}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Hora fin
              </label>
              <input
                type="time"
                name="horaFin"
                value={form.horaFin}
                onChange={handleChange}
                disabled={saving || isView}
                className={fieldCls}
              />
              {errors.horaFin && (
                <p className="mt-1 text-xs text-red-600">{errors.horaFin}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Motivo
            </label>
            <textarea
              name="motivo"
              rows={3}
              value={form.motivo}
              onChange={handleChange}
              disabled={saving || isView}
              className={fieldCls}
              placeholder="Ej. Fiesta familiar, entrenamiento, junta, etc."
            />
            {errors.motivo && (
              <p className="mt-1 text-xs text-red-600">{errors.motivo}</p>
            )}
          </div>

          <div className="sticky bottom-0 mt-2 flex justify-end gap-2 border-t border-slate-100 bg-white pt-3">
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
                {saving ? "Guardando..." : "Guardar reserva"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
