import React from "react";
import { Button } from "@/components/ui/button";

export default function ResidentHeader({ onCreate }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">Danh sách cư dân</h2>
      <div>
        <Button onClick={onCreate}>Thêm cư dân</Button>
      </div>
    </div>
  );
}
