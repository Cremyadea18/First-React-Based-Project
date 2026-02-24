import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Estado inicial de moneda con log
  const [activeCurrency, setActiveCurrency] = useState(() => {
    const saved = localStorage.getItem('store_currency') || 'USD';
    console.log("初期 (Initial) - Moneda cargada de localStorage:", saved);
    return saved;
  });

  // Escuchar el cambio de moneda desde el CurrencyMonitor
  useEffect(() => {
    const handleCurrencyChange = () => {
      const newCurr = localStorage.getItem('store_currency') || 'USD';
      console.log("🔄 EVENTO DETECTADO - Nueva moneda recibida en Buscador:", newCurr);
      setActiveCurrency(newCurr);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const timestamp = new Date().getTime();
    // Forzamos la lectura más fresca posible para la URL
    const freshCurrency = localStorage.getItem('store_currency') || activeCurrency;

    // 📡 URL de la API con logs de control
    const apiUrl = `/wp-json/wc/v3/products?per_page=20&currency=${freshCurrency}&_=${timestamp}`;
    
    console.log("--- 📡 INICIANDO FETCH API ---");
    console.log("Target Currency:", freshCurrency);
    console.log("Full API URL:", apiUrl);

    fetch(apiUrl)
      .then(response => {
        console.log("HTTP Response Status:", response.status);
        if (!response.ok) throw new Error('Error al conectar con la tienda');
        return response.json();
      })
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          console.log(`✅ RESPUESTA EXITOSA - ${data.length} productos recibidos.`);
          
          // Log del primer producto para verificar si el PHP está enviando el debug_info
          if (data.length > 0) {
            console.log("🔍 INSPECCIÓN PRIMER PRODUCTO:");
            console.log("Nombre:", data[0].name);
            console.log("Price HTML recibido:", data[0].price_html);
            // Si añadiste el bloque de debug en functions.php, esto aparecerá:
            if (data[0].debug_info) {
              console.log("⚙️ Debug del Servidor (PHP):", data[0].debug_info);
            } else {
              console.warn("⚠️ Advertencia: No se detectó 'debug_info'. ¿Actualizaste el functions.php?");
            }
          }

          setProducts(data);
          setLoading(false);
          console.log("--- 🏁 FETCH FINALIZADO ---");
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("❌ ERROR CRÍTICO EN FETCH:", err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [activeCurrency]); 

  const filteredProducts = products?.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return <div className="loading-state">Updating prices to {activeCurrency}...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="search-section">
      <div className="search-bar-container">
        <div style={{fontSize: '10px', color: 'gray', marginBottom: '5px'}}>
          DEBUG: Moneda actual en estado: {activeCurrency}
        </div>
        <input
          type="text"
          className="search-input"
          placeholder={`Search products in ${activeCurrency}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <article key={product.id} className="product-card">
            <div className="product-image-container">
              {product.images?.[0] ? (
                <img src={product.images[0].src} alt={product.name} className="product-image" />
              ) : (
                <div className="no-image">No image available</div>
              )}
            </div>
            
            <div className="product-info">
              <h3 className="product-title">{product.name}</h3>
              <div 
                className="product-price" 
                dangerouslySetInnerHTML={{ __html: product.price_html }} 
              />
              <a href={product.permalink} className="product-button">
                View Details
              </a>
            </div>
          </article>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <p className="no-results">No products found matching your search.</p>
      )}
    </div>
  );
}