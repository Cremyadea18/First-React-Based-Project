import { useEffect, useRef, useState } from 'react';

export const CurrencyMonitor = () => {
  const containerRef = useRef(null);
  const [activeCurrency, setActiveCurrency] = useState(localStorage.getItem('store_currency') || 'USD');

  useEffect(() => {
    // 1. Mover el switcher original de YayCurrency al contenedor de React
    const source = document.getElementById('yay-switcher-source');
    if (source && containerRef.current && !containerRef.current.contains(source.firstElementChild)) {
      containerRef.current.appendChild(source.firstElementChild);
    }

    // 2. Función para detectar y sincronizar la moneda
    const updateCurrency = () => {
      const selectedOptionElement = document.querySelector('.yay-currency-selected-option');
      
      if (selectedOptionElement) {
        const detectedCurrency = selectedOptionElement.innerText.trim().toUpperCase();
        const validCurrencies = ['USD', 'EUR', 'COP'];
        
        // Si la moneda detectada es válida y es DIFERENTE a la actual
        if (validCurrencies.includes(detectedCurrency) && detectedCurrency !== activeCurrency) {
          console.log("🔄 Cambiando moneda a:", detectedCurrency);
          
          // Guardamos en LocalStorage
          localStorage.setItem('store_currency', detectedCurrency);
          setActiveCurrency(detectedCurrency);
          
          // Lanzamos el evento para los componentes de React que ya están montados
          window.dispatchEvent(new Event('currencyChange'));

          // 🔥 LA CLAVE: Recargamos la página para que WordPress y la API se actualicen
          setTimeout(() => {
            window.location.reload();
          }, 100); 
        }
      }
    };

    // 3. Escuchar clics en el documento para captar cuando el usuario elige una moneda
    const handleDocumentClick = () => {
      // Un pequeño delay para dejar que el plugin de YayCurrency actualice el DOM primero
      setTimeout(updateCurrency, 150);
    };

    document.addEventListener('click', handleDocumentClick);
    
    // Ejecución inicial por si acaso
    updateCurrency(); 

    return () => document.removeEventListener('click', handleDocumentClick);
  }, [activeCurrency]);

  return (
    <div className="react-currency-wrapper" ref={containerRef} style={{ display: 'inline-block', marginLeft: '10px' }}>
      {/* Aquí es donde React "teletransporta" el selector de moneda de WordPress */}
    </div>
  );
};