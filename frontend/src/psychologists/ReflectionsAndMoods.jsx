import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col, Badge, Modal } from 'react-bootstrap';
import { FaFilter, FaFileAlt, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../style/ReflectionsAndMoods.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ReflectionsAndMoods = () => {
    const [totalReflections, setTotalReflections] = useState(0);
    const [weeklyReflections, setWeeklyReflections] = useState(0);
    const [moodStats, setMoodStats] = useState({});
    const [reflections, setReflections] = useState([]);
    const [rangeFilter, setRangeFilter] = useState('weekly');
    const [showModal, setShowModal] = useState(false);
    const [selectedReflection, setSelectedReflection] = useState(null);
    const [moodData, setMoodData] = useState([]);
    const [selectedMood, setSelectedMood] = useState('');
    const [userMap, setUserMap] = useState({});

    const token = localStorage.getItem('token');

    const fetchCounts = async () => {
        try {
            const resAll = await axios.get('http://localhost:8000/api/psychologist/reflections?range=all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTotalReflections(resAll.data.length);

            const resWeek = await axios.get('http://localhost:8000/api/psychologist/reflections?range=weekly', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWeeklyReflections(resWeek.data.length);
        } catch (err) {
            console.error("Error loading reflection counts:", err);
        }
    };

    const fetchReflections = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/psychologist/reflections?range=${rangeFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReflections(res.data);
        } catch (err) {
            console.error('Failed to fetch reflections:', err);
        }
    };

    const fetchMoods = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/psychologist/patient-moods', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const counts = {};
            res.data.forEach(mood => {
                const m = mood.mood?.toLowerCase();
                if (m) counts[m] = (counts[m] || 0) + 1;
            });
            setMoodStats(counts);
            setMoodData(res.data);
        } catch (err) {
            console.error('Failed to fetch mood stats:', err);
        }
    };
    const fetchPatientNames = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/psychologist/appointments', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const map = {};
            res.data.forEach((a) => {
                if (a.user) {
                    map[a.user_id] = a.user.name;
                }
            });

            setUserMap(map);
        } catch (err) {
            console.error("Error fetching appointments:", err);
        }
    };

    useEffect(() => {
        fetchCounts();
        fetchReflections();
        fetchMoods();
        fetchPatientNames();
    }, [rangeFilter]);

    const moodChartData = {
        labels: Object.keys(moodStats),
        datasets: [{
            data: Object.values(moodStats),
            backgroundColor: Object.keys(moodStats).map(mood => {
                switch (mood.toLowerCase()) {
                    case 'very happy': return '#4CAF50';
                    case 'happy': return '#FFEB3B';
                    case 'neutral': return '#2196F3';
                    case 'sad': return '#FF8A65';
                    case 'very sad': return '#D32F2F';
                    default: return '#E0E0E0';
                }
            }),
            borderWidth: 2,
        }]
    };

    const handleCardClick = (reflection) => {
        setSelectedReflection(reflection);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handlePieClick = (event, elements) => {
        if (!elements.length) return;
        const clickedLabel = moodChartData.labels[elements[0].index];
        setSelectedMood(clickedLabel.toLowerCase());
    };
    const getEmojiForMood = (mood) => {
        switch (mood.toLowerCase()) {
            case 'very happy': return '😁';
            case 'happy': return '😊';
            case 'neutral': return '😐';
            case 'sad': return '😔';
            case 'very sad': return '😭';
            default: return '❓';
        }
    };

    return (
        <div className="reflections-container">
            <div className="reflections-header p-4 rounded">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="reflections-title">Patient Reflections</h5>
                        <p className="reflections-subtitle">
                            Review and respond to patient reflections and maintain clinical notes.
                        </p>
                    </div>
                    <div>
                        {/* <Button variant="light" className="me-2">
                            <FaFilter className="me-1" /> Filter
                        </Button>
                        <Button variant="light">
                            <FaDownload className="me-1" /> Export Notes
                        </Button> */}
                    </div>
                </div>

                <Row>
                    <Col md={6}>
                        <Card className="reflection-card">
                            <Card.Body className="d-flex align-items-center">
                                <FaFileAlt className="icon me-3" />
                                <div>
                                    <h4 className="mb-0">{totalReflections}</h4>
                                    <small>Total Reflections</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="reflection-card">
                            <Card.Body className="d-flex align-items-center">
                                <FaFileAlt className="icon me-3" />
                                <div>
                                    <h4 className="mb-0">{weeklyReflections}</h4>
                                    <small>New This Week</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="mt-4">
                <Row>
                    <Col md={7}>
                        <h6 className="mb-3">Reflections</h6>
                        <select
                            value={rangeFilter}
                            onChange={(e) => setRangeFilter(e.target.value)}
                            className="form-select mb-3"
                        >
                            <option value="today">Today</option>
                            <option value="weekly">This Week</option>
                            <option value="monthly">This Month</option>
                            <option value="all">All Time</option>
                        </select>

                        {reflections.length === 0 ? (
                            <p className="text-muted">
                                {rangeFilter === 'today'
                                    ? "No new reflections for today."
                                    : rangeFilter === 'monthly'
                                        ? "No reflections for this month."
                                        : "No reflections found."
                                }
                            </p>
                        ) : (
                            reflections.map((r) => (
                                <Card key={r.id} className="mb-3 reflection-card-hover" onClick={() => handleCardClick(r)}>
                                    <Card.Body>
                                        <div className="d-flex justify-content-between">
                                            <strong>{r.user?.name || 'Unknown'}</strong>
                                            <Badge bg="info">{r.theme}</Badge>
                                        </div>
                                        <div className="text-muted">{new Date(r.date).toLocaleDateString()}</div>
                                        <p>{r.content.slice(0, 80)}...</p>
                                    </Card.Body>
                                </Card>
                            ))
                        )}
                    </Col>

                    <Col md={5}>
                        <h6 className="mb-3">Mood Statistics</h6>
                        <Card>
                            <Card.Body>
                                <Pie data={moodChartData} options={{ onClick: handlePieClick }} />

                                {selectedMood && (
                                    <div className="mt-4">
                                        <h6>Patients feeling "{selectedMood}"</h6>
                                        {moodData
                                            .filter((m) => m.mood?.toLowerCase() === selectedMood)
                                            .map((m, idx) => (
                                                <div key={idx} className="border-bottom py-2">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong>{userMap[m.user_id] || `User #${m.user_id}`}</strong>
                                                            <div className="text-muted">{new Date(m.date).toLocaleDateString()}</div>
                                                            <Badge bg="secondary">{m.mood}</Badge>
                                                        </div>
                                                        <div className="fs-5">{getEmojiForMood(m.mood)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </Card.Body>

                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reflection Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReflection && (
                        <>
                            <h5>{selectedReflection.user?.name}</h5>
                            <div className="mb-2 text-muted">
                                {new Date(selectedReflection.date).toLocaleDateString()} • <Badge bg="primary">{selectedReflection.theme}</Badge>
                            </div>
                            <p>{selectedReflection.content}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReflectionsAndMoods;