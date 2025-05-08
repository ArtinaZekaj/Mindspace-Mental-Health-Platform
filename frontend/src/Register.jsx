import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8000/api/register', form);
      navigate('/login');
    } catch (err) {
      setError('Regjistrimi dështoi. Kontrollo fushat ose email-in.');
    }
  };

  return (
    <div className="container mt-5">
      <h3>Regjistrohu në MindSpace</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label>Emri</label>
          <input type="text" name="name" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" name="email" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Fjalëkalimi</label>
          <input type="password" name="password" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Konfirmo Fjalëkalimin</label>
          <input type="password" name="password_confirmation" className="form-control" onChange={handleChange} required />
        </div>
        <button className="btn btn-success">Regjistrohu</button>
      </form>
    </div>
  );
}

export default Register;
