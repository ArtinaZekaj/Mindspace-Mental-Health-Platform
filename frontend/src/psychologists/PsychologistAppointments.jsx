import React, { useEffect, useState, useMemo } from 'react';
import { Card, Row, Col, Badge, Table, Button, Form, Modal } from 'react-bootstrap';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    FaPlus, FaBolt, FaCheckCircle, FaEdit, FaEllipsisV,
    FaUser, FaArrowRight, FaClock, FaCalendarPlus
} from 'react-icons/fa';
import '../index.css';

function PsychologistAppointments() {
    const [allAppointments, setAllAppointments] = useState([]);
    const [selectedRange, setSelectedRange] = useState('today');
    const [stats, setStats] = useState({ today: 0, tomorrow: 0, week: 0, month: 0 });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointmentDates, setAppointmentDates] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');


    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/psychologist/appointments', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        Accept: 'application/json'
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch appointments');

                const data = await res.json();
                setAllAppointments(data);

                const todayStr = new Date().toLocaleDateString('en-CA');
                const tomorrowStr = new Date(Date.now() + 86400000).toLocaleDateString('en-CA');
                const startOfWeek = getStartOfWeek();
                const endOfWeek = getEndOfWeek();
                const monthStr = todayStr.slice(0, 7);

                // Count appointments
                let today = 0, tomorrow = 0, week = 0, month = 0;
                data.forEach(appt => {
                    const apptDate = new Date(appt.date).toLocaleDateString('en-CA');
                    if (!appt?.date) return;
                    if (apptDate === todayStr) today++;
                    if (apptDate === tomorrowStr) tomorrow++;
                    if (apptDate >= startOfWeek && apptDate <= endOfWeek) week++;
                    if (apptDate.startsWith(monthStr)) month++;
                });

                setStats({ today, tomorrow, week, month });

                // Filter dates for calendar
                const filteredDates = data
                    .filter(appt => {
                        const apptDate = new Date(appt.date).toLocaleDateString('en-CA');
                        if (!appt?.date) return false;
                        switch (selectedRange) {
                            case 'today': return apptDate === todayStr;
                            case 'tomorrow': return apptDate === tomorrowStr;
                            case 'week': return apptDate >= startOfWeek && apptDate <= endOfWeek;
                            case 'month': return apptDate.startsWith(monthStr);
                            default: return false;
                        }
                    })
                    .map(appt => new Date(appt.date).toLocaleDateString('en-CA'));

                setAppointmentDates(filteredDates);
            } catch (err) {
                console.error('Error loading appointments:', err);
            }
        };

        fetchAppointments();
    }, [selectedRange]);



    const getStartOfWeek = () => {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(date.setDate(diff));
        return start.toLocaleDateString('en-CA');
    };

    const getEndOfWeek = () => {
        const start = new Date(getStartOfWeek());
        start.setDate(start.getDate() + 6);
        return start.toLocaleDateString('en-CA');
    };

    const formatTime = (timeStr) => {
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const getStatusBadge = (status) => {
        const normalized = status.toLowerCase();

        const map = {
            pending: { label: 'Pending', bg: 'warning' },
            approved: { label: 'Approved', bg: 'success' },
            confirmed: { label: 'Confirmed', bg: 'primary' },
            completed: { label: 'Completed', bg: 'success' },
            rejected: { label: 'Canceled', bg: 'danger' }
        };

        const badge = map[normalized] || { label: status, bg: 'secondary' };

        return (
            <Badge bg={badge.bg} className="d-inline-flex align-items-center">
                {badge.label}
            </Badge>
        );
    };


    const filteredAppointments = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
        const startOfWeek = getStartOfWeek();
        const endOfWeek = getEndOfWeek();
        const monthStr = todayStr.slice(0, 7);

        return allAppointments
            .filter(appt => {
                if (!appt?.date) return false;
                switch (selectedRange) {
                    case 'today': return appt.date === todayStr;
                    case 'tomorrow': return appt.date === tomorrowStr;
                    case 'week': return appt.date >= startOfWeek && appt.date <= endOfWeek;
                    case 'month': return appt.date.startsWith(monthStr);
                    default: return false;
                }
            })
            .map(appt => ({
                id: appt.id,
                name: appt.user?.name || 'Unknown',
                date: new Date(appt.date).toLocaleDateString('en-GB'),
                time: formatTime(appt.time),
                duration: '60 min',
                status: appt.status
            }));
    }, [allAppointments, selectedRange]);

    const handleRangeClick = (range) => {
        setSelectedRange(range);
    };

    const handleView = (appt) => {
        setSelectedAppointment(appt);
        setShowViewModal(true);
    };

    const handleEdit = (appt) => {
        setSelectedAppointment(appt);
        setNewDate(appt.date);
        setNewTime(appt.time?.slice(0, 5));
        setShowEditModal(true);
    };

    const handleCancel = (appt) => {
        setSelectedAppointment(appt);
        setShowCancelModal(true);
    };

    const submitEdit = async () => {
        try {
            await fetch(`http://localhost:8000/api/appointments/${selectedAppointment.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date: newDate, time: newTime })
            });
            setShowEditModal(false);
            window.location.reload();
        } catch {
            alert('Failed to update appointment.');
        }
    };

    const confirmCancel = async () => {
        try {
            await fetch(`http://localhost:8000/api/appointments/${selectedAppointment.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setShowCancelModal(false);
            window.location.reload();
        } catch {
            alert('Failed to cancel appointment.');
        }
    };

    return (
        <div className="container-fluid px-4 py-4">
            <div className="rounded-4 p-4 mb-4 text-white" style={{ background: 'linear-gradient(to right, #f43f5e, #d6336c)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 className="fw-bold">Appointment Schedule</h4>
                        <p className="mb-0">Manage your daily appointments and schedule.</p>
                    </div>
                </div>

                <Row>
                    {[
                        { title: 'Today', count: stats.today, key: 'today' },
                        { title: 'Tomorrow', count: stats.tomorrow, key: 'tomorrow' },
                        { title: 'This Week', count: stats.week, key: 'week' },
                        { title: 'This Month', count: stats.month, key: 'month' }
                    ].map((stat, i) => (
                        <Col md={3} key={i}>
                            <div onClick={() => handleRangeClick(stat.key)}
                                className="bg-pink-500 rounded-3 p-3 d-flex justify-content-between align-items-center mb-2"
                                style={{ backgroundColor: '#ec407a', cursor: 'pointer' }}>
                                <div>
                                    <div className="text-white-50 small">{stat.title}</div>
                                    <div className="fw-bold fs-5 text-white">{stat.count}</div>
                                    <div className="text-white-50 small">appointments</div>
                                </div>
                                <FaArrowRight color="white" />
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            <Row>
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold text-capitalize">{selectedRange} Appointments</span>
                        </Card.Header>
                        <Table className="mb-0" hover>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map(appt => (
                                    <tr key={appt.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center"
                                                    style={{ width: 36, height: 36 }}>
                                                    {getInitials(appt.name)}
                                                </div>
                                                {appt.name}
                                            </div>
                                        </td>
                                        <td>{appt.date}</td>
                                        <td>
                                            {appt.time}
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{appt.duration}</div>
                                        </td>
                                        <td>{getStatusBadge(appt.status)}</td>
                                        <td>
                                            <Button size="sm" variant="outline-info" onClick={() => handleView(appt)}>View</Button>{' '}
                                            <Button size="sm" variant="outline-primary" onClick={() => handleEdit(appt)}>Edit</Button>{' '}
                                            <Button size="sm" variant="outline-danger" onClick={() => handleCancel(appt)}>Cancel</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm">
                        <Card.Header className="fw-semibold">Calendar</Card.Header>
                        <Card.Body className="p-3">
                            <div className="calendar-wrapper">
                                <Calendar
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    tileClassName={({ date, view }) => {
                                        if (view === 'month') {
                                            const localDate = date.toLocaleDateString('en-CA');
                                            if (appointmentDates.includes(localDate)) {
                                                return 'highlight-date';
                                            }
                                        }
                                        return null;
                                    }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton><Modal.Title>Appointment Details</Modal.Title></Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <>
                            <p><strong>Patient:</strong> {selectedAppointment.name}</p>
                            <p><strong>Date:</strong> {selectedAppointment.date}</p>
                            <p><strong>Time:</strong> {selectedAppointment.time}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton><Modal.Title>Edit Appointment</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <Form.Control type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mt-2">
                        <Form.Label>Time</Form.Label>
                        <Form.Control type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={submitEdit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirm Cancellation</Modal.Title></Modal.Header>
                <Modal.Body>
                    Are you sure you want to cancel this appointment with <strong>{selectedAppointment?.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>No</Button>
                    <Button variant="danger" onClick={confirmCancel}>Yes, Cancel</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}


export default PsychologistAppointments;
