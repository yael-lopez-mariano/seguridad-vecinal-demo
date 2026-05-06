// src/pages/alertas/AdminAlertaDetalle.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertasAPI } from "../../services/alertas.api";
import ConfirmModal from "../../components/modals/ConfirmModal";

const COLOR = {
  primary: "#047857",
  light: "#10B981",
  action: "#F97316",
  emergency: "#EF4444",
  warning: "#FBBF24",
  text: "#111827",
  bg: "#F8FAFC",
};

// Modo prueba: permite atender aunque ya esté atendida
const MODO_PRUEBA = true;

const isActiva = (r) =>
  r?.activa === true || r?.activa === 1 || r?.estatus === "Activa";

export default function AdminAlertaDetalle() {
  const { id } = useParams();
  const nav = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // modal de confirmación
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await AlertasAPI.getById(id);
        if (!alive) return;
        setRow(data || null);
      } catch (e) {
        setErr(e?.message || "No se pudo cargar la alerta");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  function cerrarDetalle() {
    nav("/admin/alertas", { replace: true });
  }

  async function confirmarAtender() {
    if (!row) return;
    await AlertasAPI.updateEstado(row.alertaID, false);
    setOpenConfirm(false);
    alert("Atendida ✅");
    cerrarDetalle();
  }

  // Mientras carga, mantenemos el overlay para que parezca modal
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={cerrarDetalle} />

      {/* Dialog */}
      <div className="relative w-[96%] max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 text-white"
          style={{ backgroundColor: COLOR.light }}
        >
          <div className="font-semibold">
            {row ? `Alerta #${row.alertaID}` : "Detalle de alerta"}
          </div>
          <button
            onClick={cerrarDetalle}
            className="w-8 h-8 grid place-items-center rounded hover:bg-white/10"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="bg-white p-5" style={{ backgroundColor: COLOR.bg }}>
          {loading && <div className="py-8 text-center">Cargando…</div>}
          {err && <div className="py-8 text-center text-red-700">{err}</div>}
          {!loading && !err && row && (
            <div className="space-y-3">
              <Item
                k="Fecha/Hora"
                v={
                  row.fechaHora ? new Date(row.fechaHora).toLocaleString() : "—"
                }
              />
              <Item
                k="Usuario"
                v={row.nombreUsuario || `Usuario #${row.usuarioID}`}
              />
              <Item k="Email" v={row.emailUsuario || "—"} />
              <Item k="Tipo" v={row.tipoUsuario || "—"} />
              <Item
                k="Lat/Long"
                v={`${row.latitud ?? "—"}, ${row.longitud ?? "—"}`}
              />
              <div className="flex gap-3">
                <div className="w-40 text-slate-500">Estado</div>
                <div className="flex-1">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      backgroundColor: isActiva(row)
                        ? COLOR.emergency
                        : COLOR.light,
                    }}
                  >
                    {isActiva(row) ? "Activa" : "Atendida"}
                  </span>
                </div>
              </div>
              {/* Si agregas más campos (descripcion, observaciones), ponlos aquí */}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-3 flex justify-end gap-3">
          <button
            onClick={cerrarDetalle}
            className="px-4 py-2 rounded font-medium text-white"
            style={{ backgroundColor: COLOR.light }}
          >
            Cancelar
          </button>
          <button
            onClick={() => setOpenConfirm(true)}
            disabled={!MODO_PRUEBA && row && !isActiva(row)}
            className="px-4 py-2 rounded font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: COLOR.emergency }}
          >
            Atender
          </button>
        </div>
      </div>

      {/* Modal de confirmación (reutilizado) */}
      {row && (
        <ConfirmModal
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={confirmarAtender}
          title="¡Atención!"
          confirmText="Atender"
          cancelText="Cancelar"
          message={`¿Estás seguro de marcar la alerta del vecino "${
            row.nombreUsuario || `Usuario #${row.usuarioID}`
          }" (Folio ${row.alertaID}) como atendida?`}
        />
      )}
    </div>
  );
}

function Item({ k, v }) {
  return (
    <div className="flex gap-3">
      <div className="w-40 text-slate-500">{k}</div>
      <div className="flex-1 font-medium break-words">{v}</div>
    </div>
  );
}
