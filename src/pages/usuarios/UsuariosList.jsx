// src/app/pages/usuarios/UsuariosList.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UsuariosAPI } from "../../services/usuarios.api";
import UsuarioForm from "./UsuarioForm";
import {
  parseTipoUsuarioID,
  TIPO_USUARIO_LABEL,
} from "../../types/tiposUsuario";

export default function UsuariosList() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState(""); // 🔍 texto de búsqueda
  const [filtroTipo, setFiltroTipo] = useState(""); // tipo usuario
  const [filtroEstado, setFiltroEstado] = useState(""); // activo / inactivo

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNew = () => {
    // form nuevo
    setEditing({});
  };

  const handleEdit = async (u) => {
    try {
      setSaving(true);
      const detail = await UsuariosAPI.getById(u.usuarioID);
      setEditing(detail);
    } catch (err) {
      console.error("Error obteniendo detalle de usuario:", err);
      setError("No se pudo cargar el usuario para edición.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    const targetId = Number(u.usuarioID ?? u.id);
    const currentUserId = Number(user?.usuarioID ?? user?.id ?? user?.userId);

    if (targetId === 1 || u.usuario === "Administrador") {
      setError("El usuario Administrador demo no se puede eliminar.");
      return;
    }

    if (currentUserId && targetId === currentUserId) {
      setError("No puedes eliminar el usuario con sesión activa.");
      return;
    }

    if (
      !window.confirm(
        `¿Desactivar al usuario "${u.nombre} ${u.apellidoPaterno}"?`
      )
    ) {
      return;
    }
    try {
      setSaving(true);
      await UsuariosAPI.delete(u.usuarioID);
      await loadData();
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      setError(err.message || "No se pudo eliminar el usuario.");
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
        // UPDATE
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
          password: formData.password || "", // si viene vacío, backend decide
          numeroTarjeta: formData.numeroTarjeta ?? "",
          ultimosDigitos:
            formData.numeroTarjeta?.slice(-4) ?? formData.ultimosDigitos ?? "",
          fechaVencimiento: formData.fechaVencimiento || null,
        });
      } else {
        // CREATE
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
      }

      setEditing(null);
      await loadData();
    } catch (err) {
      console.error("Error guardando usuario:", err);
      setError("No se pudo guardar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  // 🔍 Filtro combinado: texto + tipo + estado
  const usuariosFiltrados = usuarios.filter((u) => {
    // texto
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
        .replace(/[\u0300-\u036f]/g, ""); // quitar acentos

      const normalizedTerm = term
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (!fullText.includes(normalizedTerm)) return false;
    }

    // tipo
    if (filtroTipo) {
      const tipoId = parseTipoUsuarioID(u.tipoUsuarioID ?? u.tipoUsuario);
      if (String(tipoId) !== String(filtroTipo)) return false;
    }

    // estado
    if (filtroEstado === "activos" && !u.activo) return false;
    if (filtroEstado === "inactivos" && u.activo) return false;

    return true;
  });

  return (
    <div className="p-4">
      {/* Título */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-slate-500">
          Administra administradores, residentes y personal de seguridad.
        </p>
      </div>

      {/* 🔍 Buscador + filtros + botón nuevo en la MISMA línea */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex flex-1 flex-wrap gap-2 min-w-[260px]">
          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o correo..."
            className="flex-1 min-w-[180px] border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Filtro tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border rounded-full px-3 py-2 text-sm min-w-[140px]"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.tipoUsuarioID} value={t.tipoUsuarioID}>
                {t.nombre}
              </option>
            ))}
          </select>

          {/* Filtro estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border rounded-full px-3 py-2 text-sm min-w-[140px]"
          >
            <option value="">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        {/* Botón nuevo usuario */}
        <button
          type="button"
          onClick={handleNew}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
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
          {/* Formulario de creación / edición */}
          {editing && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
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

          {/* Tabla de usuarios */}
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Correo
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
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
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-2">
                          {u.nombre} {u.apellidoPaterno}
                        </td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{tipoLabel}</td>
                        <td className="px-4 py-2">
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
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(u)}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border border-sky-300 text-sky-700 hover:bg-sky-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border border-red-300 text-red-700 hover:bg-red-50"
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
        </>
      )}
    </div>
  );
}
