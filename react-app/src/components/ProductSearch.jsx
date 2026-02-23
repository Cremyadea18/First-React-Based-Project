import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Estado de la moneda con limpieza inmediata
  const [activeCurrency, setActiveCurrency] = useState(() => {
    const saved = localStorage.getItem('store_currency') || 'USD';
    // Limpiamos: dejamos solo letras y tomamos las últimas 3 (por si viene "USD EUR COP")
    return saved.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
  });

  // 2. Escuchar el evento del Header
  useEffect(() => {
    const handleCurrencyChange = () => {
      const rawCurr = localStorage.getItem('store_currency') || 'USD';
      // Limpieza de seguridad: extrae solo el código de 3 letras
      const cleanCurr = rawCurr.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
      
      console.log("🔄 Moneda limpia detectada:", cleanCurr);
      setActiveCurrency(cleanCurr);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  // 3. Cargar productos
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // Obtenemos el valor más fresco del storage para la URL
    const freshCurrency = localStorage.getItem('store_currency') || activeCurrency;
    const cleanCurrency = freshCurrency.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
    
    const timestamp = new Date().getTime();

    // URL con moneda limpia
    const apiUrl = `/wp-json/wc/v3/products?per_page=20&currency=${cleanCurrency}&_=${timestamp}`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Error de conexión');
        return response.json();
      })
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [activeCurrency]);

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