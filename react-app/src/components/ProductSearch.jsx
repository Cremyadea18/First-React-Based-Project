import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Estado inicial inteligente
  const [activeCurrency, setActiveCurrency] = useState(() => {
    // PRIORIDAD: 1. Variable Global PHP, 2. LocalStorage, 3. Default USD
    const globalCurr = window.foxConfig ? window.foxConfig.currentCurrency : null;
    const saved = localStorage.getItem('store_currency');
    const finalInitial = globalCurr || saved || 'USD';
    
    console.log("🚀 ProductSearch: Moneda inicial determinada:", finalInitial);
    return finalInitial;
  });

  // 2. EFECTO DE ESCUCHA: Sincronizar con el Monitor
  useEffect(() => {
    const syncCurrency = () => {
      const newCurr = localStorage.getItem('store_currency') || (window.foxConfig ? window.foxConfig.currentCurrency : 'USD');
      if (newCurr !== activeCurrency) {
        console.log("🔄 SYNC detectado - Actualizando estado a:", newCurr);
        setActiveCurrency(newCurr);
      }
    };

    window.addEventListener('currencyChange', syncCurrency);
    window.addEventListener('storage', syncCurrency);

    // Verificación inmediata al montar
    syncCurrency();

    return () => {
      window.removeEventListener('currencyChange', syncCurrency);
      window.removeEventListener('storage', syncCurrency);
    };
  }, [activeCurrency]);

  // 3. EFECTO DE CARGA: Petición a la API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const timestamp = new Date().getTime();
    // Usamos el activeCurrency del estado de React que ya está sincronizado
    const apiUrl = `/wp-json/wc/v3/products?per_page=20&currency=${activeCurrency}&_=${timestamp}`;
    
    console.log("--- 📡 INICIANDO FETCH API ---");
    console.log("Moneda en URL:", activeCurrency);

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Error al conectar con la tienda');
        return response.json();
      })
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          console.log(`✅ EXITO: ${data.length} productos en ${activeCurrency}`);
          
          if (data.length > 0 && data[0].debug_info) {
            console.log("⚙️ Debug PHP:", data[0].debug_info);
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
  }, [activeCurrency]); 

  const filteredProducts = products?.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return (
    <div className="loading-state" style={{padding: '20px', textAlign: 'center'}}>
      <p>Actualizando precios a {activeCurrency}...</p>
    </div>
  );

  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="search-section">
      <div className="search-bar-container">
        <div style={{fontSize: '10px', color: '#ff4400', fontWeight: 'bold', marginBottom: '5px'}}>
          MONEDA ACTIVA: {activeCurrency}
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