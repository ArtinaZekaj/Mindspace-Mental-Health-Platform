import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { FaClock, FaCalendarAlt, FaUser, FaHeart, FaShieldAlt, FaStar, FaCommentDots } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaComments } from 'react-icons/fa';


function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
    if (modifier === 'AM' && hours === '12') hours = '00';

    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

// ✅ Format date without timezone (local)
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function BookAppointment() {
    const [psychologists, setPsychologists] = useState([]);
    const [psychologistId, setPsychologistId] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [discussion, setDiscussion] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/api/me', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            if (res.data.role !== 'user') {
                navigate('/dashboard');
            }
        }).catch(() => navigate('/login'));
    }, []);

    useEffect(() => {
        const fetchPsychologists = async () => {
            const res = await axios.get('http://localhost:8000/api/psychologists', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPsychologists(res.data);
        };
        fetchPsychologists();
    }, []);

    useEffect(() => {
        const fetchSlots = async () => {
            if (psychologistId && selectedDate) {
                try {
                    const res = await axios.get('http://localhost:8000/api/appointments/available-slots', {
                        params: {
                            psychologist_id: psychologistId,
                            date: formatLocalDate(selectedDate)
                        },
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setAvailableSlots(res.data.slots);
                } catch {
                    setAvailableSlots([]);
                }
            } else {
                setAvailableSlots([]);
            }
        };
        fetchSlots();
    }, [psychologistId, selectedDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !psychologistId) {
            setError('Please select all fields.');
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/appointments', {
                psychologist_id: psychologistId,
                date: formatLocalDate(selectedDate),
                time: convertTo24Hour(selectedTime),
                discussion
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setMessage('Appointment successfully scheduled!');
            setError('');
            setSelectedDate(null);
            setSelectedTime('');
            setPsychologistId('');
            setDiscussion('');
            setAvailableSlots([]);
        } catch (err) {
            console.log(err.response);
            setMessage('');
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <Container className="mt-5 mb-5">
            <div className="text-center mb-5">
                <FaHeart size={40} className="text-danger mb-3" />
                <h2 className="fw-bold">Take the First Step</h2>
                <p className="text-muted fs-6 mx-auto" style={{ maxWidth: 600 }}>
                    You’re not alone. Booking a session with a professional psychologist shows courage and a desire for growth.
                </p>

                <Row className="mt-4 justify-content-center">
                    <Col md={3} className="text-center">
                        <FaShieldAlt size={24} className="text-primary mb-2" />
                        <h6 className="fw-semibold">Confidentiality</h6>
                        <p className="text-muted small">Your sessions are private and secure.</p>
                    </Col>
                    <Col md={3} className="text-center">
                        <FaStar size={24} className="text-primary mb-2" />
                        <h6 className="fw-semibold">Personalized Help</h6>
                        <p className="text-muted small">Support tailored to your unique needs.</p>
                    </Col>
                    <Col md={3} className="text-center">
                        <FaHeart size={24} className="text-primary mb-2" />
                        <h6 className="fw-semibold">Safe Environment</h6>
                        <p className="text-muted small">A non-judgmental and open space.</p>
                    </Col>
                </Row>
            </div>

            <Card className="p-5 shadow-sm mb-5">
                <h3 className="fw-bold mb-4 text-center text-dark d-flex justify-content-center align-items-center gap-2 fs-2">
                    <FaCalendarAlt className="text-danger" /> Schedule Your Session
                </h3>

                <Row className="gx-5 gy-4 justify-content-center text-center mt-2">
                    {/* Psychologist */}
                    <Col xs={12} md={4}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-secondary fs-5 d-flex flex-column align-items-center">
                                <FaUser className="text-primary mb-1" />
                                Psychologist
                            </Form.Label>
                            <Form.Select
                                value={psychologistId}
                                onChange={(e) => setPsychologistId(e.target.value)}
                                className="rounded-3 py-2 fs-6 shadow-sm text-center"
                            >
                                <option value="">Select psychologist...</option>
                                {psychologists.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Date */}
                    <Col xs={12} md={4}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-secondary fs-5 d-flex flex-column align-items-center">
                                <FaCalendarAlt className="text-primary mb-1" />
                                Choose a Date
                            </Form.Label>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => {
                                    setSelectedDate(date);
                                    setSelectedTime('');
                                }}
                                className="form-control rounded-3 py-2 fs-6 shadow-sm text-center"
                                placeholderText="Click to pick date"
                                dateFormat="yyyy-MM-dd"
                                minDate={new Date()}
                            />
                        </Form.Group>
                    </Col>

                    {/* Time Slot */}
                    <Col xs={12} md={4}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-secondary fs-5 d-flex flex-column align-items-center">
                                <FaClock className="text-primary mb-1" />
                                Time Slot
                            </Form.Label>
                            <div className="d-flex flex-wrap gap-2 justify-content-center">
                                {availableSlots.length > 0 ? (
                                    availableSlots.map((slot, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedTime === slot ? 'primary' : 'outline-primary'}
                                            onClick={() => setSelectedTime(slot)}
                                            className={`px-4 py-2 rounded-3 fw-semibold shadow-sm fs-6 ${selectedTime === slot ? '' : 'text-primary'}`}
                                            style={{ minWidth: '110px' }}
                                        >
                                            <FaClock className="me-2" /> {slot}
                                        </Button>
                                    ))
                                ) : (
                                    <small className="text-muted mt-2">No available slots</small>
                                )}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
            </Card>

            <Card className="p-4 shadow-sm">
                <h5 className="fw-bold mb-3 text-center text-dark d-flex justify-content-center align-items-center gap-2 fs-4">
                    <FaComments className="text-danger" /> Tell Us More
                </h5>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>What would you like to discuss?</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={discussion}
                            onChange={(e) => setDiscussion(e.target.value)}
                            placeholder="Feel free to express your thoughts..."
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100">Schedule Appointment</Button>
                </Form>
            </Card>
        </Container>
    );
}

export default BookAppointment;
