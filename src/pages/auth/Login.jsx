import { useAuth } from "@/context/AuthContext";
import { showAutoSuccess, showError, showWarning } from "@/utils/swal";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const usuario = form.email.trim();
    const password = form.password;

    if (!usuario) {
      await showWarning("Usuario requerido", "Ingresa tu usuario para continuar.");
      return;
    }

    if (!password) {
      await showWarning(
        "Contraseña requerida",
        "Ingresa tu contraseña para continuar."
      );
      return;
    }

    try {
      const success = await login(usuario, password);

      if (success) {
        await showAutoSuccess(
          "Inicio de sesión correcto",
          "Bienvenido al sistema.",
          900
        );
        navigate("/admin/dashboard");
      }
    } catch (error) {
      if (error?.code === "INVALID_CREDENTIALS") {
        await showError(
          "Credenciales incorrectas",
          "Verifica tu usuario y contraseña."
        );
        return;
      }

      await showError(
        "Error al iniciar sesión",
        "Ocurrió un problema al validar tus datos."
      );
    }
  };

  return (
    <div className="min-h-screen grid place-items-center font-inter text-ink">
      <div className="card w-[360px] sm:w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border-4 border-emerald-200 overflow-hidden grid place-items-center bg-white">
            <img
              src="/logo/imagen_2025-10-26_192500425-removebg-preview-removebg-preview.png"
              alt="Red de Seguridad Vecinal"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <p className="mt-2 text-emerald-700 font-semibold text-sm">
            Red de Seguridad Vecinal
          </p>
        </div>

        <h1 className="text-[35px] leading-none font-extrabold text-center mb-4">
          Inicia sesión
        </h1>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="usuario" className="block mb-1 font-medium">
              Usuario
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              placeholder="Ingrese su usuario"
              className="input"
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              className="input"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Entrando..." : "Iniciar sesión"}
            </button>
          </div>
        </form>

        <div className="mt-5 text-sm text-center">
          <span className="text-slate-700">¿Necesitas ayuda?</span>{" "}
          <a href="#" className="help-link">
            Soporte técnico
          </a>
        </div>
      </div>
    </div>
  );
}
