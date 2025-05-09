import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FaSmile, FaPen, FaCalendarPlus, FaCalendarAlt, FaChartLine, FaUser } from 'react-icons/fa';

function SimpleUserDashboard() {
  const userName = localStorage.getItem('name') || 'User';

  return (
    <>
      {/* Welcome Banner */}
      <div
        className="shadow w-100"
        style={{
          background: 'linear-gradient(to right,rgb(39, 59, 37),rgb(219, 194, 210))', color: 'white',
          // color: "#333", 
          marginTop: '0',
          marginBottom: '2rem',
          padding: '4rem 3rem',
          borderRadius: '1rem'
        }}
      >
        <h3 className="fw-bold" style={{ fontSize: '2.8rem' }}>
          Good evening, {userName}
        </h3>
        <p className="mb-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        <p className="fs-5">
          <em>Every day is a new beginning. Take a deep breath and start again.</em>
        </p>
      </div>


      {/* Top Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm rounded-3" style={{ minHeight: '320px' }}>
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="mb-0"><FaSmile className="me-2 text-primary" />Today's Mood</Card.Title>
                  <a href="#" className="text-primary fw-semibold">Track Now</a>
                </div>
                <img src="/path/to/mood-chart-placeholder.png" alt="Mood Chart" className="img-fluid" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm rounded-3" style={{ backgroundColor: '#e6fff2', minHeight: '320px' }}>
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title><FaPen className="me-2 text-success" />Daily Reflection</Card.Title>
                <p className="fst-italic">"What are three things you're grateful for today?"</p>
              </div>
              <Button variant="success" className="w-100 mt-3">Write Your Reflection</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm rounded-3" style={{ backgroundColor: '#f8e6ff', minHeight: '320px' }}>
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title><FaCalendarAlt className="me-2 text-secondary" />Next Appointment</Card.Title>
                <p className="mb-1 fw-bold">January 15, 2025</p>
                <p className="mb-2">10:00 AM<br />with Dr. Sarah Johnson</p>
              </div>
              <Button variant="light" className="w-100 border">View All Appointments</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Shortcuts */}
      <Row className="g-3">
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body>
              <FaSmile size={26} className="mb-2 text-primary" />
              <p className="fw-semibold m-0">Track Mood</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body>
              <FaPen size={26} className="mb-2 text-success" />
              <p className="fw-semibold m-0">Write Reflection</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body>
              <FaCalendarPlus size={26} className="mb-2 text-danger" />
              <p className="fw-semibold m-0">Book Appointment</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body>
              <FaCalendarAlt size={26} className="mb-2 text-info" />
              <p className="fw-semibold m-0">My Appointments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body>
              <FaChartLine size={26} className="mb-2 text-warning" />
              <p className="fw-semibold m-0">Mood History</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body>
              <FaUser size={26} className="mb-2 text-dark" />
              <p className="fw-semibold m-0">Profile</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default SimpleUserDashboard;
