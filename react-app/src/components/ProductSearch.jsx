import { useState } from 'react';

export default function ProductSearch() {
  // Datos de prueba para ver si la grilla renderiza
  const [products] = useState([
    { id: 1, title: 'Producto Prueba 1', price: '10.00', category: 'Zapatos' },
    { id: 2, title: 'Producto Prueba 2', price: '20.00', category: 'Camisas' },
    { id: 3, title: 'Producto Prueba 3', price: '30.00', category: 'Accesorios' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Probar buscador..."
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredProducts.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h4>{product.title}</h4>
            <p>Precio: ${product.price}</p>
            <button style={{ background: '#646cff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
              Ver más
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}