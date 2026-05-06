// src/pages/avisos/AvisoForm.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import DateTimePickerES from "../../components/time/DateTimePickerES";
import { showWarning } from "../../utils/swal";

export default function AvisoForm({
  open,
  onClose,
  onSubmit,
  categorias = [],
  initial,
  mode = initial ? "edit" : "create",
}) {
  const [form, setForm] = useState({
    usuarioID: 0,
    categoriaID: "",
    titulo: "",
    descripcion: "",
    fechaEvento: "",
  });
  const [errors, setErrors] = useState({});

  const isView = mode === "view";
  const isEdit = mode === "edit" || (!!initial && !isView);
  const title = isView ? "Ver aviso" : isEdit ? "Editar aviso" : "Nuevo aviso";

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
      setForm({
        usuarioID: 0,
        categoriaID: categorias?.[0]?.categoriaID
          ? String(categorias[0].categoriaID)
          : "",
        titulo: "",
        descripcion: "",
        fechaEvento: "",
      });
    }
  }, [initial, categorias]);

  useEffect(() => {
    if (!initial && !form.categoriaID && categorias?.length) {
      setForm((f) => ({
        ...f,
        categoriaID: String(categorias[0].categoriaID),
      }));
    }
  }, [categorias, initial, form.categoriaID]);

  const validate = useMemo(
    () => (f) => {
      const e = {};
      if (!f.titulo?.trim()) e.titulo = "Titulo requerido";
      if (!f.descripcion?.trim()) e.descripcion = "Descripcion requerida";
      if (!f.categoriaID) e.categoriaID = "Selecciona categoria";
      return e;
    },
    []
  );

  const submit = async (e) => {
    e.preventDefault();
    if (isView) return;

    const payload = {
      usuarioID: Number(form.usuarioID) || 0,
      categoriaID: form.categoriaID ? Number(form.categoriaID) : undefined,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      fechaEvento: form.fechaEvento || null,
    };

    const eVal = validate(payload);
    setErrors(eVal);
    if (Object.keys(eVal).length) {
      await showWarning("Datos incompletos", Object.values(eVal)[0]);
      return;
    }

    if (payload.fechaEvento && Number.isNaN(new Date(payload.fechaEvento).getTime())) {
      await showWarning("Datos incompletos", "La fecha del aviso no es valida.");
      return;
    }

    await onSubmit(payload);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const fieldCls =
    "w-full rounded-xl border border-slate-300 p-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300 disabled:bg-slate-100 disabled:text-slate-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aviso-form-title"
      onClick={onClose}
    >
      <div
        className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl outline-none sm:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-emerald-600 px-4 py-2 text-white">
          <h2 id="aviso-form-title" className="text-base font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Cerrar"
            type="button"
          >
            x
          </button>
        </div>

        <form
          onSubmit={submit}
          className="grid max-h-[85vh] gap-4 overflow-y-auto p-4 text-sm"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Titulo
              </label>
              <input
                className={fieldCls}
                value={form.titulo}
                disabled={isView}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titulo: e.target.value }))
                }
                placeholder="Ej. Reunion general"
              />
              {errors.titulo && (
                <p className="mt-1 text-xs text-rose-600">{errors.titulo}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Categoria
              </label>
              <select
                className={fieldCls}
                value={form.categoriaID}
                disabled={isView}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoriaID: String(e.target.value),
                  }))
                }
              >
                <option value="">Selecciona...</option>
                {categorias.map((c) => (
                  <option key={c.categoriaID} value={String(c.categoriaID)}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaID && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.categoriaID}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Descripcion
            </label>
            <textarea
              className={`${fieldCls} min-h-24 resize-y`}
              value={form.descripcion}
              disabled={isView}
              onChange={(e) =>
                setForm((f) => ({ ...f, descripcion: e.target.value }))
              }
              placeholder="Detalle del aviso..."
            />
            {errors.descripcion && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.descripcion}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Fecha y hora del evento (opcional)
            </label>
            <div className={isView ? "pointer-events-none opacity-75" : ""}>
              <DateTimePickerES
                compact
                value={form.fechaEvento || null}
                onChange={(iso) => {
                  if (!isView) setForm((f) => ({ ...f, fechaEvento: iso }));
                }}
              />
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-2 bg-white pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
            >
              {isView ? "Cerrar" : "Cancelar"}
            </button>
            {!isView && (
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {isEdit ? "Guardar cambios" : "Crear aviso"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
