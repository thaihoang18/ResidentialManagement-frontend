import React from 'react'

export default function AuthHero() {
  return (
    <div className="hidden md:flex flex-col items-start justify-center gap-6 p-8 rounded-lg login-hero text-white shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-white/30 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="1.2" />
            <path d="M7 12h10M7 16h6" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="text-lg font-semibold">Quản lý khu dân cư</div>
          <div className="text-sm opacity-95">Phường La Khê</div>
        </div>
      </div>

      <p className="max-w-xs text-sm opacity-95">
        Vui lòng đăng nhập để tiếp tục truy cập các chức năng quản lý cư dân, hộ khẩu, và lịch họp.
      </p>
      <div className="mt-2 text-xs opacity-95">Nếu chưa có tài khoản, vui lòng liên hệ quản trị hệ thống để được <span className="font-extrabold">cấp quyền</span>.</div>
    </div>
  )
}
