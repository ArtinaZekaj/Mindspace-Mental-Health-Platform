import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaUserFriends, FaCalendarAlt, FaPen, FaSignOutAlt } from 'react-icons/fa';

function PsychologistLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-white border-end d-flex flex-column px-4 py-4" style={{ width: '250px' }}>
        <h3 className="fw-bold text-center mb-4">
          <span style={{ color: '#274d37' }}>Mind</span><span style={{ color: '#007bff' }}>Space</span>
        </h3>

        <nav className="nav flex-column">
          <span className="nav-link" onClick={() => navigate('/dashboard/psychologist')}>
            <FaUserFriends className="me-2" /> Dashboard
          </span>
          <span className="nav-link" onClick={() => navigate('/dashboard/psychologist/appointments')}>
            <FaCalendarAlt className="me-2" /> Appointments
          </span>
          <span className="nav-link" onClick={() => navigate('/dashboard/psychologist/reflections')}>
            <FaPen className="me-2" /> Reflections
          </span>
          <span className="nav-link text-danger mt-4" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" /> Log out
          </span>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 bg-light p-4">
        <Outlet />
      </div>
    </div>
  );
}

export default PsychologistLayout;
