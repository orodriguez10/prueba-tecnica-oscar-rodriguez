// Columnas verticales: la más alta ocupa el 100 % del alto y las demás son proporcionales.
// columns: [{ label, value, display, title? }]; color: color de las columnas (opcional)
export default function ColumnChart({ columns, color }) {
  const max = Math.max(...columns.map((c) => c.value), 1);

  return (
    <div className="column-chart">
      {columns.map((col) => (
        <div className="column" key={col.label}>
          <span className="column-value" title={col.title}>{col.display}</span>
          <div className="column-track">
            <div className="column-fill" style={{ height: `${(col.value / max) * 100}%`, background: color }} />
          </div>
          <span className="column-label">{col.label}</span>
        </div>
      ))}
    </div>
  );
}
