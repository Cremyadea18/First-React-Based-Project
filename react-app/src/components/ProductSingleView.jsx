import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const paypalOptions = {
  "client-id": "TU_CLIENT_ID_AQUI", 
  currency: "USD",
  intent: "capture",
};

export const ProductSingleView = ({ data }) => {
  if (!data) return <div className="product_template_container">Cargando producto...</div>;

  const { id, titulo, precio, descripcion, imagen, nonce } = data;

  
  const numericPrice = precio.replace(/[^\d.]/g, '');

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/wp-json/wc/store/v1/cart/add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WC-Store-API-Nonce': nonce 
        },
        body: JSON.stringify({ id: id, quantity: 1 })
      });
      if (response.ok) {
        document.body.dispatchEvent(new CustomEvent('wc_fragment_refresh'));
        alert(`¡${titulo} añadido al carrito!`);
      }
    } catch (error) {
      console.error("Error al añadir al carrito", error);
    }
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
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
                
                <button className="btn-secondary" onClick={handleAddToCart}>
                  Add to cart
                </button>

               
                <div className="paypal-button-container">
                  <PayPalButtons 
                    style={{ layout: "vertical", shape: "rect", label: "pay" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{
                          description: titulo,
                          amount: { value: numericPrice }
                        }]
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const order = await actions.order.capture();
                      console.log("Pago completado:", order);
                      alert("¡Gracias por tu compra, " + order.payer.name.given_name + "!");
                    }}
                  />
                </div>
                {/* ------------------------- */}
              </div>
            </div>
          </div>

        </div>
      </div>
    </PayPalScriptProvider>
  );
};