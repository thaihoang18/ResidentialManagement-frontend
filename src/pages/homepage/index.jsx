import React from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import StatisticsChart from './components/StatisticsChart.jsx'

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col gap-3 lg:h-screen lg:overflow-hidden">
      <Header />
      <StatisticsChart />
      <Footer />
    </div>
  )
}

export default HomePage