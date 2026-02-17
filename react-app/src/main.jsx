import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { Hero, About, ProductsSection } from './App.jsx'
import './index.css'

const componentsToMount = [
  { id: 'react-hero', component: <Hero /> },
  { id: 'react-about', component: <About /> },
  { id: 'react-products', component: <ProductsSection /> },
  { id: 'root', component: <App /> } // Solo se activará si pones id="root"
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

// Esto asegura que React espere a que el HTML de Elementor esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoots);
} else {
  initRoots();
}