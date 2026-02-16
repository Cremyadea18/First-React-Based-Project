import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pedimos los productos a la API de WordPress/WooCommerce
    fetch('https://reactappapplication.online/wp-json/wp/v2/product') 
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  const filteredProducts = products.filter(product =>
    product.title.rendered.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className="product-search-container">
      <input
        type="text"
        placeholder="Buscar productos..."
        className="search-input"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            {/* Si tienes imágenes, aquí iría la URL */}
            <img src={product.featured_image_src || 'https://via.placeholder.com/150'} alt={product.title.rendered} />
            <h4>{product.title.rendered}</h4>
            <div dangerouslySetInnerHTML={{ __html: product.excerpt.rendered }} />
            <a href={product.link} className="view-button">Ver Producto</a>
          </div>
        ))}
      </div>
    </div>
  );
}