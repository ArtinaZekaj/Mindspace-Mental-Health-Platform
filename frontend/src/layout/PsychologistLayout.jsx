import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {FaUserFriends,FaCalendarAlt,FaPen,FaSignOutAlt,FaChartBar,FaHome,FaSearch,FaClipboard} from 'react-icons/fa';
import { Nav } from 'react-bootstrap';
import { useState } from 'react';

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
                <h3 className="fw-bold m-0 mb-4">
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
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/analytics')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaChartBar size={22} /> <span>Analytics</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/notes')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaClipboard size={22} /> <span>Patient Notes</span>
                    </Nav.Link>
                    <Nav.Link onClick={handleLogout} className="d-flex align-items-center gap-3 fs-5 text-danger mt-3">
                        <FaSignOutAlt size={22} /> <span>Log out</span>
                    </Nav.Link>
                    

                </Nav>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1">
                {/* Top Header */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
                    <div className="d-flex align-items-center" style={{ width: '300px' }}>
                        <FaSearch className="me-2 text-muted" />
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search patients, appointments..."
                        />
                    </div>

                    <div className="d-flex align-items-center">
                        <div
                            className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center me-2"
                            style={{ backgroundColor: '#3da08f', width: '35px', height: '35px' }}
                        >
                            {initials}
                        </div>
                        <div>
                            <div className="fw-bold" style={{ fontSize: '0.9rem', color: '#333' }}>
                                {name}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Clinical Psychologist
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default PsychologistLayout;
