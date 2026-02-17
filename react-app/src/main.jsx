
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root');

// Verificamos que el elemento existe y que no tiene una raíz ya creada
if (rootElement) {
  // Esta comprobación evita el error 299
  if (!rootElement._reactRootContainer) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
}