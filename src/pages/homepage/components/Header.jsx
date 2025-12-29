import React from 'react'

function Header() {
  return (
    <header className="page-header header-gradient border border-border/60 mx-6 mt-6 rounded-2xl shadow-lg px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>
      <div className="text-center relative z-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-sm accent-text">HỆ THỐNG QUẢN LÝ DÂN CƯ</h1>
        <p className="mt-2 text-lg text-muted-foreground">PHƯỜNG LA KHÊ</p>
      </div>
    </header>
  )
}

export default Header