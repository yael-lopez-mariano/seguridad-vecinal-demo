// src/pages/amenidades/AmenidadesList.jsx
import { useEffect, useMemo, useState } from "react";
import { useAmenidades } from "../../context/Amenidades/AmenidadesContext";
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
    clearError,
  } = useAmenidades();

  const [busqueda, setBusqueda] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [amenidadEdit, setAmenidadEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  // ==========================
  // Cargar datos iniciales
  // ==========================
  useEffect(() => {
    const loadData = async () => {
      try {
        clearError();
        setLocalError("");
        await Promise.all([cargarAmenidades(), cargarTiposAmenidad()]);
      } catch (err) {
        console.error("Error al cargar datos de amenidades:", err);
      }
    };

    loadData();
  }, [cargarAmenidades, cargarTiposAmenidad, clearError]);

  const handleNueva = () => {
    setAmenidadEdit(null);
    setOpenForm(true);
  };

  const handleEditar = (amenidad) => {
    setAmenidadEdit(amenidad);
    setOpenForm(true);
  };

  const handleCerrarForm = () => {
    setOpenForm(false);
    setAmenidadEdit(null);
  };

  const handleSubmitForm = async (values) => {
    try {
      setSaving(true);
      setLocalError("");
      clearError();

      if (amenidadEdit?.amenidadID) {
        // ✏️ Actualizar solo esa amenidad y refrescar fila en el estado
        await actualizarAmenidad(amenidadEdit.amenidadID, values);
      } else {
        // ➕ Crear y agregar al estado con datos completos
        await crearAmenidad(values);
      }

      setOpenForm(false);
      setAmenidadEdit(null);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al guardar la amenidad.";
      setLocalError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // Filtro de búsqueda
  // ==========================
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

  // ==========================
  // Render
  // ==========================
  return (
    <div className="p-4 md:p-6">
      {/* Encabezado de página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Amenidades</h1>
          <p className="text-sm text-slate-500">
            Administra las amenidades del condominio (gimnasio, alberca,
            salones, etc.).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              className="w-full sm:w-64 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Buscar por nombre, tipo o ubicación..."
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
            + Nueva amenidad
          </button>
        </div>
      </div>

      {/* Error */}
      {errorAmenidades && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorAmenidades}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mb-4 text-sm text-slate-500">
          Cargando amenidades...
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            {/* 🔹 Encabezado verde tipo QR */}
            <thead className="bg-emerald-700 text-white text-xs md:text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold">Ubicación</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Capacidad
                </th>
                <th className="px-4 py-3 text-center font-semibold">Horario</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
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
                    className="border-t border-slate-100 hover:bg-emerald-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {a.nombre}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {a.tipoAmenidadNombre}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{a.ubicacion}</td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {a.capacidad}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {a.horarioInicio?.slice(0, 5)} -{" "}
                      {a.horarioFin?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.activo ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleEditar(a)}
                        className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                        disabled={saving}
                      >
                        Editar
                      </button>
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
        <AmenidadForm
          open={openForm}
          onClose={handleCerrarForm}
          onSubmit={handleSubmitForm}
          tiposAmenidad={tiposAmenidad}
          initial={amenidadEdit}
          saving={saving}
        />
      )}
    </div>
  );
}
