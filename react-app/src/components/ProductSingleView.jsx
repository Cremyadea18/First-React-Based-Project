import React, { useState, useEffect } from 'react'; 
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export const ProductSingleView = ({ data }) => {
  const [activeCurrency, setActiveCurrency] = useState(() => {
    return localStorage.getItem('store_currency') || 'USD';
  });
  const [isAdding, setIsAdding] = useState(false);

  // --- NUEVO: EFECTO PARA TRANSPARENCIA Y COLOR SILVER ---
  useEffect(() => {
    const applyStyles = () => {
      const containers = document.querySelectorAll('.paypal-button-container');
      containers.forEach(container => {
        // Forzamos fondo transparente
        container.style.setProperty('background', 'transparent', 'important');
        container.style.setProperty('background-color', 'transparent', 'important');
        
        // Simulamos el color Silver quitando el amarillo con escala de grises
        // y subiendo el brillo para que parezca metálico
        container.style.setProperty('filter', 'grayscale(100%) brightness(1.4)', 'important');
      });
    };

    // Observador para detectar cuándo PayPal inyecta los botones en el DOM
    const observer = new MutationObserver(() => {
      applyStyles();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Ejecución inicial
    applyStyles();

    return () => observer.disconnect();
  }, [activeCurrency]); // Se reinicia si cambia la moneda
  // -------------------------------------------------------

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
                style={{ marginBottom: '15px', width: '100%' }}
              >
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>

              <div className="paypal-button-container" style={{ background: 'transparent' }}>
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
                      color: "silver" // Aunque el SDK a veces lo ignora, lo dejamos aquí
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