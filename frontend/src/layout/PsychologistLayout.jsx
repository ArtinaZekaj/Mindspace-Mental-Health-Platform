import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaUserFriends, FaCalendarAlt, FaPen, FaUserCircle, FaUser, FaHome, FaSearch, FaClipboard } from 'react-icons/fa';
import { Nav, Dropdown, Container } from 'react-bootstrap';

function PsychologistLayout() {
    const navigate = useNavigate();
    const name = localStorage.getItem('name') || 'Psychologist';

    const initials = name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar */}
            <div className="bg-white border-end d-flex flex-column p-3" style={{ width: '250px' }}>
                <h3
                    className="fw-bold"
                    onClick={() => navigate('/dashboard/psychologist')}
                    style={{ marginTop: '20px', marginBottom: '55px', cursor: 'pointer' }}
                >
                    <span style={{ color: 'rgb(1, 2, 1)' }}>Mind</span>
                    <span style={{ color: '#3da08f' }}>Space</span>
                </h3>

                <Nav className="flex-column gap-3">
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaHome size={22} /> <span>Dashboard</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/patients')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaUserFriends size={22} /> <span>Patients</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/appointments')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaCalendarAlt size={22} /> <span>Appointments</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/reflections-moods')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaPen size={22} /> <span>Reflections</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/patient-notes')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaClipboard size={22} /> <span>Patient Notes</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/profile')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaUserCircle size={22} /> <span>Profile</span>
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
                            <Dropdown.Item onClick={() => navigate('/dashboard/psychologist/profile')}>View Profile</Dropdown.Item>
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

export default PsychologistLayout;
