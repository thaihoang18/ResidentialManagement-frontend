import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function getParam(name) {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function formatMeetingTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function CheckinPage() {
  const meetingId = useMemo(() => getParam("meetingId"), []);
  const token = useMemo(() => getParam("token"), []);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [meeting, setMeeting] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [search, setSearch] = useState("");

  const filteredHouseholds = useMemo(() => {
    const q = (search || "").trim().toLocaleLowerCase("vi");
    if (!q) return households;
    return households.filter((h) => {
      const address = [h.house_number, h.street].filter(Boolean).join(" - ");
      const haystack = `${h.household_code || ""} ${address} ${h.head_name || ""}`
        .toLocaleLowerCase("vi");
      return haystack.includes(q);
    });
  }, [households, search]);

  const selectedHousehold = useMemo(() => {
    if (!selectedHouseholdId) return null;
    const idNum = Number(selectedHouseholdId);
    return households.find((h) => Number(h.household_id) === idNum) || null;
  }, [households, selectedHouseholdId]);

  useEffect(() => {
    async function load() {
      if (!meetingId || !token) {
        setError("Thiếu thông tin QR (meetingId/token)");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/attendance/checkin/${meetingId}?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Không thể tải thông tin điểm danh");
        setMeeting(data?.data?.meeting || null);
        const list = Array.isArray(data?.data?.households) ? data.data.households : [];
        setHouseholds(list);
      } catch (e) {
        setError(e.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [meetingId, token]);

  async function submit() {
    if (!meetingId || !token) return;
    if (!selectedHouseholdId) {
      setError("Vui lòng chọn hộ gia đình");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/attendance/checkin/${meetingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, household_id: Number(selectedHouseholdId) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Không thể xác nhận tham gia");
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Lỗi gửi dữ liệu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="border-b">
          <CardTitle className="accent-text">Điểm danh cuộc họp</CardTitle>
          <CardDescription>
            Quét QR và chọn hộ gia đình đại diện để xác nhận tham gia.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {meeting && (
            <div className="text-sm text-muted-foreground">
              <div><span className="font-medium text-foreground">Chủ đề:</span> {meeting.topic}</div>
              <div><span className="font-medium text-foreground">Thời gian:</span> {formatMeetingTime(meeting.time)}</div>
              <div><span className="font-medium text-foreground">Địa điểm:</span> {meeting.location}</div>
            </div>
          )}

          {loading && <div className="text-center text-muted-foreground py-6">Đang tải...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !success && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Tìm & chọn hộ gia đình</label>
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedHouseholdId("");
                  }}
                  placeholder="Nhập mã hộ (HK001), địa chỉ, hoặc tên chủ hộ..."
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {filteredHouseholds.length}/{households.length} hộ phù hợp
                </div>
              </div>

              <div className="border rounded-md overflow-hidden max-h-56 overflow-y-auto">
                {filteredHouseholds.slice(0, 30).map((h) => {
                  const address = [h.house_number, h.street].filter(Boolean).join(" - ") || "-";
                  const head = h.head_name ? `Chủ hộ: ${h.head_name}` : "Chủ hộ: -";
                  const isSelected = String(h.household_id) === String(selectedHouseholdId);
                  return (
                    <button
                      key={h.household_id}
                      type="button"
                      className={
                        isSelected
                          ? "w-full text-left px-3 py-2 bg-muted"
                          : "w-full text-left px-3 py-2 hover:bg-muted/50"
                      }
                      onClick={() => {
                        setSelectedHouseholdId(String(h.household_id));
                      }}
                    >
                      <div className="text-sm font-medium">
                        {h.household_code} · {address}
                      </div>
                      <div className="text-xs text-muted-foreground">{head}</div>
                    </button>
                  );
                })}
                {filteredHouseholds.length === 0 && (
                  <div className="px-3 py-4 text-sm text-muted-foreground">Không tìm thấy hộ phù hợp.</div>
                )}
              </div>

              {selectedHousehold && (
                <div className="text-sm text-foreground">
                  Đã chọn: <span className="font-medium">{selectedHousehold.household_code}</span>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="text-center py-6">
              <div className="text-base font-medium accent-text">Đã xác nhận tham gia!</div>
              <div className="text-sm text-muted-foreground mt-1">Bạn có thể đóng trang này.</div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t">
          <Button
            className="accent-btn action-btn w-full"
            onClick={submit}
            disabled={submitting || !meetingId || !token || success}
          >
            {submitting ? "Đang xác nhận..." : "Xác nhận tham gia"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
