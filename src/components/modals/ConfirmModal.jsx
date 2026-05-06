import { useEffect } from "react";

// Paleta
const COLOR = {
  light: "#10B981", // verde claro
  emergency: "#EF4444", // rojo
  text: "#111827",
  bg: "#F8FAFC",
};

export default function ConfirmModal({
  open,
  title = "¡Atención!",
  message = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-[95%] max-w-md rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 text-white"
          style={{ backgroundColor: COLOR.light }}
        >
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded hover:bg-white/10"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Body */}
        <div
          className="bg-white px-5 py-4"
          style={{ backgroundColor: COLOR.bg }}
        >
          <p className="text-sm" style={{ color: COLOR.text }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-3 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded font-medium text-white"
            style={{ backgroundColor: COLOR.light }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded font-semibold text-white flex items-center gap-2"
            style={{ backgroundColor: COLOR.emergency }}
          >
            {/* icono opcional */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z" />
            </svg>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
