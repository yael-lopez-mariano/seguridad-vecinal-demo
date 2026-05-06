// src/pages/alertas/AdminAlertasPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

// >>> MODO PRUEBA: habilita botón "Atender" SIEMPRE
const MODO_PRUEBA = true;

const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

// Estado real (por si tu API manda 'activa' o 'estatus')
const isActiva = (r) =>
  r?.activa === true || r?.activa === 1 || r?.estatus === "Activa";

export default function AdminAlertasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function cargar() {
    try {
      setLoading(true);
      const data = await AlertasAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    cargar();
  }, []);

  // Activas primero
  const itemsOrdenados = useMemo(
    () =>
      [...items].sort((a, b) => (isActiva(b) ? 1 : 0) - (isActiva(a) ? 1 : 0)),
    [items]
  );

  const totalHoy = useMemo(
    () =>
      items.filter(
        (a) =>
          new Date(a.fechaHora).toDateString() === new Date().toDateString()
      ).length,
    [items]
  );
  const totalActivas = useMemo(() => items.filter(isActiva).length, [items]);

  const abrirModal = (row) => {
    setSelected(row);
    setOpen(true);
  };
  const cerrarModal = () => {
    setOpen(false);
    setSelected(null);
  };

  async function confirmarAtencion() {
    if (!selected) return;
    await AlertasAPI.updateEstado(selected.alertaID, false); // activa=false
    cerrarModal();
    alert(`Folio ${selected.alertaID} atendido ✅`);
    cargar();
  }

  const cols = [
    { header: "Folio", accessor: (r) => r.alertaID },
    { header: "Fecha", accessor: (r) => fmt(r.fechaHora) },
    {
      header: "Vecino",
      accessor: (r) => r.nombreUsuario || `Usuario #${r.usuarioID}`,
    },
    {
      header: "Estado",
      accessor: (r) => (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{
            backgroundColor: isActiva(r) ? COLOR.emergency : COLOR.light,
          }}
        >
          {isActiva(r) ? "Activa" : "Atendida"}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessor: (r) => {
        const activaReal = isActiva(r);
        const puedeAtender = MODO_PRUEBA ? true : activaReal; // << aquí habilitamos siempre
        return (
          <div className="flex gap-2">
            <Link
              to={`/admin/alertas/${r.alertaID}`}
              className="px-3 py-1 rounded-full text-white text-xs font-semibold shadow-sm transition"
              style={{ backgroundColor: COLOR.action }}
            >
              Detalle
            </Link>
            <button
              onClick={() => abrirModal(r)}
              disabled={!puedeAtender}
              className="px-3 py-1 rounded-full text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: COLOR.emergency }}
              title={activaReal ? "Marcar como atendida" : "Ya atendida"}
            >
              Atender
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-6" style={{ backgroundColor: COLOR.bg }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: COLOR.primary }}>
          Alertas (Administrador)
        </h1>
        <p className="text-slate-600">Recibe, revisa y marca como atendidas.</p>
      </div>

      {/* KPIs: Total=amarillo, Hoy=amarillo, Activas rojo/verde */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Kpi title="Total" value={items.length} bg={COLOR.warning} />
        <Kpi title="Hoy" value={totalHoy} bg={COLOR.warning} />
        <Kpi
          title="Activas"
          value={totalActivas}
          bg={totalActivas > 0 ? COLOR.emergency : COLOR.light}
        />
      </div>

      {loading ? (
        <div className="rounded-xl border p-4 bg-white">Cargando…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr
                className="text-white"
                style={{ backgroundColor: COLOR.light }}
              >
                {cols.map((c, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemsOrdenados.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-4 text-slate-500"
                    colSpan={cols.length}
                  >
                    Sin alertas
                  </td>
                </tr>
              ) : (
                itemsOrdenados.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-t hover:bg-slate-50/60"
                    style={{ color: COLOR.text }}
                  >
                    {cols.map((c, ci) => (
                      <td key={ci} className="px-4 py-3">
                        {typeof c.accessor === "function"
                          ? c.accessor(row)
                          : row[c.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <ConfirmModal
        open={open}
        onClose={cerrarModal}
        onConfirm={confirmarAtencion}
        title="¡Atención!"
        confirmText="Atender"
        cancelText="Cancelar"
        message={
          selected
            ? `¿Estás seguro de marcar la alerta del vecino "${
                selected.nombreUsuario || `Usuario #${selected.usuarioID}`
              }" (Folio ${selected.alertaID}) como atendida?`
            : ""
        }
      />
    </div>
  );
}

function Kpi({ title, value, bg }) {
  return (
    <div
      className="rounded-2xl p-4 shadow-sm text-white"
      style={{ backgroundColor: bg }}
    >
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
