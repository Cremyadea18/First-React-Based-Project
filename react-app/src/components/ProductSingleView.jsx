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

  if (!data) return <div style={{background: 'orange', padding: '20px'}}>Cargando producto (Data es null)...</div>;

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

  // LOG PARA CONSOLA
  console.log("DEBUG DATA:", data);

  return (
    <div className="product_template_container" style={{ border: '5px solid blue', padding: '10px' }}>
      <h2 style={{ background: 'blue', color: 'white', fontSize: '12px' }}>CONTENEDOR PRINCIPAL (AZUL)</h2>
      
      <div className="product_template_container_information" style={{ border: '3px solid green' }}>
        <h2 style={{ background: 'green', color: 'white', fontSize: '12px' }}>INFO WRAPPER (VERDE)</h2>

        <div className="product-image-wrapper-one">
          <img src={imagen} alt={titulo} style={{ border: '2px solid purple' }} />
        </div>

        <div className="product-info-wrapper-two" style={{ background: '#f0f0f0', padding: '20px' }}>
          <h1 style={{ color: 'red' }}>{titulo} (Título en Rojo)</h1>
          
          <div style={{ borderBottom: '2px dashed black', padding: '10px' }} 
               dangerouslySetInnerHTML={{ __html: precio }} />

          <div className="product-main-action" style={{ border: '4px solid yellow', padding: '15px', marginTop: '20px' }}>
            <h2 style={{ color: 'black', fontSize: '12px' }}>SECCIÓN DE BOTONES (AMARILLO)</h2>
            
            <div className="cart">
              <button 
                style={{ background: 'black', width: '100%', marginBottom: '10px' }}
                onClick={handleAddToCart}
              >
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>

              {/* Aquí es donde debería estar PayPal */}
              <div style={{ background: '#eee', padding: '10px' }}>
                <p style={{ fontSize: '10px' }}>Iniciando componente PayPal...</p>
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