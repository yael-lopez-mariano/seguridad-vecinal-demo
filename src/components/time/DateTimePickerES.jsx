import { useEffect, useMemo, useRef, useState } from "react";

const two = (n) => String(n).padStart(2, "0");

// Fecha local + "HH:mm"  → ISO
function toLocalIso(dateObj, hhmm) {
  if (!dateObj || !hhmm) return null;
  const [hh, mm] = hhmm.split(":").map(Number);
  const d = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    hh,
    mm,
    0,
    0
  );
  return d.toISOString();
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const DIAS_CORTOS = ["do.", "lu.", "ma.", "mi.", "ju.", "vi.", "sa."];

// Genera horarios cada 30 min
const buildSlots = (start = 8, end = 20) => {
  const out = [];
  for (let h = start; h <= end; h++) {
    out.push(`${two(h)}:00`);
    if (h !== end) out.push(`${two(h)}:30`);
  }
  return out;
};

export default function DateTimePickerES({
  value,
  onChange,
  startHour = 8,
  endHour = 20,
  compact = false,
  className = "",
}) {
  // -------- estado base
  const [view, setView] = useState(() => {
    const base = value ? new Date(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const initialDate = value ? new Date(value) : null;
  const [selDate, setSelDate] = useState(initialDate);
  const [selTime, setSelTime] = useState(
    value
      ? `${two(new Date(value).getHours())}:${two(
          new Date(value).getMinutes()
        )}`
      : ""
  );

  // Mantener sincronía si el padre cambia `value` (ej. al editar)
  useEffect(() => {
    const d = value ? new Date(value) : null;
    setSelDate(d);
    setSelTime(d ? `${two(d.getHours())}:${two(d.getMinutes())}` : "");
    if (d) setView(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  // Horarios memorizados
  const slots = useMemo(
    () => buildSlots(startHour, endHour),
    [startHour, endHour]
  );

  // Matriz de semanas del mes visible
  const weeks = useMemo(() => {
    const y = view.getFullYear();
    const m = view.getMonth();
    const firstDay = new Date(y, m, 1);
    const start = new Date(firstDay);
    // Ir al domingo anterior (o mismo día si ya es domingo)
    start.setDate(firstDay.getDate() - ((firstDay.getDay() + 7) % 7));
    const out = [];
    for (let i = 0; i < 6; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i * 7 + j);
        row.push(d);
      }
      out.push(row);
    }
    return out;
  }, [view]);

  // -------- evitar bucle: no dependas de la referencia inestable `onChange`
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (selDate && selTime) onChangeRef.current?.(toLocalIso(selDate, selTime));
    else onChangeRef.current?.(null);
  }, [selDate, selTime]); // ← sin `onChange` aquí

  const isSameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();

  // Tamaños (normal vs compacto)
  const sz = compact
    ? {
        headerPy: "py-1.5",
        headTxt: "text-xs",
        dayH: "h-8",
        dayTxt: "text-xs",
        gap: "gap-1.5",
        slotsH: "h-8",
        slotsTxt: "text-xs",
        sectionGap: "gap-3",
      }
    : {
        headerPy: "py-2",
        headTxt: "text-sm",
        dayH: "h-10",
        dayTxt: "text-sm",
        gap: "gap-2",
        slotsH: "h-10",
        slotsTxt: "text-sm",
        sectionGap: "gap-4",
      };

  return (
    <div className={`w-full grid ${sz.sectionGap} ${className}`}>
      {/* Calendario */}
      <div className="rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
        <div
          className={`flex items-center justify-between px-3 ${sz.headerPy} bg-emerald-600 text-white`}
        >
          <button
            type="button"
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
            }
            className="px-2 rounded-lg hover:bg-emerald-700"
            aria-label="Mes anterior"
          >
            ←
          </button>
          <div className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>
            {MESES[view.getMonth()]} {view.getFullYear()}
          </div>
          <button
            type="button"
            onClick={() =>
              setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
            }
            className="px-2 rounded-lg hover:bg-emerald-700"
            aria-label="Mes siguiente"
          >
            →
          </button>
        </div>

        <div
          className={`px-3 pt-2 grid grid-cols-7 ${sz.gap} text-center ${sz.headTxt} font-semibold text-emerald-700`}
        >
          {DIAS_CORTOS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className={`px-3 pb-3 grid grid-cols-7 ${sz.gap}`}>
          {weeks.flat().map((d, idx) => {
            const inMonth = d.getMonth() === view.getMonth();
            const selected = selDate && isSameDay(d, selDate);
            const isToday = isSameDay(d, today);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelDate(new Date(d))}
                className={[
                  `${sz.dayH} rounded-xl border ${sz.dayTxt} transition-all`,
                  selected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : inMonth
                    ? "bg-white border-emerald-100 hover:border-emerald-300"
                    : "bg-emerald-50/40 text-emerald-400 border-emerald-50",
                  isToday && !selected ? "ring-2 ring-emerald-300" : "",
                ].join(" ")}
                title={d.toLocaleDateString("es-MX")}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horarios */}
      <div>
        <div
          className={`mb-2 ${
            compact ? "text-xs" : "text-sm"
          } font-medium text-slate-700`}
        >
          Selecciona horario
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {slots.map((t) => {
            const selected = selTime === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelTime(t)}
                className={[
                  `${sz.slotsH} rounded-xl px-2 ${sz.slotsTxt} border transition-all`,
                  selected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-white border-emerald-200 hover:border-emerald-400",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            const n = new Date();
            setSelDate(n);
            setView(new Date(n.getFullYear(), n.getMonth(), 1));
          }}
          className={`rounded-xl border border-emerald-300 ${
            compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
          } text-emerald-700 hover:bg-emerald-50`}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => {
            setSelDate(null);
            setSelTime("");
            onChangeRef.current?.(null);
          }}
          className={`rounded-xl border ${
            compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
          } text-slate-600 hover:bg-slate-50`}
        >
          Borrar
        </button>
      </div>
    </div>
  );
}
