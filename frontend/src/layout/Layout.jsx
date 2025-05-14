import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container, Nav } from 'react-bootstrap';
import { FaBell, FaUser, FaHome, FaSmile, FaBookOpen, FaCalendarPlus, FaCalendarAlt, } from 'react-icons/fa';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { Dropdown } from 'react-bootstrap';

function Layout() {
    const navigate = useNavigate();

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="bg-white border-end d-flex flex-column px-4 py-4" style={{ width: '310px' }}>
                <div
                    className="d-flex justify-content-center mb-5"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    <h3 className="fw-bold m-0">
                        <span style={{ color: 'rgb(39, 59, 37)' }}>Mind</span>
                        <span style={{ color: '#005bff' }}>Space</span>
                    </h3>
                </div>

                <Nav className="flex-column gap-3">
                    <Nav.Link onClick={() => navigate('/dashboard')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaHome size={25} /> <span>Dashboard</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/mood')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaSmile size={25} /> <span>Mood Tracking</span>
                    </Nav.Link>

                    <Nav.Link onClick={() => navigate('/dashboard/daily-reflection')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaBookOpen size={25} /> <span>Daily Reflection</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/book-appointment')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaCalendarPlus size={25} /> <span>Book Appointment</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/my-appointments')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaCalendarAlt size={25} /> <span>My Appointments</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/calendar')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaRegCalendarCheck size={25} /> <span>Calendar Personal</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/profile')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaUser size={25} /> <span>Profile</span>
                    </Nav.Link>



                </Nav>
            </div>

            {/* Main content */}
            <div className="flex-grow-1 d-flex flex-column">
                {/* Top Navbar */}
                <div className="bg-white px-4 d-flex justify-content-end align-items-center" style={{ height: '80px', paddingBottom: '0', marginBottom: '0' }}>
                    <Dropdown align="end">
                        <Dropdown.Toggle
                            variant="light"
                            className="d-flex align-items-center gap-2 border-0 bg-transparent"
                            style={{ boxShadow: 'none' }}
                        >
                            <div className="bg-light rounded-circle p-2">
                                <FaUser className="text-secondary fs-5" />
                            </div>
                            <strong className="fs-6 text-dark mb-0">{localStorage.getItem('name') || 'User'}</strong>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => navigate('/dashboard/profile')}>View Profile</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                                onClick={() => {
                                    localStorage.clear(); // Remove token + user info
                                    navigate('/login');   // Redirect to login
                                }}
                                className="text-danger"
                            >
                                Log Out
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                </div>

                {/* Content container */}
                <div className="flex-grow-1 px-4 pb-4 bg-light">
                    <Container fluid>
                        <Outlet />
                    </Container>
                </div>
            </div>
        </div>
    );
}

export default Layout;
