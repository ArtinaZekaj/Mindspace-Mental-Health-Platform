import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Button, Modal, Spinner, Badge } from 'react-bootstrap';

function PsychologistPatients() {
    const token = localStorage.getItem('token');
    const [patients, setPatients] = useState([]);
    const [latestMoods, setLatestMoods] = useState({});
    const [profileData, setProfileData] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchPatients();
        fetchLatestMoods();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/psychologist/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const uniquePatients = new Map();
            res.data.forEach(appt => {
                if (appt.user) {
                    uniquePatients.set(appt.user.id, appt.user);
                }
            });

            setPatients(Array.from(uniquePatients.values()));
        } catch (err) {
            console.error("Error loading patients", err);
        } finally {
            setLoadingPatients(false);
        }
    };

    const fetchLatestMoods = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/psychologist/patient-moods', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const moodMap = {};
            res.data.forEach(mood => {
                if (!moodMap[mood.user_id] || new Date(mood.date) > new Date(moodMap[mood.user_id].date)) {
                    moodMap[mood.user_id] = mood;
                }
            });

            setLatestMoods(moodMap);
        } catch (err) {
            console.error("Error fetching latest moods", err);
        }
    };

    const getMoodEmoji = (moodText) => {
        switch ((moodText || '').toLowerCase()) {
            case 'very happy': return '😄';
            case 'happy': return '😊';
            case 'neutral': return '😐';
            case 'sad': return '😢';
            case 'very sad': return '😭';
            default: return '❓';
        }
    };

    const getMoodStatus = (moodText) => {
        const mood = (moodText || '').toLowerCase();
        if (mood === 'very happy' || mood === 'happy') return 'Improving';
        if (mood === 'neutral') return 'Stable';
        if (mood === 'sad' || mood === 'very sad') return 'Needs Attention';
        return 'Unknown';
    };

    //View Profile:
    const handleViewProfile = async (userId) => {
        setLoadingProfile(true);
        setShowProfileModal(true);

        try {
            const token = localStorage.getItem('token');

            // Fetch appointments for this user
            const apptRes = await axios.get('http://localhost:8000/api/psychologist/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const appts = apptRes.data.filter(a => a.user?.id === userId);
            const user = appts[0]?.user;

            const nextAppointment = appts
                .filter(a => new Date(a.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

            // Fetch latest mood
            const moodsRes = await axios.get('http://localhost:8000/api/psychologist/patient-moods', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const latestMood = moodsRes.data
                .filter(m => m.user_id === userId)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            // Fetch reflections
            const reflectionsRes = await axios.get('http://localhost:8000/api/psychologist/reflections?range=weekly', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const latestReflection = reflectionsRes.data
                .filter(r => r.user_id === userId)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            // Set state
            setProfileData({
                user,
                latestMood,
                latestReflection,
                nextAppointment
            });

        } catch (err) {
            console.error("Failed to load profile:", err);
        } finally {
            setLoadingProfile(false);
        }
    };
    const getFirstName = () => {
        const fullName = localStorage.getItem('name') || 'Psychologist';
        const parts = fullName.trim().split(' ');
        return parts[0] === 'Dr.' && parts.length > 1 ? parts[1] : parts[0];
    };
    return (
        <div>
            {/* Welcome Card */}
            <Card className="mb-5 shadow-lg border-0 rounded-4" style={{ backgroundColor: '#159b8f', color: 'white' }}>
                <Card.Body className="py-5 px-4 text-left">
                    <h2 className="fw-bold mb-3">
                        Welcome, Dr. {getFirstName()}
                    </h2>
                    <p className="lead mb-2">Your Patients Dashboard</p>
                    <p className="mb-0">
                        Access and review your patients’ moods, reflections, and upcoming sessions all in one place.
                    </p>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
                <input
                    type="text"
                    placeholder="Search patients by name..."
                    className="form-control"
                    style={{ maxWidth: '250px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="form-select"
                    style={{ maxWidth: '200px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Improving">Improving</option>
                    <option value="Stable">Stable</option>
                    <option value="Needs Attention">Needs Attention</option>
                </select>
            </div>


            {/* Patient Grid */}
            {loadingPatients ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status" variant="primary" />
                    <div className="mt-3">Loading patients...</div>
                </div>
            ) : (
                <>
                    <h4 className="mb-4">All Assigned Patients</h4>
                    <Row xs={1} md={2} className="g-4">
                        {patients
                            .filter((patient) => {
                                const moodData = latestMoods[patient.id];
                                const moodText = moodData?.mood;
                                const moodStatus = getMoodStatus(moodText);

                                const nameMatch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
                                const statusMatch = statusFilter === 'All' || moodStatus === statusFilter;

                                return nameMatch && statusMatch;
                            })
                            .map((patient) => {
                                const moodData = latestMoods[patient.id];
                                const moodText = moodData?.mood;
                                const moodStatus = getMoodStatus(moodText);

                                return (
                                    <Col key={patient.id}>
                                        <Card
                                            className="h-100 shadow-sm p-3"
                                            style={{
                                                borderRadius: '1.5rem',
                                                backgroundColor: '#ffffff',
                                                minHeight: '280px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                border: '2px solid #159b8f'
                                            }}
                                        >

                                            <Card.Body style={{ flexGrow: 1 }}>
                                                {/* Top: Mood Emoji + Status */}
                                                <div className="d-flex justify-content-between align-items-start">
                                                    {/* Initial Circle */}
                                                    <div
                                                        className="rounded-circle bg-secondary text-dark d-flex justify-content-center align-items-center fw-bold"
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            backgroundColor: '#d9d9d9'
                                                        }}
                                                    >
                                                        {patient.name.charAt(0).toUpperCase()}
                                                    </div>

                                                    {/* Mood Icon + Status */}
                                                    <div className="text-end">
                                                        <div
                                                            className="rounded-circle d-flex justify-content-center align-items-center"
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                backgroundColor:
                                                                    moodStatus === 'Improving'
                                                                        ? '#d1e7dd'
                                                                        : moodStatus === 'Stable'
                                                                            ? '#cfe2ff'
                                                                            : moodStatus === 'Needs Attention'
                                                                                ? '#f8d7da'
                                                                                : '#f1f1f1',
                                                                border: '2px solid #ccc',
                                                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '1.5rem' }}>{getMoodEmoji(moodText)}</span>
                                                        </div>

                                                        {/* Status Badge */}
                                                        <span
                                                            className="badge mt-2 px-2 py-1 fw-semibold text-white"
                                                            style={{
                                                                fontSize: '0.9rem',
                                                                borderRadius: '0.5rem',
                                                                backgroundColor:
                                                                    moodStatus === 'Improving'
                                                                        ? '#198754'
                                                                        : moodStatus === 'Stable'
                                                                            ? '#0d6efd'
                                                                            : moodStatus === 'Needs Attention'
                                                                                ? '#dc3545'
                                                                                : '#6c757d',
                                                            }}
                                                        >
                                                            {moodStatus}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Patient Info */}
                                                <h5 className="mt-3 mb-1" style={{ fontSize: '1.3rem' }}>
                                                    {patient.name}
                                                </h5>

                                                <p className="mb-1 text-dark" style={{ fontSize: '1.2rem' }}>
                                                    {patient.email}
                                                </p>

                                                <small className="d-block mb-1 text-dark" style={{ fontSize: '1rem' }}>
                                                    Joined: {new Date(patient.created_at).toLocaleDateString()}
                                                </small>

                                                {/* Optional: Next Appointment (if exists) */}
                                                {patient.nextAppointment && (
                                                    <small className="text-muted d-block mb-2">
                                                        Next Appointment: {patient.nextAppointment.date} at{' '}
                                                        {patient.nextAppointment.time?.slice(0, 5)}
                                                    </small>
                                                )}
                                            </Card.Body>

                                            <Card.Footer className="bg-transparent border-0">
                                                <Button
                                                    size="sm"
                                                    className="w-100 text-dark fw-semibold border-0"
                                                    style={{
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.9rem',
                                                        backgroundColor: 'rgb(177, 177, 177)'
                                                    }}
                                                    onClick={() => handleViewProfile(patient.id)}
                                                >
                                                    View Profile
                                                </Button>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                );
                            })
                        }

                    </Row>
                </>
            )}

            {/* Modal for patient profile */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Patient Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingProfile || !profileData ? (
                        <div className="d-flex justify-content-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <>
                            <h5>{profileData.user.name}</h5>
                            <p className="text-muted">{profileData.user.email}</p>
                            <p><strong>Joined:</strong> {new Date(profileData.user.created_at).toLocaleDateString()}</p>
                            <hr />
                            <p><strong>Latest Mood:</strong> {getMoodEmoji(profileData.latestMood?.mood)} {profileData.latestMood?.mood || '—'}</p>
                            <p><strong>Latest Reflection:</strong><br /> {profileData.latestReflection?.content || '—'}</p>
                            <p><strong>Next Appointment:</strong><br />
                                {profileData.nextAppointment
                                    ? `${profileData.nextAppointment.date} at ${profileData.nextAppointment.time?.slice(0, 5)}`
                                    : '—'}
                            </p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PsychologistPatients;
