// src/services/amenidades.api.js
import { DEMO_DATA } from "../data/demoData";
import { http } from "./http";

const DEMO_MODE = true;
const BASE_URL = "/Amenidades";
const STORAGE_KEY = "rsv_demo_amenidades";

const clone = (value) => JSON.parse(JSON.stringify(value));

const parseJson = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const getTiposDemo = () => clone(DEMO_DATA.catalogos.tiposAmenidad || []);

const getTipoAmenidad = (tipoAmenidadID) =>
  getTiposDemo().find(
    (tipo) => Number(tipo.tipoAmenidadID) === Number(tipoAmenidadID)
  );

const normalizeAmenidad = (amenidad) => {
  const tipo = getTipoAmenidad(amenidad.tipoAmenidadID) || {};
  const amenidadID = Number(amenidad.amenidadID ?? amenidad.id);

  return {
    ...amenidad,
    amenidadID,
    id: amenidadID,
    tipoAmenidadID: Number(amenidad.tipoAmenidadID || tipo.tipoAmenidadID || 1),
    nombre: String(amenidad.nombre || "").trim(),
    ubicacion: String(amenidad.ubicacion || "").trim(),
    capacidad: Number(amenidad.capacidad || 0),
    activo: amenidad.activo !== false,
    tipoAmenidadNombre: amenidad.tipoAmenidadNombre ?? tipo.nombre ?? "",
    horarioInicio: amenidad.horarioInicio ?? tipo.horarioInicio ?? "08:00:00",
    horarioFin: amenidad.horarioFin ?? tipo.horarioFin ?? "20:00:00",
  };
};

function initializeAmenidades(force = false) {
  const hasAmenidades = localStorage.getItem(STORAGE_KEY);
  if (force || !hasAmenidades) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(clone(DEMO_DATA.amenidades || []))
    );
  }
}

function getAmenidades() {
  initializeAmenidades();
  return parseJson(localStorage.getItem(STORAGE_KEY), []).map(normalizeAmenidad);
}

function saveAmenidades(amenidades) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify((amenidades || []).map(normalizeAmenidad))
  );
  return getAmenidades();
}

function validateAmenidad(payload) {
  if (!payload.nombre?.trim()) throw new Error("El nombre es obligatorio.");
  if (!payload.tipoAmenidadID) throw new Error("Selecciona un tipo de amenidad.");
  if (!payload.ubicacion?.trim()) throw new Error("La ubicacion es obligatoria.");
  if (!payload.capacidad || Number(payload.capacidad) <= 0) {
    throw new Error("La capacidad debe ser mayor a 0.");
  }
}

export const AmenidadesAPI = {
  async getAll(signal) {
    if (DEMO_MODE) return getAmenidades();
    return await http.get(BASE_URL, { signal });
  },

  async getById(id, signal) {
    if (id === undefined || id === null) {
      throw new Error("Se requiere un id de amenidad");
    }

    if (DEMO_MODE) {
      const amenidad = getAmenidades().find(
        (item) => Number(item.amenidadID) === Number(id)
      );
      if (!amenidad) throw new Error("Amenidad no encontrada");
      return amenidad;
    }

    return await http.get(`${BASE_URL}/${id}`, { signal });
  },

  async create(data) {
    const body = {
      tipoAmenidadID: Number(data.tipoAmenidadID),
      nombre: data.nombre?.trim(),
      ubicacion: data.ubicacion?.trim(),
      capacidad: Number(data.capacidad),
      activo: data.activo ?? true,
    };

    if (!DEMO_MODE) return await http.post(BASE_URL, body);

    validateAmenidad(body);

    const amenidades = getAmenidades();
    const nextId =
      amenidades.reduce(
        (max, amenidad) => Math.max(max, Number(amenidad.amenidadID)),
        0
      ) + 1;

    const nueva = normalizeAmenidad({
      ...body,
      amenidadID: nextId,
    });

    saveAmenidades([...amenidades, nueva]);
    return { id: nextId, amenidadID: nextId, message: "Amenidad creada" };
  },

  async update(id, data) {
    if (id === undefined || id === null) {
      throw new Error("Se requiere un id de amenidad para actualizar");
    }

    const body = {
      tipoAmenidadID: Number(data.tipoAmenidadID),
      nombre: data.nombre?.trim(),
      ubicacion: data.ubicacion?.trim(),
      capacidad: Number(data.capacidad),
      activo: data.activo,
    };

    if (!DEMO_MODE) return await http.put(`${BASE_URL}/${id}`, body);

    validateAmenidad(body);

    const amenidades = getAmenidades();
    const index = amenidades.findIndex(
      (item) => Number(item.amenidadID) === Number(id)
    );
    if (index < 0) throw new Error("Amenidad no encontrada");

    const actualizada = normalizeAmenidad({
      ...amenidades[index],
      ...body,
      activo: body.activo ?? amenidades[index].activo,
      amenidadID: Number(id),
    });

    amenidades[index] = actualizada;
    saveAmenidades(amenidades);
    return actualizada;
  },

  async remove(id) {
    if (id === undefined || id === null) {
      throw new Error("Se requiere un id de amenidad para eliminar");
    }

    if (!DEMO_MODE) return await http.delete(`${BASE_URL}/${id}`);

    const amenidades = getAmenidades();
    const index = amenidades.findIndex(
      (item) => Number(item.amenidadID) === Number(id)
    );
    if (index < 0) throw new Error("Amenidad no encontrada");

    amenidades[index] = normalizeAmenidad({
      ...amenidades[index],
      activo: false,
    });
    saveAmenidades(amenidades);
    return true;
  },

  async activate(id) {
    if (!DEMO_MODE) {
      return await http.put(`${BASE_URL}/${id}`, { activo: true });
    }

    const amenidad = await this.getById(id);
    return await this.update(id, { ...amenidad, activo: true });
  },

  async deactivate(id) {
    return await this.remove(id);
  },

  async getTiposAmenidad(signal) {
    if (DEMO_MODE) return getTiposDemo();
    return await http.get(`${BASE_URL}/tipos-amenidad`, { signal });
  },

  async getEstadosAmenidad() {
    if (DEMO_MODE) return clone(DEMO_DATA.estados.amenidades || []);
    return [];
  },

  restoreDemoAmenidades() {
    initializeAmenidades(true);
    return getAmenidades();
  },
};
