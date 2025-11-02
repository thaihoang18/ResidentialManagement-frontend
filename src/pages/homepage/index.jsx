import React from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Footer from './components/Footer.jsx'
const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col gap-3">  
        <Header />
        <Hero />
        <Footer />
      </div>
  )
}

export default HomePage