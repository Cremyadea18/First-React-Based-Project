import { useEffect, useRef, useState } from 'react';

export const CurrencyMonitor = () => {
  const containerRef = useRef(null);
  const [activeCurrency, setActiveCurrency] = useState(localStorage.getItem('store_currency') || 'USD');

  useEffect(() => {
    // 1. TELETRANSPORTAR CON SEGURIDAD (Aquí estaba el error)
    const source = document.getElementById('yay-switcher-source');
    
    // Verificamos: 1. Que exista el origen, 2. Que exista el destino (ref), 
    // 3. Que el origen tenga un hijo para mover.
    if (source && containerRef.current && source.firstElementChild) {
      // Solo movemos si el contenedor de React está vacío
      if (containerRef.current.childNodes.length === 0) {
        try {
          containerRef.current.appendChild(source.firstElementChild);
        } catch (err) {
          console.warn("No se pudo mover el switcher de moneda:", err);
        }
      }
    }

    const updateCurrency = (isManualClick = false) => {
      const selectedOptionElement = document.querySelector('.yay-currency-selected-option');
      
      if (selectedOptionElement) {
        const rawText = selectedOptionElement.innerText.trim();
        const detectedCurrency = rawText.replace(/[^a-zA-Z]/g, '').slice(-3).toUpperCase();
        
        const validCurrencies = ['USD', 'EUR', 'COP'];
        const currentInStorage = localStorage.getItem('store_currency');

        if (validCurrencies.includes(detectedCurrency) && detectedCurrency !== currentInStorage) {
          localStorage.setItem('store_currency', detectedCurrency);
          setActiveCurrency(detectedCurrency);
          window.dispatchEvent(new Event('currencyChange'));

          if (isManualClick) {
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        }
      }
    };

    const handleDocumentClick = (e) => {
      // Usamos una verificación más segura para el clic
      if (e.target && (e.target.closest('.yay-currency-switcher') || e.target.closest('.yay-currency-selected-option'))) {
        setTimeout(() => updateCurrency(true), 350);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    updateCurrency(false); 

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [activeCurrency]);

  return (
    <div 
      className="react-currency-wrapper" 
      ref={containerRef} 
      style={{ display: 'inline-block', marginLeft: '10px', minWidth: '50px', minHeight: '20px' }}
    >
      {/* El switcher se inyectará aquí de forma segura */}
    </div>
  );
};