// src/pages/invitados/InvitadoForm.jsx
import { useEffect, useMemo, useState } from "react";
import { showWarning } from "../../utils/swal";

export default function InvitadoForm({
  open,
  onClose,
  onSubmit,
  initial,
  usuarios = [],
  tiposVisitante = [],
  saving = false,
  mode = "create",
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    usuarioID: "",
    tipoVisitanteID: "",
    nombreInvitado: "",
    apellidoPaternoInvitado: "",
    apellidoMaternoInvitado: "",
    fechaVisita: "",
    observaciones: "",
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
    if (initial) {
      const initialUser = usuarios.find(
        (u) => Number(u.usuarioID ?? u.id) === Number(initial.usuarioID)
      );
      setForm({
        usuarioID: initial.usuarioID ?? "",
        tipoVisitanteID: initial.tipoVisitanteID ?? "",
        nombreInvitado: initial.nombreInvitado || "",
        apellidoPaternoInvitado: initial.apellidoPaternoInvitado || "",
        apellidoMaternoInvitado: initial.apellidoMaternoInvitado || "",
        fechaVisita: initial.fechaVisita
          ? String(initial.fechaVisita).substring(0, 10)
          : "",
        observaciones: initial.observaciones || "",
      });
      setUsuarioSearch(
        initialUser ? getUserLabel(initialUser) : initial.nombreResidente || ""
      );
    } else {
      setForm({
        usuarioID: "",
        tipoVisitanteID: "",
        nombreInvitado: "",
        apellidoPaternoInvitado: "",
        apellidoMaternoInvitado: "",
        fechaVisita: "",
        observaciones: "",
      });
      setUsuarioSearch("");
    }
    setErrors({});
  }, [initial, open, usuarios]);

  if (!open) return null;

  const title = isView
    ? "Ver invitado"
    : isEdit
    ? "Editar invitado"
    : "Nueva invitación";

  const fieldCls =
    "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600";

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

  const handleChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

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
    if (!form.usuarioID) e.usuarioID = "Selecciona un residente.";
    if (!form.tipoVisitanteID)
      e.tipoVisitanteID = "Selecciona un tipo de visitante.";
    if (!form.nombreInvitado.trim())
      e.nombreInvitado = "El nombre del invitado es obligatorio.";
    if (!form.apellidoPaternoInvitado.trim())
      e.apellidoPaternoInvitado = "El apellido paterno es obligatorio.";
    if (!form.fechaVisita) e.fechaVisita = "Selecciona la fecha de visita.";
    if (
      form.fechaVisita &&
      Number.isNaN(new Date(`${form.fechaVisita}T00:00:00`).getTime())
    ) {
      e.fechaVisita = "La fecha de visita no es válida.";
    }

    setErrors(e);
    const firstMessage = Object.values(e)[0];
    if (firstMessage) {
      await showWarning("Datos incompletos", firstMessage);
      return false;
    }

    return true;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (isView) return;
    if (!(await validate())) return;

    await onSubmit({
      usuarioID: Number(form.usuarioID),
      tipoVisitanteID: Number(form.tipoVisitanteID),
      nombreInvitado: form.nombreInvitado.trim(),
      apellidoPaternoInvitado: form.apellidoPaternoInvitado.trim(),
      apellidoMaternoInvitado: form.apellidoMaternoInvitado.trim(),
      fechaVisita: form.fechaVisita,
      observaciones: form.observaciones.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-3">
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
            <label className="block text-sm font-medium text-slate-700">
              Residente
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
              <option value="">Selecciona un residente</option>
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
              <p className="mt-1 text-xs text-red-500">{errors.usuarioID}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Tipo de visitante
            </label>
            <select
              name="tipoVisitanteID"
              value={form.tipoVisitanteID}
              onChange={handleChange}
              disabled={saving || isView}
              className={fieldCls}
            >
              <option value="">Selecciona un tipo</option>
              {tiposVisitante.map((tipo) => (
                <option key={tipo.tipoVisitanteID} value={tipo.tipoVisitanteID}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            {errors.tipoVisitanteID && (
              <p className="mt-1 text-xs text-red-500">
                {errors.tipoVisitanteID}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nombre del invitado
            </label>
            <input
              name="nombreInvitado"
              value={form.nombreInvitado}
              onChange={handleChange}
              disabled={saving || isView}
              className={fieldCls}
            />
            {errors.nombreInvitado && (
              <p className="mt-1 text-xs text-red-500">
                {errors.nombreInvitado}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Apellido paterno
              </label>
              <input
                name="apellidoPaternoInvitado"
                value={form.apellidoPaternoInvitado}
                onChange={handleChange}
                disabled={saving || isView}
                className={fieldCls}
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
                disabled={saving || isView}
                className={fieldCls}
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
              disabled={saving || isView}
              className={fieldCls}
            />
            {errors.fechaVisita && (
              <p className="mt-1 text-xs text-red-500">{errors.fechaVisita}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              rows={3}
              value={form.observaciones}
              onChange={handleChange}
              disabled={saving || isView}
              className={fieldCls}
              placeholder="Notas internas para vigilancia..."
            />
          </div>

          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white pt-3">
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
                {saving ? "Guardando..." : "Guardar invitación"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
