// src/pages/servicios/ServicesList.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import ServiciosContext from "../../context/Servicios/ServiciosContext";
import ServicioForm from "./ServicioForm";

export default function ServicesList() {
  const {
    tiposServicio,
    catalogoServicios,
    loading,
    error,
    cargarTiposServicio,
    cargarCatalogoServicios,
    crearServicioCatalogo,
    actualizarServicioCatalogo,
    cambiarDisponibilidadServicio,
    clearError,
  } = useContext(ServiciosContext);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState("");

  useEffect(() => {
    cargarTiposServicio();
    cargarCatalogoServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const serviciosFiltrados = useMemo(() => {
    if (!tipoFiltro) return catalogoServicios || [];
    return (catalogoServicios || []).filter(
      (s) => String(s.tipoServicioID) === String(tipoFiltro)
    );
  }, [catalogoServicios, tipoFiltro]);

  const handleNuevo = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEditar = (servicio) => {
    setEditing(servicio);
    setOpenForm(true);
  };

  const handleSubmitForm = async (values) => {
    if (editing) {
      await actualizarServicioCatalogo(editing.servicioID, values);
    } else {
      await crearServicioCatalogo(values);
    }
    setOpenForm(false);
    setEditing(null);
  };

  const handleToggleDisponible = async (servicio) => {
    const nuevoValor = !servicio.disponible;
    await cambiarDisponibilidadServicio(servicio.servicioID, nuevoValor);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-slate-800">
          Servicios / Catálogo
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Todos los tipos</option>
            {tiposServicio?.map((t) => (
              <option key={t.tipoServicioID} value={t.tipoServicioID}>
                {t.nombre}
              </option>
            ))}
          </select>

          <button
            onClick={handleNuevo}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded"
          >
            + Nuevo servicio
          </button>
        </div>
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
              <th className="px-3 py-2 text-left font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold">Encargado</th>
              <th className="px-3 py-2 text-left font-semibold">Teléfono</th>
              <th className="px-3 py-2 text-left font-semibold">Email</th>
              <th className="px-3 py-2 text-left font-semibold">Disponible</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {serviciosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-3 text-center text-slate-500"
                >
                  No hay servicios registrados.
                </td>
              </tr>
            )}

            {serviciosFiltrados.map((s) => {
              const tipo = tiposServicio?.find(
                (t) => t.tipoServicioID === s.tipoServicioID
              );
              return (
                <tr key={s.servicioID} className="border-t">
                  <td className="px-3 py-2">
                    {tipo?.nombre ?? `Tipo #${s.tipoServicioID}`}
                  </td>
                  <td className="px-3 py-2">{s.nombreEncargado}</td>
                  <td className="px-3 py-2">{s.telefono}</td>
                  <td className="px-3 py-2">{s.email}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleToggleDisponible(s)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        s.disponible
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {s.disponible ? "Sí" : "No"}
                    </button>
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      onClick={() => handleEditar(s)}
                      className="text-xs px-2 py-1 rounded bg-sky-500 text-white hover:bg-sky-600"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ServicioForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        tipos={tiposServicio}
        initial={editing}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
