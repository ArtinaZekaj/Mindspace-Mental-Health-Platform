import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Form, InputGroup, Button, Badge, Card, Modal } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaSync } from 'react-icons/fa';

const AdminPatients = () => {
    const [patients, setPatients] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewPatient, setViewPatient] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', email: '' });


    const fetchPatients = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/admin/patients', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data);
        setFiltered(res.data);
    };

    const toggleStatus = async (id) => {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8000/api/admin/patients/${id}/toggle-status`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchPatients();
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        let result = [...patients];

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
    }, [search, statusFilter, patients]);

    //Delete Patients:
    const deletePatient = async (id) => {
        const token = localStorage.getItem('token');
        if (window.confirm('Are you sure you want to delete this patient?')) {
            await axios.delete(`http://localhost:8000/api/admin/patients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPatients();
        }
    };

    //Edit Patients:
    const handleEditSave = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:8000/api/admin/patients/${selectedPatient.id}`, selectedPatient, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowEditModal(false);
            fetchPatients();
        } catch (error) {
            console.error(error.response?.data || error.message);
        }
    };
    //Update Patients:
    const handleEdit = (patient) => {
        setSelectedPatient(patient);
        setShowEditModal(true);
    };

    //View Patients:
    const handleView = (patient) => {
        setViewPatient(patient);
        setShowViewModal(true);
    };

    //Add Patients:
    const handleAddPatient = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8000/api/admin/patients', newPatient, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddModal(false);
            setNewPatient({ name: '', email: '' });
            fetchPatients();
        } catch (err) {
            console.error('Error adding patient:', err);
        }
    };


    return (
        <div className="p-4" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="py-4 px-5">
                    <h2 className="fw-semibold text-dark mb-2">Patient Management</h2>
                    <p className="text-muted mb-0">
                        View, search and manage patient accounts across the platform.
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
                        + Add Patient
                    </Button>
                </div>
            </div>

            <Table hover responsive className="bg-white rounded shadow-sm">
                <thead className="bg-light">
                    <tr style={{ height: '60px' }}>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(p => (
                        <tr key={p.id} style={{ height: '70px' }}> {/* Kjo shton hapsirë vertikale */}
                            <td>
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="rounded-circle text-white d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: '#0d6efd',
                                            fontSize: 14,
                                        }}
                                    >
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="fw-medium">{p.name}</span>
                                </div>
                            </td>
                            <td className="text-muted">{p.email}</td>
                            <td>
                                <Badge
                                    bg={p.status === 'active' ? 'success' : 'secondary'}
                                    className="text-uppercase px-2 py-1 rounded-pill"
                                >
                                    {p.status}
                                </Badge>
                            </td>
                            <td>{new Date(p.created_at).toISOString().split('T')[0]}</td>
                            <td>
                                <div className="d-flex align-items-center gap-2 py-2">
                                    <Button size="sm" variant="outline-secondary" title="View" onClick={() => handleView(p)}>
                                        <FaEye />
                                    </Button>
                                    <Button size="sm" variant="outline-primary" title="Edit" onClick={() => handleEdit(p)}>
                                        <FaEdit />
                                    </Button>
                                    <Button size="sm" variant="outline-danger" title="Delete" onClick={() => deletePatient(p.id)}>
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
            {/*Edit Patients*/}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedPatient?.name || ''}
                                onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={selectedPatient?.email || ''}
                                onChange={(e) => setSelectedPatient({ ...selectedPatient, email: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* View Patients */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Patient Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {viewPatient && (
                        <div>
                            <p><strong>Name:</strong> {viewPatient.name}</p>
                            <p><strong>Email:</strong> {viewPatient.email}</p>
                            <p><strong>Status:</strong> {viewPatient.status}</p>
                            <p><strong>Created At:</strong> {new Date(viewPatient.created_at).toLocaleString()}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            {/*Add Patients:*/}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newPatient.name}
                                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={newPatient.email}
                                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" className="text-nowrap" onClick={handleAddPatient}>
                        + Add Patient
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPatients;
