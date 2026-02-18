import { useState, useEffect } from 'react';

export const CartIcon = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    
    fetch('/wp-json/wc/store/v1/cart')
      .then(res => res.json())
      .then(data => {
        const totalItems = data.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCount(totalItems);
      })
      .catch(err => console.error("Error al cargar carrito", err));
  }, []);

  return (
    <div className="cart_widget">
      <a href="/cart">
        <span className="cart_icon">🛒</span>
        {count > 0 && <span className="cart_badge">{count}</span>}
      </a>
    </div>
  );
};