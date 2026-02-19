import React from 'react'; // Siempre necesario
import { PayPalScriptProvider } from "@paypal/react-paypal-js"; // ¡IMPORTANTE!

const paypalOptions = {
  "client-id": "TU_CLIENT_ID_AQUI",
  currency: "USD",
  intent: "capture",
};

export const ProductSingleView = ({ data }) => {
  // 1. Escudo de seguridad: si data es undefined, no rompemos la app
  if (!data) {
    return <div className="product_template_container">Cargando producto...</div>;
  }

  const { titulo, precio, descripcion, imagen, stock } = data;

  const handleAddToCart = () => {
    console.log("Añadiendo al carrito:", titulo);
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="product_template_container">
        <div className="product_template_container_information">
            <div className="product-image-wrapper-one animate_dos">
              {/* Usamos un fallback por si no hay imagen */}
              <img src={imagen || 'ruta/a/imagen-por-defecto.jpg'} alt={titulo} className="main-product-img" />
            </div>

            <div className="product-info-wrapper-two">
              <h1 className="product-main-title animate_dos">{titulo}</h1>
              
              <div 
                className="product-main-price animate_dos" 
                dangerouslySetInnerHTML={{ __html: precio }} 
              />

              <div className="product-main-description animate_dos">
                <div dangerouslySetInnerHTML={{ __html: descripcion }} />
              </div>

              <div className="product-main-action animate_dos">
                <div className="cart">
                  <button 
                    className="btn-secondary"
                    onClick={handleAddToCart}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};