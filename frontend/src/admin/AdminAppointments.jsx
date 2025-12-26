import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Table, Row, Col, Badge, Button, Form } from 'react-bootstrap';
import { FaCalendarPlus, FaClock, FaUser, FaUserMd } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';

const AdminAppointments = () => {

    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        user_id: '',
        psychologist_id: '',
        date: '',
        time: '',
    });
    const [users, setUsers] = useState([]);
    const [psychologists, setPsychologists] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchAppointments = async () => {
            const res = await axios.get('http://localhost:8000/api/admin/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        };

        fetchAppointments();
    }, []);

    const statusColors = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
    };

    const filtered = appointments.filter(a => {
        const matchStatus = statusFilter === 'All' || a.status === statusFilter;
        const matchDate = !dateFilter || a.date === dateFilter;
        const matchSearch =
            a.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.psychologist?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const anyFilterActive = searchTerm.trim() !== '' || dateFilter || statusFilter !== 'All';

        if (!anyFilterActive) {
            // Filter for only the next 7 days
            const today = new Date();
            const oneWeekFromNow = new Date();
            oneWeekFromNow.setDate(today.getDate() + 7);

            const appointmentDate = new Date(a.date);

            // Normalize dates (ignore time)
            appointmentDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            oneWeekFromNow.setHours(0, 0, 0, 0);

            return appointmentDate >= today && appointmentDate <= oneWeekFromNow;
        }

        return matchStatus && matchDate && matchSearch;
    });
    //Update status, approved or canceled
    const handleStatusChange = async (id, newStatus) => {
        const displayStatus = newStatus === 'rejected' ? 'Canceled' : newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        const confirm = window.confirm(`Are you sure you want to mark this appointment as ${displayStatus}?`);

        if (!confirm) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/admin/appointments/${id}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAppointments(prev =>
                prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
            );
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Something went wrong while updating the appointment.');
        }
    };

    //Add Appointment:
    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchAppointments = async () => {
            const res = await axios.get('http://localhost:8000/api/admin/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        };

        const fetchUsersAndPsychologists = async () => {
            const [userRes, psychRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/patients', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8000/api/admin/psychologists', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
            ]);

            setUsers(userRes.data);
            setPsychologists(psychRes.data);
        };

        fetchAppointments();
        fetchUsersAndPsychologists();
    }, []);

    //Add Appointment
    const handleCreate = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('http://localhost:8000/api/admin/appointments', {
                ...newAppointment,
                status: 'pending'
            }, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            setAppointments(prev => [res.data, ...prev]);
            setShowModal(false);
            setNewAppointment({ user_id: '', psychologist_id: '', date: '', time: '' });
            setSuccessMessage('Appointment created successfully! ✅');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error(err.response?.data);
            alert('Failed to create appointment');
        }
    };


    return (
        <div className="p-4" style={{ backgroundColor: '#f9fbfd', minHeight: '100vh' }}>
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="py-4 px-5">
                    <h2 className="fw-semibold text-dark mb-2">Manage Appointments</h2>
                    <p className="text-muted mb-0">
                        You organize, support, and protect the heart of the platform - your leadership is the silent power behind every smile. 🌱✨
                    </p>
                </Card.Body>
            </Card>


            <Row className="mb-4">
                {/* Filters + Controls */}
                <Card className="mb-4 p-3" style={{ background: 'transparent', border: 'none' }}>
                    <Row className="g-3 align-items-center">
                        <Col md={3}>
                            <Form.Control
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-pill shadow-sm"
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Control
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="rounded-pill shadow-sm"
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-pill shadow-sm"
                            >
                                <option value="All">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Canceled</option>
                            </Form.Select>
                        </Col>
                        <Col md={3} className="text-md-end text-center">
                            <Button
                                variant="primary"
                                className="rounded-pill px-4 shadow-sm"
                                onClick={() => setShowModal(true)}
                            >
                                <FaCalendarPlus className="me-2" />
                                Add Appointment
                            </Button>

                        </Col>
                    </Row>
                </Card>
            </Row>

            {/* Appointments Table */}
            {successMessage && (
                <div className="alert alert-success text-center mx-4 mt-2" role="alert">
                    {successMessage}
                </div>
            )}
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-light fw-semibold">Upcoming Appointments</Card.Header>
                <Table hover responsive className="mb-0">
                    <thead>
                        <tr>
                            <th><FaUser /> Patient</th>
                            <th><FaUserMd /> Psychologist</th>
                            <th><FaCalendarPlus /> Date</th>
                            <th><FaClock /> Time</th>
                            <th>Status</th>
                            <th style={{ paddingLeft: '75px' }}>Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map(a => (
                                <tr key={a.id}>
                                    <td>{a.user?.name || 'Unknown'}</td>
                                    <td>{a.psychologist?.name || 'Unknown'}</td>
                                    <td>{a.date}</td>
                                    <td>{a.time}</td>
                                    <td>
                                        <Badge bg={statusColors[a.status]} className="text-uppercase">
                                            {a.status === 'rejected' ? 'Canceled' : a.status}
                                        </Badge>
                                    </td>

                                    <td>
                                        {a.status === 'pending' ? (
                                            <div className="d-flex" style={{ marginLeft: '40px', gap: '10px' }}>
                                                <Button
                                                    size="sm"
                                                    variant="outline-success"
                                                    className="rounded-pill px-3"
                                                    onClick={() => handleStatusChange(a.id, 'approved')}
                                                >
                                                    <i className="fa fa-check me-1"></i> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="rounded-pill px-3"
                                                    onClick={() => handleStatusChange(a.id, 'rejected')}
                                                >
                                                    <i className="fa fa-times me-1"></i> Cancel
                                                </Button>
                                            </div>
                                        ) : null}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-muted text-center">No appointments found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Patient</Form.Label>
                        <Form.Select
                            value={newAppointment.user_id}
                            onChange={(e) => setNewAppointment({ ...newAppointment, user_id: e.target.value })}
                        >
                            <option value="">Select Patient</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Psychologist</Form.Label>
                        <Form.Select
                            value={newAppointment.psychologist_id}
                            onChange={(e) => setNewAppointment({ ...newAppointment, psychologist_id: e.target.value })}
                        >
                            <option value="">Select Psychologist</option>
                            {psychologists.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={newAppointment.date}
                            onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Time</Form.Label>
                        <Form.Control
                            type="time"
                            value={newAppointment.time}
                            onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreate}>Create</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default AdminAppointments;
