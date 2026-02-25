import React, { useState, useEffect } from 'react' // Añadimos hooks
import './App.css'
import './MediaQueries.css'
import miImagenabout from "./assets/asset.svg"
import ProductSearch from './components/ProductSearch.jsx' 
import { CartIcon } from './components/CartIcon.jsx'
import { ProductSingleView } from './components/ProductSingleView';
import { CurrencyMonitor } from './components/CurrencyMonitor.jsx'

// Componentes auxiliares
const MiTitulo = () => (
  <h1 className="hero__title animate"> 
    <span className='hero_span animate'>AI-Powered Solutions </span>for <br /> 
    Modern <span className='hero_span animate'>Businesses</span>
  </h1>
)

const MiTexto = () => (
  <p className="hero__text animate">
    Transform the way you work with inteligent tools built to optimize operations elevate efficency and unlock scalable growth 
  </p>
)

const BtnPrimary = () => (
  <a href="https://reactappapplication.online/#contact" className="btn-primary animate" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Start free trial</a>
);

const BtnSecondary = () => (
  <a href="https://reactappapplication.online/#benefits" className="btn-secondary animate" style={{ textDecoration: 'none', display: 'inline-block' }}>See how it works</a>
);

const AboutTittle = () => <h2 className='about__title animate '>Simplify Complex Business Operations with AI</h2>
const AboutText = () => <p className='about_text animate'>Intelligent automation helps you eliminate repetitive task, reduce constly errors and optimize every step of your workflow for greater accuracy and efficency.</p>
const ProductSearchTittle = () => <h2 className='about__title'>Our Products</h2>

// HEADER: Sin PayPalScriptProvider para evitar errores de scope
export const Header = () => (
  <header id="main-site-header">
    <nav className="nav-container">
      <div className="logo">
        <a href="https://reactappapplication.online/#home">TECH<span>AURA</span></a>
      </div>
      <div>
   <ul className="nav-links">
        <li><a href="https://reactappapplication.online/#home">Home</a></li>
        <li><a href="#about-us">About Us</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="#benefits">Benefits</a></li>
      </ul>
      </div>
      
      <div className='nav-container-elements'>
      <CartIcon />
      </div>
     
    </nav>
  </header>
);

export const Footer = () => (
  <footer className="footer_main_container">
    <div className="footer_content">
      <div className="footer_column">
        <h3 className="footer_logo">AI Solutions</h3>
        <p className="footer_description">Empowering businesses with intelligent tools for a scalable future.</p>
      </div>
      <div className="footer_column">
        <h4>Product</h4>
        <ul className="footer_links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
      </div>
      <div className="footer_column">
        <h4>Legal</h4>
        <ul className="footer_links">
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div className="footer_bottom">
      <p>&copy; {new Date().getFullYear()} AI Solutions. All rights reserved.</p>
    </div>
  </footer>
);

export const Hero = () => (
  <section className="hero">
    <div className='hero__content'>
      <MiTitulo />
      <div className='hero_content_container-text'><MiTexto /></div>
      <div className='hero__content_buttons'>
        <BtnPrimary />
        <BtnSecondary />
      </div>
    </div>
  </section>
)

export const About = () => (
  <section className='about'> 
    <div className='about_content'>
      <div className='about_content_one'>
        <AboutTittle />
        <AboutText />
      </div>
    </div>
  </section>
)

// SECCIÓN DE PRODUCTOS: Ahora recibe la key para refrescarse
export const ProductsSection = ({ currentCurrency }) => (
  <section className='main_container_structure'>
    <div className='main_container_structure_content'>
      <div className='about_content_one'>
        <ProductSearchTittle />
      </div>
      <div className='filter_section_search'> 
        {/* La KEY aquí es vital para que React reinicie el buscador */}
        <ProductSearch key={currentCurrency} />
      </div>  
    </div>
  </section>
)

export { ProductSingleView };

function App() {
  // 1. Creamos un estado para la moneda en la raíz de la App
  const [currency, setCurrency] = useState(localStorage.getItem('store_currency') || 'USD');

  // 2. Escuchamos el evento que lanza el CurrencyMonitor
  useEffect(() => {
    const handleSync = () => {
      const updatedCurr = localStorage.getItem('store_currency') || 'USD';
      setCurrency(updatedCurr);
    };

    window.addEventListener('currencyChange', handleSync);
    return () => window.removeEventListener('currencyChange', handleSync);
  }, []);

  return (
    <> 
      <Hero />
      <About />
      {/* 3. Pasamos la moneda como prop para usarla de Key */}
      <ProductsSection currentCurrency={currency} />
    </> 
  )
}

export default App