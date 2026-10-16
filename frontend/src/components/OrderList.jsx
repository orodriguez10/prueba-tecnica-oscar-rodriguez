import { useEffect, useState } from 'react';
import { get, patch } from '../api';

const STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
};

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = () => {
      get(`/orders?status=${status}`)
        .then((data) => {
          setOrders(data);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    };
    setLoading(true);
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [status]);

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
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagados</option>
          <option value="shipped">Enviados</option>
          <option value="cancelled">Cancelados</option>
        </select>
        {loading && <span className="muted">Cargando...</span>}
      </div>

      {error && <p className="error">Error cargando pedidos: {error}</p>}
      <p className="muted">{orders.length} pedidos</p>
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
              <td>${order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
