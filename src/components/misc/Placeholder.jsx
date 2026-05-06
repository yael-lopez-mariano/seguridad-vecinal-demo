export default function Placeholder({ title = "Pantalla" }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-slate-600">Pantalla en construcción.</p>
    </div>
  );
}
