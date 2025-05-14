// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Container, Row, Col, Card, Table, Spinner } from 'react-bootstrap';
// import { FaUser, FaCalendarAlt, FaPenFancy, FaSmile } from 'react-icons/fa';

// function PsychologistDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [appointments, setAppointments] = useState([]);
//   const [reflections, setReflections] = useState([]);
//   const [patients, setPatients] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const token = localStorage.getItem('token');

//       const [appointmentsRes, reflectionsRes] = await Promise.all([
//         axios.get('http://localhost:8000/api/psychologist/appointments', {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get('http://localhost:8000/api/reflections', {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       const today = new Date().toISOString().split('T')[0];
//       const todaysAppointments = appointmentsRes.data.filter(
//         (appt) => appt.date === today
//       );

//       const uniquePatients = Array.from(
//         new Map(
//           appointmentsRes.data.map((appt) => [appt.user_id, appt.user])
//         ).values()
//       );

//       setAppointments(todaysAppointments);
//       setReflections(reflectionsRes.data);
//       setPatients(uniquePatients);
//     } catch (error) {
//       console.error('Error loading dashboard:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Spinner animation="border" className="m-5" />;

//   return (
//     <Container className="mt-4">
//       <h2 className="fw-bold mb-4">Welcome, Psychologist 👩‍⚕️</h2>

//       {/* Stats */}
//       <Row className="mb-4">
//         <Col md={4}>
//           <Card className="text-center shadow-sm">
//             <Card.Body>
//               <FaUser size={30} className="mb-2" />
//               <h5>Total Patients</h5>
//               <h3>{patients.length}</h3>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="text-center shadow-sm">
//             <Card.Body>
//               <FaCalendarAlt size={30} className="mb-2" />
//               <h5>Today's Appointments</h5>
//               <h3>{appointments.length}</h3>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="text-center shadow-sm">
//             <Card.Body>
//               <FaPenFancy size={30} className="mb-2" />
//               <h5>Reflections Submitted</h5>
//               <h3>{reflections.length}</h3>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Today's Appointments */}
//       <h4 className="mb-3">📅 Today's Appointments</h4>
//       <Table striped bordered responsive>
//         <thead>
//           <tr>
//             <th>Patient</th>
//             <th>Date</th>
//             <th>Time</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {appointments.length === 0 ? (
//             <tr>
//               <td colSpan="4" className="text-center">No appointments today.</td>
//             </tr>
//           ) : (
//             appointments.map((appt, index) => (
//               <tr key={index}>
//                 <td>{appt.user?.name || 'Unknown'}</td>
//                 <td>{appt.date}</td>
//                 <td>{appt.time}</td>
//                 <td>{appt.status}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>

//       {/* My Patients */}
//       <h4 className="mt-5 mb-3">🧑‍🤝‍🧑 My Patients</h4>
//       <Table striped bordered responsive>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Last Mood</th>
//           </tr>
//         </thead>
//         <tbody>
//           {patients.length === 0 ? (
//             <tr><td colSpan="3" className="text-center">No patients found.</td></tr>
//           ) : (
//             patients.map((patient, i) => (
//               <tr key={i}>
//                 <td>{patient.name}</td>
//                 <td>{patient.email}</td>
//                 <td><FaSmile className="text-warning" /> {/* placeholder */}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>

//       {/* Latest Reflections */}
//       <h4 className="mt-5 mb-3">📝 Latest Reflections</h4>
//       <Table striped bordered responsive>
//         <thead>
//           <tr>
//             <th>Patient</th>
//             <th>Theme</th>
//             <th>Content</th>
//             <th>Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {reflections.length === 0 ? (
//             <tr><td colSpan="4" className="text-center">No reflections found.</td></tr>
//           ) : (
//             reflections.slice(0, 5).map((reflection, i) => (
//               <tr key={i}>
//                 <td>{reflection.user?.name || 'Unknown'}</td>
//                 <td>{reflection.theme}</td>
//                 <td>{reflection.content.slice(0, 40)}...</td>
//                 <td>{reflection.date}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>
//     </Container>
//   );
// }

// export default PsychologistDashboard;
