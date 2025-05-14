import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { FaHeart, FaStar, FaSun, FaCoffee, FaBookOpen, FaMusic, FaSave, FaCheckCircle } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

const themes = [
  { icon: <FaHeart className="text-danger" />, label: 'Self-Care', quote: "Today's thoughts shape tomorrow's reality.", color: 'danger' },
  { icon: <FaStar className="text-warning" />, label: 'Achievement', quote: "In quietness and reflection, your inner strength grows.", color: 'warning' },
  { icon: <FaSun className="text-warning" />, label: 'Growth', quote: "Each day brings new growth and new strength.", color: 'warning' },
  { icon: <FaCoffee className="text-dark" />, label: 'Connection', quote: "Connection fuels the soul and calms the mind.", color: 'dark' },
  { icon: <FaBookOpen className="text-primary" />, label: 'Learning', quote: "Every reflection is a step toward wisdom.", color: 'primary' },
  { icon: <FaMusic className="text-purple" />, label: 'Joy', quote: "Joy is found in the little reflections of the day.", color: 'purple' }
];

function DailyReflection() {
  const [question, setQuestion] = useState("What's a small victory you achieved today that made you proud?");
  const [answer, setAnswer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/reflections', {
        theme: selectedTheme?.label || 'Reflective',
        title: '',
        content: answer,
        date: new Date().toISOString().split('T')[0]
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setShowModal(true);
      setAnswer('');
      setSelectedTheme(null);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <Container className="py-5" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: [0, -2, 2, -2, 2, -1, 1, -1, 1, 0], opacity: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      >
        <Card className="p-5 mb-4 border-0 rounded-4" style={{ background: 'linear-gradient(to right,rgb(39, 59, 37),rgb(219, 194, 210))', color: 'white' }}>
          <h3 className="fw-bold">Time for Reflection</h3>
          <p className="mb-0">Take a peaceful moment to reflect on your day. Your thoughts and feelings matter, and this space is here for you to explore them freely.</p>
        </Card>
      </motion.div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-4">
          <FaCheckCircle size={50} className="text-success mb-3" />
          <h5 className="fw-bold">I'm proud of you 🧡</h5>
          <p className="mb-1">Whether you're feeling great or struggling, I believe in you.</p>
          <p className="mb-0">Reflection saved successfully.</p>
          <Button className="mt-3" variant="success" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Body>
      </Modal>

      <Card
        className="p-4 mb-4 border-0 shadow-sm rounded-4"
        style={{ background: "linear-gradient(120deg, rgb(252, 243, 242) 0%, rgb(240, 252, 254) 100%)" }}
      >
        <h5 className="mb-3 fw-semibold">What themes resonated with your day?</h5>
        <Row className="text-center justify-content-center">
          {themes.map((t, idx) => (
            <Col key={idx} xs={6} md={2} className="mb-3 position-relative">
              <div
                className={`theme-box p-3 rounded-3 ${selectedTheme?.label === t.label ? `bg-white shadow-sm border border-${t.color}` : ''}`}
                onClick={() => setSelectedTheme(t)}
                style={{ cursor: 'pointer' }}
              >
                <div className="fs-3 mb-2">{t.icon}</div>
                <div>{t.label}</div>

                <AnimatePresence>
                  {selectedTheme?.label === t.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`mt-2 px-3 py-2 border-start border-4 border-${t.color} rounded bg-white shadow-sm d-inline-block`}
                      style={{ maxWidth: '100%', whiteSpace: 'normal' }}
                    >
                      <span className="text-dark small fw-semibold">{t.quote}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        className="p-4 border-0 shadow-sm rounded-4"
        style={{ background: "linear-gradient(120deg, rgb(240, 250, 253) 0%, rgb(253, 240, 239) 100%)" }}
      >
        <h5 className="mb-3 fw-semibold">Your Reflection Space</h5>
        <Form onSubmit={handleSubmit}>
          <Form.Control
            type="text"
            className="mb-3"
            value={question}
            readOnly
          />
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="Let your thoughts flow freely..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
          <div className="text-end mt-3">
            <Button type="submit" variant="primary">
              <FaSave className="me-2" /> Save Your Reflection
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}

export default DailyReflection;
