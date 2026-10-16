import { useEffect, useState } from 'react';
import { get, patch } from '../api';
import { formatMoney } from '../format';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page, limit: pageSize });
    if (status) params.set('status', status);

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
  }, [page, pageSize, status]);

  // Cada filtro vuelve a la primera página.
  const withReset = (setter) => (value) => {
    setter(value);
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

  return (
    <div>
      <div className="toolbar">
        <select value={status} onChange={(e) => withReset(setStatus)(e.target.value)}>
          <option value="">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagados</option>
          <option value="shipped">Enviados</option>
          <option value="cancelled">Cancelados</option>
        </select>
        {loading && <span className="muted">Cargando...</span>}
      </div>

      {error && <p className="error">Error cargando pedidos: {error}</p>}
      <p className="muted">{total} pedidos</p>
      {!loading && !error && orders.length === 0 && (
        <p className="muted">No hay pedidos con este filtro</p>
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
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>{order.customer?.name}</td>
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
