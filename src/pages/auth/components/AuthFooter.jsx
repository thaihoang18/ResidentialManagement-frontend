import React from 'react'

export default function AuthFooter() {
  return (
    <div className="mt-6 text-center text-xs text-muted-foreground">
      <span>Phiên bản thử nghiệm • © {new Date().getFullYear()}</span>
    </div>
  )
}
