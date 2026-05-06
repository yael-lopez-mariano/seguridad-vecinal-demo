// src/pages/qr/QRPersonalList.jsx
import { useEffect, useMemo, useState } from "react";
import { UsuariosAPI } from "../../services/usuarios.api";
import InvitadosAPI from "../../services/invitados.api";
import QRPersonalAPI from "../../services/qrPersonal.api";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../../utils/swal";
import QrPersonalForm from "./QrPersonalForm";

export default function QRPersonalList() {
  const [qrs, setQrs] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [invitados, setInvitados] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos");
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formMode, setFormMode] = useState("create");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [qrList, usuariosList, invitadosList, estadosList] =
        await Promise.all([
          QRPersonalAPI.list(),
          UsuariosAPI.list(),
          InvitadosAPI.getAll(),
          QRPersonalAPI.getEstados(),
        ]);

      setQrs(Array.isArray(qrList) ? qrList : []);
      setUsuarios(Array.isArray(usuariosList) ? usuariosList : []);
      setInvitados(Array.isArray(invitadosList) ? invitadosList : []);
      setEstados(Array.isArray(estadosList) ? estadosList : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los QR personales.");
      showError("Error", "Ocurrió un problema al procesar el código QR.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return qrs.filter((qr) => {
      const text = [
        qr.codigoQR,
        qr.usuarioNombre,
        qr.invitadoNombre,
        qr.tipoQR,
        qr.descripcion,
        qr.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !term || text.includes(term);
      const matchEstado = estado === "todos" || qr.estado === estado;
      return matchSearch && matchEstado;
    });
  }, [qrs, search, estado]);

  const openCreate = () => {
    setSelected(null);
    setFormMode("create");
    setOpenForm(true);
  };

  const openView = (qr) => {
    setSelected(qr);
    setFormMode("view");
    setOpenForm(true);
  };

  const openEdit = (qr) => {
    setSelected(qr);
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

      if (formMode === "edit" && selected?.qrid) {
        await QRPersonalAPI.update(selected.qrid, values);
        await showSuccess("QR actualizado", "Los cambios se guardaron correctamente.");
      } else {
        await QRPersonalAPI.create(values);
        await showSuccess("QR generado", "El código QR se generó correctamente.");
      }

      closeForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err?.message || "No se pudo guardar el QR.");
      showError("Error", "Ocurrió un problema al procesar el código QR.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (qr) => {
    const result = await confirmAction({
      title: "¿Cancelar QR?",
      text: "El código quedará cancelado dentro de la demo.",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await QRPersonalAPI.cancelar(qr.qrid);
      await loadData();
      await showSuccess("QR cancelado", "El código QR fue cancelado correctamente.");
    } catch (err) {
      console.error(err);
      showError("Error", "Ocurrió un problema al procesar el código QR.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (qr) => {
    const result = await confirmAction({
      title: "¿Eliminar QR?",
      text: "Esta acción eliminará el código QR de la demo.",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await QRPersonalAPI.remove(qr.qrid);
      await loadData();
      await showSuccess("QR eliminado", "El código QR se eliminó correctamente.");
    } catch (err) {
      console.error(err);
      showError("Error", "Ocurrió un problema al procesar el código QR.");
    } finally {
      setSaving(false);
    }
  };

  const handleRenew = async (qr) => {
    try {
      setSaving(true);
      await QRPersonalAPI.renew(qr.qrid, 12);
      await loadData();
      await showSuccess("QR actualizado", "La vigencia se renovó correctamente.");
    } catch (err) {
      console.error(err);
      showError("Error", "Ocurrió un problema al procesar el código QR.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("es-MX");
  };

  const badgeEstado = (value = "Pendiente") => {
    const cls =
      value === "Activo"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : value === "Cancelado"
        ? "bg-red-100 text-red-700 border-red-200"
        : value === "Vencido"
        ? "bg-slate-100 text-slate-600 border-slate-200"
        : value === "Usado"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-amber-100 text-amber-700 border-amber-200";

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="px-4 pb-10 md:px-8">
      <header className="pt-6 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
          Administración de QR personales
        </h1>
        <p className="mt-1 max-w-3xl text-slate-500">
          Revisa códigos personales, invitados y accesos temporales sin generar
          imágenes QR pesadas en el listado.
        </p>
      </header>

      <section className="mb-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-emerald-600 px-6 py-5 text-white shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">QR personales de acceso</h2>
            <p className="text-sm text-emerald-100 md:text-base">
              La tabla muestra datos principales; el QR visual se renderiza solo
              al abrir el detalle.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            + Nuevo QR
          </button>
        </div>
      </section>

      <section className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Buscar por código, usuario, invitado o estado..."
          className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          {estados.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full table-auto text-sm text-slate-700">
            <thead className="bg-emerald-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Titular
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                  Tipo
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Vigencia
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold md:text-sm">
                  Usos
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    Cargando QR...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No se encontraron QR con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRows.map((qr) => (
                  <tr
                    key={qr.qrid}
                    className="transition-colors hover:bg-emerald-50/70"
                  >
                    <td className="px-4 py-3 text-xs font-mono">{qr.codigoQR}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {qr.usuarioNombre || qr.invitadoNombre || "-"}
                      </div>
                      {qr.invitadoNombre && (
                        <div className="text-xs text-slate-500">
                          Invitado: {qr.invitadoNombre}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{qr.tipoQR}</td>
                    <td className="px-4 py-3 text-center text-xs">
                      <div>Desde: {formatDate(qr.fechaInicio)}</div>
                      <div>Hasta: {formatDate(qr.fechaVencimiento)}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {qr.usosRealizados}
                      {qr.usosPermitidos ? ` / ${qr.usosPermitidos}` : " / ∞"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {badgeEstado(qr.estado)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openView(qr)}
                          className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                          disabled={saving}
                        >
                          Ver QR
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(qr)}
                          className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                          disabled={saving || ["Cancelado", "Usado"].includes(qr.estado)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRenew(qr)}
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                          disabled={saving || qr.estado === "Cancelado"}
                        >
                          Renovar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(qr)}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                          disabled={saving || qr.estado === "Cancelado"}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(qr)}
                          className="rounded-full bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-800"
                          disabled={saving}
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
      </section>

      {openForm && (
        <QrPersonalForm
          open={openForm}
          onClose={closeForm}
          onSubmit={handleSubmitForm}
          initial={selected}
          usuarios={usuarios}
          invitados={invitados}
          estados={estados}
          saving={saving}
          mode={formMode}
        />
      )}
    </div>
  );
}
