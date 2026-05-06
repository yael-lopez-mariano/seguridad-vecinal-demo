// src/pages/mapa/MapaAdmin.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import MarcadorForm from "./MarcadorForm";
import { useAuth } from "@/context/AuthContext";
import MapaContext from "@/context/Mapa/MapaContext";

// Colores por tipo de indicador
const indicadorConfig = {
  Peligroso: { color: "#ef4444", label: "Zona peligrosa" },
  Alerta: { color: "#f59e0b", label: "Zona de alerta" },
  Mantenimiento: { color: "#22c55e", label: "Zona de mantenimiento" },
};

const DEFAULT_CENTER = [21.116667, -101.683334];

// Radio del círculo según indicador (en metros)
function getRadius(indicador) {
  switch (indicador) {
    case "Peligroso":
      return 150;
    case "Alerta":
      return 120;
    case "Mantenimiento":
      return 100;
    default:
      return 100;
  }
}

// Componente para capturar clics en el mapa
function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function MapaAdmin() {
  const { user } = useAuth();
  const {
    marcadores,
    loading,
    error,
    getMarcadores,
    addMarcador,
    updateMarcador,
    deleteMarcador,
    clearError,
  } = useContext(MapaContext);

  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState({
    marcadorID: null,
    latitud: "",
    longitud: "",
    indicador: "Peligroso",
    comentario: "",
  });

  // -------------- CARGA INICIAL ----------------
  useEffect(() => {
    getMarcadores();
  }, []);

  // -------------- MANEJO FORMULARIO ----------------
  const openCreateForm = () => {
    setMode("create");
    setForm({
      marcadorID: null,
      latitud: "",
      longitud: "",
      indicador: "Peligroso",
      comentario: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (marcador) => {
    setMode("edit");
    setForm({
      marcadorID: marcador.marcadorID,
      latitud: marcador.latitud,
      longitud: marcador.longitud,
      indicador: marcador.indicador,
      comentario: marcador.comentario || "",
    });
    setFormOpen(true);
  };

  const handleMapClick = (latlng) => {
    if (!formOpen) return;
    setForm((prev) => ({
      ...prev,
      latitud: latlng.lat,
      longitud: latlng.lng,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const lat = Number(form.latitud);
    const lng = Number(form.longitud);

    if (!lat || !lng) {
      alert(
        "Selecciona una ubicación en el mapa (latitud y longitud válidas)."
      );
      return;
    }
    if (!form.comentario.trim()) {
      alert("El comentario es obligatorio.");
      return;
    }

    try {
      const payload = {
        latitud: lat,
        longitud: lng,
        indicador: form.indicador,
        comentario: form.comentario.trim(),
      };

      if (mode === "create") {
        // Agregar usuarioID si está disponible
        const usuarioID = user?.id || null;
        if (usuarioID != null) {
          payload.usuarioID = usuarioID;
        }
        await addMarcador(payload);
      } else {
        payload.marcadorID = form.marcadorID;
        await updateMarcador(payload);
      }

      setFormOpen(false);
    } catch (err) {
      console.error("Error al guardar marcador:", err);
    }
  };

  const handleDelete = async (marcador) => {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar la zona "${marcador.indicador}"?\nComentario: ${marcador.comentario}`
    );
    if (!ok) return;

    await deleteMarcador(marcador.marcadorID);
  };

  // Centro del mapa
  const center = useMemo(() => {
    if (marcadores.length > 0) {
      const m = marcadores[0];
      return [m.latitud, m.longitud];
    }
    return DEFAULT_CENTER;
  }, [marcadores]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mapa de zonas</h1>
          <p className="text-sm text-slate-500">
            Visualiza y administra las zonas peligrosas, de alerta y
            mantenimiento.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
        >
          + Nuevo marcador
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 text-sm text-red-700 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[500px]">
        {/* MAPA */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          {!loading ? (
            <MapContainer
              center={center}
              zoom={15}
              style={{ height: "100%", minHeight: "400px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              <ClickHandler onClick={handleMapClick} />

              {marcadores.map((m) => {
                const cfg = indicadorConfig[m.indicador] || {
                  color: "#3b82f6",
                  label: m.indicador,
                };

                return (
                  <div key={m.marcadorID}>
                    <Circle
                      center={[m.latitud, m.longitud]}
                      radius={getRadius(m.indicador)}
                      pathOptions={{
                        color: cfg.color,
                        fillColor: cfg.color,
                        fillOpacity: 0.25,
                      }}
                    >
                      <Tooltip sticky>
                        <div className="text-xs">
                          <div className="font-semibold">{cfg.label}</div>
                          <div>{m.comentario}</div>
                        </div>
                      </Tooltip>
                    </Circle>

                    <Marker position={[m.latitud, m.longitud]}>
                      <Popup>
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold">
                            {cfg.label} ({m.indicador})
                          </div>
                          <div>{m.comentario}</div>
                          <div className="text-xs text-slate-500">
                            Lat: {m.latitud.toFixed(6)} | Lng:{" "}
                            {m.longitud.toFixed(6)}
                          </div>
                          <button
                            onClick={() => openEditForm(m)}
                            className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                          >
                            Editar marcador
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </div>
                );
              })}
            </MapContainer>
          ) : (
            <div className="h-full grid place-items-center text-slate-500 text-sm">
              Cargando mapa...
            </div>
          )}
        </div>

        {/* PANEL LATERAL */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* FORMULARIO SEPARADO */}
          <MarcadorForm
            open={formOpen}
            mode={mode}
            form={form}
            saving={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onClose={() => setFormOpen(false)}
          />
          {/* LEYENDA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-sm">
            <h2 className="font-semibold text-slate-800 mb-3">
              Leyenda de indicadores
            </h2>
            <div className="space-y-2">
              {Object.entries(indicadorConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="font-medium text-slate-700">{key}</span>
                  <span className="text-slate-400">– {cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LISTA DE MARCADORES */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex-1 overflow-y-auto">
            <h2 className="font-semibold text-slate-800 mb-3 text-sm">
              Marcadores activos ({marcadores.length})
            </h2>
            {marcadores.length === 0 ? (
              <p className="text-xs text-slate-500">
                No hay marcadores activos. Agrega uno nuevo desde el botón
                "Nuevo marcador".
              </p>
            ) : (
              <ul className="space-y-3 text-xs">
                {marcadores.map((m) => {
                  const cfg = indicadorConfig[m.indicador] || {
                    color: "#3b82f6",
                    label: m.indicador,
                  };
                  return (
                    <li
                      key={m.marcadorID}
                      className="border border-slate-100 rounded-xl p-3 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                          />
                          <span className="font-semibold text-slate-800">
                            {cfg.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          ID: {m.marcadorID}
                        </span>
                      </div>
                      <div className="text-slate-600">{m.comentario}</div>
                      <div className="text-[11px] text-slate-400">
                        Lat: {m.latitud.toFixed(5)} | Lng:{" "}
                        {m.longitud.toFixed(5)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => openEditForm(m)}
                          className="flex-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold hover:bg-emerald-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="flex-1 px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 text-[11px] font-semibold hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
