import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Đăng nhập thành công");
      navigate("/", { replace: true });
    } else {
      toast.error(res.error || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-white px-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:flex flex-col items-start justify-center gap-6 p-8 rounded-lg login-hero text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-white/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="1.2" />
                <path d="M7 12h10M7 16h6" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold">Quản lý chung cư</div>
                <div className="text-sm opacity-95">Phường La Khê</div>
            </div>
          </div>

          <p className="max-w-xs text-sm opacity-95">
            Vui lòng đăng nhập để tiếp tục truy cập các chức năng quản lý cư dân, hộ khẩu, và lịch họp.
          </p>
          <div className="mt-2 text-xs opacity-95">Nếu chưa có tài khoản, vui lòng liên hệ quản trị hệ thống để được <span className="font-extrabold">cấp quyền</span>.</div>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-lg border">
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
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <span>Phiên bản thử nghiệm • &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
