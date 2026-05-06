export default function StatCard({ title, value, icon, hint }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-slate-500 text-sm">{title}</p>
        <p className="text-2xl font-semibold text-ink">{value}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
