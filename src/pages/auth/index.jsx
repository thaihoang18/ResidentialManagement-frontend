import React from 'react'
import AuthHero from './components/AuthHero.jsx'
import LoginForm from './components/LoginForm.jsx'

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <AuthHero />
        <LoginForm />
      </div>
    </div>
  )
}

export default AuthPage
