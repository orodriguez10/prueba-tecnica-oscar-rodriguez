import { useEffect, useState } from 'react';
import { get, patch } from '../api';
import { formatDate, formatMoney } from '../format';
import Pagination from './Pagination';

const STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
};

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [customer, setCustomer] = useState('');
  const [debouncedCustomer, setDebouncedCustomer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Espera a que el usuario deje de escribir antes de consultar.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedCustomer(customer.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [customer]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page, limit: pageSize });
    if (status) params.set('status', status);
    if (debouncedCustomer) params.set('customer', debouncedCustomer);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const load = () => {
      get(`/orders?${params}`)
        .then((res) => {
          if (cancelled) return;
          setOrders(res.data);
          setTotal(res.total);
          setError(null);
        })
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    };

    setLoading(true);
    load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [page, pageSize, status, debouncedCustomer, from, to]);

  // Cada filtro vuelve a la primera página.
  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStatus('');
    setFrom('');
    setTo('');
    setCustomer('');
    setPage(1);
  };

  const changeStatus = async (orderId, newStatus) => {
    try {
      const updated = await patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: updated.status } : o))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const hasFilters = status || from || to || customer;

  return (
    <div>
      <div className="toolbar">
        <input
          placeholder="Buscar por nombre de cliente..."
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />
        <select value={status} onChange={(e) => withReset(setStatus)(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="date-field">
          Desde
          <input type="date" value={from} max={to || undefined} onChange={(e) => withReset(setFrom)(e.target.value)} />
        </label>
        <label className="date-field">
          Hasta
          <input type="date" value={to} min={from || undefined} onChange={(e) => withReset(setTo)(e.target.value)} />
        </label>
        {hasFilters && <button onClick={clearFilters}>Limpiar filtros</button>}
        {loading && <span className="muted">Cargando...</span>}
      </div>

      {error && <p className="error">Error cargando pedidos: {error}</p>}
      <p className="muted">{total} pedidos</p>
      {!loading && !error && orders.length === 0 && (
        <p className="muted">No hay pedidos que coincidan con los filtros</p>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="nowrap">{formatDate(order.createdAt)}</td>
              <td className="nowrap">{order.customer?.name}</td>
              <td>{order.items.map((i) => i.product?.name).join(', ')}</td>
              <td>
                <select
                  className={`status status-${order.status}`}
                  value={order.status}
                  onChange={(e) => changeStatus(order._id, e.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{formatMoney(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={withReset(setPageSize)}
      />
    </div>
  );
}
