import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './layout/Layout';
import Login from './auth/Login';
import Register from './auth/Register';
import SimpleUserDashboard from './users/SimpleUserDashboard';
import AdminDashboard from './admin/AdminDashboard';
import MoodTracking from './users/MoodTracking';
import DailyReflection from './users/DailyReflection';
import BookAppointment from './users/BookAppointment';
import MyAppointments from './users/MyAppointments';
import CalendarPersonal from './users/CalendarPersonal';
import Profile from './users/Profile';
import PsychologistLayout from './layout/PsychologistLayout';
import PsychologistDashboard from './psychologists/PsychologistDashboard';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-Based Routes */}
        {token && role === 'admin' && (
          <Route path="/dashboard" element={<AdminDashboard />} />
        )}

        {/* {token && role === 'psychologist' && (
          <Route path="/dashboard" element={<PsychologistDashboard />} />
        )} */}

        {token && role === 'user' && (
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<SimpleUserDashboard />} />
            <Route path="mood" element={<MoodTracking />} />
            <Route path="daily-reflection" element={<DailyReflection />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="my-appointments" element={<MyAppointments />} />
            <Route path="calendar" element={<CalendarPersonal />} />
            <Route path="profile" element={<Profile />} />

          </Route>
        )}

        {/* Route për psikologun */}
        {token && role === 'psychologist' && (
          <Route path="/dashboard/psychologist" element={<PsychologistLayout />}>
            <Route path="psychologist" element={<PsychologistDashboard />} />
          </Route>
        )}

        {/* Redirect if no token */}
        {!token && (
          <Route path="/dashboard" element={<Navigate to="/login" />} />
        )}

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
