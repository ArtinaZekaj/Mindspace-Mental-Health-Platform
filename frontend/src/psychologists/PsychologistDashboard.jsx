// IMPORTS
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Badge, Table, Button, Form, Modal } from 'react-bootstrap';
import { FaUserFriends, FaCalendarAlt, FaSmile } from 'react-icons/fa';
import Calendar from 'react-calendar';

function PsychologistDashboard() {
    const name = localStorage.getItem('name') || 'Psychologist';
    const token = localStorage.getItem('token');

    const [patients, setPatients] = useState([]);
    const [appointmentsToday, setAppointmentsToday] = useState([]);
    const [nextAppointmentTime, setNextAppointmentTime] = useState(null);
    const [topMood, setTopMood] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [myPatients, setMyPatients] = useState([]);
    const [patientMoods, setPatientMoods] = useState({});
    const [latestReflections, setLatestReflections] = useState([]);


    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/psychologist/appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const uniquePatientIds = [...new Set(res.data.map(appt => appt.user_id))];
                setPatients(uniquePatientIds);
            } catch (error) {
                console.error('Error fetching patients:', error);
            }
        };

        fetchPatients();
        fetchAppointmentsToday();
    }, []);

    const fetchAppointmentsToday = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/psychologist/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const todayDate = new Date().toISOString().split('T')[0];
            const todayAppointments = res.data.filter(appt => appt.date === todayDate);
            setAppointmentsToday(todayAppointments);

            const upcoming = todayAppointments
                .filter(a => ['pending', 'approved'].includes(a.status))
                .sort((a, b) => a.time.localeCompare(b.time))[0];

            setNextAppointmentTime(upcoming?.time || null);
        } catch (error) {
            console.error('Error fetching today appointments:', error);
        }
    };

    useEffect(() => {
        const fetchTopMood = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/psychologist/patient-moods', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const moodCounts = {};
                for (const mood of res.data) {
                    moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
                }

                const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
                setTopMood(sorted[0]?.[0] || 'None');
            } catch (err) {
                console.error('Failed to fetch patient moods:', err);
            }
        };

        fetchTopMood();
    }, []);

    //Show My Patients
    const fetchMyPatients = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/psychologist/appointments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const uniquePatientsMap = new Map();
            res.data.forEach(appt => {
                if (appt.user) {
                    uniquePatientsMap.set(appt.user.id, appt.user);
                }
            });

            setMyPatients(Array.from(uniquePatientsMap.values()));
        } catch (err) {
            console.error("Failed to fetch patients:", err);
        }
    };
    useEffect(() => {
        const fetchPatientMoods = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/psychologist/patient-moods', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const latestMoods = {};
                res.data.forEach((mood) => {
                    const userId = mood.user_id;

                    if (
                        !latestMoods[userId] ||
                        new Date(mood.date) > new Date(latestMoods[userId].date)
                    ) {
                        latestMoods[userId] = mood;
                    }
                });

                setPatientMoods(latestMoods);
            } catch (err) {
                console.error("Failed to fetch moods:", err);
            }
        };


        fetchMyPatients();
        fetchPatientMoods();
    }, []);

    //Latest Reflections:
    useEffect(() => {
        const fetchLatestReflections = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://localhost:8000/api/psychologist/reflections?range=weekly', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setLatestReflections(res.data);
            } catch (err) {
                console.error("Error loading reflections:", err);
            }
        };

        fetchLatestReflections();
    }, []);

    const getMoodEmoji = (moodText) => {
        switch (moodText?.toLowerCase()) {
            case 'very happy':
                return '😄';
            case 'happy':
                return '😊';
            case 'neutral':
                return '😐';
            case 'sad':
                return '😢';
            case 'very sad':
                return '😭';
            default:
                return '❓';
        }
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
            await axios.put(`http://localhost:8000/api/appointments/${selectedAppointment.id}`, {
                date: newDate,
                time: newTime
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowEditModal(false);
            fetchAppointmentsToday();
        } catch {
            alert('Failed to update appointment.');
        }
    };

    const confirmCancel = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/appointments/${selectedAppointment.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCancelModal(false);
            fetchAppointmentsToday();
        } catch {
            alert('Failed to cancel appointment.');
        }
    };

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    //Calendar:
    const getTileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0];

            const today = new Date();
            const dayOfWeek = today.getDay();
            const monday = new Date(today);
            monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            if (date >= monday && date <= sunday) {
                const hasAppointment = appointmentsToday.find(appt => appt.date === dateStr);
                if (hasAppointment) {
                    return 'highlight-date';
                }
            }
        }
        return '';
    };

    //Filter Patients:
    const filteredPatients = myPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid">
            {/* HEADER */}
            <Card className="mb-4" style={{ backgroundColor: '#159b8f', color: 'white' }}>
                <Card.Body>
                    <h4>Good evening, {name}</h4>
                    <p>{formattedDate}</p>
                    <p className="mt-2" style={{ fontStyle: 'italic' }}>
                        Your presence and understanding can be the turning point in someone's life.
                    </p>
                </Card.Body>
            </Card>

            {/* STATS */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-white" style={{ backgroundColor: '#7e3ff2' }}>
                        <Card.Body>
                            <h1>{patients.length}</h1>
                            <p>Total Patients</p>
                            <FaUserFriends size={36} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-white" style={{ backgroundColor: '#dc3545' }}>
                        <Card.Body>
                            <h1>{appointmentsToday.length}</h1>
                            <p>Appointments Today</p>
                            {nextAppointmentTime && (
                                <Badge bg="light" text="dark">Next at {nextAppointmentTime.slice(0, 5)}</Badge>
                            )}
                            <FaCalendarAlt size={36} className="float-end" />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-white" style={{ backgroundColor: '#f57c00' }}>
                        <Card.Body>
                            <h1>{topMood}</h1>
                            <p>Top Mood of the Week</p>
                            <span>from your patients</span>
                            <FaSmile size={36} className="float-end" />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* APPOINTMENTS + CALENDAR */}
            <Row className="mb-4">
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <strong>Today's Appointments</strong>
                        </Card.Header>
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointmentsToday.length ? appointmentsToday.map((appt, idx) => (
                                    <tr key={idx}>
                                        <td>{appt.user?.name || 'Unknown'}</td>
                                        <td>{appt.time?.slice(0, 5)}<br /><small>60 min</small></td>
                                        <td><Badge bg={appt.status === 'pending' ? 'warning' : 'success'}>{appt.status}</Badge></td>
                                        <td>
                                            <Button size="sm" variant="outline-info" onClick={() => handleView(appt)}>View</Button>{' '}
                                            <Button size="sm" variant="outline-primary" onClick={() => handleEdit(appt)}>Edit</Button>{' '}
                                            <Button size="sm" variant="outline-danger" onClick={() => handleCancel(appt)}>Cancel</Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center text-muted">No appointments today</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Header><strong>Calendar</strong></Card.Header>
                        <Card.Body>
                            <Calendar
                                onChange={setCalendarDate}
                                value={calendarDate}
                                tileClassName={getTileClassName}
                            />
                        </Card.Body>
                    </Card>
                </Col>


            </Row>

            {/* PATIENTS + NOTES */}
            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <strong>My Patients</strong>
                            <Form.Control type="text" placeholder="Search patients..." style={{ width: '200px' }} size="sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </Card.Header>
                        <Table hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Email</th>
                                    <th>Recent Mood</th>
                                    {/* <th>Actions</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.length ? filteredPatients.map((patient, index) => (
                                    <tr key={index}>
                                        <td>
                                            <strong>{patient.name}</strong><br />
                                            <small>Joined: {new Date(patient.created_at).toLocaleDateString()}</small>
                                        </td>
                                        <td>{patient.email}</td>
                                        <td>
                                            {patientMoods[patient.id] ? (
                                                <span style={{ fontSize: '1.2rem' }}>
                                                    {getMoodEmoji(patientMoods[patient.id].mood)}
                                                </span>
                                            ) : (
                                                <Badge bg="secondary">–</Badge>
                                            )}
                                        </td>
                                        {/* <td><Button variant="link" size="sm">...</Button></td> */}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-muted text-center">No matching patients found.</td>
                                    </tr>
                                )}
                            </tbody>

                        </Table>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <strong>Patient Notes</strong>
                            <Button variant="link" size="sm">View All</Button>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            <div className="mb-3">
                                <div className="fw-bold">Emma Wilson <span className="text-muted float-end">Today</span></div>
                                <small>Patient showed significant progress with anxiety management...</small>
                                <div><Button variant="link" size="sm">Edit Note</Button></div>
                            </div>
                            <div className="mb-3">
                                <div className="fw-bold">Daniel Smith <span className="text-muted float-end">Yesterday</span></div>
                                <small>Still exhibiting avoidance patterns when discussing childhood trauma...</small>
                                <div><Button variant="link" size="sm">Edit Note</Button></div>
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            <Button variant="outline-success" size="sm" className="w-100">Add New Note</Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* REFLECTIONS */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <strong>Latest Reflections</strong>
                            <Button size="sm" variant="link">View All</Button>
                        </Card.Header>
                        <Card.Body>
                            {latestReflections.length === 0 ? (
                                <p className="text-muted">No reflections in the past 7 days.</p>
                            ) : (
                                latestReflections.map((r, idx) => {
                                    const initials = r.user?.name
                                        ? r.user.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                                        : 'U';
                                    return (
                                        <Card className="mb-3" key={idx}>
                                            <Card.Body className="d-flex">
                                                <div className="me-3 rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center" style={{ width: 40, height: 40 }}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <strong>{r.user?.name || 'Unknown'}</strong> <Badge bg="info" className="ms-2">{r.theme}</Badge><br />
                                                    <small className="text-muted">{new Date(r.date).toLocaleDateString()}</small>
                                                    <p className="mt-2 mb-0">{r.content}</p>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    );
                                })
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>
                {`
  .react-calendar {
    border: none;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
  }

  .react-calendar__navigation button {
    color: #333;
    background: none;
    border: none;
    font-weight: bold;
    font-size: 14px;
  }

  .react-calendar__tile {
    padding: 12px 0px;
    border-radius: 6px;
    background-color:rgb(204, 201, 201); /* light green for all tiles */
    transition: background 0.3s;
  }

  .react-calendar__tile--now {
    background-color:#159b8f !important; /* pink for today */
    color:rgb(241, 241, 241) !important;
    font-weight: bold;
  }

  .react-calendar__tile.highlight-date {
    background-color:#f57c00 !important; /* green for appointments this week */
    color: white !important;
    font-weight: bold;
  }
`}
            </style>

            {/* MODALS */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton><Modal.Title>Appointment Details</Modal.Title></Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <>
                            <p><strong>Patient:</strong> {selectedAppointment.user?.name}</p>
                            <p><strong>Date:</strong> {selectedAppointment.date}</p>
                            <p><strong>Time:</strong> {selectedAppointment.time?.slice(0, 5)}</p>
                            <p><strong>Discussion:</strong> {selectedAppointment.discussion || '—'}</p>
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
                    Are you sure you want to cancel this appointment with <strong>{selectedAppointment?.user?.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>No</Button>
                    <Button variant="danger" onClick={confirmCancel}>Yes, Cancel</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PsychologistDashboard;
