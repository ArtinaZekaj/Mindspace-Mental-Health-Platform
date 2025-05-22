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
import PsychologistPatients from './psychologists/PsychologistPatients';
import PsychologistAppointments from './psychologists/PsychologistAppointments';
import ReflectionsAndMoods from './psychologists/ReflectionsAndMoods';
import PatientNotes from './psychologists/PatientNotes';


function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const getDashboardRouteByRole = (role) => {
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'psychologist':
        return '/dashboard/psychologist';
      default:
        return '/dashboard';
    }
  };

  return (
    <Router>
      <Routes>
        {/* Redirect based on role */}
        <Route path="/" element={<Navigate to={getDashboardRouteByRole(role)} />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin route */}
        {token && role === 'admin' && (
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        )}

        {/* Psychologist route */}
        {token && role === 'psychologist' && (
          <Route path="/dashboard/psychologist" element={<PsychologistLayout />}>
            <Route index element={<PsychologistDashboard />} />
            <Route path="patients" element={<PsychologistPatients />} />
            <Route path="appointments" element={<PsychologistAppointments />} />
            <Route path="reflections-moods" element={<ReflectionsAndMoods />} />
            <Route path="patient-notes" element={<PatientNotes />} />
          </Route>
        )}

        {/* User route */}
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

        {/* Unauthorized fallback */}
        {!token && (
          <Route path="/dashboard" element={<Navigate to="/login" />} />
        )}

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
