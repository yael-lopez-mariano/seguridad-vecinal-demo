// src/utils/session.js
const KEY = "rsv_user";

function safeParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const session = {
  // Obtiene la sesión guardada
  get() {
    const raw = localStorage.getItem(KEY);
    return safeParse(raw);
  },

  // Guarda la sesión (lo que le mandes)
  set(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  // Limpia la sesión
  clear() {
    localStorage.removeItem(KEY);
  },

  // Alias por si en otro lado usas estos nombres
  getUser() {
    return this.get();
  },
  setUser(user) {
    this.set(user);
  },
};
