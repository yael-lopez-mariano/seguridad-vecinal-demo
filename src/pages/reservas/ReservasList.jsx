// src/pages/reservas/ReservasList.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import ReservasContext from "../../context/Reservas/ReservasContext";
import { useAmenidades } from "../../context/Amenidades/AmenidadesContext";
import { UsuariosAPI } from "../../services/usuarios.api";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../../utils/swal";
import ReservaForm from "./ReservaForm";

export default function ReservasList() {
  const {
    reservas,
    loading,
    error,
    fetchReservas,
    crearReserva,
    actualizarReserva,
    cancelarReserva,
    actualizarEstadoReserva,
  } = useContext(ReservasContext);

  const { amenidades, cargarAmenidades } = useAmenidades();

  const [busqueda, setBusqueda] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [usuarios, setUsuarios] = useState([]);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLocalError("");
        const [, , usuariosList] = await Promise.all([
          fetchReservas(),
          cargarAmenidades(),
          UsuariosAPI.list(),
        ]);
        setUsuarios(Array.isArray(usuariosList) ? usuariosList : []);
      } catch (err) {
        console.error("Error al cargar reservas:", err);
        showError("Error", "Ocurrió un problema al procesar la reserva.");
      }
    };
    load();
  }, [fetchReservas, cargarAmenidades]);

  const errorFinal = localError || error;

  const handleNueva = () => {
    setReservaSeleccionada(null);
    setFormMode("create");
    setOpenForm(true);
  };

  const handleVer = (reserva) => {
    setReservaSeleccionada(reserva);
    setFormMode("view");
    setOpenForm(true);
  };

  const handleEditar = (reserva) => {
    setReservaSeleccionada(reserva);
    setFormMode("edit");
    setOpenForm(true);
  };

  const handleCerrarForm = () => {
    setOpenForm(false);
    setReservaSeleccionada(null);
    setFormMode("create");
  };

  const handleSubmitForm = async (values) => {
    if (formMode === "view") return;

    try {
      setSaving(true);
      setLocalError("");

      if (formMode === "edit" && reservaSeleccionada?.reservaID) {
        await actualizarReserva(reservaSeleccionada.reservaID, values);
        await showSuccess(
          "Reserva actualizada",
          "Los cambios se guardaron correctamente."
        );
      } else {
        await crearReserva(values);
        await showSuccess(
          "Reserva registrada",
          "La reserva se agregó correctamente."
        );
      }

      handleCerrarForm();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al guardar la reserva.";
      setLocalError(msg);
      showError("Error", "Ocurrió un problema al procesar la reserva.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = async (reserva) => {
    const result = await confirmAction({
      title: "¿Cancelar reserva?",
      text: "Esta acción modificará la reserva dentro de la demo.",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      setLocalError("");
      await cancelarReserva(reserva.reservaID);
      await showSuccess(
        "Reserva cancelada",
        "La reserva se actualizó correctamente."
      );
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al cancelar la reserva.";
      setLocalError(msg);
      showError("Error", "Ocurrió un problema al procesar la reserva.");
    } finally {
      setSaving(false);
    }
  };

  const handleEstado = async (reserva, nuevoEstado) => {
    const isApprove = nuevoEstado === "Aprobada";
    const result = await confirmAction({
      title: isApprove ? "¿Aprobar reserva?" : "¿Rechazar reserva?",
      text: `Esta acción cambiará el estado a "${nuevoEstado}".`,
      confirmButtonText: isApprove ? "Sí, aprobar" : "Sí, rechazar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      setLocalError("");
      await actualizarEstadoReserva(reserva.reservaID, nuevoEstado);
      await showSuccess(
        isApprove ? "Reserva aprobada" : "Reserva rechazada",
        "La reserva se actualizó correctamente."
      );
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al actualizar el estado de la reserva.";
      setLocalError(msg);
      showError("Error", "Ocurrió un problema al procesar la reserva.");
    } finally {
      setSaving(false);
    }
  };

  const reservasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return reservas || [];
    return (reservas || []).filter((r) => {
      return (
        r.amenidadNombre?.toLowerCase().includes(term) ||
        r.tipoAmenidad?.toLowerCase().includes(term) ||
        r.nombreUsuario?.toLowerCase().includes(term) ||
        r.numeroCasa?.toLowerCase().includes(term) ||
        r.motivo?.toLowerCase().includes(term)
      );
    });
  }, [busqueda, reservas]);

  const badgeEstado = (estado) => {
    const value = (estado || "Pendiente").toLowerCase();

    if (value === "aprobada") {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Aprobada
        </span>
      );
    }
    if (value === "rechazada") {
      return (
        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
          Rechazada
        </span>
      );
    }
    if (value === "cancelada") {
      return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          Cancelada
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Pendiente
      </span>
    );
  };

  const isClosed = (estado) =>
    ["Cancelada", "Rechazada"].includes(estado || "Pendiente");

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Reservas</h1>
          <p className="text-sm text-slate-500">
            Administra las reservas de las amenidades del condominio.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-80"
            placeholder="Buscar por amenidad, usuario, casa o motivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button
            type="button"
            onClick={handleNueva}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            disabled={loading}
          >
            + Nueva reserva
          </button>
        </div>
      </div>

      {errorFinal && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorFinal}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-sm text-slate-500">Cargando reservas...</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full table-auto text-sm text-slate-700">
            <thead className="bg-emerald-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Amenidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Usuario
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Casa
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Fecha
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Horario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Motivo
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold md:text-sm">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {reservasFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    {loading ? "Cargando..." : "No hay reservas registradas."}
                  </td>
                </tr>
              ) : (
                reservasFiltradas.map((r) => (
                  <tr
                    key={r.reservaID}
                    className="transition-colors hover:bg-emerald-50/70"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {r.amenidadNombre}
                    </td>
                    <td className="px-4 py-3">{r.tipoAmenidad}</td>
                    <td className="px-4 py-3">{r.nombreUsuario}</td>
                    <td className="px-4 py-3 text-center">{r.numeroCasa || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {String(r.fechaReserva).slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.horaInicio?.slice(0, 5)} - {r.horaFin?.slice(0, 5)}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3">{r.motivo}</td>
                    <td className="px-4 py-3 text-center">
                      {badgeEstado(r.estado)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleVer(r)}
                          className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                          disabled={saving}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditar(r)}
                          className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                          disabled={saving || isClosed(r.estado)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEstado(r, "Aprobada")}
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                          disabled={saving || r.estado === "Aprobada" || isClosed(r.estado)}
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEstado(r, "Rechazada")}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                          disabled={saving || isClosed(r.estado)}
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelar(r)}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                          disabled={saving || r.estado === "Cancelada"}
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openForm && (
        <ReservaForm
          open={openForm}
          onClose={handleCerrarForm}
          onSubmit={handleSubmitForm}
          amenidades={amenidades}
          usuarios={usuarios}
          initial={reservaSeleccionada}
          saving={saving}
          mode={formMode}
        />
      )}
    </div>
  );
}
