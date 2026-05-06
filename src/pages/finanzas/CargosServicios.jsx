import { useEffect, useMemo, useState, useContext } from "react";
import PagosContext from "@/context/Pagos/PagosContext";

const fmtMoney = (n) =>
  typeof n === "number"
    ? n.toLocaleString("es-MX", { style: "currency", currency: "MXN" })
    : n;

const fmtDate = (d) => {
  if (!d) return "-";
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return "-";
  return x.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const EstadoPill = ({ estado }) => {
  const colors =
    estado === "Pendiente"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${colors}`}
    >
      {estado}
    </span>
  );
};

const MetodoPagoPill = ({ metodo }) => {
  const colors =
    metodo === "Tarjeta"
      ? "bg-purple-50 text-purple-700 ring-purple-200"
      : metodo === "Efectivo"
      ? "bg-green-50 text-green-700 ring-green-200"
      : "bg-gray-50 text-gray-700 ring-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${colors}`}
    >
      {metodo}
    </span>
  );
};

export default function CargosServicios() {
  const { getAllCargosServicios, obtenerTodosLosPagos } =
    useContext(PagosContext);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Pendiente");
  const [tipoVista, setTipoVista] = useState("cargos");

  // Estados para el pago
  const [cargosSeleccionados, setCargosSeleccionados] = useState({});
  const [montosPago, setMontosPago] = useState({});
  const [procesandoPago, setProcesandoPago] = useState(false);

  const mostrarColumnasPagos = tipoVista === "pagos";

  const descargarComprobante = async (pagoId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5165/api"
        }/Pagos/comprobante/${pagoId}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Abrir en nueva ventana en lugar de descargar
        window.open(url, "_blank");
      } else {
        alert("No se pudo abrir el comprobante");
      }
    } catch (error) {
      console.error("Error al abrir comprobante:", error);
      alert("Error al abrir el comprobante");
    }
  };

  const loadAll = async () => {
    try {
      setErr("");
      setLoading(true);

      if (tipoVista === "cargos") {
        // Cargar cargos de servicios usando el context
        const cargos = await getAllCargosServicios();

        const formateados = cargos.map((c) => ({
          ...c,
          usuarioNombre: [
            c.usuarioNombre,
            c.usuarioApellidoP,
            c.usuarioApellidoM,
          ]
            .filter(Boolean)
            .join(" "),
          tipo: "cargo",
        }));

        setRows(formateados);
      } else {
        // Cargar TODOS los pagos y filtrar solo los de servicios
        const pagos = await obtenerTodosLosPagos();

        // Filtrar solo pagos que tienen al menos un detalle con cargoServicioID
        const pagosServicios = pagos.filter(
          (pago) =>
            pago.detallesPago &&
            pago.detallesPago.some(
              (detalle) => detalle.cargoServicioID !== null
            )
        );

        const formateados = pagosServicios.map((p) => {
          // Encontrar el detalle de servicio para mostrar información específica
          const detalleServicio = p.detallesPago.find(
            (d) => d.cargoServicioID !== null
          );

          return {
            ...p,
            usuarioNombre: [
              p.usuario?.persona?.nombre,
              p.usuario?.persona?.apellidoPaterno,
              p.usuario?.persona?.apellidoMaterno,
            ]
              .filter(Boolean)
              .join(" "),
            usuarioId: p.usuario?.usuarioID,
            tipo: "pago",
            concepto: `Pago Servicio - ${p.folioUnico}`,
            monto: p.montoTotal,
            montoPagado: p.montoTotal,
            saldoPendiente: 0,
            estado: "Completado",
            fechaCreacion: p.fechaPago,
            metodoPago: p.metodoPago,
            tipoPago: p.tipoPago,
            folioUnico: p.folioUnico,
            tieneComprobante: !!p.comprobante,
            cargoServicioID: detalleServicio?.cargoServicioID,
          };
        });

        setRows(formateados);
      }
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los datos.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // Limpiar selección al cambiar de vista
    setCargosSeleccionados({});
    setMontosPago({});
  }, [tipoVista]);

  const dataFiltrada = useMemo(() => {
    let list = rows;

    if (!mostrarColumnasPagos && filtroEstado !== "Todos") {
      list = list.filter((r) => r.estado === filtroEstado);
    }

    if (filtroNombre.trim()) {
      const q = filtroNombre.trim().toLowerCase();
      list = list.filter((r) => r.usuarioNombre?.toLowerCase().includes(q));
    }

    return list;
  }, [rows, filtroEstado, filtroNombre, mostrarColumnasPagos]);

  // Filtrar solo cargos con saldo pendiente para pago
  const cargosPendientes = useMemo(() => {
    return dataFiltrada.filter(
      (r) => r.tipo === "cargo" && r.saldoPendiente > 0
    );
  }, [dataFiltrada]);

  // Calcular totales
  const totales = useMemo(() => {
    const ids = Object.keys(cargosSeleccionados).filter(
      (id) => cargosSeleccionados[id]
    );
    const totalCargos = ids.reduce((sum, id) => {
      const cargo = cargosPendientes.find(
        (c) => c.cargoServicioID === parseInt(id)
      );
      return sum + (cargo?.saldoPendiente || 0);
    }, 0);
    const totalPagar = ids.reduce((sum, id) => {
      return sum + (parseFloat(montosPago[id]) || 0);
    }, 0);
    return { totalCargos, totalPagar, cantidadSeleccionados: ids.length };
  }, [cargosSeleccionados, montosPago, cargosPendientes]);

  const handleCheckboxChange = (cargoId, checked) => {
    setCargosSeleccionados((prev) => ({
      ...prev,
      [cargoId]: checked,
    }));

    // Inicializar monto con el saldo pendiente
    if (checked) {
      const cargo = cargosPendientes.find((c) => c.cargoServicioID === cargoId);
      if (cargo) {
        setMontosPago((prev) => ({
          ...prev,
          [cargoId]: cargo.saldoPendiente.toFixed(2),
        }));
      }
    } else {
      // Limpiar monto si se desmarca
      setMontosPago((prev) => {
        const newMontos = { ...prev };
        delete newMontos[cargoId];
        return newMontos;
      });
    }
  };

  const handleMontoChange = (cargoId, value) => {
    setMontosPago((prev) => ({
      ...prev,
      [cargoId]: value,
    }));
  };

  const validarMontos = () => {
    const errors = [];
    const ids = Object.keys(cargosSeleccionados).filter(
      (id) => cargosSeleccionados[id]
    );

    for (const id of ids) {
      const monto = parseFloat(montosPago[id]);
      const cargo = cargosPendientes.find(
        (c) => c.cargoServicioID === parseInt(id)
      );

      if (!cargo) continue;

      if (isNaN(monto) || monto <= 0) {
        errors.push(`El cargo #${id} debe tener un monto válido mayor a 0`);
      } else if (monto > cargo.saldoPendiente) {
        errors.push(
          `El cargo #${id} no puede tener un monto mayor a ${fmtMoney(
            cargo.saldoPendiente
          )}`
        );
      }
    }

    return errors;
  };

  const procesarPago = async () => {
    // Validar que hay cargos seleccionados
    const idsSeleccionados = Object.keys(cargosSeleccionados).filter(
      (id) => cargosSeleccionados[id]
    );

    if (idsSeleccionados.length === 0) {
      alert("Debe seleccionar al menos un cargo para pagar");
      return;
    }

    // Validar montos
    const erroresValidacion = validarMontos();
    if (erroresValidacion.length > 0) {
      alert("Errores de validación:\n\n" + erroresValidacion.join("\n"));
      return;
    }

    // Obtener el usuarioID del primer cargo seleccionado
    const primerCargo = cargosPendientes.find(
      (c) => c.cargoServicioID === parseInt(idsSeleccionados[0])
    );

    if (!primerCargo) {
      alert("Error al obtener información del cargo");
      return;
    }

    // Construir detallesPagoJson para servicios
    const detalles = idsSeleccionados.map((id) => ({
      CargoServicioID: parseInt(id),
      MontoAplicado: parseFloat(montosPago[id]),
    }));

    const payload = {
      usuarioID: primerCargo.usuarioId,
      montoTotal: totales.totalPagar,
      tipoPago: "Servicio",
      metodoPago: "Efectivo",
      detallesPagoJson: JSON.stringify(detalles),
    };

    try {
      setProcesandoPago(true);
      setErr("");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5165/api"
        }/Pagos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error al procesar el pago");
      }

      // Obtener el blob del comprobante
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Abrir en nueva ventana
      window.open(url, "_blank");

      // Limpiar selección
      setCargosSeleccionados({});
      setMontosPago({});

      // Recargar datos
      await loadAll();
    } catch (error) {
      console.error("Error al procesar pago:", error);
      setErr("Error al procesar el pago. Por favor intente nuevamente.");
      alert("Error al procesar el pago");
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        {mostrarColumnasPagos
          ? "Historial de Pagos de Servicios"
          : "Cargos de Servicios"}
      </h1>
      <p className="text-slate-500 mb-4">
        {mostrarColumnasPagos
          ? "Todos los pagos de servicios registrados"
          : "Vista de administrador: todos los cargos de servicios por usuario"}
      </p>

      {/* Selector de Vista */}
      <div className="mb-4">
        <label className="text-sm text-slate-600 font-medium">
          Tipo de Vista
        </label>
        <select
          className="w-full md:w-64 rounded-lg border px-3 py-2 mt-1"
          value={tipoVista}
          onChange={(e) => setTipoVista(e.target.value)}
        >
          <option value="cargos">Cargos de Servicios</option>
          <option value="pagos">Todos los Pagos</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 shadow mb-5 overflow-hidden">
        <div className="px-4 py-2 bg-[#047857] text-white font-semibold">
          Búsqueda
        </div>

        <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-600">Buscar por nombre</label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Ej. Yael, López..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>

          {!mostrarColumnasPagos && (
            <div>
              <label className="text-sm text-slate-600">Estado</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={loadAll}
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white py-2 rounded-lg transition-colors"
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {err && <p className="text-red-600 px-4 pb-3">{err}</p>}
      </div>

      {/* Panel de pago - Solo visible en vista de cargos con pendientes seleccionados */}
      {!mostrarColumnasPagos && totales.cantidadSeleccionados > 0 && (
        <div className="rounded-xl border-2 border-[#047857] bg-emerald-50 p-4 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-emerald-900 mb-1">
                Resumen de Pago
              </h3>
              <div className="text-sm text-emerald-700 space-y-1">
                <p>Cargos seleccionados: {totales.cantidadSeleccionados}</p>
                <p>Total en cargos: {fmtMoney(totales.totalCargos)}</p>
                <p className="font-semibold">
                  Total a pagar: {fmtMoney(totales.totalPagar)}
                </p>
              </div>
            </div>
            <button
              onClick={procesarPago}
              disabled={procesandoPago}
              className="bg-[#047857] hover:bg-[#059669] disabled:bg-emerald-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {procesandoPago ? "Procesando..." : "Procesar Pago"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-2 bg-[#047857]" />
        <div className="overflow-x-auto bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#047857] text-white">
              <tr>
                {!mostrarColumnasPagos &&
                  (filtroEstado === "Pendiente" ||
                    filtroEstado === "Todos") && (
                    <th className="px-4 py-3 text-left">Pagar</th>
                  )}
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-left">Monto</th>
                {!mostrarColumnasPagos && (
                  <th className="px-4 py-3 text-left">Pagado</th>
                )}
                {!mostrarColumnasPagos && (
                  <th className="px-4 py-3 text-left">Pendiente</th>
                )}
                <th className="px-4 py-3 text-left">Estado</th>
                {mostrarColumnasPagos && (
                  <>
                    <th className="px-4 py-3 text-left">Método Pago</th>
                    <th className="px-4 py-3 text-left">Folio</th>
                    <th className="px-4 py-3 text-left">Comprobante</th>
                  </>
                )}
                {!mostrarColumnasPagos &&
                  (filtroEstado === "Pendiente" ||
                    filtroEstado === "Todos") && (
                    <th className="px-4 py-3 text-left">Monto a Pagar</th>
                  )}
                {!mostrarColumnasPagos && (
                  <th className="px-4 py-3 text-left">Solicitud</th>
                )}
                <th className="px-4 py-3 text-left">
                  {mostrarColumnasPagos ? "Fecha Pago" : "Creado"}
                </th>
              </tr>
            </thead>

            <tbody>
              {dataFiltrada.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-500"
                    colSpan={mostrarColumnasPagos ? "9" : "11"}
                  >
                    {loading ? "Cargando..." : "Sin resultados"}
                  </td>
                </tr>
              )}

              {dataFiltrada.map((r) => {
                const tieneSaldoPendiente =
                  r.tipo === "cargo" && r.saldoPendiente > 0;
                const estaSeleccionado = cargosSeleccionados[r.cargoServicioID];
                const mostrarCheckbox =
                  !mostrarColumnasPagos &&
                  (filtroEstado === "Pendiente" || filtroEstado === "Todos");

                return (
                  <tr
                    key={
                      r.tipo === "pago"
                        ? `pago-${r.pagoID}`
                        : `cargo-${r.cargoServicioID}-${r.usuarioId}`
                    }
                    className={`border-t hover:bg-slate-50 ${
                      estaSeleccionado ? "bg-emerald-50" : ""
                    }`}
                  >
                    {mostrarCheckbox && (
                      <td className="px-4 py-3">
                        {tieneSaldoPendiente && (
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-emerald-600 rounded"
                            checked={estaSeleccionado || false}
                            onChange={(e) =>
                              handleCheckboxChange(
                                r.cargoServicioID,
                                e.target.checked
                              )
                            }
                          />
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <div className="font-medium">{r.usuarioNombre}</div>
                      <div className="text-xs text-slate-500">
                        #{r.usuarioId}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {r.tipo === "pago" ? r.pagoID : r.cargoServicioID}
                    </td>

                    <td className="px-4 py-3">{r.concepto}</td>

                    <td className="px-4 py-3 font-medium">
                      {fmtMoney(r.monto)}
                    </td>

                    {!mostrarColumnasPagos && (
                      <td className="px-4 py-3">
                        {r.montoPagado != null ? fmtMoney(r.montoPagado) : "-"}
                      </td>
                    )}

                    {!mostrarColumnasPagos && (
                      <td className="px-4 py-3">
                        {fmtMoney(r.saldoPendiente)}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <EstadoPill estado={r.estado} />
                    </td>

                    {mostrarColumnasPagos && (
                      <td className="px-4 py-3">
                        <MetodoPagoPill metodo={r.metodoPago} />
                      </td>
                    )}

                    {mostrarColumnasPagos && (
                      <td className="px-4 py-3 text-xs font-mono text-slate-600">
                        {r.folioUnico}
                      </td>
                    )}

                    {mostrarColumnasPagos && (
                      <td className="px-4 py-3">
                        {r.tieneComprobante ? (
                          <button
                            onClick={() => descargarComprobante(r.pagoID)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            Comprobante
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            No disponible
                          </span>
                        )}
                      </td>
                    )}

                    {mostrarCheckbox && (
                      <td className="px-4 py-3">
                        {tieneSaldoPendiente && estaSeleccionado ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={r.saldoPendiente}
                            className="w-28 rounded border px-2 py-1 text-sm"
                            value={montosPago[r.cargoServicioID] || ""}
                            onChange={(e) =>
                              handleMontoChange(
                                r.cargoServicioID,
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                    )}

                    {!mostrarColumnasPagos && (
                      <td className="px-4 py-3">
                        {r?.solicitud ? (
                          <>
                            <div className="font-medium">
                              #{r.solicitud.solicitudID}
                            </div>
                            <div className="text-xs text-slate-600">
                              {r.solicitud.descripcion || "-"}
                            </div>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">{fmtDate(r.fechaCreacion)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="h-3 bg-[#10B981]/20" />
      </div>
    </div>
  );
}
