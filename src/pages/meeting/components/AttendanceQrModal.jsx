import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";

export default function AttendanceQrModal({ open, meeting, onClose }) {
  const meetingId = meeting?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const checkinUrl = useMemo(() => {
    if (!meetingId || !token) return "";
    return `${window.location.origin}/checkin?meetingId=${encodeURIComponent(String(meetingId))}&token=${encodeURIComponent(token)}`;
  }, [meetingId, token]);

  useEffect(() => {
    async function loadToken() {
      if (!open || !meetingId) return;
      setLoading(true);
      setError(null);
      setToken(null);
      setQrDataUrl(null);
      try {
        const res = await fetch(`/api/attendance/meeting/${meetingId}/token`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Không thể tạo QR điểm danh");
        const t = data?.data?.token;
        if (!t) throw new Error("Token không hợp lệ");
        setToken(t);
      } catch (e) {
        setError(e.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }

    loadToken();
  }, [open, meetingId]);

  useEffect(() => {
    async function gen() {
      if (!checkinUrl) return;
      try {
        const url = await QRCode.toDataURL(checkinUrl, { margin: 1, width: 320 });
        setQrDataUrl(url);
      } catch (e) {
        setError(e?.message || "Không thể tạo QR");
      }
    }

    gen();
  }, [checkinUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="glass-panel rounded-xl border p-4 w-[calc(100%-2rem)] max-w-lg"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold accent-text">QR điểm danh</h2>
            <div className="text-sm text-muted-foreground">
              {meeting?.title || meeting?.topic || "Cuộc họp"} (ID: {meetingId})
            </div>
          </div>
          <Button aria-label="Đóng" variant="ghost" size="icon" onClick={onClose} className="accent-text close-btn">
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        {error && <div className="text-sm text-destructive mb-2">{error}</div>}
        {loading && <div className="text-center text-muted-foreground py-6">Đang tạo QR...</div>}

        {!loading && qrDataUrl && (
          <div className="flex flex-col items-center gap-3">
            <img src={qrDataUrl} alt="QR điểm danh" className="border rounded-md" />
            <div className="w-full">
              <div className="text-sm mb-1 text-muted-foreground">Link điểm danh</div>
              <Input value={checkinUrl} readOnly />
            </div>
            <Button
              variant="outline"
              className="accent-outline action-btn w-full"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(checkinUrl);
                } catch {
                  // ignore
                }
              }}
            >
              Copy link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
