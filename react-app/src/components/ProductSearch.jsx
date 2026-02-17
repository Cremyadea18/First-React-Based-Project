import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Función para obtener productos de WooCommerce
  useEffect(() => {
    // Usamos la ruta nativa de WP-JSON para productos de WooCommerce
    // No necesitas poner el dominio completo si el JS corre en el mismo sitio
    fetch('/wp-json/wc/v3/products?per_page=20')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error cargando productos:', error);
        setLoading(false);
      });
  }, []);

  // 2. Filtrado dinámico
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando productos...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Buscar productos reales..."
        style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredProducts.map(product => (
          <div key={product.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '12px', textAlign: 'center', background: '#fff' }}>
            {/* Imagen del producto */}
            {product.images && product.images[0] && (
              <img src={product.images[0].src} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'contain' }} />
            )}
            
            <h4 style={{ margin: '15px 0 5px' }}>{product.name}</h4>
            
            {/* Precio usando el formato de WooCommerce */}
            <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
              {product.price_html ? (
                <span dangerouslySetInnerHTML={{ __html: product.price_html }} />
              ) : (
                `$${product.price}`
              )}
            </p>

            <a href={product.permalink} style={{ 
              display: 'inline-block',
              background: '#646cff', 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 15px', 
              borderRadius: '6px',
              marginTop: '10px'
            }}>
              Ver producto
            </a>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && <p>No se encontraron productos.</p>}
    </div>
  );
}