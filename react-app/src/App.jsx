import React from 'react'
import './App.css'
import './MediaQueries.css'
import miImagenabout from "./assets/asset.svg"
import ProductSearch from './components/ProductSearch.jsx' 


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
  <button className="btn-primary animate">Start free trial</button>
)

const BtnSecondary = () => (
  <button className="btn-secondary animate">See how it works</button> 
)

const AboutTittle = () => (
  <h2 className='about__title animate '>Simplify Complex Business Operations with AI</h2>
)

const AboutText = () => (
  <p className='about_text animate'>
    Intelligent automation helps you eliminate repetitive task, reduce constly errors and optimize every step of your workflow for greater accuracy and efficency.
  </p>
)

const ProductSearchTittle = () => (
  <h2 className='about__title'>Our Products</h2>
)


export const Header = () => (
  <header id="main-site-header">
    <nav className="nav-container">
      <div className="logo">
        <a href="https://reactappapplication.online/#home">TECH<span>AURA</span></a>
      </div>

      <ul className="nav-links">
        
        <li><a href="https://reactappapplication.online/#home">Home</a></li>
        <li><a href="#about-us">About Us</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="#benefits">Benefits</a></li>
      </ul>
    </nav>
  </header>
);



export const Footer = () => {
  // --- LOG DE DIAGNÓSTICO ---
  console.log("🛠️ React: El componente Footer se ha ejecutado correctamente.");

  return (
    <footer className="footer_main_container">
      <div className="footer_content">
        <div className="footer_column">
          <h3 className="footer_logo">AI Solutions</h3>
          <p className="footer_description">
            Empowering businesses with intelligent tools for a scalable future.
          </p>
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
};




export const Hero = () => (
  <section className="hero">
    <div className='hero__content'>
      <MiTitulo />
      <div className='hero_content_container-text'>
        <MiTexto />
      </div>
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

export const ProductsSection = () => (
  <section className='main_container_structure'>
    <div className='main_container_structure_content'>
      <div className='about_content_one'>
        <ProductSearchTittle />
      </div>
      <div className='filter_section_search'> 
        <ProductSearch />
      </div>  
    </div>
  </section>
)


function App() {
  return (
    <> 
      <Hero />
      <About />
      <ProductsSection />
    </> 
  )
}

export default App