import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
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

  // Suma o resta unidades; no pasa del stock y el producto se quita al llegar a 0.
  const changeQuantity = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === productId
            ? { ...item, quantity: Math.min(item.quantity + delta, item.stock) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // Mismo objeto mientras no cambie el carrito, para no re-renderizar a todos los consumidores.
  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, changeQuantity, clearCart }),
    [cart, addToCart, removeFromCart, changeQuantity, clearCart]
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
