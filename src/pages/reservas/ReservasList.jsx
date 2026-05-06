// src/pages/reservas/ReservasList.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import ReservasContext from "../../context/Reservas/ReservasContext";
import { useAmenidades } from "../../context/Amenidades/AmenidadesContext";
import ReservaForm from "./ReservaForm";

export default function ReservasList() {
  const {
    reservas,
    loading,
    error,
    fetchReservas,
    crearReserva,
    cancelarReserva,
    actualizarEstadoReserva,
  } = useContext(ReservasContext);

  const { amenidades, cargarAmenidades } = useAmenidades();

  const [busqueda, setBusqueda] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  // Cargar reservas y amenidades
  useEffect(() => {
    const load = async () => {
      try {
        setLocalError("");
        await Promise.all([fetchReservas(), cargarAmenidades()]);
      } catch (err) {
        console.error("Error al cargar reservas:", err);
      }
    };
    load();
  }, [fetchReservas, cargarAmenidades]);

  const errorFinal = localError || error;

  const handleNueva = () => {
    setOpenForm(true);
  };

  const handleCerrarForm = () => {
    setOpenForm(false);
  };

  const handleSubmitForm = async (values) => {
    try {
      setSaving(true);
      setLocalError("");
      await crearReserva(values);
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al guardar la reserva.";
      setLocalError(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmar = (msg) => window.confirm(msg);

  const handleCancelar = async (reserva) => {
    const ok = confirmar(
      `¿Cancelar la reserva de ${reserva.amenidadNombre} para ${reserva.nombreUsuario}?`
    );
    if (!ok) return;

    try {
      setSaving(true);
      setLocalError("");
      await cancelarReserva(reserva.reservaID);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al cancelar la reserva.";
      setLocalError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEstado = async (reserva, nuevoEstado) => {
    const ok = confirmar(
      `¿Cambiar el estado de la reserva a "${nuevoEstado}"?`
    );
    if (!ok) return;

    try {
      setSaving(true);
      setLocalError("");
      await actualizarEstadoReserva(reserva.reservaID, nuevoEstado);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al actualizar el estado de la reserva.";
      setLocalError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Filtro de búsqueda
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
          Aprobada
        </span>
      );
    }
    if (value === "rechazada") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
          Rechazada
        </span>
      );
    }
    if (value === "cancelada") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          Cancelada
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        Pendiente
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Reservas</h1>
          <p className="text-sm text-slate-500">
            Administra las reservas de las amenidades del condominio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              className="w-full sm:w-72 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Buscar por amenidad, usuario, casa o motivo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-slate-400 text-sm">
              🔍
            </span>
          </div>

          <button
            type="button"
            onClick={handleNueva}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            + Nueva reserva
          </button>
        </div>
      </div>

      {/* Errores */}
      {errorFinal && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorFinal}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mb-4 text-sm text-slate-500">Cargando reservas...</div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            {/* Encabezado verde */}
            <thead className="bg-emerald-700 text-white text-xs md:text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Amenidad</th>
                <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                <th className="px-4 py-3 text-center font-semibold">Casa</th>
                <th className="px-4 py-3 text-center font-semibold">Fecha</th>
                <th className="px-4 py-3 text-center font-semibold">Horario</th>
                <th className="px-4 py-3 text-left font-semibold">Motivo</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
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
                    className="border-t border-slate-100 hover:bg-emerald-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {r.amenidadNombre}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.tipoAmenidad}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.nombreUsuario}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {r.numeroCasa}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {String(r.fechaReserva).slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {r.horaInicio?.slice(0, 5)} - {r.horaFin?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                      {r.motivo}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {badgeEstado(r.estado)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col sm:flex-row gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => handleEstado(r, "Aprobada")}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                          disabled={saving}
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEstado(r, "Rechazada")}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
                          disabled={saving}
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelar(r)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                          disabled={saving}
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

      {/* Modal formulario */}
      {openForm && (
        <ReservaForm
          open={openForm}
          onClose={handleCerrarForm}
          onSubmit={handleSubmitForm}
          amenidades={amenidades}
          saving={saving}
        />
      )}
    </div>
  );
}
