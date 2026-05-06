import { useEffect, useMemo, useRef, useState } from "react";
import { showWarning } from "../../utils/swal";

const QR_SIZE = 29;
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 980;

function hashCode(value) {
  return String(value)
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function getQrCells(value) {
  const seed = hashCode(value || "RSV");
  return Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
    const row = Math.floor(index / QR_SIZE);
    const col = index % QR_SIZE;

    const finder = (r, c) =>
      row >= r &&
      row < r + 7 &&
      col >= c &&
      col < c + 7 &&
      (row === r ||
        row === r + 6 ||
        col === c ||
        col === c + 6 ||
        (row >= r + 2 && row <= r + 4 && col >= c + 2 && col <= c + 4));

    if (finder(0, 0) || finder(0, QR_SIZE - 7) || finder(QR_SIZE - 7, 0)) {
      return true;
    }

    const quietZone =
      (row < 8 && col < 8) ||
      (row < 8 && col > QR_SIZE - 9) ||
      (row > QR_SIZE - 9 && col < 8);
    if (quietZone) return false;

    return ((seed + index * 17 + row * 13 + col * 7) % 7) < 3;
  });
}

function QrPreview({ qr }) {
  const canvasRef = useRef(null);
  const value = qr?.codigoQR || "RSV-QR-DEMO";
  const personName =
    qr?.usuarioNombre || qr?.invitadoNombre || "Visitante autorizado";
  const estado = qr?.estado || "Activo";
  const vigenciaInicio = qr?.fechaInicio || qr?.fechaGeneracion;
  const vigenciaFin = qr?.fechaVencimiento;

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return String(date).slice(0, 10);
    return parsed.toLocaleDateString("es-MX");
  };

  const cells = useMemo(() => getQrCells(value), [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#059669";
    ctx.fillRect(0, 0, CANVAS_WIDTH, 155);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TIENES ACCESO", CANVAS_WIDTH / 2, 58);
    ctx.font = "bold 28px Arial";
    ctx.fillText(personName, CANVAS_WIDTH / 2, 105);
    ctx.font = "18px Arial";
    ctx.fillText("Red de Seguridad Vecinal", CANVAS_WIDTH / 2, 134);

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#dbe4ef";
    ctx.lineWidth = 3;
    roundRect(ctx, 70, 190, 580, 580, 28);
    ctx.fill();
    ctx.stroke();

    const qrX = 110;
    const qrY = 230;
    const qrSize = 500;
    const moduleSize = qrSize / QR_SIZE;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = "#111827";
    cells.forEach((active, index) => {
      if (!active) return;
      const row = Math.floor(index / QR_SIZE);
      const col = index % QR_SIZE;
      const gap = moduleSize * 0.12;
      ctx.fillRect(
        qrX + col * moduleSize + gap,
        qrY + row * moduleSize + gap,
        moduleSize - gap * 2,
        moduleSize - gap * 2
      );
    });

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(value, CANVAS_WIDTH / 2, 805);

    ctx.fillStyle = "#334155";
    ctx.font = "20px Arial";
    ctx.fillText(
      `Vigencia: ${formatDate(vigenciaInicio)} - ${formatDate(vigenciaFin)}`,
      CANVAS_WIDTH / 2,
      850
    );

    const badgeWidth = 190;
    const badgeX = CANVAS_WIDTH / 2 - badgeWidth / 2;
    ctx.fillStyle =
      estado === "Activo"
        ? "#dcfce7"
        : estado === "Cancelado"
        ? "#fee2e2"
        : estado === "Usado"
        ? "#dbeafe"
        : "#f1f5f9";
    roundRect(ctx, badgeX, 875, badgeWidth, 44, 22);
    ctx.fill();
    ctx.fillStyle =
      estado === "Activo"
        ? "#047857"
        : estado === "Cancelado"
        ? "#b91c1c"
        : estado === "Usado"
        ? "#1d4ed8"
        : "#475569";
    ctx.font = "bold 19px Arial";
    ctx.fillText(estado, CANVAS_WIDTH / 2, 904);

    ctx.fillStyle = "#64748b";
    ctx.font = "15px Arial";
    ctx.fillText("Presenta este código en el acceso principal", CANVAS_WIDTH / 2, 948);
  }, [cells, estado, personName, value, vigenciaFin, vigenciaInicio]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${value}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleDownload}
        className="group rounded-3xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        title="Descargar QR"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="h-auto w-[260px] rounded-2xl"
        />
      </button>
      <button
        type="button"
        onClick={handleDownload}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Descargar
      </button>
    </div>
  );
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default function QrPersonalForm({
  open,
  onClose,
  onSubmit,
  initial,
  usuarios = [],
  invitados = [],
  estados = [],
  saving = false,
  mode = "create",
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const [usuarioSearch, setUsuarioSearch] = useState("");
  const [invitadoSearch, setInvitadoSearch] = useState("");
  const [form, setForm] = useState({
    usuarioID: "",
    invitadoID: "",
    tipoQR: "Personal",
    descripcion: "",
    estado: "Activo",
    fechaInicio: "",
    fechaVencimiento: "",
    usosPermitidos: "0",
    observaciones: "",
  });
  const [errors, setErrors] = useState({});

  const getUserLabel = (usuario) =>
    [
      usuario.nombre,
      usuario.apellidoPaterno ?? usuario.apellidoP,
      usuario.apellidoMaterno ?? usuario.apellidoM,
    ]
      .filter(Boolean)
      .join(" ") ||
    usuario.usuario ||
    `Usuario #${usuario.usuarioID ?? usuario.id}`;

  const getInvitadoLabel = (invitado) =>
    [
      invitado.nombreInvitado,
      invitado.apellidoPaternoInvitado,
      invitado.apellidoMaternoInvitado,
    ]
      .filter(Boolean)
      .join(" ") || `Invitado #${invitado.invitadoID ?? invitado.id}`;

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    if (initial) {
      const selectedUser = usuarios.find(
        (u) => Number(u.usuarioID ?? u.id) === Number(initial.usuarioID)
      );
      const selectedInvitado = invitados.find(
        (i) => Number(i.invitadoID ?? i.id) === Number(initial.invitadoID)
      );
      setForm({
        usuarioID: initial.usuarioID ? String(initial.usuarioID) : "",
        invitadoID: initial.invitadoID ? String(initial.invitadoID) : "",
        tipoQR: initial.tipoQR || "Personal",
        descripcion: initial.descripcion || "",
        estado: initial.estado || "Activo",
        fechaInicio: initial.fechaInicio || today,
        fechaVencimiento: initial.fechaVencimiento
          ? String(initial.fechaVencimiento).slice(0, 10)
          : nextYear.toISOString().slice(0, 10),
        usosPermitidos: String(initial.usosPermitidos ?? 0),
        observaciones: initial.observaciones || "",
      });
      setUsuarioSearch(selectedUser ? getUserLabel(selectedUser) : initial.usuarioNombre || "");
      setInvitadoSearch(
        selectedInvitado ? getInvitadoLabel(selectedInvitado) : initial.invitadoNombre || ""
      );
    } else {
      setForm({
        usuarioID: "",
        invitadoID: "",
        tipoQR: "Personal",
        descripcion: "",
        estado: "Activo",
        fechaInicio: today,
        fechaVencimiento: nextYear.toISOString().slice(0, 10),
        usosPermitidos: "0",
        observaciones: "",
      });
      setUsuarioSearch("");
      setInvitadoSearch("");
    }
    setErrors({});
  }, [open, initial, usuarios, invitados]);

  if (!open) return null;

  const title = isView ? "Ver QR" : isEdit ? "Editar QR" : "Nuevo QR";
  const fieldCls =
    "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600";

  const usuariosFiltrados = useMemo(() => {
    const term = usuarioSearch.trim().toLowerCase();
    const activeUsers = usuarios.filter((u) => u.activo !== false);
    if (!term) return activeUsers;
    return activeUsers.filter((u) =>
      [getUserLabel(u), u.email, u.usuario, u.numeroCasa, u.tipoUsuario]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [usuarioSearch, usuarios]);

  const invitadosFiltrados = useMemo(() => {
    const term = invitadoSearch.trim().toLowerCase();
    if (!term) return invitados;
    return invitados.filter((i) =>
      [getInvitadoLabel(i), i.codigoQR, i.nombreResidente, i.estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [invitadoSearch, invitados]);

  const handleChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectUser = (e) => {
    if (isView) return;
    const userId = e.target.value;
    const user = usuarios.find((u) => Number(u.usuarioID ?? u.id) === Number(userId));
    setForm((prev) => ({ ...prev, usuarioID: userId }));
    setUsuarioSearch(user ? getUserLabel(user) : usuarioSearch);
  };

  const selectInvitado = (e) => {
    if (isView) return;
    const invitadoId = e.target.value;
    const invitado = invitados.find(
      (i) => Number(i.invitadoID ?? i.id) === Number(invitadoId)
    );
    setForm((prev) => ({ ...prev, invitadoID: invitadoId }));
    setInvitadoSearch(invitado ? getInvitadoLabel(invitado) : invitadoSearch);
  };

  const validate = async () => {
    const e = {};
    if (!form.usuarioID && !form.invitadoID)
      e.target = "Selecciona un usuario o invitado.";
    if (!form.tipoQR) e.tipoQR = "Selecciona un tipo de QR.";
    if (!form.fechaInicio) e.fechaInicio = "Selecciona la fecha de inicio.";
    if (!form.fechaVencimiento)
      e.fechaVencimiento = "Selecciona la fecha de vencimiento.";
    if (
      form.fechaInicio &&
      form.fechaVencimiento &&
      new Date(`${form.fechaVencimiento}T00:00:00`) <=
        new Date(`${form.fechaInicio}T00:00:00`)
    ) {
      e.fechaVencimiento =
        "La fecha de vencimiento debe ser posterior al inicio.";
    }
    if (!form.estado) e.estado = "Selecciona un estado.";

    setErrors(e);
    const firstMessage = Object.values(e)[0];
    if (firstMessage) {
      await showWarning("Datos incompletos", firstMessage);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    if (!(await validate())) return;

    await onSubmit({
      usuarioID: form.usuarioID ? Number(form.usuarioID) : null,
      invitadoID: form.invitadoID ? Number(form.invitadoID) : null,
      tipoQR: form.tipoQR,
      descripcion: form.descripcion.trim(),
      estado: form.estado,
      activo: form.estado === "Activo",
      fechaInicio: form.fechaInicio,
      fechaVencimiento: `${form.fechaVencimiento}T23:59:00.000Z`,
      usosPermitidos: Number(form.usosPermitidos || 0),
      observaciones: form.observaciones.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-3">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-emerald-600 px-5 py-3 text-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none hover:bg-emerald-700"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4">
          <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Usuario / residente
                  </label>
                  <input
                    type="text"
                    value={usuarioSearch}
                    onChange={(e) => setUsuarioSearch(e.target.value)}
                    disabled={saving || isView}
                    className={fieldCls}
                    placeholder="Buscar usuario..."
                  />
                  <select
                    value={form.usuarioID}
                    onChange={selectUser}
                    disabled={saving || isView}
                    className={fieldCls}
                  >
                    <option value="">Sin usuario</option>
                    {usuariosFiltrados.map((u) => {
                      const id = u.usuarioID ?? u.id;
                      return (
                        <option key={id} value={id}>
                          {getUserLabel(u)}
                          {u.numeroCasa ? ` - Casa ${u.numeroCasa}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Invitado
                  </label>
                  <input
                    type="text"
                    value={invitadoSearch}
                    onChange={(e) => setInvitadoSearch(e.target.value)}
                    disabled={saving || isView}
                    className={fieldCls}
                    placeholder="Buscar invitado..."
                  />
                  <select
                    value={form.invitadoID}
                    onChange={selectInvitado}
                    disabled={saving || isView}
                    className={fieldCls}
                  >
                    <option value="">Sin invitado</option>
                    {invitadosFiltrados.map((i) => {
                      const id = i.invitadoID ?? i.id;
                      return (
                        <option key={id} value={id}>
                          {getInvitadoLabel(i)}
                          {i.codigoQR ? ` - ${i.codigoQR}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {errors.target && (
                <p className="text-xs text-red-500">{errors.target}</p>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Tipo de QR
                  </label>
                  <select
                    name="tipoQR"
                    value={form.tipoQR}
                    onChange={handleChange}
                    disabled={saving || isView}
                    className={fieldCls}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Invitado">Invitado</option>
                    <option value="Temporal">Temporal</option>
                    <option value="Recurrente">Recurrente</option>
                    <option value="Proveedor">Proveedor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    disabled={saving || isView}
                    className={fieldCls}
                  >
                    {estados.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Usos permitidos
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="usosPermitidos"
                    value={form.usosPermitidos}
                    onChange={handleChange}
                    disabled={saving || isView}
                    className={fieldCls}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={form.fechaInicio}
                    onChange={handleChange}
                    disabled={saving || isView}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Fecha vencimiento
                  </label>
                  <input
                    type="date"
                    name="fechaVencimiento"
                    value={form.fechaVencimiento}
                    onChange={handleChange}
                    disabled={saving || isView}
                    className={fieldCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <input
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  disabled={saving || isView}
                  className={fieldCls}
                  placeholder="Ej. QR personal de acceso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  rows={3}
                  value={form.observaciones}
                  onChange={handleChange}
                  disabled={saving || isView}
                  className={fieldCls}
                />
              </div>
            </div>

            <div className="flex justify-center">
              {initial?.codigoQR ? (
                <QrPreview qr={initial} />
              ) : (
                <div className="flex h-52 w-52 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-500">
                  El QR visual se mostrará después de generarlo.
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 mt-4 flex justify-end gap-2 border-t border-slate-100 bg-white pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
              disabled={saving}
            >
              {isView ? "Cerrar" : "Cancelar"}
            </button>
            {!isView && (
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Generar QR"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
