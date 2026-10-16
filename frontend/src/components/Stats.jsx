import { useEffect, useState } from 'react';
import { get } from '../api';
import { formatCompactMoney, formatMoney } from '../format';
import BarChart from './BarChart';
import ColumnChart from './ColumnChart';
import GroupedColumnChart from './GroupedColumnChart';

const LIMIT = 10;
const SALES_MONTHS = 12;
const COMPARISON_MONTHS = 6;
const VALID_COLOR = '#4f46e5';
const CANCELLED_COLOR = '#dc2626';

// Mismos colores que las etiquetas de estado de la tabla de pedidos.
const STATUS_ROWS = [
  { key: 'pending', label: 'Pendiente', color: '#f59e0b' },
  { key: 'paid', label: 'Pagado', color: '#16a34a' },
  { key: 'shipped', label: 'Enviado', color: '#2563eb' },
  { key: 'cancelled', label: 'Cancelado', color: '#dc2626' },
];

const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// "2026-10" -> "oct 26"
const monthLabel = (month) => {
  const [year, number] = month.split('-');
  return `${MONTH_NAMES[Number(number) - 1]} ${year.slice(2)}`;
};

export default function Stats() {
  const [top, setTop] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      get('/orders/summary'),
      get(`/orders/top-products?limit=${LIMIT}`),
      get(`/orders/sales-by-month?months=${SALES_MONTHS}`),
    ])
      .then(([summaryData, topData, salesData]) => {
        setSummary(summaryData);
        setTop(topData);
        setSales(salesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Cargando estadísticas...</p>;
  if (error) return <p className="error">Error cargando estadísticas: {error}</p>;

  const topRows = top.map((p, index) => ({ label: `${index + 1}. ${p.name}`, value: p.quantity }));
  const statusRows = STATUS_ROWS.map(({ key, label, color }) => {
    const value = summary.byStatus[key];
    const percent = summary.totalOrders ? Math.round((value / summary.totalOrders) * 100) : 0;
    return { label, value, color, display: `${value} · ${percent}%` };
  });
  const salesColumns = sales.map((m) => ({
    label: monthLabel(m.month),
    value: m.revenue,
    display: formatCompactMoney(m.revenue),
    title: formatMoney(m.revenue),
  }));

  // La comparación solo muestra los meses más recientes para que las columnas se lean bien.
  const comparisonGroups = sales.slice(-COMPARISON_MONTHS).map((m) => ({
    label: monthLabel(m.month),
    bars: [
      { value: m.orders, color: VALID_COLOR },
      { value: m.cancelled, color: CANCELLED_COLOR },
    ],
  }));

  return (
    <div>
      <div className="kpis">
        <Kpi label="Total de pedidos" value={summary.totalOrders} />
        <Kpi label="Ingresos" value={formatMoney(summary.revenue)} hint="Sin pedidos cancelados" />
        <Kpi label="Ticket promedio" value={formatMoney(summary.averageTicket)} hint="Ingresos / pedidos válidos" />
        <Kpi label="Pedidos este mes" value={summary.ordersThisMonth} />
        <Kpi
          label="Stock bajo"
          value={summary.lowStockProducts}
          hint={`Productos con menos de ${summary.lowStockLimit} unidades`}
        />
      </div>

      <div className="charts">
        <div className="panel">
          <h2>Top {LIMIT} productos más vendidos</h2>
          {topRows.length === 0 && <p className="muted">Todavía no hay ventas registradas</p>}
          <BarChart rows={topRows} />
          <p className="muted">Unidades vendidas por producto</p>
        </div>

        <div className="panel">
          <h2>Pedidos por estado</h2>
          <BarChart rows={statusRows} />
          <p className="muted">Cantidad de pedidos y porcentaje del total</p>
        </div>
      </div>

      <div className="charts charts-sales">
        <div className="panel">
          <h2>Ventas por mes</h2>
          <ColumnChart columns={salesColumns} />
          <p className="muted">Ingresos del último año (12 meses), sin pedidos cancelados</p>
        </div>

        <div className="panel">
          <h2>Pedidos válidos vs cancelados</h2>
          <GroupedColumnChart
            groups={comparisonGroups}
            legend={[
              { name: 'No cancelados', color: VALID_COLOR },
              { name: 'Cancelados', color: CANCELLED_COLOR },
            ]}
          />
          <p className="muted">Cantidad de pedidos por mes, en los últimos {COMPARISON_MONTHS} meses</p>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {hint && <small className="muted">{hint}</small>}
    </div>
  );
}
