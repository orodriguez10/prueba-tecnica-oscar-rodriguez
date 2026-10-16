// Barras horizontales: la más larga ocupa el 100 % y las demás son proporcionales.
// rows: [{ label, value, color?, display? }]  (display: texto que se muestra en lugar del valor)
export default function BarChart({ rows }) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="bar-chart">
      {rows.map((row) => (
        <div className="bar-row" key={row.label}>
          <span className="bar-label" title={row.label}>
            {row.label}
          </span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(row.value / max) * 100}%`, background: row.color }}
            />
          </div>
          <strong className="bar-value">{row.display ?? row.value}</strong>
        </div>
      ))}
    </div>
  );
}
