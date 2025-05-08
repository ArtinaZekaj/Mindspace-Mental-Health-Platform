// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login';
import Register from './Register';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import PsychologistDashboard from './PsychologistDashboard';


function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            token ? (
              role === 'admin' ? <AdminDashboard /> :
              role === 'psychologist' ? <PsychologistDashboard /> :
              <StudentDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
