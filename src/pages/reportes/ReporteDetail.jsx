// src/pages/reportes/ReporteDetail.jsx
import { useContext, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReportesContext from "../../context/Reportes/ReportesContext";
import { confirmAction, showError, showSuccess } from "../../utils/swal";

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

const Section = ({ title, children, right }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between bg-emerald-700 px-4 py-3 text-white md:px-6">
      <h2 className="font-semibold">{title}</h2>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

const Row = ({ label, value, mono = false }) => (
  <div className="grid grid-cols-12 gap-2 py-2 text-sm">
    <div className="col-span-12 text-slate-500 md:col-span-4">{label}</div>
    <div
      className={`col-span-12 text-slate-800 md:col-span-8 ${
        mono ? "font-mono" : ""
      }`}
    >
      {value || "-"}
    </div>
  </div>
);

export default function ReporteDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const {
    reporteActual: item,
    loading,
    error,
    fetchReporteById,
    cambiarEstado,
    cambiarAnonimato,
  } = useContext(ReportesContext);

  useEffect(() => {
    if (id) fetchReporteById(Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const gmapsUrl = useMemo(() => {
    if (!item) return "#";
    return `https://www.google.com/maps?q=${item.latitud},${item.longitud}`;
  }, [item]);

  const handleEstado = async (estado) => {
    if (!item) return;

    const result = await confirmAction({
      title:
        estado === "Resuelto"
          ? "¿Marcar como resuelto?"
          : "¿Marcar en revisión?",
      text: "Esta acción modificará el reporte dentro de la demo.",
      confirmButtonText:
        estado === "Resuelto" ? "Sí, resolver" : "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await cambiarEstado(item.reporteID, estado);
      await fetchReporteById(item.reporteID);
      await showSuccess(
        estado === "Resuelto" ? "Reporte resuelto" : "Reporte en revisión",
        "El reporte se actualizó correctamente."
      );
    } catch (err) {
      console.error(err);
      await showError("Error", "Ocurrió un problema al procesar el reporte.");
    }
  };

  const handleAnonimato = async () => {
    if (!item) return;
    try {
      await cambiarAnonimato(item.reporteID, !item.esAnonimo);
      await fetchReporteById(item.reporteID);
      await showSuccess(
        "Reporte actualizado",
        "Los cambios se guardaron correctamente."
      );
    } catch (err) {
      console.error(err);
      await showError("Error", "Ocurrió un problema al procesar el reporte.");
    }
  };

  const copyCoords = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(`${item.latitud}, ${item.longitud}`);
      await showSuccess("Coordenadas copiadas", "La ubicacion quedo disponible.");
    } catch {
      await showError("Error", "No se pudieron copiar las coordenadas.");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 md:text-2xl">
            Detalle del reporte #{id}
          </h1>
          {item && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={estadoClass(item.estado)}>{item.estado}</Badge>
              <Badge className={prioridadClass(item.prioridad)}>
                {item.prioridad}
              </Badge>
              <Badge className="bg-slate-50 text-slate-700 border-slate-200">
                {item.tipoReporte || "Tipo"}
              </Badge>
              {item.esAnonimo && (
                <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                  Anonimo
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => nav("/admin/reportes")}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
          >
            Volver
          </button>
          <button
            onClick={() => fetchReporteById(Number(id))}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Recargar
          </button>
          {item && (
            <>
              <button
                onClick={() => handleEstado("En revision")}
                disabled={item.estado === "En revision"}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                En revision
              </button>
              <button
                onClick={() => handleEstado("Resuelto")}
                disabled={item.estado === "Resuelto"}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resuelto
              </button>
              <button
                onClick={handleAnonimato}
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                {item.esAnonimo ? "Quitar anonimato" : "Hacer anonimo"}
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white p-10 text-slate-500 shadow-sm">
          Cargando reporte...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      ) : !item ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          No se encontró el reporte.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Section title="Informacion general">
              <h3 className="text-lg font-semibold text-slate-800">
                {item.titulo}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.descripcion}
              </p>

              <div className="mt-4">
                <Row
                  label="Fecha de creacion"
                  value={
                    item.fechaCreacion
                      ? new Date(item.fechaCreacion).toLocaleString()
                      : "-"
                  }
                />
                <Row
                  label="Ultima actualizacion"
                  value={
                    item.fechaActualizacion
                      ? new Date(item.fechaActualizacion).toLocaleString()
                      : "-"
                  }
                />
                <Row
                  label="Reportado por"
                  value={item.esAnonimo ? "Anonimo" : item.nombreUsuario}
                />
                <Row label="Correo" value={item.email} />
                <Row label="Telefono" value={item.telefono} />
                <Row
                  label="Domicilio"
                  value={
                    item.esAnonimo
                      ? "Anonimo"
                      : `${item.calle || ""} ${item.numeroCasa || ""}`.trim()
                  }
                />
              </div>
            </Section>

            <Section
              title="Ubicacion"
              right={
                <>
                  <button
                    onClick={copyCoords}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    Copiar coordenadas
                  </button>
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    Abrir en Maps
                  </a>
                </>
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Row label="Direccion" value={item.direccionTexto} />
                  <Row
                    label="Coordenadas"
                    value={`${item.latitud}, ${item.longitud}`}
                    mono
                  />
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <iframe
                    title="map"
                    className="h-52 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${item.latitud},${item.longitud}&output=embed`}
                  />
                </div>
              </div>
            </Section>

            {item.imagen && (
              <Section title="Evidencia">
                <div className="max-w-xl overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={item.imagen}
                    alt="Evidencia"
                    className="h-auto w-full"
                  />
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-5">
            <Section title="Estado">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className={estadoClass(item.estado)}>{item.estado}</Badge>
                <Badge className={prioridadClass(item.prioridad)}>
                  {item.prioridad}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEstado("En revision")}
                  disabled={item.estado === "En revision"}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Marcar en revision
                </button>
                <button
                  onClick={() => handleEstado("Resuelto")}
                  disabled={item.estado === "Resuelto"}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Marcar resuelto
                </button>
              </div>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}
