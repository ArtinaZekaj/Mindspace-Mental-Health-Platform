import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Form, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Professional icons

function CalendarPersonal() {
    const [showMoods, setShowMoods] = useState(false);
    const [showReflections, setShowReflections] = useState(false);
    const [showAppointments, setShowAppointments] = useState(false);
    const [allEvents, setAllEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false); // View details modal
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editModal, setEditModal] = useState(false); // Edit modal
    const [editData, setEditData] = useState({
        id: null,
        type: '',
        mood: '',
        note: '',
        theme: '',
        content: '',
        date: '',
    });
    const calendarRef = useRef(null);

    useEffect(() => {
        if (!showMoods && !showReflections && !showAppointments) {
            setEvents([]);
            return;
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                const [reflectionsRes, moodsRes, appointmentsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/reflections', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get('http://localhost:8000/api/moods', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get('http://localhost:8000/api/appointments/my', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const reflections = reflectionsRes.data;
                const moods = moodsRes.data;
                const appointments = appointmentsRes.data;

                let combined = [];

                if (showMoods) {
                    moods.forEach((m) => {
                        combined.push({
                            id: m.id,
                            title: getMoodEmoji(m.mood),
                            date: m.date,
                            color: '#90EE90',
                            type: 'mood',
                            mood: m.mood,
                            content: m.note,
                            raw: m,
                        });
                    });
                }

                if (showReflections) {
                    reflections.forEach((ref) => {
                        combined.push({
                            id: ref.id,
                            title: '📖 Daily Reflection',
                            date: ref.date,
                            color: '#9370DB',
                            type: 'reflection',
                            theme: ref.theme,
                            content: ref.content,
                            raw: ref,
                        });
                    });
                }

                if (showAppointments) {
                    appointments.forEach((app) => {
                        const name = app.psychologist?.name || 'Psychologist';
                        combined.push({
                            id: app.id,
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

                setAllEvents(combined);
                setEvents(combined);
            } catch (error) {
                console.error('Error loading events:', error);
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

    // When an edit or delete icon is clicked, if the details modal is open, close it first.
    const handleEdit = (event) => {
        if (showModal) setShowModal(false);
        const type = event.type;
        const data = event.raw;

        if (type === 'mood') {
            setEditData({
                id: data.id,
                type: 'mood',
                mood: data.mood,
                note: data.note || '',
                date: data.date,
            });
        } else if (type === 'reflection') {
            setEditData({
                id: data.id,
                type: 'reflection',
                theme: data.theme || '',
                content: data.content || '',
                date: data.date,
            });
        }
        setEditModal(true);
    };

    const handleDelete = async (event) => {
        if (showModal) setShowModal(false);
        const token = localStorage.getItem('token');
        const id = event.raw.id;
        const type = event.type;

        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const url = type === 'mood'
                ? `http://localhost:8000/api/moods/${id}`
                : `http://localhost:8000/api/reflections/${id}`;

            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setEvents(events.filter(e => e.raw.id !== id));
            setAllEvents(allEvents.filter(e => e.raw.id !== id));
            setShowModal(false);
        } catch (err) {
            console.error(`Failed to delete ${type}:`, err);
            alert('Failed to delete. Please try again.');
        }
    };

    const handleEditSubmit = async () => {
        const token = localStorage.getItem('token');
        try {
            const url = editData.type === 'mood'
                ? `http://localhost:8000/api/moods/${editData.id}`
                : `http://localhost:8000/api/reflections/${editData.id}`;

            const payload = editData.type === 'mood'
                ? { mood: editData.mood, note: editData.note, date: editData.date }
                : { theme: editData.theme, content: editData.content, date: editData.date };

            await axios.put(url, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setEditModal(false);
            window.location.reload(); // Consider replacing with a more refined data refresh
        } catch (error) {
            console.error('Error updating:', error);
            alert('Failed to update.');
        }
    };

    const handleDatesSet = () => {
        if (!calendarRef.current) return;
        const calendarApi = calendarRef.current.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(events);
    };

    // Use onMouseDown to prevent FullCalendar from also processing the event click.
    const renderEventContent = (eventInfo) => {
        const { event } = eventInfo;
        const props = event.extendedProps;
        const isEditable = props.type === 'mood' || props.type === 'reflection';

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>{event.title}</div>
                {isEditable && (
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                handleEdit(props);
                            }}
                            title="Edit"
                            style={{ cursor: 'pointer', color: '#0d6efd' }}
                        >
                            <FaEdit />
                        </div>
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                handleDelete(props);
                            }}
                            title="Delete"
                            style={{ cursor: 'pointer', color: '#dc3545' }}
                        >
                            <FaTrash />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 bg-white rounded-3 shadow-sm">
            <div className="mb-5 text-center position-relative">
    <div
        className="px-5 py-4 border border-2 rounded-4 shadow-sm mx-auto"
        style={{
            backgroundColor: 'rgb(241, 242, 247)', 
            borderColor: '#B39DDB',     
            maxWidth: '1200px',        
            width: '100%',              
        }}
    >
        <div
            className="d-inline-block px-4 py-2 border border-3 border-indigo rounded-pill shadow-sm bg-white mb-4"
            style={{
                borderColor: '#4B0082',
            }}
        >
            <h2
                className="fw-bold m-0 d-flex align-items-center justify-content-center"
                style={{
                    fontSize: '1.9rem',
                    color: '#4B0082',
                    gap: '0.5rem',
                }}
            >
                📅 Your Personal Calendar
            </h2>
        </div>

        <p
            className="text-muted mx-auto"
            style={{
                maxWidth: '800px',
                fontSize: '1.1rem',
                lineHeight: '1.8',
            }}
        >
            Stay organized and mindful with a clear view of your progress and plans. <br />
            Track your journey through{' '}
            <span className="fw-semibold text-dark">moods</span>,{' '}
            <span className="fw-semibold text-dark">reflections</span>, and{' '}
            <span className="fw-semibold text-dark">appointments</span>.
        </p>
    </div>
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
                        eventDisplay="block"
                        eventClick={handleEventClick}
                        eventContent={renderEventContent}
                        dayMaxEvents
                        dayMaxEventRows={3}
                        fixedWeekCount={false}
                        headerToolbar={{
                            left: 'prev,next',
                            center: 'title',
                            right: '',
                        }}
                        datesSet={handleDatesSet}
                    />
                </div>
            </div>

            {/* View Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedEvent?.type === 'mood' &&
                            `${getMoodEmoji(selectedEvent.mood)} ${capitalize(selectedEvent.mood)}`}
                        {selectedEvent?.type === 'reflection' && '📖 Daily Reflection'}
                        {selectedEvent?.type === 'appointment' &&
                            `📅 Session with Dr. ${selectedEvent.psychologist}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <strong>Date:</strong> {selectedEvent?.raw?.date}{' '}
                        {selectedEvent?.time ? `at ${selectedEvent.time}` : ''}
                    </p>

                    {(selectedEvent?.type === 'mood' ||
                        selectedEvent?.type === 'reflection') && (
                        <>
                            <p>
                                <strong>
                                    {selectedEvent?.type === 'mood' ? 'Details:' : 'A:'}
                                </strong>{' '}
                                {selectedEvent.content}
                            </p>
                        </>
                    )}

                    {selectedEvent?.type === 'appointment' && (
                        <>
                            <p>
                                <strong>Psychologist:</strong> Dr. {selectedEvent.psychologist}
                            </p>
                            <p>
                                <strong>Details:</strong> Therapy session
                            </p>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* Edit Modal */}
            <Modal show={editModal} onHide={() => setEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editData.type === 'mood' ? 'Edit Mood' : 'Edit Reflection'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={editData.date}
                                onChange={(e) =>
                                    setEditData({ ...editData, date: e.target.value })
                                }
                            />
                        </Form.Group>

                        {editData.type === 'mood' ? (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mood</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editData.mood}
                                        onChange={(e) =>
                                            setEditData({ ...editData, mood: e.target.value })
                                        }
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Note</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={editData.note}
                                        onChange={(e) =>
                                            setEditData({ ...editData, note: e.target.value })
                                        }
                                    />
                                </Form.Group>
                            </>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Theme</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editData.theme}
                                        onChange={(e) =>
                                            setEditData({ ...editData, theme: e.target.value })
                                        }
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Content</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={editData.content}
                                        onChange={(e) =>
                                            setEditData({ ...editData, content: e.target.value })
                                        }
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={() => setEditModal(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-success" onClick={handleEditSubmit}>
                        Save Changes
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

const capitalize = (word) => word?.charAt(0).toUpperCase() + word?.slice(1);

export default CalendarPersonal;
