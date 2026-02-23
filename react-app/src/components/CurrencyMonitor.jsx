import { useEffect, useRef, useState } from 'react';

export const CurrencyMonitor = () => {
  const containerRef = useRef(null);
  const [activeCurrency, setActiveCurrency] = useState(localStorage.getItem('store_currency') || 'USD');

  useEffect(() => {
    // 1. Teletransportar el switcher de YayCurrency
    const source = document.getElementById('yay-switcher-source');
    if (source && containerRef.current && !containerRef.current.contains(source.firstElementChild)) {
      containerRef.current.appendChild(source.firstElementChild);
    }

    const updateCurrency = () => {
      const selectedOptionElement = document.querySelector('.yay-currency-selected-option');
      
      if (selectedOptionElement) {
        // 🛠️ LIMPIEZA CLAVE: 
        // Tomamos el texto, quitamos espacios y nos quedamos SOLO con las últimas 3 letras
        // Esto evita que se guarde "USD EUR COP" si el DOM está sucio.
        const rawText = selectedOptionElement.innerText.trim();
        const detectedCurrency = rawText.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
        
        const validCurrencies = ['USD', 'EUR', 'COP'];
        
        if (validCurrencies.includes(detectedCurrency) && detectedCurrency !== activeCurrency) {
          console.log("🎯 Moneda real detectada:", detectedCurrency);
          
          localStorage.setItem('store_currency', detectedCurrency);
          setActiveCurrency(detectedCurrency);
          
          // Avisar a ProductSearch
          window.dispatchEvent(new Event('currencyChange'));

          // 🔄 RECARGA: Necesaria para que la sesión de PHP de WooCommerce se actualice
          setTimeout(() => {
            window.location.reload();
          }, 150);
        }
      }
    };

    const handleDocumentClick = () => {
      // Damos tiempo a que el plugin de WP cambie el DOM antes de leerlo
      setTimeout(updateCurrency, 200);
    };

    document.addEventListener('click', handleDocumentClick);
    updateCurrency(); 

    return () => document.removeEventListener('click', handleDocumentClick);
  }, [activeCurrency]);

  return (
    <div className="react-currency-wrapper" ref={containerRef} style={{ display: 'inline-block', marginLeft: '10px' }}>
      {/* El switcher de WP aparecerá aquí */}
    </div>
  );
};