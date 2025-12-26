import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Public routes
import Login from './auth/Login';
import Register from './auth/Register';

// Layouts
import Layout from './layout/Layout';
import AdminLayout from './layout/AdminLayout';
import PsychologistLayout from './layout/PsychologistLayout';


// Admin Routes:
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminPatients = lazy(() => import('./admin/AdminPatients'));
const AdminPsychologist = lazy(() => import('./admin/AdminPsychologist'));
const AdminAppointments = lazy(() => import('./admin/AdminAppointments'));

//Psychologist Routes:
const PsychologistDashboard = lazy(() => import('./psychologists/PsychologistDashboard'));
const PsychologistPatients = lazy(() => import('./psychologists/PsychologistPatients'));
const PsychologistAppointments = lazy(() => import('./psychologists/PsychologistAppointments'));
const ReflectionsAndMoods = lazy(() => import('./psychologists/ReflectionsAndMoods'));
const PatientNotes = lazy(() => import('./psychologists/PatientNotes'));

//User Routes:
const SimpleUserDashboard = lazy(() => import('./users/SimpleUserDashboard'));
const MoodTracking = lazy(() => import('./users/MoodTracking'));
const DailyReflection = lazy(() => import('./users/DailyReflection'));
const BookAppointment = lazy(() => import('./users/BookAppointment'));
const MyAppointments = lazy(() => import('./users/MyAppointments'));
const CalendarPersonal = lazy(() => import('./users/CalendarPersonal'));
const Profile = lazy(() => import('./users/Profile'));




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
      <Suspense fallback={<div className="text-center p-5">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to={getDashboardRouteByRole(role)} />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          {token && role === 'admin' && (
            <Route path="/dashboard/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="psychologist" element={<AdminPsychologist />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          )}

          {/* Psychologist Routes */}
          {token && role === 'psychologist' && (
            <Route path="/dashboard/psychologist" element={<PsychologistLayout />}>
              <Route index element={<PsychologistDashboard />} />
              <Route path="patients" element={<PsychologistPatients />} />
              <Route path="appointments" element={<PsychologistAppointments />} />
              <Route path="reflections-moods" element={<ReflectionsAndMoods />} />
              <Route path="patient-notes" element={<PatientNotes />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          )}

          {/* User Routes */}
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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
