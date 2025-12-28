import React from 'react'

function Header() {
  return (
    <header className="bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 text-white py-8 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>
      <div className="container mx-auto text-center relative z-10 px-4">
        <h1 className="text-5xl font-bold tracking-tight mb-3 drop-shadow-lg">HỆ THỐNG QUẢN LÝ DÂN CƯ</h1>
        <p className="text-teal-50 text-lg font-regular drop-shadow-md">PHƯỜNG LA KHÊ</p>
      </div>
    </header>
  )
}

export default Header