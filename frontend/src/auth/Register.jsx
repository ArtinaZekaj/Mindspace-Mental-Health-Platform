import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/register', form);
      navigate('/login');
    } catch (err) {
      setError('Regjistrimi dështoi. Kontrollo të dhënat ose email-in.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <h3 className="text-center mb-4">
          <FaUserPlus className="me-2 text-success" /> Regjistrohu në MindSpace
        </h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>Emri i Plotë</Form.Label>
            <Form.Control type="text" name="name" onChange={handleChange} placeholder="Shkruaj emrin" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" onChange={handleChange} placeholder="Shkruaj email-in" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fjalëkalimi</Form.Label>
            <Form.Control type="password" name="password" onChange={handleChange} placeholder="Shkruaj fjalëkalimin" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Konfirmo Fjalëkalimin</Form.Label>
            <Form.Control type="password" name="password_confirmation" onChange={handleChange} placeholder="Përsërit fjalëkalimin" required />
          </Form.Group>
          <Button type="submit" className="w-100" variant="success">
            Regjistrohu
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });

      const token = response.data.access_token;
      localStorage.setItem('token', token);

      const profile = await axios.get('http://localhost:8000/api/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      localStorage.setItem('role', profile.data.role);
      localStorage.setItem('name', profile.data.name);

      navigate('/dashboard');
    } catch (err) {
      setError('Email ose fjalëkalim i pasaktë.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <h3 className="text-center mb-4">
          <FaSignInAlt className="me-2 text-primary" /> Kyçu në MindSpace
        </h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Shkruaj email-in"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fjalëkalimi</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Shkruaj fjalëkalimin"
              required
            />
          </Form.Group>
          <Button type="submit" className="w-100" variant="primary">
            Kyçu
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default Register;
