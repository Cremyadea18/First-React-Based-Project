import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Estado inicial de moneda con log
  const [activeCurrency, setActiveCurrency] = useState(() => {
    const saved = localStorage.getItem('store_currency') || 'USD';
    console.log("🚀 ProductSearch: Moneda inicial cargada:", saved);
    return saved;
  });

  // 2. EFECTO DE ESCUCHA: Detectar cambios del CurrencyMonitor
  useEffect(() => {
    const syncCurrency = () => {
      const newCurr = localStorage.getItem('store_currency') || 'USD';
      console.log("🔄 SYNC detectado - Actualizando estado a:", newCurr);
      setActiveCurrency(newCurr);
    };

    // Escuchamos el evento personalizado que dispara tu CurrencyMonitor
    window.addEventListener('currencyChange', syncCurrency);
    
    // También escuchamos el evento 'storage' por si se cambia en otra pestaña
    window.addEventListener('storage', syncCurrency);

    // Ejecución inmediata por si hubo un cambio justo antes del montaje
    syncCurrency();

    return () => {
      window.removeEventListener('currencyChange', syncCurrency);
      window.removeEventListener('storage', syncCurrency);
    };
  }, []);

  // 3. EFECTO DE CARGA: Petición a la API cuando cambia activeCurrency
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // Forzamos la lectura más fresca posible del localStorage para la petición
    const freshCurrency = localStorage.getItem('store_currency') || activeCurrency;
    const timestamp = new Date().getTime();

    const apiUrl = `/wp-json/wc/v3/products?per_page=20&currency=${freshCurrency}&_=${timestamp}`;
    
    console.log("--- 📡 INICIANDO FETCH API ---");
    console.log("Moneda en URL:", freshCurrency);
    console.log("URL Completa:", apiUrl);

    fetch(apiUrl)
      .then(response => {
        console.log("Status Servidor:", response.status);
        if (!response.ok) throw new Error('Error al conectar con la tienda');
        return response.json();
      })
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          console.log(`✅ EXITO: ${data.length} productos recibidos en ${freshCurrency}`);
          
          if (data.length > 0) {
            console.log("🔍 INSPECCIÓN DE DATOS:");
            console.log("Precio HTML:", data[0].price_html);
            // Revisamos el debug que inyectamos en functions.php
            if (data[0].debug_info) {
              console.log("⚙️ Debug PHP:", data[0].debug_info);
            } else {
              console.warn("⚠️ No se recibió 'debug_info'. Revisa tu functions.php");
            }
          }

          setProducts(data);
          setLoading(false);
          console.log("--- 🏁 FETCH FINALIZADO ---");
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("❌ ERROR EN FETCH:", err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [activeCurrency]); // Este array de dependencia es la clave

  const filteredProducts = products?.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return (
    <div className="loading-state">
      <p>Actualizando precios a {activeCurrency}...</p>
    </div>
  );

  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="search-section">
      <div className="search-bar-container">
        {/* Etiqueta de debug visual temporal */}
        <div style={{fontSize: '10px', color: '#ff4400', fontWeight: 'bold'}}>
          ACTUALMENTE PIDIENDO: {activeCurrency}
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
              {/* Aquí se renderiza el precio que FOX ya convirtió en el backend */}
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