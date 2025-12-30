import React from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md rounded-2xl border p-8 text-center">
        <div className="text-6xl font-bold tracking-tight text-foreground">404</div>
        <div className="mt-2 text-xl font-semibold text-foreground">Trang không tìm thấy</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại.
        </div>

        <div className="mt-6 flex items-center justify-center">
          <Button asChild className="accent-btn action-btn">
            <Link to="/">Quay về trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;