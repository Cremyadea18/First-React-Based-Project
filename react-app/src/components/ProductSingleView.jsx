const paypalOptions = {
  "client-id": "TU_CLIENT_ID_AQUI",
  currency: "USD",
  intent: "capture",
};

export const ProductSingleView = ({ data }) => {
  
  const { titulo, precio, descripcion, imagen, stock } = data;

  const handleAddToCart = () => {
    console.log("Añadiendo al carrito:", titulo);
    
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="product_main_container">
        <div className="product-single-container">
          <div className="product-layout-grid">
            
            {/* Imagen del producto */}
            <div className="product-image-wrapper">
              <img src={imagen} alt={titulo} className="main-product-img" />
            </div>

            {/* Información del producto */}
            <div className="product-info-wrapper">
              <h1 className="product-main-title">{titulo}</h1>
              
              <div 
                className="product-main-price" 
                dangerouslySetInnerHTML={{ __html: precio }} 
              />

              <div className="product-main-description">
                {/* Aquí se renderiza the_content() */}
                <div dangerouslySetInnerHTML={{ __html: descripcion }} />
              </div>

              <div className="product-main-action">
                {/* Aquí está el botón envuelto en el Provider */}
                <div className="cart">
                  <button 
                    className="single_add_to_cart_button button alt"
                    onClick={handleAddToCart}
                  >
                    Add to cart
                  </button>
                  {/* Aquí podrías poner también <PayPalButtons /> más adelante */}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};