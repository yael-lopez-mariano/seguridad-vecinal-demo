// src/services/avisos.api.js
import { DEMO_DATA } from "../data/demoData";
import { http } from "./http";

const DEMO_MODE = true;
const STORAGE_KEY = "rsv_demo_avisos";

const clone = (value) => JSON.parse(JSON.stringify(value));

const parseJson = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

const getCategoriasDemo = () => clone(DEMO_DATA.catalogos.categoriasAviso);

const withCategoria = (aviso) => {
  const categoria = getCategoriasDemo().find(
    (item) => Number(item.categoriaID) === Number(aviso.categoriaID)
  );

  return {
    ...aviso,
    categoriaNombre: aviso.categoriaNombre ?? categoria?.nombre ?? "",
    categoria: categoria
      ? {
          categoriaID: categoria.categoriaID,
          nombre: categoria.nombre,
          prioridad: categoria.prioridad,
        }
      : undefined,
  };
};

const normalizeAviso = (aviso) => ({
  avisoID: Number(aviso.avisoID),
  usuarioID: Number(aviso.usuarioID) || 0,
  categoriaID: Number(aviso.categoriaID),
  titulo: String(aviso.titulo || "").trim(),
  descripcion: String(aviso.descripcion || "").trim(),
  fechaEvento: aviso.fechaEvento ? new Date(aviso.fechaEvento).toISOString() : null,
  fechaPublicacion: aviso.fechaPublicacion
    ? new Date(aviso.fechaPublicacion).toISOString()
    : new Date().toISOString(),
  usuarioNombre: aviso.usuarioNombre || "Admin",
});

function initializeAvisos(force = false) {
  const hasAvisos = localStorage.getItem(STORAGE_KEY);
  if (force || !hasAvisos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clone(DEMO_DATA.avisos)));
  }
}

function getAvisos() {
  initializeAvisos();
  return parseJson(localStorage.getItem(STORAGE_KEY), [])
    .map(normalizeAviso)
    .map(withCategoria);
}

function saveAvisos(avisos) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify((avisos || []).map(normalizeAviso))
  );
  return getAvisos();
}

function validateAviso(payload) {
  if (!payload.titulo?.trim()) throw new Error("Titulo requerido");
  if (!payload.descripcion?.trim()) throw new Error("Descripcion requerida");
  if (!payload.categoriaID) throw new Error("Selecciona categoria");
}

/** Lista cruda del backend o localStorage demo. */
async function listRaw() {
  if (DEMO_MODE) return getAvisos();
  return await http.get("/Avisos");
}

/** GET /api/Avisos/{id} */
async function getById(id) {
  if (DEMO_MODE) {
    const aviso = getAvisos().find((item) => Number(item.avisoID) === Number(id));
    if (!aviso) throw new Error("Aviso no encontrado");
    return aviso;
  }

  return await http.get(`/Avisos/${id}`);
}

/** POST /api/Avisos (crea) */
async function create(payload) {
  const body = {
    usuarioID: Number(payload.usuarioID) || 0,
    categoriaID: Number(payload.categoriaID),
    titulo: payload.titulo?.trim(),
    descripcion: payload.descripcion?.trim(),
    fechaEvento: payload.fechaEvento
      ? new Date(payload.fechaEvento).toISOString()
      : null,
  };

  if (!DEMO_MODE) return await http.post("/Avisos", body);

  validateAviso(body);

  const avisos = getAvisos();
  const currentUser = getStoredUser();
  const nextId =
    avisos.reduce((max, aviso) => Math.max(max, Number(aviso.avisoID)), 0) + 1;

  const nuevo = normalizeAviso({
    ...body,
    avisoID: nextId,
    usuarioID: body.usuarioID || currentUser?.usuarioID || currentUser?.id || 0,
    fechaPublicacion: new Date().toISOString(),
    usuarioNombre:
      currentUser?.nombre && currentUser?.apellidoP
        ? `${currentUser.nombre} ${currentUser.apellidoP}`
        : currentUser?.nombre || "Admin",
  });

  saveAvisos([...avisos, nuevo]);
  return withCategoria(nuevo);
}

/** PUT /api/Avisos (actualiza sin id en la ruta; incluye avisoID en el body) */
async function update(id, payload) {
  const body = {
    avisoID: Number(id),
    categoriaID: Number(payload.categoriaID),
    titulo: payload.titulo?.trim(),
    descripcion: payload.descripcion?.trim(),
    fechaEvento: payload.fechaEvento
      ? new Date(payload.fechaEvento).toISOString()
      : null,
  };

  if (!DEMO_MODE) return await http.put("/Avisos", body);

  validateAviso(body);

  const avisos = getAvisos();
  const index = avisos.findIndex((item) => Number(item.avisoID) === Number(id));
  if (index < 0) throw new Error("Aviso no encontrado");

  const actualizado = normalizeAviso({
    ...avisos[index],
    ...body,
    avisoID: Number(id),
  });

  avisos[index] = actualizado;
  saveAvisos(avisos);
  return withCategoria(actualizado);
}

/** DELETE /api/Avisos/{id} */
async function remove(id) {
  if (!DEMO_MODE) {
    await http.del(`/Avisos/${id}`);
    return true;
  }

  const avisos = getAvisos();
  const next = avisos.filter((item) => Number(item.avisoID) !== Number(id));
  if (next.length === avisos.length) throw new Error("Aviso no encontrado");

  saveAvisos(next);
  return true;
}

/** GET /api/Avisos/categorias-aviso */
async function getCategorias() {
  if (DEMO_MODE) return getCategoriasDemo();
  return await http.get("/Avisos/categorias-aviso");
}

function restoreDemoAvisos() {
  initializeAvisos(true);
  return getAvisos();
}

export const AvisosAPI = {
  listRaw,
  getById,
  create,
  update,
  remove,
  getCategorias,
  restoreDemoAvisos,
};
