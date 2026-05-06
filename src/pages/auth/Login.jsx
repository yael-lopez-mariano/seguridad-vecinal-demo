import { useAuth } from "@/context/AuthContext";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
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
    setError("");

    if (!form.email || !form.password) {
      setError("Por favor, completa todos los campos");
      return;
    }

    const success = await login(form.email, form.password);

    if (success) {
      navigate("/admin/dashboard");
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

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
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
              required
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
              required={false}
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
