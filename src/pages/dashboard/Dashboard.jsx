import StatCard from "@/components/charts/StatCard";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      {/* KPIs rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Reportes abiertos"
          value="24"
          hint="Revisar urgentes"
        />
        <StatCard title="Avisos activos" value="5" />
        <StatCard title="Reservas hoy" value="12" />
        <StatCard title="Solicitudes servicio" value="7" />
      </div>

      {/* Aquí luego pones charts y tablas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 h-[340px]">
          <b className="text-ink">Reportes por tipo (semana)</b>
          <div className="mt-3 text-slate-500">Gráfica próximamente…</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 h-[340px]">
          <b className="text-ink">Alertas pendientes</b>
          <div className="mt-3 text-slate-500">Tabla próximamente…</div>
        </div>
      </div>
    </div>
  );
}
