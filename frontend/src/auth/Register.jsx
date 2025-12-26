import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';

export function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name || form.name.length < 3) {
      newErrors.name = 'Full name must be at least 3 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/register', form);
      navigate('/login');
    } catch (err) {
      setServerError('Registration failed. Email may already be in use.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <h3 className="text-center mb-4">
          <FaUserPlus className="me-2 text-success" />
          Create your MindSpace account
        </h3>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Form onSubmit={handleRegister} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="password_confirmation"
              placeholder="Repeat your password"
              value={form.password_confirmation}
              onChange={handleChange}
              isInvalid={!!errors.password_confirmation}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password_confirmation}
            </Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" className="w-100" variant="success">
            Register
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
export default Register;