import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentDashboard() {
  const [showMessage, setShowMessage] = useState(false);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/appointments/my', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      setAppointments(response.data);
    })
    .catch(error => {
      console.error('Gabim gjatë marrjes së termineve:', error);
    });
  }, []);

  return (
    <div className="container mt-4">
      <h2>Mirësevini në MindSpace 🎓</h2>
      <p>Kjo është faqja juaj e dashboard-it.</p>

      <button
        className="btn btn-primary"
        onClick={() => setShowMessage(!showMessage)}
      >
        {showMessage ? 'Fshije mesazhin' : 'Shfaq mesazhin'}
      </button>

      {showMessage && (
        <div className="alert alert-info mt-3">
          Ky është një mesazh testues! 🎉
        </div>
      )}

      {appointments.length > 0 && (
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">📅 Termini i radhës</h5>
            <p className="card-text">
              Data: <strong>{appointments[0].date}</strong><br />
              Ora: <strong>{appointments[0].time}</strong><br />
              Psikologu: <strong>{appointments[0].psychologist?.name}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
