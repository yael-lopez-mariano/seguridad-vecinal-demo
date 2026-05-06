// src/services/mapa.api.js
import { http } from "./http";

export const MapaAPI = {
  async getAll() {
    return await http.get("/Mapa/marcadores");
  },
  async getById(id) {
    return await http.get(`/Mapa/marcadores/${id}`);
  },
  async create(data) {
    return await http.post("/Mapa/marcadores", data);
  },
  async update(data) {
    return await http.put("/Mapa/marcadores", data);
  },
  async remove(id) {
    return await http.delete(`/Mapa/marcadores/${id}`);
  },
};
