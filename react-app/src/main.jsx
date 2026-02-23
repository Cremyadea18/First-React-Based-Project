import React from 'react'
import ReactDOM from 'react-dom/client'


import App, { Header, Footer, Hero, About, ProductsSection } from './App.jsx' 
import './index.css'


import { ProductSingleView } from './components/ProductSingleView';

const initRoots = () => {
  console.log("🚀 React: Iniciando búsqueda de puntos de montaje...");

  const componentsToMount = [
    { id: 'react-header', component: <Header /> },
    { id: 'react-hero', component: <Hero /> },
    { id: 'react-about', component: <About /> },
    { id: 'react-products', component: <ProductsSection /> },
    { id: 'react-footer', component: <Footer /> }, 
    { id: 'root-full-app', component: <App /> }
  ];

  componentsToMount.forEach(({ id, component }) => {
    const el = document.getElementById(id);
    if (el) {
      mountComponent(el, component);
    } else {
      console.info(`ℹ️ Info: #${id} no presente.`);
    }
  });

  // Lógica para el Single Product (donde pasamos los datos del PHP)
  const productEl = document.getElementById('react-single-product-root');
  if (productEl && productEl.dataset.product) {
    try {
      const productData = JSON.parse(productEl.dataset.product);
      console.log(`✅ Producto detectado. Montando ProductSingleView...`);
      // Inyectamos el componente con sus datos
      mountComponent(productEl, <ProductSingleView data={productData} />);
    } catch (e) {
      console.error("❌ Error al parsear datos del producto:", e);
    }
  }
};

const mountComponent = (el, component) => {
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
    console.error(`❌ Error al renderizar en #${el.id}:`, error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoots);
} else {
  setTimeout(initRoots, 10);
}