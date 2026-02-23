import { useEffect, useRef, useState } from 'react';

export const CurrencyMonitor = () => {
  const containerRef = useRef(null);
  const [activeCurrency, setActiveCurrency] = useState(localStorage.getItem('store_currency') || 'USD');

  useEffect(() => {
   
    const source = document.getElementById('yay-switcher-source');
    if (source && containerRef.current && !containerRef.current.contains(source.firstElementChild)) {
      containerRef.current.appendChild(source.firstElementChild);
    }

   
    const updateCurrency = () => {
      const selectedOptionElement = document.querySelector('.yay-currency-selected-option');
      
      if (selectedOptionElement) {
        const detectedCurrency = selectedOptionElement.innerText.trim().toUpperCase();
        const validCurrencies = ['USD', 'EUR', 'COP'];
        
        if (validCurrencies.includes(detectedCurrency) && detectedCurrency !== activeCurrency) {
          localStorage.setItem('store_currency', detectedCurrency);
          setActiveCurrency(detectedCurrency);
          window.dispatchEvent(new Event('currencyChange'));
          console.log("✅ Sincronizado:", detectedCurrency);
        }
      }
    };

   
    const handleDocumentClick = () => {
      
      setTimeout(updateCurrency, 100);
    };

    document.addEventListener('click', handleDocumentClick);
    updateCurrency(); 

    return () => document.removeEventListener('click', handleDocumentClick);
  }, [activeCurrency]);

  return (
    <div className="react-currency-wrapper" ref={containerRef} style={{ display: 'inline-block', marginLeft: '10px' }}>
     
    </div>
  );
};