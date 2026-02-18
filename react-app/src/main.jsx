import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { Header, Hero, About, ProductsSection, Footer } from './App.jsx' 
import './index.css'

// main.jsx
const componentsToMount = [
  { id: 'react-header', component: <Header /> },
  { id: 'react-hero', component: <Hero /> },
  { id: 'react-about', component: <About /> },
  { id: 'react-products', component: <ProductsSection /> },
  { id: 'react-footer', component: <Footer /> }, 
  { id: 'root-full-app', component: <App /> }
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


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoots);
} else {
  initRoots();
}