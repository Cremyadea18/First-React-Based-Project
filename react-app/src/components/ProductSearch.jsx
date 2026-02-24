import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Simplificamos la detección inicial de moneda
  const [activeCurrency, setActiveCurrency] = useState(() => {
    return localStorage.getItem('store_currency') || 'USD';
  });

  // Escuchar el cambio de moneda desde el CurrencyMonitor (FOX)
  useEffect(() => {
    const handleCurrencyChange = () => {
      const newCurr = localStorage.getItem('store_currency') || 'USD';
      console.log("🔄 Cambio de moneda detectado en Buscador:", newCurr);
      setActiveCurrency(newCurr);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // Agregamos un timestamp para evitar que el navegador guarde en caché precios viejos
    const timestamp = new Date().getTime();

    // 📡 PETICIÓN API - Usamos la moneda activa directamente
    // El backend (functions.php + FOX) interceptará este parámetro 'currency'
    const apiUrl = `/wp-json/wc/v3/products?per_page=20&currency=${activeCurrency}&_=${timestamp}`;
    
    console.log("📡 Buscando productos en:", activeCurrency);

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Error al conectar con la tienda');
        return response.json();
      })
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          console.log(`✅ ${data.length} productos recibidos en ${activeCurrency}`);
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("❌ Error en la carga:", err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [activeCurrency]); // Se dispara cada vez que cambie la moneda

  const filteredProducts = products?.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return <div className="loading-state">Updating prices to {activeCurrency}...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="search-section">
      <div className="search-bar-container">
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
              
              {/* FOX + Functions.php ya nos mandan el price_html listo 
                  con el símbolo (€ / $) y el valor convertido */}
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