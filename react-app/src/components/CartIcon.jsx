import { useState, useEffect, useCallback } from 'react';

export const CartIcon = () => {
  const [count, setCount] = useState(0);

 
  const fetchCartData = useCallback(() => {
    fetch('/wp-json/wc/store/v1/cart', {
      credentials: 'include' 
    })
      .then(res => res.json())
      .then(data => {
        const totalItems = data.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
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

    
    return () => {
      document.body.removeEventListener('added_to_cart', handleCartUpdate);
      document.body.removeEventListener('wc_fragment_refresh', handleCartUpdate);
      if (window.jQuery) {
        window.jQuery(document.body).off('wc_fragments_refreshed added_to_cart', handleCartUpdate);
      }
    };
  }, [fetchCartData]);

  return (
    <div className="cart_widget">
      <a href="/cart" className="cart_link">
        <span className="cart_icon">
           
           🛒
        </span>
        {count > 0 && <span className="cart_badge animate_badge">{count}</span>}
      </a>
    </div>
  );
};