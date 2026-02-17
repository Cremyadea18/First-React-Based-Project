import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { Header, Hero, About, ProductsSection } from './App.jsx' // <--- Verifica que Header esté aquí
import './index.css'

const componentsToMount = [
  { id: 'react-header', component: <Header /> },
  { id: 'react-hero', component: <Hero /> },
  { id: 'react-about', component: <About /> },
  { id: 'react-products', component: <ProductsSection /> }
];

const initRoots = () => {
  componentsToMount.forEach(({ id, component }) => {
    const el = document.getElementById(id);
    if (el) {
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

// IMPORTANTE: Asegúrate de que esto esté presente para manejar el orden de carga
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoots);
} else {
  initRoots();
}