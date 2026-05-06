// src/pages/servicios/PersonalMantenimientoList.jsx
import { useContext, useEffect, useState } from "react";
import ServiciosContext from "../../context/Servicios/ServiciosContext";
import PersonalMantenimientoForm from "./PersonalMantenimientoForm";

export default function PersonalMantenimientoList() {
  const {
    personalMantenimiento,
    loading,
    error,
    cargarPersonalMantenimiento,
    crearPersonalMantenimiento,
    clearError,
  } = useContext(ServiciosContext);

  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    cargarPersonalMantenimiento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNuevo = () => {
    setOpenForm(true);
  };

  const handleSubmit = async (values) => {
    await crearPersonalMantenimiento(values);
    setOpenForm(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-slate-800">
          Personal de mantenimiento
        </h1>
        <button
          onClick={handleNuevo}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded"
        >
          + Nuevo personal
        </button>
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
              <th className="px-3 py-2 text-left font-semibold">PersonaID</th>
              <th className="px-3 py-2 text-left font-semibold">Puesto</th>
              <th className="px-3 py-2 text-left font-semibold">
                Fecha contratación
              </th>
              <th className="px-3 py-2 text-left font-semibold">Sueldo</th>
              <th className="px-3 py-2 text-left font-semibold">
                Tipo contrato
              </th>
              <th className="px-3 py-2 text-left font-semibold">Turno</th>
              <th className="px-3 py-2 text-left font-semibold">
                Días laborales
              </th>
            </tr>
          </thead>
          <tbody>
            {(!personalMantenimiento || personalMantenimiento.length === 0) && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-3 text-center text-slate-500"
                >
                  No hay personal registrado.
                </td>
              </tr>
            )}

            {personalMantenimiento?.map((p) => (
              <tr key={p.personalMantenimientoID} className="border-t">
                <td className="px-3 py-2">{p.personaID}</td>
                <td className="px-3 py-2">{p.puesto}</td>
                <td className="px-3 py-2">
                  {p.fechaContratacion?.slice(0, 10)}
                </td>
                <td className="px-3 py-2">
                  ${Number(p.sueldo ?? 0).toFixed(2)}
                </td>
                <td className="px-3 py-2">{p.tipoContrato}</td>
                <td className="px-3 py-2">{p.turno}</td>
                <td className="px-3 py-2">{p.diasLaborales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PersonalMantenimientoForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
