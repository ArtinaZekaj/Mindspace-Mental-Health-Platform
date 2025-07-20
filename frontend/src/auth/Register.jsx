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
      setError('Registration failed. Please check your details or email.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <h3 className="text-center mb-4">
          <FaUserPlus className="me-2 text-success" /> Register to MindSpace
        </h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control type="text" name="name" onChange={handleChange} placeholder="Enter your full name" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" onChange={handleChange} placeholder="Enter your email" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" onChange={handleChange} placeholder="Enter your password" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" name="password_confirmation" onChange={handleChange} placeholder="Repeat your password" required />
          </Form.Group>
          <Button type="submit" className="w-100" variant="success">
            Register
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
      setError('Invalid email or password.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <h3 className="text-center mb-4">
          <FaSignInAlt className="me-2 text-primary" /> Sign In to MindSpace
        </h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </Form.Group>
          <Button type="submit" className="w-100" variant="primary">
            Sign In
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default Register;
