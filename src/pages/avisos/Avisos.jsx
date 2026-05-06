// src/pages/avisos/Avisos.jsx
import { useCallback, useEffect, useState } from "react";
import { AvisosAPI } from "../../services/avisos.api";
import { confirmAction, showError, showSuccess } from "../../utils/swal";
import AvisoForm from "./AvisoForm.jsx";
import AvisosList from "./AvisosList.jsx";

export default function Avisos() {
  const [cats, setCats] = useState([]);
  const [raw, setRaw] = useState([]);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    orden: "recientes",
  });
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formMode, setFormMode] = useState("create");

  const catPriority = useCallback(
    (catId) => {
      const c = cats.find((x) => Number(x.categoriaID) === Number(catId));
      if (c?.prioridad != null) return Number(c.prioridad);
      const n = (c?.nombre || "").toLowerCase();
      if (n.includes("urgente") || n.includes("seguridad")) return 1;
      if (n.includes("evento")) return 2;
      return 3;
    },
    [cats]
  );

  const applyClientQuery = useCallback(() => {
    let arr = Array.isArray(raw) ? [...raw] : [];

    if (query.q?.trim()) {
      const q = query.q.trim().toLowerCase();
      arr = arr.filter(
        (a) =>
          (a.titulo || "").toLowerCase().includes(q) ||
          (a.descripcion || "").toLowerCase().includes(q)
      );
    }

    if (query.categoriaId) {
      arr = arr.filter(
        (a) => Number(a.categoriaID) === Number(query.categoriaId)
      );
    }

    if (query.orden === "prioridad") {
      arr.sort(
        (a, b) =>
          catPriority(a.categoriaID) - catPriority(b.categoriaID) ||
          new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
      );
    } else {
      arr.sort(
        (a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
      );
    }

    const total = arr.length;
    const start = (query.page - 1) * query.pageSize;
    const items = arr.slice(start, start + query.pageSize);
    setData({ items, total, page: query.page, pageSize: query.pageSize });
  }, [raw, query, catPriority]);

  const loadCats = useCallback(async () => {
    try {
      const res = await AvisosAPI.getCategorias();
      const list = Array.isArray(res) ? res : [];
      setCats(
        [...list].sort(
          (a, b) =>
            Number(a?.prioridad ?? 99) - Number(b?.prioridad ?? 99) ||
            String(a?.nombre ?? "").localeCompare(String(b?.nombre ?? ""))
        )
      );
    } catch (e) {
      console.error(e);
      setCats([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const arr = await AvisosAPI.listRaw();
      setRaw(Array.isArray(arr) ? arr : []);
    } catch (e) {
      setError(e?.message || "Error cargando avisos");
      setRaw([]);
      showError("Error", "Ocurrio un problema al cargar los avisos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCats();
  }, [loadCats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyClientQuery();
  }, [applyClientQuery]);

  const openCreate = () => {
    setSelected(null);
    setFormMode("create");
    setShowForm(true);
  };

  const openView = (item) => {
    setSelected(item);
    setFormMode("view");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setSelected(item);
    setFormMode("edit");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelected(null);
    setFormMode("create");
  };

  const onDelete = async (item) => {
    const result = await confirmAction({
      title: "¿Eliminar aviso?",
      text: "Esta accion eliminara el aviso de la demo.",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await AvisosAPI.remove(item.avisoID);
      await loadData();
      await showSuccess("Aviso eliminado", "El aviso se elimino correctamente.");
    } catch (e) {
      console.error(e);
      showError("Error", "Ocurrio un problema al procesar la accion.");
    }
  };

  const onSubmitForm = async (values) => {
    if (formMode === "view") return;

    try {
      if (formMode === "edit" && selected) {
        await AvisosAPI.update(selected.avisoID, values);
        await showSuccess(
          "Aviso actualizado",
          "Los cambios se guardaron correctamente."
        );
      } else {
        await AvisosAPI.create(values);
        await showSuccess("Aviso creado", "El aviso se agrego correctamente.");
      }
      closeForm();
      await loadData();
    } catch (e) {
      console.error(e);
      showError("Error", "Ocurrio un problema al procesar la accion.");
    }
  };

  return (
    <div className="min-w-0 p-1 sm:p-2 md:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Avisos (Admin)</h1>
        <button
          onClick={openCreate}
          className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          + Nuevo aviso
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input
          className="min-w-0 rounded-xl border p-2"
          placeholder="Buscar por titulo o descripcion..."
          value={query.q || ""}
          onChange={(e) =>
            setQuery((q) => ({ ...q, q: e.target.value, page: 1 }))
          }
        />
        <select
          className="min-w-0 rounded-xl border p-2"
          value={query.categoriaId ?? ""}
          onChange={(e) =>
            setQuery((q) => ({
              ...q,
              categoriaId: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            }))
          }
        >
          <option value="">Todas las categorias</option>
          {cats.map((c) => (
            <option key={c.categoriaID} value={c.categoriaID}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          className="min-w-0 rounded-xl border p-2"
          value={query.orden}
          onChange={(e) =>
            setQuery((q) => ({ ...q, orden: e.target.value, page: 1 }))
          }
        >
          <option value="recientes">Orden: Recientes</option>
          <option value="prioridad">Orden: Prioridad</option>
        </select>
        <select
          className="min-w-0 rounded-xl border p-2"
          value={query.pageSize}
          onChange={(e) =>
            setQuery((q) => ({
              ...q,
              pageSize: Number(e.target.value),
              page: 1,
            }))
          }
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} por pagina
            </option>
          ))}
        </select>
      </div>

      <AvisosList
        loading={loading}
        error={error}
        data={data}
        onView={openView}
        onEdit={openEdit}
        onDelete={onDelete}
        onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
      />

      {showForm && (
        <AvisoForm
          open={showForm}
          onClose={closeForm}
          onSubmit={onSubmitForm}
          categorias={cats}
          initial={selected}
          mode={formMode}
        />
      )}
    </div>
  );
}
