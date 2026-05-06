// src/app/pages/usuarios/MiPerfil.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsuariosAPI } from "../../services/usuarios.api";
import { session } from "../../utils/session";

export default function MiPerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    usuarioID: 0,
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    telefono: "",
    fechaNacimiento: "",
    numeroCasa: "",
    calle: "",
    email: "",
  });

  useEffect(() => {
    const u = session.getUser();
    if (!u) {
      navigate("/auth/login");
      return;
    }

    const userId =
      u.userId ?? u.usuarioID ?? u.raw?.usuarioID ?? u.raw?.userId ?? null;

    if (!userId) {
      console.error("No hay userId en la sesión:", u);
      setError("No se pudo identificar tu usuario.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await UsuariosAPI.getById(userId);
        setForm({
          usuarioID: data.usuarioID,
          nombre: data.nombre ?? "",
          apellidoPaterno: data.apellidoPaterno ?? "",
          apellidoMaterno: data.apellidoMaterno ?? "",
          telefono: data.telefono ?? "",
          fechaNacimiento: data.fechaNacimiento?.substring(0, 10) ?? "",
          numeroCasa: data.numeroCasa ?? "",
          calle: data.calle ?? "",
          email: data.email ?? "",
        });
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("No se pudo cargar tu perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await UsuariosAPI.update({
        ...form,
        // Si en tu API password / tarjeta son opcionales, los puedes omitir
        password: "",
        numeroTarjeta: "",
        ultimosDigitos: "",
        fechaVencimiento: "2030-01-01", // o déjalo fuera si no es requerido
      });
      alert("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Error al guardar el perfil:", err); //
      setError("No se pudo guardar tu perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Cargando perfil...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mi perfil</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-4 grid gap-4 md:grid-cols-2"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nombre(s)</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Apellido paterno
          </label>
          <input
            name="apellidoPaterno"
            value={form.apellidoPaterno}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Apellido materno
          </label>
          <input
            name="apellidoMaterno"
            value={form.apellidoMaterno}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            name="fechaNacimiento"
            value={form.fechaNacimiento}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Número de casa
          </label>
          <input
            name="numeroCasa"
            value={form.numeroCasa}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Calle</label>
          <input
            name="calle"
            value={form.calle}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Correo electrónico
          </label>
          <input
            name="email"
            value={form.email}
            disabled // normalmente no se edita el correo
            className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-100"
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
