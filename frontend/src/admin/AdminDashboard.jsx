import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col } from 'react-bootstrap';
import { FaUsers, FaUserMd, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {

    const [adminName, setAdminName] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPsychologists, setTotalPsychologists] = useState(0);
    const [appointmentsToday, setAppointmentsToday] = useState(0);
    const [appointmentsThisMonth, setAppointmentsThisMonth] = useState(0);
    const [recentAppointments, setRecentAppointments] = useState([]);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch logged-in admin info
                const meRes = await axios.get('http://localhost:8000/api/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAdminName(meRes.data.name);

                // Fetch admin dashboard stats
                const statsRes = await axios.get('http://localhost:8000/api/admin/dashboard-stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                //Recent Appointments
                const appointmentsRes = await axios.get('http://localhost:8000/api/admin/recent-appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                //Mood Statistics
                const moodRes = await axios.get('http://localhost:8000/api/admin/mood-statistics', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTotalUsers(statsRes.data.total_users);
                setTotalPsychologists(statsRes.data.total_psychologists);
                setAppointmentsToday(statsRes.data.appointments_today);
                setAppointmentsThisMonth(statsRes.data.appointments_this_month);
                setRecentAppointments(appointmentsRes.data);
                setMoodStats(moodRes.data);

            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            }
        };

        fetchAdminData();
    }, []);

    const [moodStats, setMoodStats] = useState({
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0
    });

    return (
        <div className="p-4" style={{ backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
            {/* Motivational Header */}
            <div
                className="mb-4 p-4 rounded shadow-sm"
                style={{
                    // background: 'linear-gradient(135deg, #ffecd2, #fcb69f)', // soft peach & coral
                    // color: '#2d3436'
                    background: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
                    color: '#2d3436',
                    padding: '1.5rem'
                }}
            >
                <h2 className="fw-bold mb-2">Welcome back, {adminName}! 💼</h2>
                <p style={{ fontSize: '1.1rem' }}>
                    Thank you for supporting mental well-being across the platform. Your presence makes a difference every day. Keep spreading positivity! 🌟💙
                </p>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4 g-4">
                <Col md={3}>
                    <Card className="shadow-sm border-0 text-dark" style={{ background: 'linear-gradient(135deg, #d4fc79, #96e6a1)', minHeight: '150px' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="fw-bold mb-0" style={{ fontSize: '1.3rem' }}>Total Users</Card.Title>
                                <FaUsers size={32} />
                            </div>
                            <h3 className="fw-bold" style={{ fontSize: '2.2rem' }}>{totalUsers}</h3>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="shadow-sm border-0 text-dark" style={{ background: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)', minHeight: '150px' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="fw-bold mb-0" style={{ fontSize: '1.3rem' }}>Psychologists</Card.Title>
                                <FaUserMd size={32} />
                            </div>
                            <h3 className="fw-bold" style={{ fontSize: '2.2rem' }}>{totalPsychologists}</h3>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="shadow-sm border-0 text-dark" style={{ background: 'linear-gradient(135deg, #fddb92, #d1fdff)', minHeight: '150px' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="fw-bold mb-0" style={{ fontSize: '1.3rem' }}>Appointments Today</Card.Title>
                                <FaCalendarAlt size={32} />
                            </div>
                            <h3 className="fw-bold" style={{ fontSize: '2.2rem' }}>{appointmentsToday}</h3>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="shadow-sm border-0 text-dark" style={{ background: 'linear-gradient(135deg, #f6d365, #fda085)', minHeight: '150px' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="fw-bold mb-0" style={{ fontSize: '1.3rem' }}>
                                    Appointments This Month
                                </Card.Title>
                                <FaChartLine size={32} />
                            </div>
                            <h3 className="fw-bold" style={{ fontSize: '2.2rem' }}>{appointmentsThisMonth}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Recent Appointments */}
                <Col md={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="fw-bold">Recent Appointments</Card.Title>
                                <a href="#" className="text-primary text-decoration-none">View all</a>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-borderless align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Patient</th>
                                            <th>Psychologist</th>
                                            <th>Date & Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentAppointments.map((appt, index) => (
                                            <tr key={index}>
                                                <td>{appt.user?.name}</td>
                                                <td>{appt.psychologist?.name}</td>
                                                <td>
                                                    {appt.date}<br />
                                                    {appt.time.slice(0, 5)}
                                                </td>
                                                <td>
                                                    <span className={`badge ${appt.status === 'approved' ? 'bg-success' :
                                                        appt.status === 'pending' ? 'bg-warning text-dark' :
                                                            'bg-danger'}`}>
                                                        {appt.status === 'rejected' ? 'Canceled' : appt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Mood Statistics */}
                <Col md={4}>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Card.Title className="fw-bold mb-3">Mood Statistics</Card.Title>

                            <p className="mb-1 fw-semibold text-success">
                                Positive <span className="float-end">{((moodStats.positive / moodStats.total) * 100 || 0).toFixed(0)}%</span>
                            </p>
                            <div className="progress mb-3">
                                <div className="progress-bar bg-success" style={{ width: `${(moodStats.positive / moodStats.total) * 100 || 0}%` }}></div>
                            </div>

                            <p className="mb-1 fw-semibold text-primary">
                                Neutral <span className="float-end">{((moodStats.neutral / moodStats.total) * 100 || 0).toFixed(0)}%</span>
                            </p>
                            <div className="progress mb-3">
                                <div className="progress-bar bg-primary" style={{ width: `${(moodStats.neutral / moodStats.total) * 100 || 0}%` }}></div>
                            </div>

                            <p className="mb-1 fw-semibold text-danger">
                                Negative <span className="float-end">{((moodStats.negative / moodStats.total) * 100 || 0).toFixed(0)}%</span>
                            </p>
                            <div className="progress mb-4">
                                <div className="progress-bar bg-danger" style={{ width: `${(moodStats.negative / moodStats.total) * 100 || 0}%` }}></div>
                            </div>

                            <div className="d-flex justify-content-around">
                                <div className="text-center">
                                    <span className="d-block text-success fw-bold fs-5">●</span>
                                    <small>Positive</small>
                                    <div className="fw-bold">{moodStats.positive}</div>
                                </div>
                                <div className="text-center">
                                    <span className="d-block text-primary fw-bold fs-5">●</span>
                                    <small>Neutral</small>
                                    <div className="fw-bold">{moodStats.neutral}</div>
                                </div>
                                <div className="text-center">
                                    <span className="d-block text-danger fw-bold fs-5">●</span>
                                    <small>Negative</small>
                                    <div className="fw-bold">{moodStats.negative}</div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </div>
    );
};

export default AdminDashboard;
