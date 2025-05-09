import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import {FaSmileBeam,FaSmile,FaMeh,FaFrown,FaSadTear} from 'react-icons/fa';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import axios from 'axios';

const moodOptions = [
  { label: 'Very Happy', value: 5, icon: <FaSmileBeam />, color: '#d1f7e0', glow: '#00c37d', iconColor: '#00c37d' },
  { label: 'Happy', value: 4, icon: <FaSmile />, color: '#e0f8d9', glow: '#78d900', iconColor: '#78d900' },
  { label: 'Neutral', value: 3, icon: <FaMeh />, color: '#fff3c9', glow: '#eab308', iconColor: '#eab308' },
  { label: 'Sad', value: 2, icon: <FaFrown />, color: '#ffe2d2', glow: '#ff6363', iconColor: '#ff6363' },
  { label: 'Very Sad', value: 1, icon: <FaSadTear />, color: '#ffd6e0', glow: '#e23f6f', iconColor: '#e23f6f' },
];

const motivationMessages = {
  'Very Happy': "Keep shining your positive energy! 🌟 You're an inspiration!",
  'Happy': "Happiness is contagious—spread it around! 😊",
  'Neutral': "It's okay to feel neutral. Take time to reflect and recharge. 🌤️",
  'Sad': "It's okay to feel sad. You're stronger than you think. 💪",
  'Very Sad': "You are not alone. Brighter days are ahead. 🕊️ Stay hopeful.",
};

const MoodTracking = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [motivationalText, setMotivationalText] = useState('');
  const { width, height } = useWindowSize();

  const handleSave = async () => {
    if (!selectedMood) {
      toast.warn('Please select a mood first.');
      return;
    }

    const token = localStorage.getItem('token');

    const reflectionEntry = {
      content: notes.trim(),
      mood: selectedMood.label,
      date: new Date().toISOString().slice(0, 10),
    };

    try {
      await axios.post('http://localhost:8000/api/reflections', reflectionEntry, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMotivationalText(motivationMessages[selectedMood.label]);
      setShowMotivation(true);

      setTimeout(() => {
        setShowMotivation(false);
        setShowSuccessMessage(true);
        setShowConfetti(true);
        toast.success('Mood saved successfully! ✅');
      
        setTimeout(() => {
          setShowSuccessMessage(false);
          setShowConfetti(false);
          setSelectedMood(null);
          setNotes('');
        }, 5000);
      }, 5000);

    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood. Please try again.');
    }
  };

  return (
    <div
      className="p-4 position-relative"
      style={{
        background: 'linear-gradient(120deg,rgb(248, 236, 234) 0%,rgb(232, 249, 252) 100%)',
        borderRadius: '20px',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {showConfetti && <Confetti width={width} height={height} />}
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="fw-bold text-center mb-2" style={{ color: '#333', fontSize: '2.4rem' }}>
        How are you feeling today? <span className="animate__animated animate__pulse animate__infinite">😊</span>
      </h2>
      <p className="text-center mb-5 fs-5 fst-italic" style={{ color: '#6c757d' }}>
        "Track your emotions daily to better understand yourself. 🌱"
      </p>

      {showSuccessMessage && (
        <Card className="text-center border-success shadow-lg p-5 animate__animated animate__fadeInUp" style={{ borderRadius: '16px', backgroundColor: '#e6ffed' }}>
          <div className="text-success display-5 mb-3">✔️</div>
          <h4 className="fw-bold text-success">Mood tracked successfully!</h4>
          <p className="text-muted">Your mood has been recorded. You can track another in a few seconds...</p>
        </Card>
      )}

      {!showSuccessMessage && (
        <>
          <Card className="mb-4 shadow-sm p-4 border-0" style={{ borderRadius: '20px', backgroundColor: '#ffffffcc' }}>
            <h6 className="mb-3 text-muted">Select your mood</h6>
            <div className="d-flex justify-content-between flex-wrap gap-4">
              {moodOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setSelectedMood(option)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedMood?.value === option.value ? option.color : '#f8f9fa',
                    border: selectedMood?.value === option.value ? `3px solid ${option.glow}` : '1px solid #ddd',
                    boxShadow: selectedMood?.value === option.value ? `0 0 18px ${option.glow}` : 'none',
                    borderRadius: '1rem',
                    padding: '1rem',
                    textAlign: 'center',
                    flex: '1 0 140px',
                    transition: 'all 0.3s ease-in-out',
                    transform: selectedMood?.value === option.value ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2.5rem',
                      marginBottom: '0.5rem',
                      color: option.iconColor,
                    }}
                  >
                    {option.icon}
                  </div>
                  <small className="fw-semibold">{option.label}</small>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mb-4 shadow-sm p-4 border-0" style={{ borderRadius: '20px', backgroundColor: '#ffffffcc' }}>
            <h6 className="mb-2 text-muted">Add notes (optional)</h6>
            <Form.Control
              as="textarea"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made you feel this way? Add any thoughts or details about your day..."
            />
          </Card>

          <div className="text-end">
            <Button
              onClick={handleSave}
              variant="success"
              className="px-4 py-2"
              style={{ borderRadius: '10px', fontWeight: 'bold' }}
            >
              💾 Save Mood
            </Button>
          </div>
        </>
      )}

      {/* FLOATING MOTIVATION MESSAGE IN CENTER */}
      {showMotivation && (
        <div
          className="animate__animated animate__zoomIn"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#ffe9c9',
            border: '3px solid #ffa94d',
            borderRadius: '20px',
            padding: '2rem 2.5rem',
            boxShadow: '0 0 20px rgba(255, 170, 0, 0.4)',
            color: '#7c4400',
            textAlign: 'center',
            fontSize: '1.6rem',
            fontWeight: 'bold',
            lineHeight: '1.7',
            zIndex: 9999,
            maxWidth: '90%',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌟 Stay Inspired!</div>
          <p style={{ fontStyle: 'italic', margin: 0 }}>{motivationalText}</p>
        </div>
      )}
    </div>
  );
};

export default MoodTracking;
