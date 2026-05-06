// src/pages/avisos/Avisos.jsx
import { useEffect, useState, useCallback } from "react";
import { AvisosAPI } from "../../services/avisos.api";
import AvisosList from "./AvisosList";
import AvisoForm from "./AvisoForm";

export default function Avisos() {
  const [cats, setCats] = useState([]); // [{ categoriaID, nombre, prioridad? }]
  const [raw, setRaw] = useState([]); // lista cruda del backend

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    orden: "recientes", // "recientes" | "prioridad"
    // q?: string
    // categoriaId?: number
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
  const [editing, setEditing] = useState(null);

  // ------ helpers de ordenamiento/filtrado/paginación en cliente ------
  const catPriority = (catId) => {
    const c = cats.find((x) => x.categoriaID === catId);
    // Si el backend expone prioridad, úsala; si no, fallback por nombre:
    if (c?.prioridad != null) return Number(c.prioridad);
    const n = (c?.nombre || "").toLowerCase();
    // Prioridad manual (puedes ajustarla)
    if (n.includes("alerta")) return 1;
    if (n.includes("evento")) return 2;
    return 3; // AvisoGeneral / otros
  };

  const applyClientQuery = useCallback(() => {
    let arr = Array.isArray(raw) ? [...raw] : [];

    // filtro q (título/descripcion)
    if (query.q?.trim()) {
      const q = query.q.trim().toLowerCase();
      arr = arr.filter(
        (a) =>
          (a.titulo || "").toLowerCase().includes(q) ||
          (a.descripcion || "").toLowerCase().includes(q)
      );
    }

    // filtro por categoría
    if (query.categoriaId) {
      arr = arr.filter(
        (a) => Number(a.categoriaID) === Number(query.categoriaId)
      );
    }

    // orden
    if (query.orden === "prioridad") {
      arr.sort(
        (a, b) =>
          catPriority(a.categoriaID) - catPriority(b.categoriaID) ||
          new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
      );
    } else {
      // recientes: fechaPublicacion DESC
      arr.sort(
        (a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
      );
    }

    // paginación
    const total = arr.length;
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    const items = arr.slice(start, end);

    setData({ items, total, page: query.page, pageSize: query.pageSize });
  }, [raw, query, cats]);

  // ----------------- carga de datos -----------------
  const loadCats = useCallback(async () => {
    try {
      const res = await AvisosAPI.getCategorias();
      const list = Array.isArray(res) ? res : [];
      // orden estable: prioridad -> nombre
      const ordenadas = [...list].sort(
        (a, b) =>
          Number(a?.prioridad ?? 99) - Number(b?.prioridad ?? 99) ||
          String(a?.nombre ?? "").localeCompare(String(b?.nombre ?? ""))
      );
      setCats(ordenadas);
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

  // recalcular vista cuando cambian raw/cats/query
  useEffect(() => {
    applyClientQuery();
  }, [applyClientQuery]);

  // ----------------- acciones -----------------
  const onCreate = () => {
    setEditing(null);
    setShowForm(true);
  };
  const onEdit = (item) => {
    setEditing(item);
    setShowForm(true);
  };

  const onDelete = async (item) => {
    if (!confirm(`¿Eliminar el aviso "${item.titulo}"?`)) return;
    try {
      await AvisosAPI.remove(item.avisoID);
      await loadData();
      alert("Aviso eliminado");
    } catch (e) {
      alert(e?.message || "No se pudo eliminar");
    }
  };

  const onSubmitForm = async (values) => {
    try {
      if (editing) {
        await AvisosAPI.update(editing.avisoID, values); // PUT sin id en la ruta
        alert("Aviso actualizado");
      } else {
        await AvisosAPI.create(values);
        alert("Aviso creado");
      }
      setShowForm(false);
      await loadData();
    } catch (e) {
      alert(e?.message || "Error al guardar");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Avisos (Admin)</h1>
        <button
          onClick={onCreate}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          + Nuevo aviso
        </button>
      </div>

      {/* Filtros */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input
          className="border rounded-xl p-2"
          placeholder="Buscar por título o descripción…"
          value={query.q || ""}
          onChange={(e) =>
            setQuery((q) => ({ ...q, q: e.target.value, page: 1 }))
          }
        />
        <select
          className="border rounded-xl p-2"
          value={query.categoriaId ?? ""}
          onChange={(e) =>
            setQuery((q) => ({
              ...q,
              categoriaId: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            }))
          }
        >
          <option value="">Todas las categorías</option>
          {cats.map((c) => (
            <option key={c.categoriaID} value={c.categoriaID}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          className="border rounded-xl p-2"
          value={query.orden}
          onChange={(e) =>
            setQuery((q) => ({ ...q, orden: e.target.value, page: 1 }))
          }
        >
          <option value="recientes">Orden: Recientes</option>
          <option value="prioridad">Orden: Prioridad</option>
        </select>
        <select
          className="border rounded-xl p-2"
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
              {n} por página
            </option>
          ))}
        </select>
      </div>

      <AvisosList
        loading={loading}
        error={error}
        data={data}
        onEdit={onEdit}
        onDelete={onDelete}
        onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
      />

      {showForm && (
        <AvisoForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={onSubmitForm}
          categorias={cats}
          initial={editing}
        />
      )}
    </div>
  );
}
