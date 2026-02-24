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
          console.log("✅ Selector de FOX movido al Header");
        } catch (err) {
          console.warn("❌ Error al mover switcher:", err);
        }
      }
    }

    // 2. FUNCIÓN DE DETECCIÓN MULTINIVEL
    const updateCurrency = () => {
      let detectedCurrency = '';

      // Nivel 1: Variable Global inyectada desde functions.php (La más precisa)
      if (window.foxConfig && window.foxConfig.currentCurrency) {
        detectedCurrency = window.foxConfig.currentCurrency;
        console.log("📡 FOX Monitor: Detectado vía PHP Global ->", detectedCurrency);
      } 

      // Nivel 2: Cookie nativa de FOX (Si falla la global)
      if (!detectedCurrency) {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.trim().startsWith('woocs_current_currency='))
          ?.split('=')[1];
        if (cookieValue) {
          detectedCurrency = cookieValue;
          console.log("🍪 FOX Monitor: Detectado vía Cookie ->", detectedCurrency);
        }
      }

      // Nivel 3: Lectura del DOM (Como respaldo visual)
      if (!detectedCurrency) {
        const woocsSelect = document.querySelector('.woocs_visitor_view_default select, select.woocs_visitor_view_default, .woocs_visitor_view_default');
        if (woocsSelect) {
          detectedCurrency = woocsSelect.tagName === 'SELECT' ? woocsSelect.value : woocsSelect.getAttribute('data-currency');
        }
        console.log("🔍 FOX Monitor: Detectado vía DOM ->", detectedCurrency);
      }

      const validCurrencies = ['USD', 'EUR', 'COP'];
      const currentInStorage = localStorage.getItem('store_currency');

      // 3. ACTUALIZACIÓN Y SINCRONIZACIÓN
      if (detectedCurrency && validCurrencies.includes(detectedCurrency)) {
        if (detectedCurrency !== currentInStorage) {
          console.log(`💾 Guardando en Storage: ${detectedCurrency}`);
          
          localStorage.setItem('store_currency', detectedCurrency);
          setActiveCurrency(detectedCurrency);
          
          // Despertar al ProductSearch
          window.dispatchEvent(new Event('currencyChange'));
          
          // Solo recargamos si el cambio viene de una interacción real del usuario
          // para evitar bucles infinitos en la carga inicial
        }
      }
    };

    // 4. MANEJO DE INTERACCIONES
    const handleFoxInteraction = (e) => {
      // Si el usuario hace clic o cambia algo en el selector de monedas
      if (containerRef.current && containerRef.current.contains(e.target)) {
        console.log("🖱️ Interacción detectada en el selector...");
        // Damos tiempo a FOX para que actualice sus cookies/estado
        setTimeout(() => {
            updateCurrency();
            // Forzamos recarga tras interacción para que el buscador haga fetch nuevo
            window.location.reload();
        }, 150);
      }
    };

    document.addEventListener('change', handleFoxInteraction);
    document.addEventListener('click', handleFoxInteraction);

    // Chequeo inicial (delay para asegurar que PHP/Cookies estén listos)
    const initialCheck = setTimeout(updateCurrency, 500);

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
      {/* El switcher de FOX se inyectará aquí */}
    </div>
  );
};