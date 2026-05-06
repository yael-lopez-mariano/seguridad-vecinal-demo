import React, { createContext, useContext, useEffect, useState } from "react";
import demoStorage from "../services/demoStorage";
import { showError } from "../utils/swal";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const DEMO_MODE = true;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      demoStorage.initializeDemoData();
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error al restaurar la sesión:", error);
        showError("Error de sesión", "No se pudo restaurar la sesión guardada.");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const buildUserData = (data, loginValue) => ({
    id: data.id ?? data.usuarioID,
    usuarioID: data.usuarioID ?? data.id,
    userId: data.usuarioID ?? data.id,
    usuario: data.usuario ?? loginValue,
    nombre: data.nombre,
    apellidoP: data.apellidoP ?? data.apellidoPaterno ?? "",
    apellidoM: data.apellidoM ?? data.apellidoMaterno ?? "",
    apellidoPaterno: data.apellidoPaterno ?? data.apellidoP ?? "",
    apellidoMaterno: data.apellidoMaterno ?? data.apellidoM ?? "",
    email: data.email ?? loginValue,
    tipoUsuario: data.tipoUsuario,
    tipoUsuarioID: data.tipoUsuarioID,
    descripcion: data.descripcion,
    firebaseID: data.firebaseID ?? null,
    online: true,
  });

  const persistUserSession = (userData) => {
    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));

    // Compatibilidad con utilidades existentes que leen otras llaves de sesión.
    localStorage.setItem("rsv_user", JSON.stringify(userData));
    localStorage.setItem(
      "session",
      JSON.stringify({
        userId: userData.userId,
        usuarioID: userData.usuarioID,
        role: userData.tipoUsuario,
        tipoUsuarioID: userData.tipoUsuarioID,
      })
    );
  };

  const login = async (email, password) => {
    try {
      setLoading(true);

      if (DEMO_MODE) {
        const data = demoStorage.validateCredentials(email, password);

        if (!data) {
          const authError = new Error("Credenciales incorrectas");
          authError.code = "INVALID_CREDENTIALS";
          throw authError;
        }

        const userData = buildUserData(data, email);
        persistUserSession(userData);

        return true;
      }

      // Modo backend original. Se conserva para poder reactivarlo quitando DEMO_MODE.
      const response = await fetch(`${apiBaseUrl}/Usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        const authError = new Error(errorData || "Credenciales incorrectas");
        authError.code = "INVALID_CREDENTIALS";
        throw authError;
      }

      const data = await response.json();

      const userData = buildUserData(data, email);
      persistUserSession(userData);

      return true;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("rsv_user");
    localStorage.removeItem("session");
  };

  const restoreDemoData = () => demoStorage.restoreDemoData();

  const value = {
    user,
    login,
    logout,
    restoreDemoData,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
