import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Form, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';

function CalendarPersonal() {
    const [showMoods, setShowMoods] = useState(true);
    const [showReflections, setShowReflections] = useState(true);
    const [showAppointments, setShowAppointments] = useState(true);
    const [allEvents, setAllEvents] = useState([]); // ruan të gjitha për të rishfaqur
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const calendarRef = useRef(null);

    // Ngarko nga databaza
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                const [reflectionsRes, appointmentsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/reflections', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get('http://localhost:8000/api/appointments/my', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const reflections = reflectionsRes.data;
                const appointments = appointmentsRes.data;

                let combined = [];

                if (showMoods) {
                    reflections.forEach((ref) => {
                        combined.push({
                            title: getMoodEmoji(ref.mood),
                            date: ref.date,
                            color: '#90EE90',
                            type: 'mood',
                            mood: ref.mood,
                            content: ref.content,
                            raw: ref,
                        });
                    });
                }

                if (showReflections) {
                    reflections.forEach((ref) => {
                        combined.push({
                            title: '📖 Daily Reflection',
                            date: ref.date,
                            color: '#9370DB',
                            type: 'reflection',
                            content: ref.content,
                            raw: ref,
                        });
                    });
                }

                if (showAppointments) {
                    appointments.forEach((app) => {
                        const name = app.psychologist?.name || 'Psychologist';
                        combined.push({
                            title: `📅 Session with Dr. ${name}`,
                            date: app.date,
                            color: '#FFB347',
                            type: 'appointment',
                            psychologist: name,
                            time: app.time,
                            raw: app,
                        });
                    });
                }

                setAllEvents(combined);      // Ruaj për filtrim të ardhshëm
                setEvents(combined);         // Shfaq të gjitha fillimisht
            } catch (error) {
                console.error('Gabim gjatë ngarkimit të eventeve:', error);
            }
        };

        fetchData();
    }, [showMoods, showReflections, showAppointments]);

    const getMoodEmoji = (mood) => {
        if (!mood) return '🙂';
        const text = mood.toLowerCase();

        if (text.includes('happy')) return '😊';
        if (text.includes('sad')) return '😢';
        if (text.includes('calm')) return '🧘';
        if (text.includes('anxious')) return '😰';
        if (text.includes('relaxed')) return '😌';
        if (text.includes('focused')) return '🎯';

        return '🙂';
    };

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
        setShowModal(true);
    };

    const handleTodayClick = () => {
        const calendarApi = calendarRef.current.getApi();
        const today = new Date().toISOString().split('T')[0];
        const filtered = allEvents.filter((e) => e.date === today);
        calendarApi.gotoDate(today);
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(filtered);
    };


    const handleDatesSet = () => {
        if (!calendarRef.current) return;
        const calendarApi = calendarRef.current.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(events);
    };

    return (
        <div className="p-4 bg-white rounded-3 shadow-sm">
  <div className="mb-4 text-center">
    <h2 className="text-2xl fw-bold text-primary" style={{ color: '#4B0082' }}>
      Your Personal Calendar
    </h2>
    <p className="text-muted fs-5">
      Stay organized and mindful with a clear view of your progress and plans. <br />
      Track your journey through <span className="fw-semibold">moods</span>, <span className="fw-semibold">reflections</span>, and <span className="fw-semibold">appointments</span> all in one place.
    </p>
  </div>



            <div className="mb-3 p-3 bg-light border rounded">
                <Row>
                    <Col>
                        <Form.Check
                            type="checkbox"
                            label="🙂 Moods"
                            checked={showMoods}
                            onChange={() => setShowMoods(!showMoods)}
                        />
                    </Col>
                    <Col>
                        <Form.Check
                            type="checkbox"
                            label="📖 Reflections"
                            checked={showReflections}
                            onChange={() => setShowReflections(!showReflections)}
                        />
                    </Col>
                    <Col>
                        <Form.Check
                            type="checkbox"
                            label="📅 Appointments"
                            checked={showAppointments}
                            onChange={() => setShowAppointments(!showAppointments)}
                        />
                    </Col>
                </Row>
            </div>

            <div className="calendar-wrapper d-flex justify-content-center">
                <div style={{ width: '100%', maxWidth: '1500px' }}>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        height="auto"
                        contentHeight="auto"
                        eventDisplay="auto"
                        dayMaxEvents={true}
                        dayMaxEventRows={3}
                        fixedWeekCount={false}
                        eventClick={handleEventClick}
                        headerToolbar={{
                            left: 'prev,next',
                            center: 'title',
                            right: '',
                        }}
                        datesSet={handleDatesSet}
                    />


                    <style>
                        {`
              .fc-event-title {
                font-size: 0.9rem;
              }
              .fc-daygrid-event {
                padding: 3px 6px;
                font-weight: 500;
                border-radius: 4px;
              }
              .fc .fc-toolbar-title {
                font-size: 1.4rem;
              }
            `}
                    </style>
                </div>
            </div>

            {/* Modal për klikim eventi */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedEvent?.type === 'mood' && `${getMoodEmoji(selectedEvent.mood)} ${capitalize(selectedEvent.mood)}`}
                        {selectedEvent?.type === 'reflection' && '📖 Daily Reflection'}
                        {selectedEvent?.type === 'appointment' && `📅 Session with Dr. ${selectedEvent.psychologist}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Date:</strong> {selectedEvent?.raw?.date} {selectedEvent?.time ? `at ${selectedEvent.time}` : ''}</p>

                    {selectedEvent?.type === 'mood' && (
                        <p><strong>Details:</strong> {selectedEvent.content}</p>
                    )}
                    {selectedEvent?.type === 'reflection' && (
                        <>
                            <p><strong>Q:</strong> What are you grateful for?</p>
                            <p><strong>A:</strong> {selectedEvent.content}</p>
                        </>
                    )}
                    {selectedEvent?.type === 'appointment' && (
                        <>
                            <p><strong>Psychologist:</strong> Dr. {selectedEvent.psychologist}</p>
                            <p><strong>Details:</strong> Therapy session</p>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

const capitalize = (word) => word?.charAt(0).toUpperCase() + word?.slice(1);

export default CalendarPersonal;
