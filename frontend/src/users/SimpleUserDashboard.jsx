import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FaSmile, FaPen, FaCalendarPlus, FaCalendarAlt, FaChartLine, FaUser } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SimpleUserDashboard() {
  const userName = localStorage.getItem('name') || 'User';
  const navigate = useNavigate();

  return (
    <>
      {/* Welcome Banner */}
      <div
        className="shadow w-100"
        style={{
          // background: 'linear-gradient(to right,rgb(39, 59, 37),rgb(219, 194, 210))',
          background: '#005bff',
          color: 'white',
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
                  <Card.Title className="mb-0">
                    <FaSmile className="me-2 text-primary" />Today's Mood
                  </Card.Title>
                  <span onClick={() => navigate('/dashboard/mood')} style={{ cursor: 'pointer' }} className="text-primary fw-semibold">
                    Track Now
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart
                    data={[
                      { day: 'Mon', mood: 3 },
                      { day: 'Tue', mood: 4 },
                      { day: 'Wed', mood: 2 },
                      { day: 'Thu', mood: 4 },
                      { day: 'Fri', mood: 5 },
                      { day: 'Sat', mood: 3 },
                      { day: 'Sun', mood: 4 },
                    ]}
                    margin={{ right: 10, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis type="number" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip
                      formatter={(val) => {
                        const moods = {
                          1: 'Very Sad',
                          2: 'Sad',
                          3: 'Neutral',
                          4: 'Happy',
                          5: 'Very Happy',
                        };
                        return moods[val];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#007bff"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>


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
              <Button variant="success" className="w-100 mt-3" onClick={() => navigate('/dashboard/daily-reflection')}>
                Write Your Reflection
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm rounded-3" style={{ backgroundColor: '#f8e6ff', minHeight: '320px' }}>
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title><FaCalendarAlt className="me-2 text-secondary" />Appointments</Card.Title>
                <p className="mt-2">
                  Take time for your mental health. Booking a session can be your first step to healing. 💬
                </p>
              </div>
              <Button variant="primary" className="w-100" onClick={() => navigate('/dashboard/book-appointment')}>
                Book Appointment
              </Button>
            </Card.Body>
          </Card>

        </Col>
      </Row>

      {/* Bottom Shortcuts */}
      <Row className="g-3">
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body onClick={() => navigate('/dashboard/mood')} style={{ cursor: 'pointer' }}>
              <FaSmile size={26} className="mb-2 text-primary" />
              <p className="fw-semibold m-0">Track Mood</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body onClick={() => navigate('/dashboard/daily-reflection')} style={{ cursor: 'pointer' }}>
              <FaPen size={26} className="mb-2 text-success" />
              <p className="fw-semibold m-0">Write Reflection</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body onClick={() => navigate('/dashboard/book-appointment')} style={{ cursor: 'pointer' }}>
              <FaCalendarPlus size={26} className="mb-2 text-danger" />
              <p className="fw-semibold m-0">Book Appointment</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body onClick={() => navigate('/dashboard/my-appointments')} style={{ cursor: 'pointer' }}>
              <FaCalendarAlt size={26} className="mb-2 text-info" />
              <p className="fw-semibold m-0">My Appointments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body onClick={() => navigate('/dashboard/calendar')} style={{ cursor: 'pointer' }}>
              <FaChartLine size={26} className="mb-2 text-warning" />
              <p className="fw-semibold m-0">Calendar Personal</p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={4} lg={2}>
          <Card className="text-center shadow border-0 rounded-4 py-3">
            <Card.Body onClick={() => navigate('/dashboard/profile')} style={{ cursor: 'pointer' }}>
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
