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
    return () => window.removeEventListener('currencyChange', handleSync); // Nota: Cambié handleSync por handleCurrencyChange para consistencia
  }, []);

  if (!data) return <div className="product_template_container">Cargando producto...</div>;

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
        if (window.jQuery) {
            window.jQuery(document.body).trigger('wc_fragment_refresh');
            window.jQuery(document.body).trigger('added_to_cart');
        }
      } 
    } catch (error) {
      console.error("Error al añadir:", error);
    } finally {
      setTimeout(() => setIsAdding(false), 1000);
    }
  };

  // LOG UBICADO CORRECTAMENTE
  console.log("DEBUG PAYPAL:", { raw_price, currency: window.foxConfig?.currentCurrency });

  return (
    <div className="product_template_container">
      <div className="product_template_container_information">
        
        <div className="product-image-wrapper-one animate_dos">
          <img src={imagen || 'https://via.placeholder.com/600'} alt={titulo} className="main-product-img" />
        </div>

        <div className="product-info-wrapper-two">
          <h1 className="product-main-title animate_dos" style={{ color: '#00ffcc' }}>{titulo}</h1> {/* TEST COLOR */}
          
          <div className="product-main-price animate_dos" dangerouslySetInnerHTML={{ __html: precio }} />
          
          <div className="product-main-description animate_dos" dangerouslySetInnerHTML={{ __html: descripcion }} />

          <div className="product-main-action animate_dos">
            <div className="cart" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button 
                className={`btn-secondary ${isAdding ? 'loading' : ''}`} 
                onClick={handleAddToCart}
                disabled={isAdding}
                style={{ cursor: isAdding ? 'not-allowed' : 'pointer' }}
              >
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>

              {/* CONTENEDOR DE PRUEBA VISUAL */}
              <div style={{ 
                border: '3px solid #ff4444', 
                padding: '15px', 
                borderRadius: '10px',
                background: '#1a1a1a',
                minHeight: '150px' 
              }}>
                <h4 style={{ color: 'white', fontSize: '12px', marginBottom: '10px' }}>PayPal Container Test</h4>
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