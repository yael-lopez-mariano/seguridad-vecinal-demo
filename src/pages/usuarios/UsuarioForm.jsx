// src/app/pages/usuarios/UsuarioForm.jsx
import { useEffect, useState } from "react";
import { parseTipoUsuarioID } from "../../types/tiposUsuario";

const emptyForm = {
  usuarioID: null,
  tipoUsuarioID: "",
  numeroCasa: "",
  calle: "",
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
  fechaNacimiento: "",
  email: "",
  password: "",
  numeroTarjeta: "",
  fechaVencimiento: "",
};

export default function UsuarioForm({
  initial,
  tipos = [],
  onCancel,
  onSubmit,
  saving,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initial) {
      setForm({
        usuarioID: initial.usuarioID ?? null,
        tipoUsuarioID:
          initial.tipoUsuarioID ??
          parseTipoUsuarioID(initial.tipoUsuario) ??
          "",
        numeroCasa: initial.numeroCasa ?? "",
        calle: initial.calle ?? "",
        nombre: initial.nombre ?? "",
        apellidoPaterno: initial.apellidoPaterno ?? "",
        apellidoMaterno: initial.apellidoMaterno ?? "",
        telefono: initial.telefono ?? "",
        fechaNacimiento: initial.fechaNacimiento
          ? initial.fechaNacimiento.substring(0, 10)
          : "",
        email: initial.email ?? "",
        password: "", // para edición, lo dejamos vacío (se puede ignorar)
        numeroTarjeta: initial.numeroTarjeta ?? "",
        fechaVencimiento: initial.fechaVencimiento
          ? initial.fechaVencimiento.substring(0, 10)
          : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mandamos el form tal cual al padre
    onSubmit({
      ...form,
      tipoUsuarioID: Number(form.tipoUsuarioID || 0),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow rounded-xl p-4 grid gap-4 md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">
          Tipo de usuario
        </label>
        <select
          name="tipoUsuarioID"
          value={form.tipoUsuarioID}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        >
          <option value="">Seleccione un tipo</option>
          {tipos.map((t) => (
            <option key={t.tipoUsuarioID} value={t.tipoUsuarioID}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre(s)</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
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
          required
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
        <label className="block text-sm font-medium mb-1">Número de casa</label>
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

      <div>
        <label className="block text-sm font-medium mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Contraseña{" "}
          {!form.usuarioID && (
            <span className="text-xs text-slate-500">(nuevo usuario)</span>
          )}
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder={form.usuarioID ? "Dejar vacío para no cambiar" : ""}
          required={!form.usuarioID}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Número tarjeta</label>
        <input
          name="numeroTarjeta"
          value={form.numeroTarjeta}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha vencimiento
        </label>
        <input
          type="date"
          name="fechaVencimiento"
          value={form.fechaVencimiento}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : form.usuarioID
            ? "Guardar cambios"
            : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
