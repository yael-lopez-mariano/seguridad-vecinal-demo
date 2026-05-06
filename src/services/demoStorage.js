import { DEMO_DATA } from "../data/demoData";

const STORAGE_KEYS = {
  usuarios: "rsv_demo_usuarios",
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const parseJson = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const normalizeLogin = (value) => String(value || "").trim().toLowerCase();

const getUserId = (user) => Number(user?.usuarioID ?? user?.id ?? user?.userId);

const getTipoUsuario = (tipoUsuarioID) =>
  DEMO_DATA.tiposUsuario.find(
    (tipo) => Number(tipo.tipoUsuarioID) === Number(tipoUsuarioID)
  );

const normalizeUser = (user) => {
  const tipo = getTipoUsuario(user.tipoUsuarioID) || {};
  const usuarioID = Number(user.usuarioID ?? user.id);
  const apellidoPaterno = user.apellidoPaterno ?? user.apellidoP ?? "";
  const apellidoMaterno = user.apellidoMaterno ?? user.apellidoM ?? "";

  return {
    ...user,
    id: usuarioID,
    usuarioID,
    userId: usuarioID,
    usuario: user.usuario ?? user.email ?? user.nombre ?? `usuario-${usuarioID}`,
    nombre: user.nombre ?? "",
    apellidoP: user.apellidoP ?? apellidoPaterno,
    apellidoM: user.apellidoM ?? apellidoMaterno,
    apellidoPaterno,
    apellidoMaterno,
    tipoUsuarioID: Number(user.tipoUsuarioID || tipo.tipoUsuarioID || 3),
    tipoUsuario: user.tipoUsuario ?? tipo.nombre ?? "Residente",
    descripcion: user.descripcion ?? tipo.descripcion ?? "",
    activo: user.activo !== false,
    online: user.online === true,
    firebaseID: user.firebaseID ?? null,
  };
};

const publicUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = normalizeUser(user);
  return safeUser;
};

const getStoredSessionUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

const syncCurrentSessionUser = (updatedUser) => {
  const current = getStoredSessionUser();
  if (!current || getUserId(current) !== getUserId(updatedUser)) return;

  const safeUser = {
    ...current,
    ...publicUser(updatedUser),
    online: true,
  };

  localStorage.setItem("user", JSON.stringify(safeUser));
  localStorage.setItem("rsv_user", JSON.stringify(safeUser));
  localStorage.setItem(
    "session",
    JSON.stringify({
      userId: safeUser.userId,
      usuarioID: safeUser.usuarioID,
      role: safeUser.tipoUsuario,
      tipoUsuarioID: safeUser.tipoUsuarioID,
    })
  );
};

export const demoStorage = {
  initializeDemoData(force = false) {
    const hasUsers = localStorage.getItem(STORAGE_KEYS.usuarios);

    if (force || !hasUsers) {
      localStorage.setItem(
        STORAGE_KEYS.usuarios,
        JSON.stringify(clone(DEMO_DATA.usuarios))
      );
    }
  },

  getDemoUsers() {
    this.initializeDemoData();
    return parseJson(localStorage.getItem(STORAGE_KEYS.usuarios), []).map(
      normalizeUser
    );
  },

  saveDemoUsers(users) {
    localStorage.setItem(
      STORAGE_KEYS.usuarios,
      JSON.stringify((users || []).map(normalizeUser))
    );
    return this.getDemoUsers();
  },

  restoreDemoData() {
    this.initializeDemoData(true);
    return this.getDemoUsers();
  },

  validateCredentials(usuario, password) {
    this.initializeDemoData();

    const login = normalizeLogin(usuario);
    const users = this.getDemoUsers();

    const found = users.find((user) => {
      const matchesUser =
        normalizeLogin(user.usuario) === login ||
        normalizeLogin(user.email) === login;
      return matchesUser && user.password === password && user.activo !== false;
    });

    if (!found) return null;
    return publicUser(found);
  },

  getDemoUserTypes() {
    return clone(DEMO_DATA.tiposUsuario);
  },

  listUsers() {
    return this.getDemoUsers().map(publicUser);
  },

  getUserById(id) {
    const user = this.getDemoUsers().find(
      (item) => getUserId(item) === Number(id)
    );
    if (!user) throw new Error("Usuario no encontrado");
    return publicUser(user);
  },

  registerUser(payload) {
    const users = this.getDemoUsers();
    const email = String(payload.email || "").trim();
    const nextId =
      users.reduce((max, user) => Math.max(max, getUserId(user)), 0) + 1;

    if (
      email &&
      users.some((user) => normalizeLogin(user.email) === normalizeLogin(email))
    ) {
      throw new Error("Ya existe un usuario con ese correo");
    }

    const newUser = normalizeUser({
      ...payload,
      id: nextId,
      usuarioID: nextId,
      usuario: payload.usuario || email || payload.nombre || `usuario-${nextId}`,
      password: payload.password || "Vecinal123!",
      activo: payload.activo ?? true,
      ultimosDigitos:
        payload.ultimosDigitos ??
        (payload.numeroTarjeta ? String(payload.numeroTarjeta).slice(-4) : ""),
    });

    this.saveDemoUsers([...users, newUser]);
    return publicUser(newUser);
  },

  updateUser(payload) {
    const users = this.getDemoUsers();
    const userId = Number(payload.usuarioID ?? payload.id);
    const index = users.findIndex((user) => getUserId(user) === userId);

    if (index < 0) throw new Error("Usuario no encontrado");

    const email = String(payload.email || "").trim();
    if (
      email &&
      users.some(
        (user) =>
          getUserId(user) !== userId &&
          normalizeLogin(user.email) === normalizeLogin(email)
      )
    ) {
      throw new Error("Ya existe un usuario con ese correo");
    }

    const previous = users[index];
    const updated = normalizeUser({
      ...previous,
      ...payload,
      password: payload.password ? payload.password : previous.password,
      activo: payload.activo ?? previous.activo,
      ultimosDigitos:
        payload.ultimosDigitos ??
        (payload.numeroTarjeta
          ? String(payload.numeroTarjeta).slice(-4)
          : previous.ultimosDigitos ?? ""),
    });

    users[index] = updated;
    this.saveDemoUsers(users);
    syncCurrentSessionUser(updated);

    return publicUser(updated);
  },

  deactivateUser(id) {
    const userId = Number(id);
    const users = this.getDemoUsers();
    const current = getStoredSessionUser();
    const index = users.findIndex((user) => getUserId(user) === userId);

    if (index < 0) throw new Error("Usuario no encontrado");
    if (userId === 1 || users[index].usuario === "Administrador") {
      throw new Error("El usuario Administrador demo no se puede eliminar");
    }
    if (current && getUserId(current) === userId) {
      throw new Error("No puedes eliminar el usuario con sesion activa");
    }

    users[index] = normalizeUser({
      ...users[index],
      activo: false,
      online: false,
    });
    this.saveDemoUsers(users);

    return publicUser(users[index]);
  },

  activateUser(id) {
    const users = this.getDemoUsers();
    const index = users.findIndex((user) => getUserId(user) === Number(id));

    if (index < 0) throw new Error("Usuario no encontrado");

    users[index] = normalizeUser({ ...users[index], activo: true });
    this.saveDemoUsers(users);

    return publicUser(users[index]);
  },
};

export default demoStorage;
