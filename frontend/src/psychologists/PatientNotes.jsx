import React, { useEffect, useState } from "react";
import { Form, InputGroup, Button, Card, Modal } from "react-bootstrap";
import { FaSearch, FaPlus, FaFileAlt, FaPlusCircle, FaClock } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PatientNotes = () => {
    const token = localStorage.getItem("token");
    const [patients, setPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [important, setImportant] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState('all');
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);


    // Fetch Patients from appointments 
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
            alert("Error loading patients");
        } finally {
            setLoadingPatients(false);
        }
    };

    // Fetch all Patient Notes
    const fetchNotes = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/patient-notes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(res.data);
        } catch (err) {
            console.error("Error loading notes", err);
            alert("Error loading notes");
        } finally {
            setLoadingNotes(false);
        }
    };

    // Add New Note
    const handleAddNote = async () => {
        if (!selectedPatient || !title || !content) {
            toast.error("Please fill patient, title, and content.");
            return;
        }
        try {
            await axios.post('http://localhost:8000/api/patient-notes', {
                patient_id: selectedPatient,
                title,
                content,
                important,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Note added successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setTitle("");
            setContent("");
            setImportant(false);
            setSelectedPatient("");
            fetchNotes();
        } catch (err) {
            console.error("Error adding note:", err);
            toast.error("Error adding note.");
        }
    };

    // Funksioni për Edit, ngarkon të dhënat e notes në formë
    const handleEditNote = (note) => {
        setEditingNoteId(note.id);
        setSelectedPatient(note.patient?.id || "");
        setTitle(note.title);
        setContent(note.content);
        setImportant(note.important);
    };

    //Funksioni për Ruajtje
    const handleSaveNote = async () => {
        if (!selectedPatient || !title || !content) {
            toast.error("Please fill patient, title, and content.");
            return;
        }

        try {
            if (editingNoteId) {
                // Update note ekzistuese
                await axios.put(`http://localhost:8000/api/patient-notes/${editingNoteId}`, {
                    title,
                    content,
                    important,
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Note updated successfully!");
            } else {
                // Krijo note te re
                await axios.post('http://localhost:8000/api/patient-notes', {
                    patient_id: selectedPatient,
                    title,
                    content,
                    important,
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Note added successfully!");
            }

            // Pas ruajtjes, pastro forma dhe rifresko notes
            setEditingNoteId(null);
            setTitle("");
            setContent("");
            setImportant(false);
            setSelectedPatient("");
            fetchNotes();

        } catch (err) {
            console.error("Error saving note:", err);
            toast.error("Error saving note.");
        }
    };

    //Funksioni për fshirje note
    const handleDeleteNote = async (id) => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;

        try {
            await axios.delete(`http://localhost:8000/api/patient-notes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Note deleted successfully!");
            fetchNotes();
        } catch (err) {
            console.error("Error deleting note:", err);
            toast.error("Error deleting note.");
        }
    };


    useEffect(() => {
        fetchPatients();
        fetchNotes();
    }, []);

    //Count notes added this week
    const countAddedThisWeek = () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return notes.filter(note => new Date(note.created_at) >= oneWeekAgo).length;
    };

    //Most recent note
    const mostRecentNote = notes.length > 0
        ? notes.reduce((latest, note) => {
            return new Date(note.created_at) > new Date(latest.created_at) ? note : latest;
        }, notes[0])
        : null;

    const fullName = mostRecentNote?.patient?.name || 'Unnamed';
    const firstName = fullName.split(' ')[0];

    //Count notes added today
    const countAddedToday = () => {
        const today = new Date();
        return notes.filter(note => {
            const createdDate = new Date(note.created_at);
            return (
                createdDate.getDate() === today.getDate() &&
                createdDate.getMonth() === today.getMonth() &&
                createdDate.getFullYear() === today.getFullYear()
            );
        }).length;
    };

    //Filter notes për Search, Dropdown dhe Tabs
    const filteredNotes = notes.filter(note => {
        const matchesSearchTerm = !searchTerm || (note.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSelectedPatient = !selectedPatient || (note.patient?.id.toString() === selectedPatient.toString());
        const matchesTab = activeTab === 'all' ? true : Boolean(note.important);
        return matchesSearchTerm && matchesSelectedPatient && matchesTab;
    });

    //View Note:
    const handleViewNote = (note) => {
        setSelectedNote(note);
        setShowViewModal(true);
    };

    return (
        <div>
            {/* Top Header */}
            <div style={{ backgroundColor: "#8e2de2", padding: "2rem", color: "#fff" }}>
                <h2 className="fw-bold">Patient Notes</h2>
                <p>
                    Document and track patient progress and treatment plans. Keep detailed records of sessions and observations.
                </p>
            </div>

            {/* Search + Filter + Button */}
            <div className="p-4" style={{ backgroundColor: "#f8f9fc" }}>
                <div
                    className="bg-white shadow-sm rounded-4 p-3 d-flex align-items-center justify-content-between"
                    style={{ flexWrap: "nowrap", gap: "0.5rem" }}
                >
                    {/* Search Input */}
                    <InputGroup style={{ minWidth: "250px", maxWidth: "500px" }}>
                        <InputGroup.Text className="bg-white border-end-0">
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search notes..."
                            className="border-start-0"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    {/* Dropdown */}
                    <div className="ms-auto">
                        <Form.Select style={{ width: "250px" }} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                            <option value="">All Patients</option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name}
                                </option>
                            ))}
                        </Form.Select>
                    </div>

                    {/* Butoni që ndryshon mes Add dhe Update */}
                    <Button
                        className="text-white d-flex align-items-center gap-1"
                        style={{
                            background: "#8e2de2",
                            border: "none",
                            padding: "8px 16px",
                            minWidth: "120px",
                            borderRadius: "0.5rem",
                        }}
                        onClick={handleSaveNote}
                    >
                        <FaPlus /> {editingNoteId ? "Update Note" : "Add Note"}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="p-4" style={{ backgroundColor: "#f8f9fc" }}>
                <div className="d-flex gap-4 flex-wrap">
                    {/* Total Notes Card */}
                    <Card style={{ minWidth: "350px", flex: 1, border: "none", borderRadius: "1rem", minHeight: "160px" }} className="shadow-sm">
                        <div style={{ height: "6px", backgroundColor: "#8e2de2", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}></div>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="text-purple fw-bold">{notes.length}</h4>
                                    <p className="mb-1">Total Notes</p>
                                    <small className="text-success">↑ {countAddedThisWeek()}</small>
                                    <small className="text-muted ms-2">since last week</small>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        backgroundColor: "#f1e7ff",
                                        width: "48px",
                                        height: "48px",
                                    }}
                                >
                                    <FaFileAlt color="#8e2de2" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Added This Week Card */}
                    <Card style={{ flex: 1, border: "none", borderRadius: "1rem" }} className="shadow-sm">
                        <div style={{ height: "6px", backgroundColor: "#2ecc71", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}></div>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="text-success fw-bold">{countAddedThisWeek()}</h4>
                                    <p className="mb-1">Added This Week</p>
                                    <small className="text-success">↑ +{countAddedToday()} new</small>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        backgroundColor: "#d7f7e6",
                                        width: "48px",
                                        height: "48px",
                                    }}
                                >
                                    <FaPlusCircle color="#2ecc71" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Most Recent Card */}
                    <Card style={{ flex: 1, border: "none", borderRadius: "1rem" }} className="shadow-sm">
                        <div style={{ height: "6px", backgroundColor: "#e67e22", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}></div>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    {mostRecentNote ? (
                                        <>
                                            <h4 className="fw-bold" style={{ color: "#e67e22" }}>
                                                {firstName}
                                            </h4>
                                            <p className="mb-1">Most Recent</p>
                                            <small className="text-muted">
                                                📅 {new Date(mostRecentNote.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(mostRecentNote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </>
                                    ) : (
                                        <>
                                            <h4 className="fw-bold" style={{ color: "#e67e22" }}>No Notes</h4>
                                            <p className="mb-1">Most Recent</p>
                                            <small className="text-muted">No data available</small>
                                        </>
                                    )}
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        backgroundColor: "#ffeccc",
                                        width: "48px",
                                        height: "48px",
                                    }}
                                >
                                    <FaClock color="#e67e22" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Tabs Filter (All, Important) */}
            <div className="bg-white px-4" style={{ borderBottom: "1px solid #e0e0e0", marginBottom: "2rem" }}>
                <div className="d-flex gap-3" style={{ padding: "1rem 0" }}>
                    <Button
                        variant="light"
                        className={activeTab === 'all' ? 'fw-bold border-bottom border-primary' : 'text-muted'}
                        onClick={() => setActiveTab('all')}
                    >
                        All Notes
                    </Button>
                    <Button
                        variant="light"
                        className={activeTab === 'important' ? 'fw-bold border-bottom border-primary' : 'text-muted'}
                        onClick={() => setActiveTab('important')}
                    >
                        Important
                    </Button>
                </div>
            </div>

            {/* Notes List */}
            <div className="px-4 pb-4" style={{ backgroundColor: "#f8f9fc" }}>
                <div className="row">
                    {/* Left: Patient Notes List */}
                    <div className="col-md-8">
                        <h4 className="mb-3 fw-bold">Patient Notes</h4>

                        {loadingNotes ? (
                            <p>Loading notes...</p>
                        ) : filteredNotes.length === 0 ? (
                            <p>No notes found.</p>
                        ) : (
                            filteredNotes.map(note => (
                                <Card key={note.id} className="mb-4 shadow-sm rounded-4">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="fw-bold mb-0">{note.patient?.name || 'Unnamed'}</h6>
                                                <small className="text-muted">📅 {new Date(note.created_at).toLocaleDateString()}</small>
                                            </div>
                                            <div className="d-flex gap-2 align-items-center">
                                                {Boolean(note.important) && <span className="badge rounded-pill text-bg-warning">Important</span>}
                                                <Button variant="outline-info" size="sm" onClick={() => handleViewNote(note)}>View</Button>
                                                <Button variant="outline-primary" size="sm" onClick={() => handleEditNote(note)}>Edit</Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                                            </div>
                                        </div>
                                        <Card className="mt-3 bg-light border-0">
                                            <Card.Body>
                                                <strong>{note.title}</strong>
                                                <p className="mb-0">{note.content}</p>
                                            </Card.Body>
                                        </Card>
                                    </Card.Body>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Right: Add New Note Form */}
                    <div className="col-md-4">
                        {/* Forma e shtimit ashtu siç e ke ti, pa ndryshime */}
                        <Card className="shadow-sm rounded-4">
                            <Card.Body>
                                <h5 className="fw-bold mb-3">Add New Note</h5>

                                <Form.Group className="mb-3">
                                    <Form.Select
                                        value={selectedPatient}
                                        onChange={e => setSelectedPatient(e.target.value)}
                                    >
                                        <option value="">Select Patient</option>
                                        {patients.map((patient) => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.name || patient.full_name || patient.username || 'Unnamed'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Control
                                        placeholder="Note Title"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="Note content..."
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Check
                                    type="checkbox"
                                    label="Mark as important"
                                    checked={important}
                                    onChange={e => setImportant(e.target.checked)}
                                    className="mb-3"
                                />

                                {/* Shtesa: Ndrysho onClick për të thirrur handleSaveNote */}
                                <Button
                                    className="w-100"
                                    style={{ background: "#8e2de2", border: "none" }}
                                    onClick={handleSaveNote}
                                >
                                    {editingNoteId ? "Update Note" : "Save Note"}
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
            <ToastContainer />
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Note Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNote && (
                        <>
                            <p><strong>Patient:</strong> {selectedNote.patient?.name || 'Unknown'}</p>
                            <p><strong>Title:</strong> {selectedNote.title}</p>
                            <p><strong>Content:</strong><br />{selectedNote.content}</p>
                            <p><strong>Date:</strong> {new Date(selectedNote.created_at).toLocaleString()}</p>
                            {selectedNote.important && (
                                <p><strong>Status:</strong> <span className="badge bg-warning text-dark">Important</span></p>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default PatientNotes;
