// src/app/types/tiposUsuario.js

// IDs oficiales según tu API /Usuarios/tipos-usuario
export const TIPOS_USUARIO = {
  ADMIN: 2,
  RESIDENTE: 3,
  SEGURIDAD: 4,
};

// Labels de texto para mostrar en UI
export const TIPO_USUARIO_LABEL = {
  [TIPOS_USUARIO.ADMIN]: "Administrador",
  [TIPOS_USUARIO.RESIDENTE]: "Residente",
  [TIPOS_USUARIO.SEGURIDAD]: "Seguridad",
};

/**
 * Normaliza cualquier cosa a un tipoUsuarioID:
 * - 2, 3, 4
 * - "2", "3", "4"
 * - "Administrador", "Residente", "Seguridad"
 * - { tipoUsuarioID: 2 } o { tipoUsuario: "Administrador" }
 */
export function parseTipoUsuarioID(raw) {
  if (raw == null) return null;

  // Si ya es número
  if (typeof raw === "number") return raw || null;

  // Si viene un objeto (detalle del backend)
  if (typeof raw === "object") {
    return parseTipoUsuarioID(
      raw.tipoUsuarioID ?? raw.tipoUsuario ?? raw.nombre ?? raw.id ?? null
    );
  }

  // Si es string
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return null;

    // Intentar como número "2", "3", "4"
    const num = Number(t);
    if (!Number.isNaN(num)) return num;

    // Intentar como texto
    const s = t.toLowerCase();
    if (s.startsWith("admin")) return TIPOS_USUARIO.ADMIN;
    if (s.startsWith("resid")) return TIPOS_USUARIO.RESIDENTE;
    if (s.startsWith("segur")) return TIPOS_USUARIO.SEGURIDAD;
  }

  return null;
}

// Helpers rápidos para usar en componentes
export const esAdmin = (tipo) =>
  parseTipoUsuarioID(tipo) === TIPOS_USUARIO.ADMIN;

export const esResidente = (tipo) =>
  parseTipoUsuarioID(tipo) === TIPOS_USUARIO.RESIDENTE;

export const esSeguridad = (tipo) =>
  parseTipoUsuarioID(tipo) === TIPOS_USUARIO.SEGURIDAD;
