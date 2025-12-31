import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePasswordCard({
  currentPassword,
  onCurrentPasswordChange,
  nextPassword,
  onNextPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  loading,
  saving,
  onChangePassword,
}) {
  return (
    <Card className="glass-panel border overflow-hidden relative">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{ backgroundImage: "var(--primary-gradient)" }}
      />
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight text-[color:var(--primary-dark)]">
          Đổi mật khẩu
        </CardTitle>
      </CardHeader>
      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          onChangePassword();
        }}
      >
        <CardContent className="space-y-5">
          {/* Decoy fields to reduce aggressive password-manager autofill */}
          <input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} readOnly value="rm" />
          <input type="password" name="password" autoComplete="new-password" className="hidden" tabIndex={-1} readOnly value="rm" />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <div className="text-base font-medium text-foreground/90">Mật khẩu hiện tại</div>
              <Input
                type="password"
                name="rm_current_password"
                autoComplete="off"
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>

            <div className="space-y-1">
              <div className="text-base font-medium text-foreground/90">Mật khẩu mới</div>
              <Input
                type="password"
                name="rm_new_password"
                autoComplete="new-password"
                value={nextPassword}
                onChange={(e) => onNextPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div className="space-y-1">
              <div className="text-base font-medium text-foreground/90">Xác nhận mật khẩu mới</div>
              <Input
                type="password"
                name="rm_confirm_password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end pt-5">
          <Button
            type="submit"
            variant="default"
            className="action-btn accent-btn px-5 py-2.5 rounded-xl font-semibold text-base"
            disabled={saving || loading}
          >
            {saving ? "Đang đổi..." : "Đổi mật khẩu"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
