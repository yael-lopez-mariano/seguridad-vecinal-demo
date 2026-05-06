// src/services/amenidades.api.js
import { http } from "./http";

/**
 * Servicio para consumir el backend de Amenidades.
 *
 * Endpoints esperados en el backend (.NET):
 *  GET    /api/Amenidades
 *  POST   /api/Amenidades
 *  GET    /api/Amenidades/{id}
 *  PUT    /api/Amenidades/{id}
 *  DELETE /api/Amenidades/{id}          (opcional)
 *  GET    /api/Amenidades/tipos-amenidad
 *
 * OJO: el http.js ya se encarga de añadir /api si hace falta,
 * aquí solo usamos rutas relativas tipo "/Amenidades".
 */

const BASE_URL = "/Amenidades";

export const AmenidadesAPI = {
  /**
   * Obtiene todas las amenidades.
   * Devuelve un array de objetos de la forma:
   * {
   *   amenidadID,
   *   tipoAmenidadID,
   *   nombre,
   *   ubicacion,
   *   capacidad,
   *   activo,
   *   tipoAmenidadNombre,
   *   horarioInicio,
   *   horarioFin
   * }
   */
  async getAll(signal) {
    return await http.get(BASE_URL, { signal });
  },

  /**
   * Obtiene una amenidad por ID.
   */
  async getById(id, signal) {
    if (id === undefined || id === null) {
      throw new Error("Se requiere un id de amenidad");
    }
    return await http.get(`${BASE_URL}/${id}`, { signal });
  },

  /**
   * Crea una nueva amenidad.
   * body esperado:
   * {
   *   tipoAmenidadID: number,
   *   nombre: string,
   *   ubicacion: string,
   *   capacidad: number
   * }
   *
   * Respuesta ejemplo:
   * { message: "Amenidad creada exitosamente", id: 9 }
   */
  async create(data) {
    return await http.post(BASE_URL, data);
  },

  /**
   * Actualiza una amenidad existente.
   * body esperado:
   * {
   *   tipoAmenidadID: number,
   *   nombre: string,
   *   ubicacion: string,
   *   capacidad: number
   * }
   */
  async update(id, data) {
    if (id === undefined || id === null) {
      throw new Error("Se requiere un id de amenidad para actualizar");
    }
    return await http.put(`${BASE_URL}/${id}`, data);
  },

  /**
   * Elimina una amenidad (si tu backend lo soporta).
   */
  async remove(id) {
    if (id === undefined || id === null) {
      throw new Error("Se requiere un id de amenidad para eliminar");
    }
    // puedes usar http.del o http.delete, ambos están definidos
    return await http.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Obtiene el catálogo de tipos de amenidad.
   * Devuelve algo como:
   * [
   *   {
   *     tipoAmenidadID,
   *     nombre,
   *     horarioInicio,
   *     horarioFin,
   *     activo
   *   },
   *   ...
   * ]
   */
  async getTiposAmenidad(signal) {
    return await http.get(`${BASE_URL}/tipos-amenidad`, { signal });
  },
};
