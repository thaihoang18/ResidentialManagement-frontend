import React from 'react'

function Hero() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-16 border-b border-slate-200">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-5xl font-bold text-slate-900 mb-8">Chào mừng đến với hệ thống quản lý</h2>
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <button className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors shadow-md">
            Bắt đầu ngay
          </button>
          <button className="px-8 py-3 bg-white hover:bg-slate-50 text-teal-600 rounded-lg font-semibold border-2 border-teal-500 transition-colors">
            Tìm hiểu thêm
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero