import { useEffect, useState } from 'react';
import { get } from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

function sortProducts(products, sortBy) {
  const copy = [...products];
  for (let i = 0; i < copy.length; i++) {
    for (let j = 0; j < copy.length - i - 1; j++) {
      const a = sortBy === 'price' ? copy[j].price : copy[j].name;
      const b = sortBy === 'price' ? copy[j + 1].price : copy[j + 1].name;
      if (a > b) {
        const tmp = copy[j];
        copy[j] = copy[j + 1];
        copy[j + 1] = tmp;
      }
    }
  }
  return copy;
}

export default function ProductList() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    get(`/products?search=${search}`).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [search]);

  const categories = [...new Set(products.map((p) => p.category))];
  const filtered = products.filter((p) => !category || p.category === category);
  const sorted = sortProducts(filtered, sortBy);

  return (
    <div>
      <div className="toolbar">
        <input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
        </select>
        {loading && <span>Cargando...</span>}
      </div>

      <p className="muted">{sorted.length} productos</p>

      <div className="grid">
        {sorted.map((product, index) => (
          <ProductCard
            key={index}
            product={product}
            onAdd={() => addToCart(product)}
            style={{ borderColor: product.stock < 5 ? 'orange' : '#ddd' }}
          />
        ))}
      </div>
    </div>
  );
}
