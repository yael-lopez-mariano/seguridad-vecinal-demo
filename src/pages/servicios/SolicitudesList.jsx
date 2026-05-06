// src/pages/servicios/SolicitudesList.jsx
import { useContext, useEffect, useState } from "react";
import ServiciosContext from "../../context/Servicios/ServiciosContext";
import AsignacionForm from "./AsignacionForm";

export default function SolicitudesList() {
  const {
    solicitudes,
    personalMantenimiento,
    loading,
    error,
    cargarSolicitudes,
    cargarPersonalMantenimiento,
    asignarSolicitud,
    cambiarEstadoSolicitud,
    completarSolicitud,
    clearError,
  } = useContext(ServiciosContext);

  const [openAsignacion, setOpenAsignacion] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  useEffect(() => {
    cargarSolicitudes();
    cargarPersonalMantenimiento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirAsignacion = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setOpenAsignacion(true);
  };

  const handleAsignar = async (personaAsignado) => {
    if (!solicitudSeleccionada) return;
    await asignarSolicitud(solicitudSeleccionada.solicitudID, personaAsignado);
    setOpenAsignacion(false);
    setSolicitudSeleccionada(null);
  };

  const handleCambioEstado = async (solicitud, nuevoEstado) => {
    await cambiarEstadoSolicitud(solicitud.solicitudID, nuevoEstado);
  };

  const handleCompletar = async (solicitud) => {
    const notas = window.prompt(
      "Notas del administrador (opcional):",
      solicitud.notasAdmin ?? ""
    );
    await completarSolicitud(solicitud.solicitudID, notas ?? "");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-slate-800">
          Solicitudes de servicio
        </h1>
      </div>

      {loading && (
        <p className="text-sm text-slate-500">Cargando información...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded flex justify-between">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-xs underline underline-offset-2"
          >
            cerrar
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">ID</th>
              <th className="px-3 py-2 text-left font-semibold">UsuarioID</th>
              <th className="px-3 py-2 text-left font-semibold">
                Tipo servicio
              </th>
              <th className="px-3 py-2 text-left font-semibold">Descripción</th>
              <th className="px-3 py-2 text-left font-semibold">Urgencia</th>
              <th className="px-3 py-2 text-left font-semibold">Fecha pref.</th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-left font-semibold">Asignado</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(!solicitudes || solicitudes.length === 0) && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-3 text-center text-slate-500"
                >
                  No hay solicitudes registradas.
                </td>
              </tr>
            )}

            {solicitudes?.map((s) => (
              <tr key={s.solicitudID} className="border-t">
                <td className="px-3 py-2">{s.solicitudID}</td>
                <td className="px-3 py-2">{s.usuarioID}</td>
                <td className="px-3 py-2">{s.tipoServicioID}</td>
                <td className="px-3 py-2 max-w-xs truncate">{s.descripcion}</td>
                <td className="px-3 py-2">{s.urgencia}</td>
                <td className="px-3 py-2">{s.fechaPreferida?.slice(0, 10)}</td>
                <td className="px-3 py-2">{s.estado}</td>
                <td className="px-3 py-2">
                  {s.personaAsignado ? `#${s.personaAsignado}` : "Sin asignar"}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    onClick={() => abrirAsignacion(s)}
                    className="text-xs px-2 py-1 rounded bg-sky-500 text-white hover:bg-sky-600"
                  >
                    Asignar
                  </button>
                  <button
                    onClick={() =>
                      handleCambioEstado(
                        s,
                        s.estado === "Pendiente" ? "En proceso" : "Pendiente"
                      )
                    }
                    className="text-xs px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Cambiar estado
                  </button>
                  <button
                    onClick={() => handleCompletar(s)}
                    className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Completar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AsignacionForm
        open={openAsignacion}
        onClose={() => {
          setOpenAsignacion(false);
          setSolicitudSeleccionada(null);
        }}
        personal={personalMantenimiento}
        onSubmit={handleAsignar}
      />
    </div>
  );
}
