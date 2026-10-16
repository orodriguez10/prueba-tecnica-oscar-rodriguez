import { useEffect, useState } from 'react';
import { get } from '../api';

export default function Stats() {
  const [top, setTop] = useState([]);
  const [error, setError] = useState(null);
  const options = { limit: 10 };

  useEffect(() => {
    get(`/orders/top-products?limit=${options.limit}`)
      .then((data) => {
        if (data.statusCode) {
          setError(data.message);
        } else {
          setTop(data);
        }
      })
      .catch((err) => setError(err.message));
  }, [options]);

  if (error) return <p className="error">Error cargando estadísticas: {error}</p>;

  return (
    <div>
      <h2>Top {options.limit} productos más vendidos</h2>
      <ol>
        {top.map((p) => (
          <li key={p.name}>
            {p.name} — {p.quantity} unidades
          </li>
        ))}
      </ol>
    </div>
  );
}
