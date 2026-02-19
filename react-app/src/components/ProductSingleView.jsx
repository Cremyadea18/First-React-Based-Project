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
    return <div className="product_main_container">Cargando producto...</div>;
  }

  const { titulo, precio, descripcion, imagen, stock } = data;

  const handleAddToCart = () => {
    console.log("Añadiendo al carrito:", titulo);
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="product_template_container">
        <div className="product_template_container_information">
            <div className="product-image-wrapper">
              {/* Usamos un fallback por si no hay imagen */}
              <img src={imagen || 'ruta/a/imagen-por-defecto.jpg'} alt={titulo} className="main-product-img" />
            </div>

            <div className="product-info-wrapper">
              <h1 className="product-main-title">{titulo}</h1>
              
              <div 
                className="product-main-price" 
                dangerouslySetInnerHTML={{ __html: precio }} 
              />

              <div className="product-main-description">
                <div dangerouslySetInnerHTML={{ __html: descripcion }} />
              </div>

              <div className="product-main-action">
                <div className="cart">
                  <button 
                    className="single_add_to_cart_button button alt"
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