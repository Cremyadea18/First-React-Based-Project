import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/wp-json/wc/v3/products?per_page=20')
      .then(response => {
        if (!response.ok) throw new Error('Error de conexión con la tienda');
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products?.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return <div className="loading-state">Cargando productos...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="search-section">
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for your Digital product"
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
                dangerouslySetInnerHTML={{ __html: product.price_html || `$${product.price}` }} 
              />
              <a href={product.permalink} className="product-button">
                View Details
              </a>
            </div>
          </article>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="no-results">No encontramos productos que coincidan con tu búsqueda.</p>
      )}
    </div>
  );
}