import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

// Igual que el máximo por producto que acepta la API en un pedido.
const MAX_PER_PRODUCT = 10;
export const maxQuantity = (product) => Math.min(product.stock, MAX_PER_PRODUCT);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  // Sube cada vez que se completa un pedido, para que las listas recarguen el stock.
  const [ordersCompleted, setOrdersCompleted] = useState(0);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= maxQuantity(product)) return prev;
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  }, []);

  // Suma o resta unidades; no pasa del stock ni del máximo por producto y el producto se quita al llegar a 0.
  const changeQuantity = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === productId
            ? { ...item, quantity: Math.min(item.quantity + delta, maxQuantity(item)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const completeOrder = useCallback(() => {
    setCart([]);
    setOrdersCompleted((n) => n + 1);
  }, []);

  // Mismo objeto mientras no cambie el carrito, para no re-renderizar a todos los consumidores.
  const value = useMemo(
    () => ({ cart, ordersCompleted, addToCart, removeFromCart, changeQuantity, clearCart, completeOrder }),
    [cart, ordersCompleted, addToCart, removeFromCart, changeQuantity, clearCart, completeOrder]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
