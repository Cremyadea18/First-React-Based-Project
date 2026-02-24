import { useEffect, useRef, useState } from 'react';

export const CurrencyMonitor = () => {
  const containerRef = useRef(null);
  const [activeCurrency, setActiveCurrency] = useState(localStorage.getItem('store_currency') || 'USD');

  useEffect(() => {
    // 1. TELETRANSPORTAR EL SELECTOR DE FOX
    const source = document.getElementById('fox-switcher-source');
    
    if (source && containerRef.current && source.firstElementChild) {
      if (containerRef.current.childNodes.length === 0) {
        try {
          containerRef.current.appendChild(source.firstElementChild);
          console.log("✅ Selector de FOX movido al Header de React");
        } catch (err) {
          console.warn("❌ No se pudo mover el switcher de moneda FOX:", err);
        }
      }
    }

    // 2. LÓGICA DE DETECCIÓN Y ACTUALIZACIÓN
    const updateCurrency = () => {
      // Buscamos el elemento de FOX que contiene la moneda activa
      const woocsSelect = document.querySelector('.woocs_visitor_view_default select, select.woocs_visitor_view_default, .woocs_visitor_view_default');
      
      let detectedCurrency = '';

      if (woocsSelect) {
        if (woocsSelect.tagName === 'SELECT') {
          detectedCurrency = woocsSelect.value;
        } else {
          detectedCurrency = woocsSelect.getAttribute('data-currency') || '';
        }
      }

      // Respaldo: Intentar leer el texto del informador si lo anterior falla
      if (!detectedCurrency) {
        const informer = document.querySelector('.woocs_current_currency_informer');
        if (informer) detectedCurrency = informer.innerText.trim();
      }

      console.log("🔍 FOX Monitor - Moneda detectada en el DOM:", detectedCurrency);

      const validCurrencies = ['USD', 'EUR', 'COP'];
      const currentInStorage = localStorage.getItem('store_currency');

      if (detectedCurrency && validCurrencies.includes(detectedCurrency)) {
        if (detectedCurrency !== currentInStorage) {
          console.log(`💾 Guardando nueva moneda: ${detectedCurrency} (Antes era: ${currentInStorage})`);
          
          // GUARDADO CRÍTICO: Esto es lo que lee el buscador
          localStorage.setItem('store_currency', detectedCurrency);
          setActiveCurrency(detectedCurrency);
          
          // EVENTO CRÍTICO: Esto despierta a los componentes de React
          window.dispatchEvent(new Event('currencyChange'));
          
          // RECARGA: Necesaria para que FOX asiente la cookie en PHP
          console.log("🔄 Recargando página para sincronizar PHP...");
          window.location.reload();
        }
      }
    };

    // FOX usa eventos de cambio en su select o clics en sus diseños personalizados
    const handleFoxInteraction = (e) => {
      // Si la interacción es dentro de nuestro contenedor de moneda
      if (containerRef.current && containerRef.current.contains(e.target)) {
        // Damos un pequeño delay para que el plugin de FOX termine de cambiar su propio estado
        setTimeout(updateCurrency, 150);
      }
    };

    document.addEventListener('change', handleFoxInteraction);
    document.addEventListener('click', handleFoxInteraction);

    // Ejecución inicial por si el plugin cargó después que React
    const initialCheck = setTimeout(updateCurrency, 1000);

    return () => {
      document.removeEventListener('change', handleFoxInteraction);
      document.removeEventListener('click', handleFoxInteraction);
      clearTimeout(initialCheck);
    };
  }, []);

  return (
    <div 
      className="react-currency-wrapper fox-monitor" 
      ref={containerRef} 
      style={{ 
        display: 'inline-block', 
        marginLeft: '10px', 
        minWidth: '80px',
        minHeight: '30px' 
      }}
    >
      {/* El switcher de FOX se inyectará aquí de forma automática */}
    </div>
  );
};