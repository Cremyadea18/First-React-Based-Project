import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { Header, Footer, Hero, About, ProductsSection } from './App.jsx' 
import './index.css'

// 1. Mapeo de componentes
const componentsToMount = [
  { id: 'react-header', component: <Header /> },
  { id: 'react-hero', component: <Hero /> },
  { id: 'react-about', component: <About /> },
  { id: 'react-products', component: <ProductsSection /> },
  { id: 'react-footer', component: <Footer /> }, 
  { id: 'root-full-app', component: <App /> }
];

// 2. Función de montaje con diagnóstico
const initRoots = () => {
  console.log("🚀 React: Iniciando búsqueda de puntos de montaje...");

  componentsToMount.forEach(({ id, component }) => {
    const el = document.getElementById(id);
    
    if (el) {
      console.log(`✅ Elemento encontrado: #${id}. Montando componente...`);
      try {
        if (!el._reactRoot) {
          el._reactRoot = ReactDOM.createRoot(el);
        }
        el._reactRoot.render(
          <React.StrictMode>
            {component}
          </React.StrictMode>
        );
      } catch (error) {
        console.error(`❌ Error al renderizar el componente en #${id}:`, error);
      }
    } else {
      // Usamos info en lugar de warn para no llenar la consola si es normal que no esté
      console.info(`ℹ️ Info: #${id} no presente en esta página.`);
    }
  });
};

// 3. Ejecución segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoots);
} else {
  // Un pequeño delay de 10ms ayuda a que Elementor termine de inyectar sus widgets HTML
  setTimeout(initRoots, 10);
}