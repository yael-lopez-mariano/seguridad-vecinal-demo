// src/pages/avisos/AvisoForm.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import DateTimePickerES from "../../components/time/DateTimePickerES";

export default function AvisoForm({
  open,
  onClose,
  onSubmit,
  categorias = [],
  initial,
}) {
  const [form, setForm] = useState({
    usuarioID: 0,
    categoriaID: "", // string en el input
    titulo: "",
    descripcion: "",
    fechaEvento: "", // ISO (string) o "" vacío
  });
  const [errors, setErrors] = useState({});

  // ------ efectos de montaje / edición ------
  useEffect(() => {
    if (initial) {
      const catIdFromInitial =
        initial.categoriaID ?? initial.categoria?.categoriaID ?? "";

      setForm({
        usuarioID: Number(initial.usuarioID) || 0,
        categoriaID: catIdFromInitial !== "" ? String(catIdFromInitial) : "",
        titulo: initial.titulo || "",
        descripcion: initial.descripcion || "",
        fechaEvento: initial.fechaEvento || "",
      });
    } else {
      setForm((f) => ({
        ...f,
        categoriaID:
          f.categoriaID ||
          (categorias?.[0]?.categoriaID
            ? String(categorias[0].categoriaID)
            : ""),
      }));
    }
  }, [initial, categorias]);

  // si llegan categorías async y aún no hay selección, tomar la primera
  useEffect(() => {
    if (!initial && !form.categoriaID && categorias?.length) {
      setForm((f) => ({
        ...f,
        categoriaID: String(categorias[0].categoriaID),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorias, initial]);

  const isEdit = !!initial;
  const title = isEdit ? "Editar aviso" : "Nuevo aviso";

  const validate = useMemo(
    () => (f) => {
      const e = {};
      if (!f.titulo?.trim()) e.titulo = "Título requerido";
      if (!f.descripcion?.trim()) e.descripcion = "Descripción requerida";
      if (!f.categoriaID) e.categoriaID = "Selecciona categoría";
      return e;
    },
    []
  );

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      usuarioID: Number(form.usuarioID) || 0,
      categoriaID: form.categoriaID ? Number(form.categoriaID) : undefined,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      fechaEvento: form.fechaEvento || null, // null si no seleccionó
    };

    const eVal = validate(payload);
    setErrors(eVal);
    if (Object.keys(eVal).length) return;

    await onSubmit(payload);
  };

  // -------- manejo de cierre con ESC y por fondo ----------
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKeyDown);
    // bloquear scroll del body cuando está abierto
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aviso-form-title"
      onClick={onClose}
    >
      {/* Caja del modal: pointer-events para que el click dentro NO cierre */}
      <div
        className="
          pointer-events-auto
          w-full 
          max-w-md sm:max-w-lg
          rounded-2xl bg-white shadow-2xl
          outline-none
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo (compacto) */}
        <div className="px-4 py-2 bg-emerald-600 text-white flex items-center justify-between">
          <h2 id="aviso-form-title" className="text-base font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Cerrar"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Contenido con scroll interno para pantallas pequeñas */}
        <form
          onSubmit={submit}
          className="
            p-4 grid gap-4 text-sm
            max-h-[85vh] overflow-y-auto
          "
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Título
              </label>
              <input
                className="w-full border border-slate-300 rounded-xl p-2 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                value={form.titulo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titulo: e.target.value }))
                }
                placeholder="Ej. Reunión general"
              />
              {errors.titulo && (
                <p className="text-xs text-rose-600 mt-1">{errors.titulo}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Categoría
              </label>
              <select
                className="w-full border border-slate-300 rounded-xl p-2 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                value={form.categoriaID}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoriaID: String(e.target.value),
                  }))
                }
              >
                <option value="">Selecciona…</option>
                {categorias.map((c) => (
                  <option key={c.categoriaID} value={String(c.categoriaID)}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaID && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.categoriaID}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-xl p-2 min-h-24 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({ ...f, descripcion: e.target.value }))
              }
              placeholder="Detalle del aviso…"
            />
            {errors.descripcion && (
              <p className="text-xs text-rose-600 mt-1">{errors.descripcion}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Fecha y hora del evento (opcional)
            </label>
            <DateTimePickerES
              compact
              value={form.fechaEvento || null}
              onChange={(iso) => setForm((f) => ({ ...f, fechaEvento: iso }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isEdit ? "Guardar cambios" : "Crear aviso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
