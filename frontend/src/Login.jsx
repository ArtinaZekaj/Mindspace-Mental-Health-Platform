// src/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

      // Marrim të dhënat e user-it nga /api/me
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
    <div className="container mt-5">
      <h3>Kyçu në MindSpace</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Fjalëkalimi</label>
          <input type="password" className="form-control" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary">Kyçu</button>
      </form>
    </div>
  );
}

export default Login;
