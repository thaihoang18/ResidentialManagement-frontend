import React from 'react'
import { Home } from "lucide-react"

function Header() {
  return (
    <header className="page-header glass-header header-gradient border border-border/60 mx-6 mt-6 lg:mt-4 rounded-2xl shadow-lg px-6 py-8 lg:py-5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>
      <div className="text-center relative z-10 px-4">
        <div className="flex items-center justify-center gap-3">
          <Home className="size-8 text-[color:var(--primary-dark)]" />
          <h1 className="text-4xl md:text-5xl lg:text-4xl font-bold tracking-tight drop-shadow-sm accent-text">HỆ THỐNG QUẢN LÝ DÂN CƯ</h1>
        </div>
        <p className="mt-2 lg:mt-1 text-lg lg:text-base text-muted-foreground">PHƯỜNG LA KHÊ</p>
      </div>
    </header>
  )
}

export default Header