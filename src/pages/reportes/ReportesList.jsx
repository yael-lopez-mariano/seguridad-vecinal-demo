// src/pages/reportes/ReportesList.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import ReportesContext from "../../context/Reportes/ReportesContext";
import { UsuariosAPI } from "../../services/usuarios.api";
import {
  confirmAction,
  showError,
  showSuccess,
  showWarning,
} from "../../utils/swal";
import ReporteForm from "./ReporteForm";

const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
  >
    {children}
  </span>
);

const estadoClass = (estado) => {
  const value = String(estado || "Pendiente").toLowerCase();
  if (value === "resuelto" || value === "atendido") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (value === "en revision" || value === "en revisión") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (value === "cancelado" || value === "rechazado") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  return "bg-amber-100 text-amber-700 border-amber-200";
};

const prioridadClass = (prioridad) => {
  const value = String(prioridad || "Media").toLowerCase();
  if (value === "alta" || value === "critica" || value === "crítica") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (value === "media") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

const normalizeSearch = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const validationMessage = (values) => {
  if (!values.titulo?.trim()) return "Falta capturar el titulo.";
  if (!values.descripcion?.trim()) return "Falta capturar la descripcion.";
  if (!values.tipoReporteID) return "Falta seleccionar el tipo de reporte.";
  if (!values.prioridad) return "Falta seleccionar la prioridad.";
  if (!values.estado) return "Falta seleccionar el estado.";
  if (!values.esAnonimo && !values.usuarioID) {
    return "Falta seleccionar el residente.";
  }
  if (!values.direccionTexto?.trim()) return "Falta capturar la ubicacion.";
  if (
    Number.isNaN(Number(values.latitud)) ||
    Number.isNaN(Number(values.longitud))
  ) {
    return "Las coordenadas deben ser validas.";
  }
  if (
    values.fechaCreacion &&
    Number.isNaN(new Date(values.fechaCreacion).getTime())
  ) {
    return "La fecha del reporte no es valida.";
  }
  return "";
};

export default function ReportesList() {
  const {
    reportes,
    tiposReporte,
    estadosReporte,
    prioridadesReporte,
    loading,
    error,
    fetchReportes,
    fetchTiposReporte,
    fetchEstadosReporte,
    fetchPrioridadesReporte,
    createReporte,
    updateReporte,
    removeReporte,
    cambiarEstado,
  } = useContext(ReportesContext);

  const [usuarios, setUsuarios] = useState([]);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [formMode, setFormMode] = useState("create");
  const [selected, setSelected] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const loadData = async () => {
    try {
      const [, , , , usuariosData] = await Promise.all([
        fetchReportes(),
        fetchTiposReporte(),
        fetchEstadosReporte(),
        fetchPrioridadesReporte(),
        UsuariosAPI.list(),
      ]);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (err) {
      console.error(err);
      showError("Error", "Ocurrió un problema al procesar el reporte.");
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = normalizeSearch(q.trim());
    return reportes
      .filter((r) => {
        if (!term) return true;
        const fullText = normalizeSearch(
          `${r.titulo} ${r.descripcion} ${r.nombreUsuario} ${r.direccionTexto} ${r.tipoReporte} ${r.prioridad} ${r.estado}`
        );
        return fullText.includes(term);
      })
      .filter((r) =>
        tipo ? Number(r.tipoReporteID) === Number(tipo) : true
      )
      .filter((r) => (estado ? r.estado === estado : true));
  }, [reportes, q, tipo, estado]);

  const closeForm = () => {
    setSelected(null);
    setFormMode("create");
    setOpenForm(false);
  };

  const openCreate = () => {
    setSelected(null);
    setFormMode("create");
    setOpenForm(true);
  };

  const openView = (reporte) => {
    setSelected(reporte);
    setFormMode("view");
    setOpenForm(true);
  };

  const openEdit = (reporte) => {
    setSelected(reporte);
    setFormMode("edit");
    setOpenForm(true);
  };

  const handleSubmit = async (values) => {
    const message = validationMessage(values);
    if (message) {
      await showWarning("Datos incompletos", message);
      return;
    }

    try {
      setSaving(true);
      if (formMode === "edit" && selected?.reporteID) {
        await updateReporte(selected.reporteID, values);
        await showSuccess(
          "Reporte actualizado",
          "Los cambios se guardaron correctamente."
        );
      } else {
        await createReporte(values);
        await showSuccess(
          "Reporte registrado",
          "El reporte se agregó correctamente."
        );
      }
      closeForm();
      await loadData();
    } catch (err) {
      console.error(err);
      if (err?.message) {
        await showWarning("Datos incompletos", err.message);
      } else {
        await showError("Error", "Ocurrió un problema al procesar el reporte.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reporte) => {
    const result = await confirmAction({
      title: "¿Eliminar reporte?",
      text: "Esta acción modificará el reporte dentro de la demo.",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await removeReporte(reporte.reporteID);
      await loadData();
      await showSuccess(
        "Reporte eliminado",
        "El reporte se actualizó correctamente."
      );
    } catch (err) {
      console.error(err);
      await showError("Error", "Ocurrió un problema al procesar el reporte.");
    } finally {
      setSaving(false);
    }
  };

  const handleEstado = async (reporte, nextEstado) => {
    const successTitle =
      nextEstado === "Resuelto" ? "Reporte resuelto" : "Reporte en revisión";
    const result = await confirmAction({
      title:
        nextEstado === "Resuelto"
          ? "¿Marcar como resuelto?"
          : "¿Marcar en revisión?",
      text: "Esta acción modificará el reporte dentro de la demo.",
      confirmButtonText:
        nextEstado === "Resuelto" ? "Sí, resolver" : "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await cambiarEstado(reporte.reporteID, nextEstado);
      await loadData();
      await showSuccess(successTitle, "El reporte se actualizó correctamente.");
    } catch (err) {
      console.error(err);
      await showError("Error", "Ocurrió un problema al procesar el reporte.");
    } finally {
      setSaving(false);
    }
  };

  const isClosed = (reporte) =>
    ["Resuelto", "Cancelado", "Rechazado"].includes(reporte.estado);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Reportes de la comunidad
          </h1>
          <p className="text-sm text-slate-500">
            Revisa, atiende y cambia el estado de los reportes enviados por los
            vecinos.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="Buscar por titulo, residente, ubicacion..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-80"
          />
          <button
            type="button"
            onClick={openCreate}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            + Nuevo reporte
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="min-w-[180px] rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todos los tipos</option>
          {tiposReporte.map((item) => (
            <option key={item.tipoReporteID} value={item.tipoReporteID}>
              {item.nombre}
            </option>
          ))}
        </select>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="min-w-[180px] rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todos los estados</option>
          {estadosReporte.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={loadData}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
        >
          Recargar
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-sm text-slate-500">Cargando reportes...</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full table-auto text-sm text-slate-700">
            <thead className="bg-emerald-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Reporte
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Residente
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Ubicacion
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Prioridad
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Fecha
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold md:text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No hay reportes registrados.
                  </td>
                </tr>
              )}

              {filtered.map((reporte) => (
                <tr
                  key={reporte.reporteID}
                  className="transition-colors hover:bg-emerald-50/70"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      {reporte.titulo}
                    </div>
                    <div className="mt-1 line-clamp-2 max-w-sm text-xs text-slate-500">
                      {reporte.descripcion}
                    </div>
                  </td>
                  <td className="px-4 py-3">{reporte.tipoReporte || "-"}</td>
                  <td className="px-4 py-3">
                    {reporte.esAnonimo ? (
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                        Anonimo
                      </Badge>
                    ) : (
                      reporte.nombreUsuario || "-"
                    )}
                  </td>
                  <td className="px-4 py-3">{reporte.direccionTexto || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={prioridadClass(reporte.prioridad)}>
                      {reporte.prioridad || "Media"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={estadoClass(reporte.estado)}>
                      {reporte.estado || "Pendiente"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600">
                    {reporte.fechaCreacion
                      ? new Date(reporte.fechaCreacion).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openView(reporte)}
                        className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        disabled={saving}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(reporte)}
                        className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                        disabled={saving || isClosed(reporte)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEstado(reporte, "En revision")}
                        className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        disabled={saving || reporte.estado === "En revision" || isClosed(reporte)}
                      >
                        En revision
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEstado(reporte, "Resuelto")}
                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                        disabled={saving || reporte.estado === "Resuelto"}
                      >
                        Resuelto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(reporte)}
                        className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                        disabled={saving}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openForm && (
        <ReporteForm
          initial={selected}
          usuarios={usuarios}
          tiposReporte={tiposReporte}
          estados={estadosReporte}
          prioridades={prioridadesReporte}
          saving={saving}
          mode={formMode}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
