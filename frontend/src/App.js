import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './Layout';
import Login from './Login';
import Register from './Register';
import SimpleUserDashboard from './SimpleUserDashboard';
import AdminDashboard from './AdminDashboard';
import PsychologistDashboard from './PsychologistDashboard';
import MoodTracking from './MoodTracking';
import DailyReflection from './DailyReflection';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin and Psychologist dashboards */}
        {token && role === 'admin' && (
          <Route path="/dashboard" element={<AdminDashboard />} />
        )}
        {token && role === 'psychologist' && (
          <Route path="/dashboard" element={<PsychologistDashboard />} />
        )}

        {/* User layout with nested routes */}
        {token && role === 'user' && (
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<SimpleUserDashboard />} />
            <Route path="mood" element={<MoodTracking />} />
            <Route path="daily-reflection" element={<DailyReflection />} />
          </Route>
        )}

        {/* Fallback për jo të loguar */}
        {!token && (
          <Route path="/dashboard" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
