import React from 'react'
import './App.css'
import './MediaQueries.css'
import miImagenabout from "./assets/asset.svg"

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

    </> 
  )
}

export default App