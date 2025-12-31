import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { login } from '@/lib/auth'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import AuthFooter from './AuthFooter.jsx'
import { runAppTransition } from '@/lib/transition'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.ok) {
      toast.success('Đăng nhập thành công')
      await runAppTransition(() => {
        navigate('/', { replace: true })
      })
    } else {
      toast.error(res.error || 'Đăng nhập thất bại')
    }
  }

  return (
    <div className="glass-panel rounded-xl p-8 border">
      <div className="mb-6 flex flex-col items-start">
        <div className="text-2xl font-bold text-foreground">Đăng nhập</div>
        <div className="text-sm text-muted-foreground">Nhập email và mật khẩu của bạn để bắt đầu</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Mật khẩu</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center justify-start">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" />
            <span className="text-muted-foreground">Ghi nhớ đăng nhập</span>
          </label>
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </div>
      </form>

      <AuthFooter />
    </div>
  )
}
