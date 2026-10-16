import { useEffect, useState } from 'react';
import { get } from '../api';

// Fuera del componente: un objeto creado dentro cambia en cada render y vuelve a disparar el efecto.
const LIMIT = 10;

export default function Stats() {
  const [top, setTop] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    get(`/orders/top-products?limit=${LIMIT}`)
      .then((data) => {
        if (data.statusCode) {
          setError(data.message);
        } else {
          setTop(data);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">Error cargando estadísticas: {error}</p>;

  return (
    <div>
      <h2>Top {LIMIT} productos más vendidos</h2>
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
