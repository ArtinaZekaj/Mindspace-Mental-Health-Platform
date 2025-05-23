import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {FaUserFriends,FaCalendarAlt,FaPen,FaSignOutAlt,FaChartBar,FaHome,FaSearch,FaClipboard, FaRegCalendarCheck, FaStethoscope } from 'react-icons/fa';
import { Nav } from 'react-bootstrap';
import { useState } from 'react';

function AdminLayout() {
    const navigate = useNavigate();
    const name = localStorage.getItem('name') || 'admin';
    
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
                <h3 className="fw-bold" style={{ marginTop: '20px', marginBottom: '55px' }}>
                    <span style={{ color: 'rgb(1, 2, 1)' }}>Mind</span>
                    <span style={{ color: '#3da08f' }}>Space</span>
                </h3>

                <Nav className="flex-column gap-3">
                    <Nav.Link onClick={() => navigate('/dashboard/admin')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaHome size={22} /> <span>Dashboard</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/admin/patients')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaUserFriends size={22} /> <span>Patients</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/admin/psychologist')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaStethoscope  size={22} /> <span>Psychologists</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/appointments')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaCalendarAlt size={22} /> <span>Appointments</span>
                    </Nav.Link>
                    <Nav.Link onClick={() => navigate('/dashboard/psychologist/patient-notes')} className="d-flex align-items-center gap-3 fs-5 text-dark">
                        <FaRegCalendarCheck size={22} /> <span>Calendar</span>
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

export default AdminLayout;
