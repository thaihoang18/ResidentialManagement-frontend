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

    // Fetch meetings from backend
    useEffect(() => {
        setLoading(true);
        fetch("/api/meetings")
            .then(res => {
                if (!res.ok) throw new Error("Lỗi tải dữ liệu cuộc họp");
                return res.json();
            })
            .then(data => {
                // If backend returns { success, data: [...] }
                const arr = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                // Map backend fields to frontend event fields
                setEvents(arr.map(ev => ({
                    id: ev.id,
                    title: ev.topic || ev.title || "",
                    date: ev.time ? ev.time.slice(0,10) : "",
                    time: ev.time ? ev.time.slice(11,16) : "",
                    location: ev.location || "",
                    description: ev.content || ev.description || ""
                })));
                setError(null);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
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
        // Map frontend form to backend fields (no timezone, send as local)
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
                updatedMeeting = await res.json();
                setEvents(prev => prev.map(ev => ev.id === form.id ? {
                    ...ev,
                    ...form,
                    tasks: payload.tasks
                } : ev));
            } else {
                // Add (POST)
                res = await fetch("/api/meetings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Không thể tạo cuộc họp");
                updatedMeeting = await res.json();
                // Map backend response to frontend event
                setEvents(prev => [...prev, {
                    id: updatedMeeting.id,
                    title: updatedMeeting.topic,
                    date: updatedMeeting.time ? updatedMeeting.time.slice(0,10) : "",
                    time: updatedMeeting.time ? updatedMeeting.time.slice(11,16) : "",
                    location: updatedMeeting.location,
                    description: updatedMeeting.content,
                    tasks: updatedMeeting.tasks || [],
                    creator_id: updatedMeeting.creator_id
                }]);
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
            setEvents(prev => prev.filter(ev => ev.id !== id));
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
                {loading && <div className="text-center text-gray-500">Đang tải dữ liệu...</div>}
                {error && <div className="text-center text-red-500">{error}</div>}
        <CalendarHeader
          monthName={monthName}
          year={view.year}
          onPrev={prevMonth}
          onNext={nextMonth}
          onToday={goToday}
          onAdd={() => setShowForm(true)}
        />
        <div className="grid grid-cols-7 gap-1 text-sm">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center font-medium py-2 text-gray-600">{d}</div>
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