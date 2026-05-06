// src/pages/amenidades/AmenidadesList.jsx
import { useEffect, useMemo, useState } from "react";
import { useAmenidades } from "../../context/Amenidades/AmenidadesContext";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../../utils/swal";
import AmenidadForm from "./AmenidadForm";

export default function AmenidadesList() {
  const {
    amenidades,
    tiposAmenidad,
    loading,
    error,
    cargarAmenidades,
    cargarTiposAmenidad,
    crearAmenidad,
    actualizarAmenidad,
    eliminarAmenidad,
    clearError,
  } = useAmenidades();

  const [busqueda, setBusqueda] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [amenidadSeleccionada, setAmenidadSeleccionada] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        clearError();
        setLocalError("");
        await Promise.all([cargarAmenidades(), cargarTiposAmenidad()]);
      } catch (err) {
        console.error("Error al cargar datos de amenidades:", err);
        showError("Error", "Ocurrió un problema al procesar la amenidad.");
      }
    };

    loadData();
  }, [cargarAmenidades, cargarTiposAmenidad, clearError]);

  const handleNueva = () => {
    setAmenidadSeleccionada(null);
    setFormMode("create");
    setOpenForm(true);
  };

  const handleVer = (amenidad) => {
    setAmenidadSeleccionada(amenidad);
    setFormMode("view");
    setOpenForm(true);
  };

  const handleEditar = (amenidad) => {
    setAmenidadSeleccionada(amenidad);
    setFormMode("edit");
    setOpenForm(true);
  };

  const handleCerrarForm = () => {
    setOpenForm(false);
    setAmenidadSeleccionada(null);
    setFormMode("create");
  };

  const handleSubmitForm = async (values) => {
    if (formMode === "view") return;

    try {
      setSaving(true);
      setLocalError("");
      clearError();

      if (formMode === "edit" && amenidadSeleccionada?.amenidadID) {
        await actualizarAmenidad(amenidadSeleccionada.amenidadID, values);
        await showSuccess(
          "Amenidad actualizada",
          "Los cambios se guardaron correctamente."
        );
      } else {
        await crearAmenidad(values);
        await showSuccess(
          "Amenidad registrada",
          "La amenidad se agregó correctamente."
        );
      }

      handleCerrarForm();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al guardar la amenidad.";
      setLocalError(msg);
      showError("Error", "Ocurrió un problema al procesar la amenidad.");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (amenidad) => {
    const result = await confirmAction({
      title: "¿Eliminar amenidad?",
      text: "Esta acción modificará la amenidad dentro de la demo.",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      setLocalError("");
      clearError();
      await eliminarAmenidad(amenidad.amenidadID);
      await showSuccess(
        "Amenidad eliminada",
        "La amenidad se actualizó correctamente."
      );
    } catch (err) {
      console.error("Error al eliminar amenidad:", err);
      setLocalError(err?.message || "No se pudo eliminar la amenidad.");
      showError("Error", "Ocurrió un problema al procesar la amenidad.");
    } finally {
      setSaving(false);
    }
  };

  const amenidadesFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return amenidades || [];

    return (amenidades || []).filter((a) => {
      return (
        a.nombre?.toLowerCase().includes(term) ||
        a.ubicacion?.toLowerCase().includes(term) ||
        a.tipoAmenidadNombre?.toLowerCase().includes(term)
      );
    });
  }, [busqueda, amenidades]);

  const errorAmenidades = localError || error;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Amenidades</h1>
          <p className="text-sm text-slate-500">
            Administra las amenidades del condominio.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <input
              type="text"
              className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-72"
              placeholder="Buscar por nombre, tipo o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleNueva}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            disabled={loading}
          >
            + Nueva amenidad
          </button>
        </div>
      </div>

      {errorAmenidades && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorAmenidades}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-sm text-slate-500">
          Cargando amenidades...
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full table-auto text-sm text-slate-700">
            <thead className="bg-emerald-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Capacidad
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Horario
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
              {amenidadesFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    {loading ? "Cargando..." : "No hay amenidades registradas."}
                  </td>
                </tr>
              ) : (
                amenidadesFiltradas.map((a) => (
                  <tr
                    key={a.amenidadID}
                    className="transition-colors hover:bg-emerald-50/70"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {a.nombre}
                    </td>
                    <td className="px-4 py-3">{a.tipoAmenidadNombre}</td>
                    <td className="px-4 py-3">{a.ubicacion}</td>
                    <td className="px-4 py-3 text-center">{a.capacidad}</td>
                    <td className="px-4 py-3 text-center">
                      {a.horarioInicio?.slice(0, 5)} -{" "}
                      {a.horarioFin?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.activo ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleVer(a)}
                          className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                          disabled={saving}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditar(a)}
                          className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                          disabled={saving}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(a)}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                          disabled={saving || !a.activo}
                        >
                          Eliminar
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
        <AmenidadForm
          open={openForm}
          onClose={handleCerrarForm}
          onSubmit={handleSubmitForm}
          tiposAmenidad={tiposAmenidad}
          initial={amenidadSeleccionada}
          saving={saving}
          mode={formMode}
        />
      )}
    </div>
  );
}
