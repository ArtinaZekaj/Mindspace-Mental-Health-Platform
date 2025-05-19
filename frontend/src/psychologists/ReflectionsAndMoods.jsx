import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function ReflectionsAndMoods() {
  const [reflections, setReflections] = useState([]);
  const [patientMoods, setPatientMoods] = useState({});
  const [weeklyReflectionsCount, setWeeklyReflectionsCount] = useState(0);
  const [totalReflectionsCount, setTotalReflectionsCount] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReflections = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/psychologist/reflections', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setReflections(res.data);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weekly = res.data.filter(item => new Date(item.date) >= weekAgo);
        setWeeklyReflectionsCount(weekly.length);
        setTotalReflectionsCount(res.data.length);
      } catch (err) {
        console.error("Failed to fetch reflections:", err);
      }
    };

    const fetchPatientMoods = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/psychologist/patient-moods', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const latestMoods = {};
        res.data.forEach((mood) => {
          const userId = mood.user_id;
          if (!latestMoods[userId] || new Date(mood.date) > new Date(latestMoods[userId].date)) {
            latestMoods[userId] = mood;
          }
        });

        setPatientMoods(latestMoods);
      } catch (err) {
        console.error("Failed to fetch moods:", err);
      }
    };

    fetchReflections();
    fetchPatientMoods();
  }, [token]);

  // Generate mood stats
  const moodCount = {};
  Object.values(patientMoods).forEach((m) => {
    moodCount[m.mood] = (moodCount[m.mood] || 0) + 1;
  });

  const pieData = {
    labels: Object.keys(moodCount),
    datasets: [{
      label: 'Mood Distribution',
      data: Object.values(moodCount),
      backgroundColor: ['#f6c23e', '#e74a3b', '#36b9cc', '#1cc88a', '#858796']
    }]
  };

  const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <div className="mt-4">
      {/* HEADER STATS */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white bg-warning shadow-sm">
            <Card.Body>
              <h5>Total Reflections</h5>
              <h3>{totalReflectionsCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-danger shadow-sm">
            <Card.Body>
              <h5>New This Week</h5>
              <h3>{weeklyReflectionsCount}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-success shadow-sm">
            <Card.Body>
              <h5>Top Mood</h5>
              <h3>{topMood}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Body: Reflections + Moods */}
      <Row>
        <Col md={8}>
          <h4 className="mb-3">Latest Reflections</h4>
          {reflections.slice(0, 4).map((item, index) => (
            <Card className="mb-3" key={index}>
              <Card.Body>
                <strong>{item.user?.name || 'Anonymous'}</strong> – <span className="text-muted">{item.theme}</span>
                <p className="mb-1 mt-2">{item.content.substring(0, 100)}...</p>
                <small className="text-muted">{new Date(item.date).toLocaleDateString()}</small>
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col md={4}>
          <h4 className="mb-3">Mood Distribution</h4>
          <Pie data={pieData} />
        </Col>
      </Row>
    </div>
  );
}

export default ReflectionsAndMoods;
