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

  // Estado de carga si no hay data
  if (!data) return <div className="loading-state">Cargando producto...</div>;

  // Extraemos las variables de data
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

        {/* Bloque de Imagen */}
        <div className="product-image-wrapper-one">
          <img src={imagen} alt={titulo} />
        </div>

        {/* Bloque de Información */}
        <div className="product-info-wrapper-two">
          <h1>{titulo}</h1>
          
          {/* Precio: Si el símbolo sale atrás, es por la configuración de WooCommerce */}
          <div className="product-price" dangerouslySetInnerHTML={{ __html: precio }} />

          {/* Descripción del Producto: Ahora se renderiza aquí */}
          {descripcion && (
            <div 
              className="product-description" 
              dangerouslySetInnerHTML={{ __html: descripcion }} 
            />
          )}

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