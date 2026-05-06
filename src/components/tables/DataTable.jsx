export default function DataTable({
  columns = [],
  data = [],
  emptyText = "Sin datos",
}) {
  if (!data?.length) {
    return (
      <div className="rounded-xl border p-4 text-slate-500 bg-white">
        {emptyText}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="px-4 py-3 font-semibold text-slate-700">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} className="border-t hover:bg-slate-50/60">
              {columns.map((c, ci) => (
                <td key={ci} className="px-4 py-3">
                  {typeof c.accessor === "function"
                    ? c.accessor(row)
                    : row[c.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
