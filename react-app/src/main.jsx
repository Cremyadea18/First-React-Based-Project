import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root');

if (rootElement) {
  // Usamos una variable global personalizada para controlar la raíz
  if (!window.reactRoot) {
    // Si no existe, la creamos y la guardamos en window para que nadie más la cree
    window.reactRoot = ReactDOM.createRoot(rootElement);
    window.reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // Opcional: Si ya existe, simplemente volvemos a renderizar sobre la misma raíz
    window.reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}