// src/pages/qr/QRPersonalList.jsx
import { useEffect, useMemo, useState } from "react";
import { UsuariosAPI } from "../../services/usuarios.api";
import QRPersonalAPI from "../../services/qrPersonal.api";

export default function QRPersonalList() {
  const [rows, setRows] = useState([]); // { usuario, qr }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos"); // todos | activos | inactivos

  // Cargar usuarios + QR personal
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // 🔁 Ajusta al método real de tu API (list, getAll, etc.)
        const usuarios = await UsuariosAPI.list();

        // Traer QR de cada usuario (si tiene)
        const qrResults = await Promise.all(
          usuarios.map((u) =>
            QRPersonalAPI.getByUsuario(u.usuarioID).catch(() => null)
          )
        );

        const merged = usuarios.map((u, idx) => ({
          usuario: u,
          qr: qrResults[idx],
        }));

        setRows(merged);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los usuarios y sus QR.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const { usuario, qr } = row;

      const fullName = [
        usuario.nombre,
        usuario.apellidoPaterno,
        usuario.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        (qr?.codigoQR || "").toLowerCase().includes(search.toLowerCase());

      const matchEstado =
        estado === "todos"
          ? true
          : estado === "activos"
          ? qr?.activo === true
          : qr?.activo === false;

      return matchSearch && matchEstado;
    });
  }, [rows, search, estado]);

  const handleToggleEstado = async (row) => {
    if (!row.qr) return;
    const nuevoEstado = !row.qr.activo;
    try {
      await QRPersonalAPI.actualizarEstado(row.qr.qrid, nuevoEstado);
      setRows((prev) =>
        prev.map((r) =>
          r.qr?.qrid === row.qr.qrid
            ? { ...r, qr: { ...r.qr, activo: nuevoEstado } }
            : r
        )
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado del QR.");
    }
  };

  const handleRegenerar = async (row) => {
    try {
      const resp = await QRPersonalAPI.generar(row.usuario.usuarioID);
      // si el backend devuelve el QR generado, actualizamos
      if (resp) {
        setRows((prev) =>
          prev.map((r) =>
            r.usuario.usuarioID === row.usuario.usuarioID
              ? { ...r, qr: resp }
              : r
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el QR.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  return (
    <div className="px-4 md:px-8 pb-10">
      {/* Título principal */}
      <header className="pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Administración de QR personales
        </h1>
        <p className="mt-1 text-slate-500 max-w-3xl">
          Desde aquí puedes revisar, generar y cambiar el estado de los códigos
          QR personales que usan los residentes para acceder al fraccionamiento.
        </p>
      </header>

      {/* Banner verde, igual estilo que reportes */}
      <section className="mb-6">
        <div className="bg-emerald-600 text-white rounded-3xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">QR personales de acceso</h2>
            <p className="text-emerald-100 text-sm md:text-base">
              Consulta el estado de los QR y regenera códigos en caso de
              extravío o cambio de dispositivo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/30 text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            <span className="text-lg">⟳</span>
            <span>Recargar</span>
          </button>
        </div>
      </section>

      {/* Filtros de búsqueda */}
      <section className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre de usuario o código QR..."
            className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-full border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>
      </section>

      {/* Tabla principal estilo finanzas */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Encabezado verde */}
        <div className="bg-emerald-700 text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-3 flex">
          <div className="w-1/4">Usuario</div>
          <div className="w-1/5">Código QR</div>
          <div className="w-1/5">Vigencia</div>
          <div className="w-1/12 text-center">Estado</div>
          <div className="flex-1 text-right pr-2">Acciones</div>
        </div>

        {loading ? (
          <div className="px-4 md:px-6 py-6 text-sm text-slate-500">
            Cargando usuarios y QR...
          </div>
        ) : error ? (
          <div className="px-4 md:px-6 py-6 text-sm text-red-600">{error}</div>
        ) : filteredRows.length === 0 ? (
          <div className="px-4 md:px-6 py-6 text-sm text-slate-500">
            No se encontraron usuarios con los filtros seleccionados.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredRows.map((row) => {
              const { usuario, qr } = row;
              const fullName = [
                usuario.nombre,
                usuario.apellidoPaterno,
                usuario.apellidoMaterno,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <li
                  key={usuario.usuarioID}
                  className="px-4 md:px-6 py-3 text-xs md:text-sm hover:bg-emerald-50/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {/* Usuario */}
                    <div className="w-1/4 min-w-[140px]">
                      <div className="font-medium text-slate-800">
                        {fullName || `Usuario #${usuario.usuarioID}`}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ID: {usuario.usuarioID}
                      </div>
                    </div>

                    {/* Código QR */}
                    <div className="w-1/5 min-w-[110px]">
                      {qr ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                          {qr.codigoQR}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Sin QR generado
                        </span>
                      )}
                    </div>

                    {/* Vigencia */}
                    <div className="w-1/5 min-w-[160px] text-[11px] text-slate-600">
                      {qr ? (
                        <>
                          <div>
                            <span className="font-semibold">Desde:</span>{" "}
                            {formatDate(qr.fechaGeneracion)}
                          </div>
                          <div>
                            <span className="font-semibold">Hasta:</span>{" "}
                            {formatDate(qr.fechaVencimiento)}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </div>

                    {/* Estado */}
                    <div className="w-1/12 text-center min-w-[80px]">
                      {qr ? (
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            qr.activo
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {qr.activo ? "Activo" : "Inactivo"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex-1 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleRegenerar(row)}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] md:text-xs font-semibold hover:bg-emerald-700"
                      >
                        {qr ? "Regenerar QR" : "Generar QR"}
                      </button>

                      {qr && (
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(row)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold ${
                            qr.activo
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-slate-500 hover:bg-slate-600 text-white"
                          }`}
                        >
                          {qr.activo ? "Desactivar" : "Activar"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
