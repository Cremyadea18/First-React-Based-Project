import { useEffect, useRef, useState } from 'react';

export const CurrencyMonitor = () => {
  const containerRef = useRef(null);
  const [activeCurrency, setActiveCurrency] = useState('USD');

  useEffect(() => {
    
    const source = document.getElementById('yay-switcher-source');
    if (source && containerRef.current) {
      containerRef.current.appendChild(source.firstElementChild);
      source.remove(); 
    }

    
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const updateCurrency = () => {
      
      const currency = getCookie('yay_currency') || getCookie('yaycurrency_currency') || 'USD';
      
      if (currency !== activeCurrency) {
        localStorage.setItem('store_currency', currency);
        setActiveCurrency(currency);
        console.log("💰 Nueva moneda detectada:", currency);
        
        
        window.dispatchEvent(new Event('currencyChange'));
      }
    };

   
    document.addEventListener('click', updateCurrency);
    updateCurrency(); 

    return () => document.removeEventListener('click', updateCurrency);
  }, [activeCurrency]);

  return (
    <div className="react-currency-wrapper" ref={containerRef}>
      {/* Aquí es donde "aterrizará" el switcher de WordPress */}
    </div>
  );
};