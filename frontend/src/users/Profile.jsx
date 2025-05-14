import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Modal, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaUserCircle, FaEnvelope, FaKey, FaTrashAlt, FaEdit } from 'react-icons/fa';

function Profile() {
  const [formData, setFormData] = useState({ name: '', password: '', password_confirmation: '' });
  const [userInfo, setUserInfo] = useState({});
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/api/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      setUserInfo(res.data.user);
      setFormData(prev => ({ ...prev, name: res.data.user.name }));
    });
  }, []);

  const handleUpdate = async () => {
    if (!formData.name && !formData.password) {
      setMessage("Please fill out at least one field to update your profile.");
      return;
    }

    try {
      const res = await axios.put('http://localhost:8000/api/profile/update', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessage("Profile updated successfully.");
      setFormData({ ...formData, password: '', password_confirmation: '' });
    } catch {
      setMessage("An error occurred while updating your profile.");
    }
  };


  const handleDelete = async () => {
    await axios.delete('http://localhost:8000/api/profile/delete', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="mt-4">
      <h2 className="mb-4">👤 My Profile</h2>


      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row>
            <Col md={4} className="text-center border-end">
              <FaUserCircle size={100} className="text-muted" />
              <h3 className="mt-3 fw-bold" style={{ fontSize: '1.8rem' }}>{userInfo.name}</h3>
              <p className="fs-5"><FaEnvelope className="me-2" /> {userInfo.email}</p>
              <Badge bg="dark" className="text-uppercase fs-6 py-2 px-3 mt-2">{userInfo.role}</Badge>
            </Col>

            <Col md={8}>
              <h5 className="mb-3"><FaEdit className="me-2" />Edit Profile</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><FaKey className="me-2" />New Password</Form.Label>
                  <Form.Control
                    type="password"
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleUpdate}>💾 Update Profile</Button>
              </Form>
              {message && <Alert variant="info" className="mt-3">{message}</Alert>}
            </Col>
          </Row>
        </Card.Body>
      </Card>


      <Card className="border-0 shadow-sm bg-light">
        <Card.Body>
          <h5 className="text-danger"><FaTrashAlt className="me-2" />Danger Zone</h5>
          <p className="text-muted">Once deleted, your account and data cannot be recovered.</p>
          <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>Delete My Account</Button>
        </Card.Body>
      </Card>


      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to permanently delete your account? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Profile;
