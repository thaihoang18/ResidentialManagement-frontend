import React, { useState, useMemo, useEffect } from "react";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import DayDetailModal from "./components/DayDetailModal";
import EventFormModal from "./components/EventFormModal";
import EventDetailModal from "./components/EventDetailModal";

function formatDate(date) {
    return date.toISOString().slice(0, 10);
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
            creator_id: meeting.creator_id
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
        tasks: "",
        creator_id: 1
    });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null); // for day detail popup

    // Open form for add
    function openAdd(day) {
        setForm({
            id: null,
            title: "",
            date: formatDate(day || new Date()),
            time: "09:00",
            location: "",
            description: "",
            tasks: "",
            creator_id: 1
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
            tasks: event.tasks ? event.tasks.join("; ") : "",
            creator_id: event.creator_id || 1
        });
        setShowForm(true);
    }

    async function submitForm(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        // include timezone offset so backend interprets the datetime as local
        const payload = {
            topic: form.title,
            content: form.description,
            tasks: form.tasks ? form.tasks.split(";").map(t => t.trim()).filter(Boolean) : [],
            location: form.location,
            time: `${form.date}T${form.time}:00`,
            creator_id: form.creator_id
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
                    tasks: "",
                    creator_id: 1
                });
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }


    function openEvent(ev) {
        setSelectedEvent(ev);
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
            setSelectedEvent(null);
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
                            onEventClick={openEvent}
                            onAdd={openAdd}
                        />
        <DayDetailModal
          day={selectedDay}
          events={events}
          onClose={() => setSelectedDay(null)}
          onEventClick={(ev) => { setSelectedEvent(ev); setSelectedDay(null); }}
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
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onDelete={deleteEvent}
                    onEdit={() => {
                        if (selectedEvent) {
                            setSelectedEvent(null); // Hide detail modal
                            setForm({
                                id: selectedEvent.id,
                                title: selectedEvent.title,
                                date: selectedEvent.date,
                                time: selectedEvent.time,
                                location: selectedEvent.location,
                                description: selectedEvent.description,
                                tasks: selectedEvent.tasks ? selectedEvent.tasks.join('; ') : '',
                                creator_id: selectedEvent.creator_id || 1
                            });
                            setShowForm(true);
                        }
                    }}
                />
      </div>
    );
}

export default Meeting;