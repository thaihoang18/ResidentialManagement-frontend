import React, { useState, useMemo, useEffect } from "react";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import DayDetailModal from "./components/DayDetailModal";
import EventFormModal from "./components/EventFormModal";
import AttendanceModal from "./components/AttendanceModal";
import AttendanceQrModal from "./components/AttendanceQrModal";

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

function normalizeHexColor(input, fallback = "#32f1cd") {
    if (input === undefined || input === null) return fallback;
    const raw = String(input).trim();
    if (!raw) return fallback;

    // already a hex with '#'
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) return raw;

    // hex without '#'
    if (/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) return `#${raw}`;

    return fallback;
}

function generateCalendar(year, month) {
    // month: 0-11
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();

    const startDay = first.getDay(); // 0 Sun - 6 Sat
    const weeks = [];
    let current = 1 - startDay;

    for (let w = 0; w < 6; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            const day = new Date(year, month, current);
            week.push(day);
            current++;
        }
        weeks.push(week);
    }

    return weeks;
}

function Meeting() {
    const today = new Date();
    const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // helper: map backend meeting object (with ISO time) to frontend event (local date/time)
    function mapMeetingToEvent(meeting) {
        const id = meeting.id;
        const title = meeting.topic || meeting.title || "";
        const timeStr = meeting.time || meeting.datetime || meeting.date || "";
        let date = "";
        let time = "";
        if (timeStr) {
            const dt = new Date(timeStr);
            // format local YYYY-MM-DD and HH:MM
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, "0");
            const d = String(dt.getDate()).padStart(2, "0");
            date = `${y}-${m}-${d}`;
            const hh = String(dt.getHours()).padStart(2, "0");
            const mm = String(dt.getMinutes()).padStart(2, "0");
            time = `${hh}:${mm}`;
        }
        return {
            id,
            title,
            date,
            time,
            location: meeting.location || "",
            description: meeting.content || meeting.description || "",
            tasks: meeting.tasks || [],
            creator_id: meeting.creator_id,
            color: normalizeHexColor(meeting.color, "#32f1cd"),
        };
    }

    // helper: load meetings from backend and normalize to frontend events
    async function loadMeetings() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/meetings");
            if (!res.ok) throw new Error("Lỗi tải dữ liệu cuộc họp");
            const data = await res.json();
            const arr = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
            setEvents(arr.map(mapMeetingToEvent));
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    // Fetch meetings from backend (use loadMeetings)
    useEffect(() => {
        loadMeetings();
    }, []);

    const weeks = useMemo(() => generateCalendar(view.year, view.month), [view]);

    function prevMonth() {
        setView(({ year, month }) => {
            if (month === 0) return { year: year - 1, month: 11 };
            return { year, month: month - 1 };
        });
    }

    function nextMonth() {
        setView(({ year, month }) => {
            if (month === 11) return { year: year + 1, month: 0 };
            return { year, month: month + 1 };
        });
    }

    function goToday() {
        const t = new Date();
        setView({ year: t.getFullYear(), month: t.getMonth() });
    }


    // Modal state

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        id: null,
        title: "",
        date: formatDate(new Date()),
        time: "09:00",
        location: "",
        description: "",
        tasks: [""],
        creator_id: 1,
        color: "#32f1cd",
    });
    const [selectedDay, setSelectedDay] = useState(null); // for day detail popup

    const [showAttendance, setShowAttendance] = useState(false);
    const [attendanceEvent, setAttendanceEvent] = useState(null);

    const [showQr, setShowQr] = useState(false);
    const [qrEvent, setQrEvent] = useState(null);

        function escapeHtml(value) {
                return String(value ?? "")
                        .replaceAll("&", "&amp;")
                        .replaceAll("<", "&lt;")
                        .replaceAll(">", "&gt;")
                        .replaceAll('"', "&quot;")
                        .replaceAll("'", "&#039;");
        }

        function formatDateDdMmYyyy(yyyyMmDd) {
                if (!yyyyMmDd || typeof yyyyMmDd !== "string") return "-";
                const parts = yyyyMmDd.split("-");
                if (parts.length !== 3) return yyyyMmDd;
                const [y, m, d] = parts;
                if (!y || !m || !d) return yyyyMmDd;
                return `${d}/${m}/${y}`;
        }

        function buildInvitationHtml({ meeting, households }) {
                const meetingTitle = escapeHtml(meeting?.title || "");
                const meetingDate = escapeHtml(formatDateDdMmYyyy(meeting?.date));
                const meetingTime = escapeHtml(meeting?.time || "-");
                const meetingLocation = escapeHtml(meeting?.location || "-");
                const meetingDescription = escapeHtml(meeting?.description || "");
                const tasks = Array.isArray(meeting?.tasks) ? meeting.tasks : [];

                const pages = (households || []).map((h) => {
                        const householdCode = escapeHtml(h?.household_code || "-");
                        const headName = escapeHtml(h?.head_name || "-");
                        const addressRaw = [h?.house_number, h?.street].filter(Boolean).join(" ").trim();
                        const address = escapeHtml(addressRaw || "-");

                        const tasksHtml = tasks.length
                                ? `<div class="row"><div class="label">Công việc:</div><div class="value"><ul>${tasks
                                            .map((t) => `<li>${escapeHtml(t)}</li>`)
                                            .join("")}</ul></div></div>`
                                : "";

                        const descriptionHtml = meetingDescription
                                ? `<div class="row"><div class="label">Nội dung:</div><div class="value"><div class="pre">${meetingDescription}</div></div></div>`
                                : "";

                        return `
                            <section class="page">
                                <div class="top">
                                    <div class="left">
                                        <div class="org">BAN QUẢN LÝ KHU DÂN CƯ</div>
                                        <div class="ref">Số: ...../GM</div>
                                    </div>
                                    <div class="right">
                                        <div class="country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                        <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
                                        <div class="line"></div>
                                    </div>
                                </div>

                                <h1 class="title">GIẤY MỜI</h1>
                                <div class="subtitle">V/v: Tham dự cuộc họp</div>

                                <div class="section">
                                    <div class="row"><div class="label">Kính gửi</div><div class="value">: Ông/Bà <span class="em">${headName}</span></div></div>
                                    <div class="row"><div class="label">Mã hộ</div><div class="value">: ${householdCode}</div></div>
                                    <div class="row"><div class="label">Địa chỉ</div><div class="value">: ${address}</div></div>
                                </div>

                                <div class="section">
                                    <div class="row"><div class="label">Chủ đề</div><div class="value">: <span class="em">${meetingTitle || "-"}</span></div></div>
                                    <div class="row"><div class="label">Thời gian</div><div class="value">: ${meetingTime} ngày ${meetingDate}</div></div>
                                    <div class="row"><div class="label">Địa điểm</div><div class="value">: ${meetingLocation}</div></div>
                                    ${descriptionHtml}
                                    ${tasksHtml}
                                </div>

                                <div class="note">
                                    Kính đề nghị Ông/Bà thu xếp thời gian tham dự đầy đủ, đúng giờ.
                                </div>

                                <div class="footer">
                                    <div class="sign">
                                        <div class="place">Ngày ..... tháng ..... năm .....</div>
                                        <div class="signTitle">ĐẠI DIỆN BAN TỔ CHỨC</div>
                                        <div class="muted">(Ký và ghi rõ họ tên)</div>
                                    </div>
                                </div>
                            </section>
                        `;
                });

                return `
                    <!doctype html>
                    <html lang="vi">
                        <head>
                            <meta charset="utf-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1" />
                            <title>Giấy mời - ${meetingTitle || "Cuộc họp"}</title>
                            <style>
                                @page { size: A4; margin: 18mm; }
                                html, body { padding: 0; margin: 0; }
                                body { color: #000; font-size: 14px; line-height: 1.45; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
                                .page { min-height: 100vh; }
                                .page { page-break-after: always; }
                                .page:last-child { page-break-after: auto; }
                                .top { display: flex; justify-content: space-between; gap: 16px; }
                                .top .left { width: 42%; }
                                .top .right { width: 58%; text-align: center; }
                                .org { font-weight: 700; text-transform: uppercase; }
                                .ref { margin-top: 2px; }
                                .country { font-weight: 700; text-transform: uppercase; }
                                .motto { margin-top: 2px; }
                                .line { margin: 8px auto 0; width: 62%; border-top: 1px solid #000; }
                                .title { margin: 18px 0 4px; text-align: center; font-size: 22px; letter-spacing: 0.6px; font-weight: 800; }
                                .subtitle { text-align: center; margin-bottom: 14px; font-style: italic; }
                                .section { margin-top: 12px; padding-top: 8px; border-top: 1px solid #000; }
                                .section:first-of-type { border-top: 0; padding-top: 0; }
                                .row { display: flex; gap: 10px; margin: 7px 0; }
                                .label { width: 95px; flex: 0 0 95px; font-weight: 600; }
                                .value { flex: 1 1 auto; }
                                .em { font-weight: 700; }
                                .pre { white-space: pre-wrap; }
                                ul { margin: 4px 0 0; padding-left: 18px; }
                                .note { margin-top: 14px; padding-top: 10px; border-top: 1px dashed #000; }
                                .footer { margin-top: 26px; display: flex; justify-content: flex-end; }
                                .sign { width: 46%; text-align: center; }
                                .place { margin-bottom: 6px; }
                                .signTitle { font-weight: 800; margin-top: 6px; }
                                .muted { margin-top: 4px; }
                                @media print {
                                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                }
                            </style>
                        </head>
                        <body>
                            ${pages.join("\n") || "<div>Không có hộ gia đình để in.</div>"}
                        </body>
                    </html>
                `;
        }

        async function printInvitationsForMeeting(meetingEvent) {
                if (!meetingEvent?.id) return;
            setError(null);

            setLoading(true);
                try {
                        const res = await fetch("/api/households");
                        if (!res.ok) throw new Error("Không thể tải danh sách hộ gia đình để in giấy mời");
                        const data = await res.json();
                        const households = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
                        const html = buildInvitationHtml({ meeting: meetingEvent, households });

                // Print in the current tab via hidden iframe (no new tab/window)
                const iframe = document.createElement("iframe");
                iframe.style.position = "fixed";
                iframe.style.right = "0";
                iframe.style.bottom = "0";
                iframe.style.width = "0";
                iframe.style.height = "0";
                iframe.style.border = "0";
                iframe.setAttribute("aria-hidden", "true");
                document.body.appendChild(iframe);

                let didPrint = false;
                iframe.onload = () => {
                    if (didPrint) return;
                    didPrint = true;
                    const win = iframe.contentWindow;
                    if (!win) {
                        setTimeout(() => iframe.remove(), 500);
                        return;
                    }

                    const cleanup = () => setTimeout(() => iframe.remove(), 500);
                    try {
                        win.addEventListener?.("afterprint", cleanup, { once: true });
                    } catch {
                        // ignore
                    }

                    // Let layout settle then print once
                    setTimeout(() => {
                        try {
                            win.focus?.();
                            win.print?.();
                        } finally {
                            // in case afterprint doesn't fire
                            setTimeout(cleanup, 2000);
                        }
                    }, 50);
                };

                // Use srcdoc to avoid navigation
                iframe.srcdoc = html;
                } catch (e) {
                        setError(e.message);
                } finally {
                        setLoading(false);
                }
        }

    // Open form for add
    function openAdd(day) {
        setForm({
            id: null,
            title: "",
            date: formatDate(day || new Date()),
            time: "09:00",
            location: "",
            description: "",
            tasks: [""],
            creator_id: 1,
            color: "#32f1cd",
        });
        setShowForm(true);
    }

    // Open form for edit
    function openEdit(event) {
        setForm({
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            description: event.description,
            tasks: Array.isArray(event.tasks) && event.tasks.length > 0 ? event.tasks : [""],
            creator_id: event.creator_id || 1,
            color: normalizeHexColor(event.color, "#32f1cd"),
        });
        setShowForm(true);
    }

    async function submitForm(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const tasks = Array.isArray(form.tasks)
            ? form.tasks.map((t) => String(t ?? "").trim()).filter(Boolean)
            : [];
        // include timezone offset so backend interprets the datetime as local
        const payload = {
            topic: form.title,
            content: form.description,
            tasks,
            location: form.location,
            time: `${form.date}T${form.time}:00`,
            creator_id: form.creator_id,
            color: normalizeHexColor(form.color, "#32f1cd"),
        };
        try {
            let res, updatedMeeting;
            if (form.id) {
                // Edit (PUT)
                res = await fetch(`/api/meetings/${form.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Không thể cập nhật cuộc họp");
                try {
                    updatedMeeting = await res.json();
                } catch {
                    updatedMeeting = null;
                }
                if (updatedMeeting && (updatedMeeting.id || updatedMeeting.time)) {
                    // use returned object to update state
                    setEvents(prev => prev.map(ev => ev.id === form.id ? mapMeetingToEvent(updatedMeeting) : ev));
                } else {
                    // backend didn't return full object -> reload from server
                    await loadMeetings();
                }
            } else {
                // Add (POST)
                res = await fetch("/api/meetings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Không thể tạo cuộc họp");
                try {
                    updatedMeeting = await res.json();
                } catch {
                    updatedMeeting = null;
                }
                if (updatedMeeting && updatedMeeting.id && updatedMeeting.time) {
                    // map backend response to frontend event
                    const newEvent = mapMeetingToEvent(updatedMeeting);
                    setEvents(prev => [...prev, newEvent]);
                } else {
                    // backend didn't return created object (or id) -> reload list to sync
                    await loadMeetings();
                }
            }
            setShowForm(false);
            // Clear form after creating a new meeting
            if (!form.id) {
                setForm({
                    id: null,
                    title: "",
                    date: formatDate(new Date()),
                    time: "09:00",
                    location: "",
                    description: "",
                    tasks: [""],
                    creator_id: 1,
                    color: "#32f1cd",
                });
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }


    function openDayDetail(day) {
        setSelectedDay(day);
    }

    async function deleteEvent(id) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Không thể xóa cuộc họp");
            // reload list from server to ensure client/server synchronized (handles newly-created items)
            await loadMeetings();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    const monthName = new Date(view.year, view.month).toLocaleString(undefined, { month: "long" });

        return (
                <div className="p-6">
                        {loading && <div className="text-center text-muted-foreground">Đang tải dữ liệu...</div>}
                        {error && <div className="text-center text-destructive">{error}</div>}

                        <CalendarHeader
                                monthName={monthName}
                                year={view.year}
                                onPrev={prevMonth}
                                onNext={nextMonth}
                                onToday={goToday}
                                onAdd={() => setShowForm(true)}
                        />

                        <div className="grid grid-cols-7 gap-1 text-sm">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                        <div key={d} className="text-center font-medium py-2 text-muted-foreground">
                                                {d}
                                        </div>
                                ))}
                        </div>
                        <CalendarGrid
                            weeks={weeks}
                            month={view.month}
                            events={events}
                            onDayDetail={openDayDetail}
                            onAdd={openAdd}
                        />
        <DayDetailModal
          day={selectedDay}
          events={events}
          onClose={() => setSelectedDay(null)}
                    onQr={(ev) => {
                        setSelectedDay(null);
                        setQrEvent(ev);
                        setShowQr(true);
                    }}
                    onPrintInvite={(ev) => {
                        setSelectedDay(null);
                        printInvitationsForMeeting(ev);
                    }}
                    onAttendance={(ev) => {
                        setSelectedDay(null);
                        setAttendanceEvent(ev);
                        setShowAttendance(true);
                    }}
                    onEdit={(ev) => {
                        setSelectedDay(null);
                        openEdit(ev);
                    }}
                    onDelete={async (ev) => {
                        // keep UX simple: close modal then delete
                        setSelectedDay(null);
                        await deleteEvent(ev.id);
                    }}
        />
                <EventFormModal
                    show={showForm}
                    form={form}
                    setForm={setForm}
                    onClose={() => {
                        setShowForm(false);
                        setForm({
                            id: null,
                            title: "",
                            date: formatDate(new Date()),
                            time: "09:00",
                            location: "",
                            description: "",
                            tasks: "",
                            creator_id: 1
                        });
                    }}
                    onSubmit={submitForm}
                />
                <AttendanceModal
                    open={showAttendance}
                    meeting={attendanceEvent}
                    onClose={() => {
                        setShowAttendance(false);
                        setAttendanceEvent(null);
                    }}
                />

                <AttendanceQrModal
                    open={showQr}
                    meeting={qrEvent}
                    onClose={() => {
                        setShowQr(false);
                        setQrEvent(null);
                    }}
                />
      </div>
    );
}

export default Meeting;