import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });

      const token = response.data.access_token;
      localStorage.setItem('token', token);

      const profile = await axios.get('http://localhost:8000/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const role = profile.data.role;
      const name = profile.data.name;

      localStorage.setItem('role', role);
      localStorage.setItem('name', name);

    
      switch (role) {
        case 'admin':
          window.location.href = '/dashboard/admin';
          break;
        case 'psychologist':
          window.location.href = '/dashboard/psychologist';
          break;
        default:
          window.location.href = '/dashboard';
      }

    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <h3 className="text-center mb-4">
          <FaSignInAlt className="me-2 text-primary" />
          Sign in to MindSpace
        </h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

export default Login;
