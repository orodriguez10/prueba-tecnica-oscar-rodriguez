import { useEffect, useState } from 'react';
import { get } from '../api';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = () => {
      get(`/orders?status=${status}`).then((data) => setOrders(data));
    };
    load();
    setInterval(load, 5000);
  }, [status]);

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
      </div>

      <p className="muted">{orders.length} pedidos</p>

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
              <td>{order.status}</td>
              <td>${order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
