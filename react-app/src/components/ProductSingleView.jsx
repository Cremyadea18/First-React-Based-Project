import React, { useState, useEffect } from 'react'; 
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export const ProductSingleView = ({ data }) => {
  const [activeCurrency, setActiveCurrency] = useState(() => {
    return localStorage.getItem('store_currency') || 'USD';
  });
  const [isAdding, setIsAdding] = useState(false);

  // EFECTO PARA FORZAR EL COLOR DE FONDO #121212
  useEffect(() => {
    const applyBackgroundColor = () => {
      const containers = document.querySelectorAll('.paypal-button-container');
      containers.forEach(container => {
        // Aplicamos el color específico que solicitaste
        container.style.setProperty('background', '#121212', 'important');
        container.style.setProperty('background-color', '#121212', 'important');
      });
    };

    const observer = new MutationObserver(() => {
      applyBackgroundColor();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    applyBackgroundColor();
    return () => observer.disconnect();
  }, [activeCurrency]);

  useEffect(() => {
    const handleCurrencyChange = () => {
      const newCurr = localStorage.getItem('store_currency') || 'USD';
      setActiveCurrency(newCurr);
    };
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  if (!data) return <div className="product_template_container">Cargando producto...</div>;

  const { id, titulo, precio, descripcion, imagen, nonce } = data;
  
  const getNumericPrice = (priceInput) => {
    if (!priceInput) return "0.00";
    const cleanString = String(priceInput).replace(/<[^>]*>/g, '').replace(/[^\d.,]/g, ''); 
    const matched = cleanString.match(/[\d[.,]\d]*/g);
    const number = matched ? matched.join('').replace(',', '.') : "0.00";
    return number || "0.00";
  };

  const numericPrice = getNumericPrice(precio);

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

  return (
    <div className="product_template_container">
      <div className="product_template_container_information">
        
        <div className="product-image-wrapper-one animate_dos">
          <img src={imagen || 'https://via.placeholder.com/600'} alt={titulo} className="main-product-img" />
        </div>

        <div className="product-info-wrapper-two">
          <h1 className="product-main-title animate_dos">{titulo}</h1>
          <div className="product-main-price animate_dos" dangerouslySetInnerHTML={{ __html: precio }} />
          <div className="product-main-description animate_dos" dangerouslySetInnerHTML={{ __html: descripcion }} />

          <div className="product-main-action animate_dos">
            <div className="cart">
              <button 
                className={`btn-secondary ${isAdding ? 'loading' : ''}`} 
                onClick={handleAddToCart}
                disabled={isAdding}
                style={{ marginBottom: '15px' }} 
              >
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>

              {/* Contenedor con inline style preventivo */}
              <div className="paypal-button-container" style={{ backgroundColor: '#121212' }}>
                <PayPalScriptProvider 
                  key={activeCurrency} 
                  options={{
                    "client-id": "BAAyx1ha025RcHTNYyMJwsx0YoB4-Gz6metHJV8XVMVCxD5OHpTen1wzhmqNOanP3XrXwxmcH42MU-i8vY", 
                    "currency": activeCurrency, 
                    "intent": "capture"
                  }}
                >
                  <PayPalButtons 
                    style={{ 
                        layout: "vertical", 
                        shape: "rect", 
                        label: "pay",
                        color: "silver"
                    }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{
                          description: titulo,
                          amount: { 
                            value: numericPrice,
                            currency_code: activeCurrency 
                          }
                        }]
                      });
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};