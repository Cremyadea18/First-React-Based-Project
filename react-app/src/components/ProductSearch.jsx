import { useState, useEffect } from 'react';

export default function ProductSearch() {
  const [products, setProducts] = useState([]); // Siempre iniciamos con array vacío
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/wp-json/wc/v3/products?per_page=20')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error de autenticación o respuesta del servidor');
        }
        return response.json();
      })
      .then(data => {
        // VALIDACIÓN CLAVE: Verificamos que 'data' sea realmente un Array
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('La API no devolvió un array:', data);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error en fetch:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Usamos encadenamiento opcional (?.) para evitar errores de lectura
  const filteredProducts = products?.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return <p style={{textAlign: 'center', padding: '20px'}}>Cargando productos...</p>;
  if (error) return <p style={{color: 'red', textAlign: 'center'}}>Error: {error}. Revisa los permisos de la API.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Buscar productos..."
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredProducts.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '15px' }}>
             {product.images?.[0] && (
              <img src={product.images[0].src} style={{width: '100%', height: '150px', objectFit: 'cover'}} />
            )}
            <h4>{product.name}</h4>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}