// src/pages/invitados/InvitadosList.jsx
import { useEffect, useMemo, useState } from "react";
import InvitadosAPI from "../../services/invitados.api";
import { UsuariosAPI } from "../../services/usuarios.api";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../../utils/swal";
import InvitadoForm from "./InvitadoForm";

export default function InvitadosList() {
  const [invitados, setInvitados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tiposVisitante, setTiposVisitante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formMode, setFormMode] = useState("create");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [invitadosData, usuariosData, tiposData] = await Promise.all([
        InvitadosAPI.getAll(),
        UsuariosAPI.list(),
        InvitadosAPI.getTiposVisitante(),
      ]);

      setInvitados(Array.isArray(invitadosData) ? invitadosData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setTiposVisitante(Array.isArray(tiposData) ? tiposData : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las invitaciones.");
      showError("Error", "Ocurrió un problema al procesar el invitado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const invitadosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invitados;
    return invitados.filter((inv) => {
      const fullName = [
        inv.nombreInvitado,
        inv.apellidoPaternoInvitado,
        inv.apellidoMaternoInvitado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const residente = (inv.nombreResidente || "").toLowerCase();
      const casa = (inv.numeroCasa || "").toLowerCase();
      const codigo = (inv.codigoQR || "").toLowerCase();
      const estado = (inv.estado || "").toLowerCase();
      const tipo = (inv.tipoVisitanteNombre || "").toLowerCase();
      return (
        fullName.includes(q) ||
        residente.includes(q) ||
        casa.includes(q) ||
        codigo.includes(q) ||
        estado.includes(q) ||
        tipo.includes(q)
      );
    });
  }, [search, invitados]);

  const openCreate = () => {
    setSelected(null);
    setFormMode("create");
    setOpenForm(true);
  };

  const openView = (invitado) => {
    setSelected(invitado);
    setFormMode("view");
    setOpenForm(true);
  };

  const openEdit = (invitado) => {
    setSelected(invitado);
    setFormMode("edit");
    setOpenForm(true);
  };

  const closeForm = () => {
    setSelected(null);
    setFormMode("create");
    setOpenForm(false);
  };

  const handleSubmitForm = async (values) => {
    if (formMode === "view") return;

    try {
      setSaving(true);
      setError("");

      if (formMode === "edit" && selected?.invitadoID) {
        await InvitadosAPI.update(selected.invitadoID, values);
        await showSuccess(
          "Invitado actualizado",
          "Los cambios se guardaron correctamente."
        );
      } else {
        await InvitadosAPI.crear(values);
        await showSuccess(
          "Invitado registrado",
          "El invitado se agregó correctamente."
        );
      }

      closeForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err?.message || "No se pudo guardar el invitado.");
      showError("Error", "Ocurrió un problema al procesar el invitado.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = async (invitado) => {
    const result = await confirmAction({
      title: "¿Cancelar invitado?",
      text: "Esta acción modificará el registro dentro de la demo.",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await InvitadosAPI.cancelar(invitado.invitadoID);
      await loadData();
      await showSuccess(
        "Invitado cancelado",
        "El registro se actualizó correctamente."
      );
    } catch (err) {
      console.error(err);
      showError("Error", "Ocurrió un problema al procesar el invitado.");
    } finally {
      setSaving(false);
    }
  };

  const handleEstado = async (invitado, action) => {
    const config = {
      autorizar: {
        title: "¿Autorizar invitado?",
        confirmButtonText: "Sí, autorizar",
        successTitle: "Invitado autorizado",
        fn: InvitadosAPI.autorizar,
      },
      rechazar: {
        title: "¿Rechazar invitado?",
        confirmButtonText: "Sí, rechazar",
        successTitle: "Invitado rechazado",
        fn: InvitadosAPI.rechazar,
      },
      entrada: {
        title: "¿Registrar entrada?",
        confirmButtonText: "Sí, registrar",
        successTitle: "Entrada registrada",
        fn: InvitadosAPI.registrarEntrada,
      },
      salida: {
        title: "¿Registrar salida?",
        confirmButtonText: "Sí, registrar",
        successTitle: "Salida registrada",
        fn: InvitadosAPI.registrarSalida,
      },
    }[action];

    if (!config) return;

    const result = await confirmAction({
      title: config.title,
      text: "Esta acción modificará el registro dentro de la demo.",
      confirmButtonText: config.confirmButtonText,
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await config.fn(invitado.invitadoID);
      await loadData();
      await showSuccess(config.successTitle, "El registro se actualizó correctamente.");
    } catch (err) {
      console.error(err);
      showError("Error", "Ocurrió un problema al procesar el invitado.");
    } finally {
      setSaving(false);
    }
  };

  const badgeEstado = (estado) => {
    const value = estado || "Pendiente";
    const lower = value.toLowerCase();

    const cls =
      lower === "autorizado" || lower === "ingresó" || lower === "salió"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : lower === "pendiente"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : lower === "cancelado" || lower === "rechazado"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-slate-100 text-slate-600 border-slate-200";

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
      >
        {value}
      </span>
    );
  };

  const isClosed = (estado) =>
    ["Cancelado", "Expirado", "Rechazado", "Salió"].includes(
      estado || "Pendiente"
    );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Invitaciones de acceso
          </h1>
          <p className="text-sm text-slate-500">
            Como administrador puedes revisar todas las invitaciones de los
            residentes.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="Buscar por invitado, residente, casa, código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-80"
          />
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            disabled={loading}
          >
            + Nuevo invitado
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-sm text-slate-500">
          Cargando invitaciones...
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full table-auto text-sm text-slate-700">
            <thead className="bg-emerald-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Invitado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Residente
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Casa
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Visita
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
              {invitadosFiltrados.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No hay invitaciones registradas.
                  </td>
                </tr>
              )}

              {invitadosFiltrados.map((inv) => (
                <tr
                  key={inv.invitadoID}
                  className="transition-colors hover:bg-emerald-50/70"
                >
                  <td className="px-4 py-3 text-xs font-mono">
                    {inv.codigoQR}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      {inv.nombreInvitado} {inv.apellidoPaternoInvitado}{" "}
                      {inv.apellidoMaternoInvitado}
                    </div>
                  </td>
                  <td className="px-4 py-3">{inv.tipoVisitanteNombre || "-"}</td>
                  <td className="px-4 py-3">{inv.nombreResidente || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {inv.numeroCasa || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600">
                    {inv.fechaVisita || inv.fechaVencimiento?.substring(0, 10) || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {badgeEstado(inv.estado)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openView(inv)}
                        className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        disabled={saving}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(inv)}
                        className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                        disabled={saving || isClosed(inv.estado)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEstado(inv, "autorizar")}
                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                        disabled={saving || isClosed(inv.estado) || inv.estado === "Autorizado"}
                      >
                        Autorizar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEstado(inv, "entrada")}
                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                        disabled={
                          saving ||
                          isClosed(inv.estado) ||
                          !["Autorizado", "Pendiente"].includes(inv.estado)
                        }
                      >
                        Entrada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEstado(inv, "salida")}
                        className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        disabled={saving || inv.estado !== "Ingresó"}
                      >
                        Salida
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEstado(inv, "rechazar")}
                        className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                        disabled={saving || isClosed(inv.estado)}
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelar(inv)}
                        className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                        disabled={saving || inv.estado === "Cancelado"}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openForm && (
        <InvitadoForm
          open={openForm}
          onClose={closeForm}
          onSubmit={handleSubmitForm}
          initial={selected}
          usuarios={usuarios}
          tiposVisitante={tiposVisitante}
          saving={saving}
          mode={formMode}
        />
      )}
    </div>
  );
}
