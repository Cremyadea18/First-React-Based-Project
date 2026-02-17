import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { Hero, About, ProductsSection } from './App.jsx' // Importamos los componentes específicos
import './index.css'

// 1. Mapeamos el ID del HTML con el Componente de React
const componentsToMount = [
  { id: 'root', component: <App /> },             // Para la página completa original
  { id: 'react-hero', component: <Hero /> },       // Para el Hero en Elementor
  { id: 'react-about', component: <About /> },     // Para el About en Elementor
  { id: 'react-products', component: <ProductsSection /> } // Para el buscador
];

// 2. Función para inicializar los roots de forma segura
const initRoots = () => {
  componentsToMount.forEach(({ id, component }) => {
    const el = document.getElementById(id);
    
    if (el) {
      // Usamos un nombre de propiedad único en el elemento para guardar su propia raíz
      // Esto evita conflictos si Elementor recarga secciones
      if (!el._reactRoot) {
        el._reactRoot = ReactDOM.createRoot(el);
      }
      
      el._reactRoot.render(
        <React.StrictMode>
          {component}
        </React.StrictMode>
      );
    }
  });
};

// 3. Ejecutar la inicialización
initRoots();

/** * Opcional: Si Elementor usa carga dinámica o widgets que aparecen después, 
 * podemos re-ejecutar la función cuando sea necesario.
 */
window.refreshReactComponents = initRoots;