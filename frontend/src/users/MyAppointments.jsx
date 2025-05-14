import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Card, Button, Badge, Row, Col, Spinner, Modal, Form
} from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaUserMd, FaEdit, FaTrash } from 'react-icons/fa';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, date: '', time: '' });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/appointments/my', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAppointments(response.data);
      setSessionCount(response.data.length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`http://localhost:8000/api/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchAppointments();
      } catch (error) {
        console.error('Failed to cancel:', error);
      }
    }
  };

  const handleEditClick = (appointment) => {
    const formattedTime = appointment.time.substring(0, 5); // "12:00:00" → "12:00"
    setEditData({ id: appointment.id, date: appointment.date, time: formattedTime });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const convertedTime = editData.time.length === 5 ? `${editData.time}:00` : editData.time;

      await axios.put(`http://localhost:8000/api/appointments/${editData.id}`, {
        date: editData.date,
        time: convertedTime
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setShowEditModal(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4 text-left fw-bold" style={{ color: 'rgb(39, 59, 37)' }}>
        📅 My Appointments
      </h1>

      <Card
        className="p-4 shadow rounded-4 border-0 text-black"
        style={{
          background: 'linear-gradient(to right, rgb(224, 238, 223), rgb(238, 234, 236))',
          marginTop: '40px',
          marginBottom: '40px',
        }}
      >
        <Card.Body>
          <h3 className="fw-bold mb-3 d-flex align-items-center">
            🎉 Celebrating Your Progress!
            <Badge bg="light" text="dark" className="ms-3 fs-6">
              {sessionCount} session{sessionCount !== 1 ? 's' : ''}
            </Badge>
          </h3>
          <p className="fs-5">
            You've completed <strong>{sessionCount}</strong> session{sessionCount !== 1 ? 's' : ''}!
            Every step you take matters—keep going!
          </p>

          <Row className="mt-4 text-center">
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm p-3 h-100">
                <h5 className="text-primary">🌱 Commitment</h5>
                <p className="text-muted">Showing up for yourself regularly</p>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm p-3 h-100">
                <h5 className="text-warning">📈 Progress</h5>
                <p className="text-muted">You're moving forward step-by-step</p>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm p-3 h-100">
                <h5 className="text-info">🧘 Self-Care</h5>
                <p className="text-muted">Taking care of your mental wellness</p>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : appointments.length > 0 ? (
        appointments.map((appointment) => (
          <Card
            className="mb-4 shadow"
            key={appointment.id}
            style={{
              borderWidth: '2px',
              borderStyle: 'solid',
              padding: '20px',
              fontSize: '1.4rem',
            }}
          >
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Card.Title><FaUserMd /> {appointment.psychologist.name}</Card.Title>
                  <Card.Text><FaCalendarAlt /> {appointment.date}</Card.Text>
                  <Card.Text><FaClock /> {appointment.time}</Card.Text>
                  <Badge bg={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </Col>
                <Col md={4} className="text-end">
                  <Button variant="outline-primary" className="me-2" onClick={() => handleEditClick(appointment)}><FaEdit /></Button>
                  {appointment.status === 'pending' && (
                    <Button variant="outline-danger" onClick={() => handleCancel(appointment.id)}><FaTrash /></Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>No appointments found.</p>
      )}

      {/* Modal for editing appointment */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={editData.time}
                onChange={(e) => setEditData({ ...editData, time: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
          <Button variant="success" onClick={handleEditSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Custom success popup */}
      {showSuccessToast && (
        <div
          className="position-fixed top-50 start-50 translate-middle p-4"
          style={{ zIndex: 1055 }}
        >
          <div
            className="alert alert-success d-flex align-items-center shadow-lg rounded-4"
            role="alert"
            style={{ fontSize: '1.2rem', padding: '1.5rem 2rem', minWidth: '320px' }}
          >
            <div className="me-3">
              <i className="bi bi-check-circle-fill fs-3 text-success"></i>
            </div>
            <div>
              <strong>Success!</strong><br />
              Appointment updated successfully.
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default MyAppointments;
