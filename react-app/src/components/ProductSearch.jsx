import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeCurrency, setActiveCurrency] = useState(() => {
    const saved = localStorage.getItem('store_currency') || 'USD';
    return saved.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
  });

  useEffect(() => {
    const handleCurrencyChange = () => {
      const rawCurr = localStorage.getItem('store_currency') || 'USD';
      const cleanCurr = rawCurr.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
      
      console.log("1. 🔄 EVENTO DETECTADO - Nueva moneda en Monitor:", cleanCurr);
      setActiveCurrency(cleanCurr);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const freshCurrency = localStorage.getItem('store_currency') || activeCurrency;
    const cleanCurrency = freshCurrency.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
    const timestamp = new Date().getTime();

    // 🚩 LOG DE PETICIÓN
    const apiUrl = `/wp-json/wc/v3/products?per_page=20&currency=${cleanCurrency}&_=${timestamp}`;
    console.log("2. 📡 PETICIÓN API - Generando URL:", apiUrl);

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Error de conexión');
        return response.json();
      })
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          // 🚩 LOG DE RESPUESTA DEL SERVIDOR
          console.log("3. ✅ RESPUESTA RECIBIDA - Datos crudos del servidor:", data);
          
          if (data.length > 0) {
            console.log("🔍 Ejemplo del primer producto (price_html):", data[0].price_html);
          }
          
          setProducts(data);
          setLoading(false);
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

  // 🚩 LOG DE RENDERIZADO
  console.log("4. 🎨 RENDER - Moneda activa actual:", activeCurrency);

  const filteredProducts = products?.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return <div className="loading-state">Cargando productos en {activeCurrency}...</div>;
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
                <div className="no-image">Sin imagen</div>
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
        <p className="no-results">No encontramos productos.</p>
      )}
    </div>
  );
}