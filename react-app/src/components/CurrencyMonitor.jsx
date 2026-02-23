import { useEffect, useRef, useState } from 'react';

export const CurrencyMonitor = () => {
  const containerRef = useRef(null);
  const [activeCurrency, setActiveCurrency] = useState(localStorage.getItem('store_currency') || 'USD');

  useEffect(() => {
    // 1. Mover el switcher original al contenedor de React
    const source = document.getElementById('yay-switcher-source');
    if (source && containerRef.current && !containerRef.current.contains(source.firstElementChild)) {
      containerRef.current.appendChild(source.firstElementChild);
    }

    // 2. Función de actualización con control de "Recarga"
    const updateCurrency = (isManualClick = false) => {
      const selectedOptionElement = document.querySelector('.yay-currency-selected-option');
      
      if (selectedOptionElement) {
        const rawText = selectedOptionElement.innerText.trim();
        // Limpiamos para obtener solo el código de 3 letras (USD, COP, etc.)
        const detectedCurrency = rawText.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
        
        const validCurrencies = ['USD', 'EUR', 'COP'];
        const currentInStorage = localStorage.getItem('store_currency');

        if (validCurrencies.includes(detectedCurrency) && detectedCurrency !== currentInStorage) {
          console.log("🎯 Nueva moneda detectada:", detectedCurrency);
          
          localStorage.setItem('store_currency', detectedCurrency);
          setActiveCurrency(detectedCurrency);
          
          // Notificar a otros componentes (ProductSearch)
          window.dispatchEvent(new Event('currencyChange'));

          // 🔥 LA CLAVE: Solo recargamos si el usuario hizo clic.
          // Si el cambio se detectó al cargar la página, NO recargamos para evitar el bucle.
          if (isManualClick) {
            console.log("🔄 Recarga manual activada por clic");
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        }
      }
    };

    // 3. Escuchamos clics específicos en el switcher
    const handleDocumentClick = (e) => {
      // Verificamos si el clic fue en el selector de YayCurrency
      if (e.target.closest('.yay-currency-switcher') || e.target.closest('.yay-currency-selected-option')) {
        // Damos un tiempo a que el DOM del plugin se actualice antes de leerlo
        setTimeout(() => updateCurrency(true), 350);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    
    // Sincronización inicial silenciosa (sin recarga)
    updateCurrency(false); 

    return () => document.removeEventListener('click', handleDocumentClick);
  }, [activeCurrency]);

  return (
    <div className="react-currency-wrapper" ref={containerRef} style={{ display: 'inline-block', marginLeft: '10px' }}>
    </div>
  );
};