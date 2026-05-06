// src/app/pages/usuarios/UsuariosList.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UsuariosAPI } from "../../services/usuarios.api";
import {
  confirmAction,
  showError,
  showSuccess,
  showWarning,
} from "../../utils/swal";
import {
  parseTipoUsuarioID,
  TIPO_USUARIO_LABEL,
} from "../../types/tiposUsuario";
import UsuarioForm from "./UsuarioForm";

export default function UsuariosList() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [list, tiposResp] = await Promise.all([
        UsuariosAPI.list(),
        UsuariosAPI.tipos(),
      ]);
      setUsuarios(Array.isArray(list) ? list : []);
      setTipos(Array.isArray(tiposResp) ? tiposResp : []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
      showError("Error", "Ocurrio un problema al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNew = () => {
    setEditing({});
  };

  const handleEdit = async (u) => {
    try {
      setSaving(true);
      const detail = await UsuariosAPI.getById(u.usuarioID);
      setEditing(detail);
    } catch (err) {
      console.error("Error obteniendo detalle de usuario:", err);
      setError("No se pudo cargar el usuario para edicion.");
      showError("Error", "Ocurrio un problema al cargar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    const targetId = Number(u.usuarioID ?? u.id);
    const currentUserId = Number(user?.usuarioID ?? user?.id ?? user?.userId);

    if (targetId === 1 || u.usuario === "Administrador") {
      setError("El usuario Administrador demo no se puede eliminar.");
      await showWarning(
        "Accion no permitida",
        "No puedes desactivar este usuario."
      );
      return;
    }

    if (currentUserId && targetId === currentUserId) {
      setError("No puedes eliminar el usuario con sesion activa.");
      await showWarning(
        "Accion no permitida",
        "No puedes desactivar este usuario."
      );
      return;
    }

    const result = await confirmAction({
      title: "¿Desactivar usuario?",
      text: "El usuario quedara inactivo dentro de la demo.",
      confirmButtonText: "Si, desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await UsuariosAPI.delete(u.usuarioID);
      await loadData();
      await showSuccess("Usuario desactivado", "El usuario quedo inactivo.");
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      setError(err.message || "No se pudo eliminar el usuario.");
      showError("Error", "Ocurrio un problema al procesar la accion.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelForm = () => {
    setEditing(null);
  };

  const handleSubmitForm = async (formData) => {
    setSaving(true);
    setError("");
    try {
      if (formData.usuarioID) {
        await UsuariosAPI.update({
          usuarioID: formData.usuarioID,
          numeroCasa: formData.numeroCasa ?? "",
          calle: formData.calle ?? "",
          nombre: formData.nombre ?? "",
          apellidoPaterno: formData.apellidoPaterno ?? "",
          apellidoMaterno: formData.apellidoMaterno ?? "",
          telefono: formData.telefono ?? "",
          fechaNacimiento: formData.fechaNacimiento || null,
          email: formData.email ?? "",
          password: formData.password || "",
          numeroTarjeta: formData.numeroTarjeta ?? "",
          ultimosDigitos:
            formData.numeroTarjeta?.slice(-4) ?? formData.ultimosDigitos ?? "",
          fechaVencimiento: formData.fechaVencimiento || null,
        });
        await showSuccess(
          "Usuario actualizado",
          "Los cambios se guardaron correctamente."
        );
      } else {
        await UsuariosAPI.register({
          tipoUsuarioID: formData.tipoUsuarioID,
          numeroCasa: formData.numeroCasa ?? "",
          calle: formData.calle ?? "",
          nombre: formData.nombre ?? "",
          apellidoPaterno: formData.apellidoPaterno ?? "",
          apellidoMaterno: formData.apellidoMaterno ?? "",
          telefono: formData.telefono ?? "",
          fechaNacimiento: formData.fechaNacimiento || null,
          email: formData.email ?? "",
          password: formData.password || "Vecinal123!",
          numeroTarjeta: formData.numeroTarjeta ?? "",
          fechaVencimiento: formData.fechaVencimiento || null,
        });
        await showSuccess(
          "Usuario registrado",
          "El usuario se agrego correctamente."
        );
      }

      setEditing(null);
      await loadData();
    } catch (err) {
      console.error("Error guardando usuario:", err);
      const message = err?.message || "No se pudo guardar el usuario.";
      setError(message);
      if (message.toLowerCase().includes("existe")) {
        showWarning("Datos incompletos", message);
      } else {
        showError("Error", "Ocurrio un problema al procesar la accion.");
      }
    } finally {
      setSaving(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const term = search.trim().toLowerCase();
    if (term) {
      const fullText = (
        (u.nombre || "") +
        " " +
        (u.apellidoPaterno || "") +
        " " +
        (u.apellidoMaterno || "") +
        " " +
        (u.email || "") +
        " " +
        (u.calle || "") +
        " " +
        (u.numeroCasa || "")
      )
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const normalizedTerm = term
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (!fullText.includes(normalizedTerm)) return false;
    }

    if (filtroTipo) {
      const tipoId = parseTipoUsuarioID(u.tipoUsuarioID ?? u.tipoUsuario);
      if (String(tipoId) !== String(filtroTipo)) return false;
    }

    if (filtroEstado === "activos" && !u.activo) return false;
    if (filtroEstado === "inactivos" && u.activo) return false;

    return true;
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-slate-500">
          Administra administradores, residentes y personal de seguridad.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[260px] flex-1 flex-wrap gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o correo..."
            className="min-w-[180px] flex-1 rounded-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="min-w-[140px] rounded-full border px-3 py-2 text-sm"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.tipoUsuarioID} value={t.tipoUsuarioID}>
                {t.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="min-w-[140px] rounded-full border px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleNew}
          className="whitespace-nowrap rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          + Nuevo usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-500">Cargando...</div>
      ) : (
        <>
          {editing && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold">
                {editing.usuarioID ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <UsuarioForm
                initial={editing.usuarioID ? editing : null}
                tipos={tipos}
                saving={saving}
                onCancel={handleCancelForm}
                onSubmit={handleSubmitForm}
              />
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[780px] w-full table-auto text-sm text-slate-700">
              <thead className="bg-emerald-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                    Correo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold md:text-sm">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold md:text-sm">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No hay usuarios que coincidan con el filtro.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const tipoId = parseTipoUsuarioID(
                      u.tipoUsuarioID ?? u.tipoUsuario
                    );
                    const tipoLabel =
                      u.tipoUsuario || TIPO_USUARIO_LABEL[tipoId] || "Sin tipo";

                    return (
                      <tr
                        key={u.usuarioID}
                        className="transition-colors hover:bg-emerald-50/70"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800">
                            {u.nombre} {u.apellidoPaterno}
                          </span>
                        </td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{tipoLabel}</td>
                        <td className="px-4 py-3">
                          {u.activo ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleEdit(u)}
                            className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            className="inline-flex items-center rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
