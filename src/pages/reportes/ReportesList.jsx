// src/pages/reportes/ReportesList.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/modals/ConfirmModal";
import ReportesContext from "../../context/Reportes/ReportesContext";

const Badge = ({ children, className = "" }) => (
  <span
    className={
      "px-2.5 py-1.5 text-sm font-semibold rounded-full border " + className
    }
  >
    {children}
  </span>
);

const EstadoBadge = ({ visto }) =>
  visto ? (
    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
      Atendido
    </Badge>
  ) : (
    <Badge className="bg-amber-50 text-amber-700 border-amber-200">
      Pendiente
    </Badge>
  );

const TipoBadge = ({ tipo }) => {
  const map =
    {
      Robo: "bg-rose-50 text-rose-700 border-rose-200",
      Vandalismo: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Incidente: "bg-cyan-50 text-cyan-700 border-cyan-200",
    }[tipo] || "bg-slate-50 text-slate-700 border-slate-200";
  return <Badge className={map}>{tipo || "Tipo"}</Badge>;
};

export default function ReportesList() {
  const nav = useNavigate();

  const {
    reportes,
    tiposReporte,
    loading,
    error,
    fetchReportes,
    fetchTiposReporte,
    marcarVisto,
    cambiarAnonimato,
  } = useContext(ReportesContext);

  // modal de confirmación
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    onConfirm: null,
  });

  // Filtros UI
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("all");
  const [estado, setEstado] = useState("all"); // all | pendiente | atendido

  const fetchAll = async () => {
    await Promise.all([fetchReportes(), fetchTiposReporte()]);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return reportes
      .filter((r) =>
        q.trim()
          ? `${r.titulo} ${r.descripcion} ${r.nombreUsuario} ${r.direccionTexto} ${r.tipoReporte}`
              .toLowerCase()
              .includes(q.toLowerCase())
          : true
      )
      .filter((r) => (tipo === "all" ? true : r.tipoReporteID === Number(tipo)))
      .filter((r) =>
        estado === "all" ? true : estado === "pendiente" ? !r.visto : r.visto
      )
      .sort(
        (a, b) =>
          new Date(b.fechaCreacion).getTime() -
          new Date(a.fechaCreacion).getTime()
      );
  }, [reportes, q, tipo, estado]);

  // Helpers para abrir/cerrar modal
  const openConfirm = (payload) => setConfirm({ ...payload, open: true });
  const closeConfirm = () => setConfirm((c) => ({ ...c, open: false }));

  // Acciones (se invocan DESPUÉS de confirmar)
  const doMarcarVisto = async (id, newValue) => {
    await marcarVisto(id, newValue);
    // El contexto actualiza la lista
  };

  const doToggleAnon = async (id, newValue) => {
    await cambiarAnonimato(id, newValue);
    // El contexto actualiza la lista
  };

  // Handlers que abren el modal
  const onMarcarVisto = (r) => {
    const newVal = !r.visto;
    openConfirm({
      title: newVal ? "Marcar como atendido" : "Marcar como pendiente",
      message: `¿Confirmas cambiar el estado del reporte “${r.titulo}” a ${
        newVal ? "Atendido" : "Pendiente"
      }?`,
      confirmText: "Sí, confirmar",
      onConfirm: async () => {
        try {
          await doMarcarVisto(r.reporteID, newVal);
        } catch (e) {
          alert(e.message || "No se pudo actualizar el estado");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const onToggleAnon = (r) => {
    const newVal = !r.esAnonimo;
    openConfirm({
      title: newVal ? "Hacer anónimo" : "Quitar anonimato",
      message: `¿Deseas ${
        newVal ? "ocultar" : "mostrar"
      } los datos del usuario en “${r.titulo}”?`,
      confirmText: "Sí, confirmar",
      onConfirm: async () => {
        try {
          await doToggleAnon(r.reporteID, newVal);
        } catch (e) {
          alert(e.message || "No se pudo cambiar el anonimato");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  return (
    <div className="p-5 md:p-7">
      {/* Card de encabezado VERDE */}
      <div className="rounded-2xl shadow-sm mb-5 border border-[#10B981] bg-[#10B981] text-white">
        <div className="px-5 md:px-7 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Reportes de la comunidad
            </h1>
            <p className="opacity-90 text-base mt-0.5">
              Revisa, atiende y marca el estado de los reportes enviados por
              vecinos.
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2.5 text-base font-medium
                       bg-white/10 text-white hover:bg-white/10
                       active:scale-95 transition
                       focus:outline-none focus:ring-2 focus:ring-white/40"
            title="Recargar"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M21 12a9 9 0 1 1-3-6.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v6h-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Recargar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="md:col-span-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, descripción, dirección o usuario…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-500"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="all">Todos los tipos</option>
          {tiposReporte.map((t) => (
            <option key={t.tipoReporteID} value={t.tipoReporteID}>
              {t.nombre}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-500"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="atendido">Atendido</option>
        </select>
      </div>

      {/* Contenido */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        {loading ? (
          <div className="p-10 grid place-items-center">
            <div className="animate-spin h-7 w-7 border-2 border-slate-300 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="p-6 text-rose-600 text-base">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-base">
            No hay reportes con los filtros actuales.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <li
                key={r.reporteID}
                className="p-5 md:p-6 transition rounded-xl
                           hover:bg-emerald-50 hover:border hover:border-emerald-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Izquierda */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg md:text-xl font-semibold text-slate-800">
                        {r.titulo}
                      </h3>
                      <EstadoBadge visto={r.visto} />
                      <TipoBadge tipo={r.tipoReporte} />
                      {r.esAnonimo ? (
                        <Badge className="bg-slate-50 text-slate-700 border-slate-200">
                          Anónimo
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-1 text-base text-slate-700 line-clamp-2">
                      {r.descripcion}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-base text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7Z"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="9" r="2" />
                        </svg>
                        {r.direccionTexto}
                      </span>
                      <span>•</span>
                      <span>{new Date(r.fechaCreacion).toLocaleString()}</span>
                      {r.nombreUsuario && (
                        <>
                          <span>•</span>
                          <span>Por: {r.nombreUsuario}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Botonera */}
                  <div className="flex items-center gap-2.5">
                    {/* Detalle */}
                    <button
                      onClick={() => nav(`/admin/reportes/${r.reporteID}`)}
                      className="px-4 py-2.5 text-base rounded-xl border border-[#047857]
                                 bg-[#047857] text-white
                                 active:scale-95 transition
                                 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      title="Ver detalle"
                    >
                      Detalle
                    </button>

                    {/* Estado */}
                    <button
                      onClick={() => onMarcarVisto(r)}
                      className={`px-4 py-2.5 text-base rounded-xl border active:scale-95 transition
                                  focus:outline-none focus:ring-2 focus:ring-emerald-300
                                  ${
                                    r.visto
                                      ? "border-[#10B981] bg-[#10B981] text-white"
                                      : "border-[#FBBF24] bg-[#FBBF24] text-[#111827]"
                                  }`}
                      title="Cambiar estado"
                    >
                      {r.visto ? "Marcar como pendiente" : "Marcar atendido"}
                    </button>

                    {/* (Des)Anonimizar */}
                    <button
                      onClick={() => onToggleAnon(r)}
                      className="px-4 py-2.5 text-base rounded-xl border border-[#F97316]
                                 bg-[#F97316] text-white
                                 active:scale-95 transition
                                 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      title="Alternar anonimato"
                    >
                      {r.esAnonimo ? "Quitar anonimato" : "Hacer anónimo"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        onConfirm={confirm.onConfirm}
        onClose={closeConfirm}
        cancelText="Cancelar"
      />
    </div>
  );
}
