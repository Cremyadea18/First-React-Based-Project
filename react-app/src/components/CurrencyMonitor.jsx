import { useEffect, useRef, useState } from 'react';

export const CurrencyMonitor = () => {
  const containerRef = useRef(null);
  const [activeCurrency, setActiveCurrency] = useState(localStorage.getItem('store_currency') || 'USD');

  useEffect(() => {
    // 1. TELETRANSPORTAR EL SELECTOR DE FOX
    // FOX suele generar un contenedor con la clase .woocs_visitor_view_default o similar
    // Buscamos el origen que viene del PHP (asegúrate de que en tu PHP el ID sea 'fox-switcher-source')
    const source = document.getElementById('fox-switcher-source');
    
    if (source && containerRef.current && source.firstElementChild) {
      if (containerRef.current.childNodes.length === 0) {
        try {
          containerRef.current.appendChild(source.firstElementChild);
        } catch (err) {
          console.warn("No se pudo mover el switcher de moneda FOX:", err);
        }
      }
    }

    // 2. DETECTAR EL CAMBIO DE MONEDA
    const updateCurrency = () => {
      // FOX guarda la moneda seleccionada en un atributo o en el valor del select
      // Buscamos el select que inyecta FOX
      const woocsSelect = document.querySelector('.woocs_visitor_view_default select, .woocs_visitor_view_default');
      
      let detectedCurrency = '';

      if (woocsSelect) {
        // Si es un <select> estándar
        if (woocsSelect.tagName === 'SELECT') {
          detectedCurrency = woocsSelect.value;
        } else {
          // Si es la vista personalizada de FOX, suele tener un data-currency
          detectedCurrency = woocsSelect.getAttribute('data-currency') || '';
        }
      }

      // Si no detectamos nada arriba, intentamos por la clase 'woocs_current_currency_informer'
      if (!detectedCurrency) {
        const informer = document.querySelector('.woocs_current_currency_informer');
        if (informer) detectedCurrency = informer.innerText.trim();
      }

      const validCurrencies = ['USD', 'EUR', 'COP'];
      const currentInStorage = localStorage.getItem('store_currency');

      if (detectedCurrency && validCurrencies.includes(detectedCurrency)) {
        if (detectedCurrency !== currentInStorage) {
          localStorage.setItem('store_currency', detectedCurrency);
          setActiveCurrency(detectedCurrency);
          // Avisamos a los demás componentes (ProductSingleView, buscador, etc)
          window.dispatchEvent(new Event('currencyChange'));
          
          // Recargamos para que el backend de FOX procese el cambio de sesión
          window.location.reload();
        }
      }
    };

    // FOX usa eventos de cambio en su select
    const handleFoxChange = (e) => {
      // Si el clic o cambio ocurre dentro de nuestro contenedor
      if (containerRef.current && containerRef.current.contains(e.target)) {
        setTimeout(updateCurrency, 100);
      }
    };

    document.addEventListener('change', handleFoxChange);
    document.addEventListener('click', handleFoxChange);

    return () => {
      document.removeEventListener('change', handleFoxChange);
      document.removeEventListener('click', handleFoxChange);
    };
  }, []);

  return (
    <div 
      className="react-currency-wrapper fox-monitor" 
      ref={containerRef} 
      style={{ display: 'inline-block', marginLeft: '10px', minWidth: '80px' }}
    >
      {/* El switcher de FOX se inyectará aquí */}
    </div>
  );
};