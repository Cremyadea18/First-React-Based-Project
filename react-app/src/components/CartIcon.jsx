import { useState, useEffect, useCallback, useRef } from 'react';

export const CartIcon = () => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // Usamos una referencia para comparar el valor anterior sin disparar re-renders
  const prevCountRef = useRef(0);

  const fetchCartData = useCallback(() => {
    fetch('/wp-json/wc/store/v1/cart', {
      credentials: 'include' 
    })
      .then(res => res.json())
      .then(data => {
        const totalItems = data.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        
        // Si el nuevo total es mayor que el anterior, activamos la animación
        if (totalItems > prevCountRef.current) {
          setIsAnimating(true);
        }
        
        // Actualizamos la referencia y el estado
        prevCountRef.current = totalItems;
        setCount(totalItems);
      })
      .catch(err => console.error("Error al cargar carrito", err));
  }, []);

  useEffect(() => {
    fetchCartData();

    const handleCartUpdate = () => {
      console.log("🔄 CartIcon detectó cambio, actualizando...");
      fetchCartData();
    };

    document.body.addEventListener('added_to_cart', handleCartUpdate);
    document.body.addEventListener('wc_fragment_refresh', handleCartUpdate);

    if (window.jQuery) {
      window.jQuery(document.body).on('wc_fragments_refreshed added_to_cart', handleCartUpdate);
    }

    // Timer para remover la clase de animación después de 300ms
    let timer;
    if (isAnimating) {
      timer = setTimeout(() => setIsAnimating(false), 300);
    }

    return () => {
      document.body.removeEventListener('added_to_cart', handleCartUpdate);
      document.body.removeEventListener('wc_fragment_refresh', handleCartUpdate);
      if (window.jQuery) {
        window.jQuery(document.body).off('wc_fragments_refreshed added_to_cart', handleCartUpdate);
      }
      clearTimeout(timer);
    };
  }, [fetchCartData, isAnimating]);

  return (
    <div className="cart_widget">
      <a href="/cart" className="cart_link">
        <span className="cart_icon">🛒</span>
        {count > 0 && (
          <span className={`cart_badge ${isAnimating ? 'animate_badge' : ''}`}>
            {count}
          </span>
        )}
      </a>
    </div>
  );
};