import React, { useState, useEffect } from 'react'; 
import PayPalCheckout from './PaypalCheckout'; 

export const ProductSingleView = ({ data }) => {
  const [activeCurrency, setActiveCurrency] = useState(() => {
    return localStorage.getItem('store_currency') || 'USD';
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const handleCurrencyChange = () => {
      const newCurr = localStorage.getItem('store_currency') || 'USD';
      setActiveCurrency(newCurr);
    };
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  if (!data) return <div className="loading-state">Cargando producto...</div>;

  const { id, titulo, precio, descripcion, imagen, nonce, raw_price } = data;
  
  const handleAddToCart = async () => {
    setIsAdding(true); 
    try {
      const response = await fetch('/wp-json/wc/store/v1/cart/add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Nonce': nonce,
          'X-WC-Store-API-Nonce': nonce 
        },
        body: JSON.stringify({ id: id, quantity: 1 }),
        credentials: 'include' 
      });
      if (response.ok) {
        document.body.dispatchEvent(new CustomEvent('wc_fragment_refresh'));
      } 
    } catch (error) {
      console.error("Error al añadir:", error);
    } finally {
      setTimeout(() => setIsAdding(false), 1000);
    }
  };

  return (
    <div className="product_template_container">
      
      <div className="product_template_container_information">

        <div className="product-image-wrapper-one">
          <img src={imagen} alt={titulo} />
        </div>

        <div className="product-info-wrapper-two">
          <h1>{titulo}</h1>
          
          <div dangerouslySetInnerHTML={{ __html: precio }} />

          <div className="product-main-action">
            
            <div className="cart">
              <button 
                className="add-to-cart-button"
                onClick={handleAddToCart}
              >
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>

              <div className="paypal-checkout-container">
                <PayPalCheckout 
                  amount={raw_price} 
                  currency={window.foxConfig ? window.foxConfig.currentCurrency : 'USD'} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};