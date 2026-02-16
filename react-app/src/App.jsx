import React from 'react'
import './App.css'
import './MediaQueries.css'
import miImagenabout from "./assets/asset.svg"
import ProductSearch from './components/ProductSearch' 

const MiTitulo = () => (
  <h1 className="hero__title animate"> <span className='hero_span animate'>AI-Powered Solutions </span>for <br /> Modern <span className='hero_span animate'>Businesses</span></h1>
)
const MiTexto = () => (
  <p className="hero__text animate">Transform the way you work with inteligent tools built to optimize operations elevate efficency and unlock scalable growth </p>
)
const BtnPrimary = () => (
  <button className="btn-primary animate">Start free trial</button>
)
const BtnSecondary = () => (
<button className="btn-secondary animate">See how it works</button> )

const AboutTittle = () => (
  <h2 className='about__title animate '>Simplify Complex Business Operations with AI</h2>
)

const AboutText = () => (
<p className='about_text animate'>Intelligent automation helps you eliminate repetitive task, reduce constly errors and optimize every step of your workflow for greater accuracy and efficency.</p>
)

const PruebaRepo = () => (
<h1 className='hero_text'> Aqui estamos probando que tan rapido se conecta todo nuestro proyecto personal</h1>
)

import ProductSearch from './components/ProductSearch'

function App() {
  return (
    <> 
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

      <section className='about'> 
        <div className='about_content'>
          <div className='about_content_one'>
            <AboutTittle />
            <AboutText />
          </div>
          <div className='about_content_two'>
            <div>
              <div></div>
            </div>
            <div>
              <img src="{miImagenabout}" alt="Tecnologi app image" />
            </div>
          </div>
        </div>
      </section>

      {/* Sección del buscador para que le agregues tus clases de CSS */}
      <section className='products_search'>
        <div className='products_search_container'>
           <ProductSearch />
        </div>
      </section>

    </> 
  )
}

export default App