// AdminPsychologist.jsx - me CRUD të plotë
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Form, InputGroup, Button, Badge, Card, Modal } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaSync } from 'react-icons/fa';

const AdminPsychologist = () => {
    const [psychologists, setPsychologists] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedPsychologist, setSelectedPsychologist] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewPsychologist, setViewPsychologist] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPsychologist, setNewPsychologist] = useState({ name: '', email: '' });

    const fetchPsychologists = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/admin/psychologists', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setPsychologists(res.data);
        setFiltered(res.data);
    };

    const toggleStatus = async (id) => {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8000/api/admin/psychologists/${id}/toggle-status`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchPsychologists();
    };

    const deletePsychologist = async (id) => {
        const token = localStorage.getItem('token');
        if (window.confirm('Are you sure you want to delete this psychologist?')) {
            await axios.delete(`http://localhost:8000/api/admin/psychologists/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPsychologists();
        }
    };

    const handleEditSave = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:8000/api/admin/psychologists/${selectedPsychologist.id}`, selectedPsychologist, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowEditModal(false);
            fetchPsychologists();
        } catch (error) {
            console.error(error.response?.data || error.message);
        }
    };

    const handleEdit = (psychologist) => {
        setSelectedPsychologist(psychologist);
        setShowEditModal(true);
    };

    const handleView = (psychologist) => {
        setViewPsychologist(psychologist);
        setShowViewModal(true);
    };

    const handleAddPsychologist = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8000/api/admin/psychologists', newPsychologist, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddModal(false);
            setNewPsychologist({ name: '', email: '' });
            fetchPsychologists();
        } catch (err) {
            console.error('Error adding psychologist:', err);
        }
    };

    useEffect(() => {
        fetchPsychologists();
    }, []);

    useEffect(() => {
        let result = [...psychologists];

        if (statusFilter !== 'All') {
            result = result.filter(p => p.status === statusFilter.toLowerCase());
        }

        if (search.trim() !== '') {
            result = result.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFiltered(result);
    }, [search, statusFilter, psychologists]);

    return (
        <div className="p-4" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="py-4 px-5">
                    <h2 className="fw-semibold text-dark mb-2">Psychologist Management</h2>
                    <p className="text-muted mb-0">
                        View, search and manage psychologist accounts.
                    </p>
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-between align-items-center mb-3 flex-nowrap gap-3">
                <InputGroup style={{ maxWidth: '300px' }}>
                    <Form.Control
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded"
                    />
                </InputGroup>

                <div className="d-flex gap-3 flex-nowrap align-items-center">
                    <Form.Select
                        style={{ width: '200px' }}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </Form.Select>

                    <Button
                        variant="success"
                        className="text-nowrap"
                        style={{ minWidth: '140px' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        + Add Psychologist
                    </Button>
                </div>
            </div>

            <Table hover responsive className="bg-white rounded shadow-sm">
                <thead className="bg-light">
                    <tr style={{ height: '60px' }}>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Patients</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(p => (
                        <tr key={p.id} style={{ height: '70px' }}>
                            <td>
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="rounded-circle text-white d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: '#2dd4bf',
                                            fontSize: 14,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {p.name.charAt(0)}
                                    </div>
                                    <span className="fw-medium">{p.name}</span>
                                </div>
                            </td>

                            <td>{p.email}</td>
                            <td>{p.patients_count}</td>
                            <td>
                                <Badge
                                    bg={p.status === 'active' ? 'success' : 'secondary'}
                                    className="text-uppercase px-2 py-1 rounded-pill"
                                >
                                    {p.status}
                                </Badge>
                            </td>
                            <td>
                                <div className="d-flex align-items-center gap-2 py-2">
                                    <Button size="sm" variant="outline-secondary" title="View" onClick={() => handleView(p)}>
                                        <FaEye />
                                    </Button>
                                    <Button size="sm" variant="outline-primary" title="Edit" onClick={() => handleEdit(p)}>
                                        <FaEdit />
                                    </Button>
                                    <Button size="sm" variant="outline-danger" title="Delete" onClick={() => deletePsychologist(p.id)}>
                                        <FaTrash />
                                    </Button>
                                    <Button size="sm" variant="outline-warning" title="Toggle Status" onClick={() => toggleStatus(p.id)}>
                                        <FaSync />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton><Modal.Title>Edit Psychologist</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedPsychologist?.name || ''}
                                onChange={(e) => setSelectedPsychologist({ ...selectedPsychologist, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={selectedPsychologist?.email || ''}
                                onChange={(e) => setSelectedPsychologist({ ...selectedPsychologist, email: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleEditSave}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton><Modal.Title>Psychologist Details</Modal.Title></Modal.Header>
                <Modal.Body>
                    {viewPsychologist && (
                        <>
                            <p><strong>Name:</strong> {viewPsychologist.name}</p>
                            <p><strong>Email:</strong> {viewPsychologist.email}</p>
                            <p><strong>Status:</strong> {viewPsychologist.status}</p>
                            <p><strong>Patients:</strong> {viewPsychologist.patients_count}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton><Modal.Title>Add New Psychologist</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newPsychologist.name}
                                onChange={(e) => setNewPsychologist({ ...newPsychologist, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={newPsychologist.email}
                                onChange={(e) => setNewPsychologist({ ...newPsychologist, email: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="success" className="text-nowrap" onClick={handleAddPsychologist}>+ Add Psychologist</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPsychologist;