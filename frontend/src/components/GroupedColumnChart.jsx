// Columnas agrupadas para comparar series en cada categoría.
// groups: [{ label, bars: [{ value, color }] }]   legend: [{ name, color }]
// Todas las barras comparten la misma escala, así se pueden comparar entre sí.
export default function GroupedColumnChart({ groups, legend }) {
  const max = Math.max(...groups.flatMap((g) => g.bars.map((b) => b.value)), 1);

  return (
    <div>
      <div className="legend">
        {legend.map((item) => (
          <span key={item.name}>
            <i className="legend-dot" style={{ background: item.color }} />
            {item.name}
          </span>
        ))}
      </div>
      <div className="column-chart">
        {groups.map((group) => (
          <div className="column" key={group.label}>
            <div className="column-group">
              {group.bars.map((bar, index) => (
                <div className="column-bar" key={index}>
                  <span className="column-value">{bar.value}</span>
                  <div className="column-track">
                    <div
                      className="column-fill"
                      style={{ height: `${(bar.value / max) * 100}%`, background: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <span className="column-label">{group.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
