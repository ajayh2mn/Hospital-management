/**
 * StaffList.jsx — view, search, add, edit, and delete staff members.
 *
 * Features:
 * - Table with all staff
 * - Search bar (calls /api/staff/search)
 * - "Add Staff" button opens a modal form
 * - Edit and Delete buttons per row
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Form, InputGroup, Modal,
  Badge, Spinner, Alert, Row, Col
} from 'react-bootstrap';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllStaff, createStaff, updateStaff, deleteStaff, searchStaff } from '../../api/staffApi';

// All available departments and designations
const DEPARTMENTS = ['ADMINISTRATION','CARDIOLOGY','NEUROLOGY','ORTHOPEDICS','PEDIATRICS',
  'GYNECOLOGY','ONCOLOGY','RADIOLOGY','PHARMACY','LABORATORY','EMERGENCY','ICU','NURSING','HR','ACCOUNTS'];

const DESIGNATIONS = ['CHIEF_MEDICAL_OFFICER','SENIOR_DOCTOR','JUNIOR_DOCTOR','HEAD_NURSE',
  'STAFF_NURSE','RECEPTIONIST','PHARMACIST','LAB_TECHNICIAN','HR_MANAGER','ACCOUNTANT','ADMIN_STAFF'];

const initialForm = {
  firstName: '', lastName: '', email: '', phone: '',
  department: '', designation: '', dateOfJoining: '',
  dateOfBirth: '', address: '', gender: '', basicSalary: '',
  username: '', password: '',
};

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await getAllStaff();
      setStaff(res.data.data || []);
    } catch {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length >= 2) {
      const res = await searchStaff(q);
      setStaff(res.data.data || []);
    } else if (q === '') {
      fetchStaff();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setEditId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setFormData({
      firstName: s.firstName, lastName: s.lastName, email: s.email,
      phone: s.phone || '', department: s.department, designation: s.designation,
      dateOfJoining: s.dateOfJoining || '', dateOfBirth: s.dateOfBirth || '',
      address: s.address || '', gender: s.gender || '',
      basicSalary: s.basicSalary || '', username: '', password: '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await updateStaff(editId, formData);
        toast.success('Staff updated successfully');
      } else {
        await createStaff(formData);
        toast.success('Staff created successfully');
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save staff';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete staff member "${name}"?`)) return;
    try {
      await deleteStaff(id);
      toast.success('Staff deleted');
      fetchStaff();
    } catch {
      toast.error('Failed to delete staff');
    }
  };

  const statusBadge = (status) => {
    const colors = { ACTIVE: 'success', INACTIVE: 'secondary', ON_LEAVE: 'warning',
      TERMINATED: 'danger', SUSPENDED: 'dark' };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaUsers className="me-2" />Staff Management</h4>
        <Button variant="primary" onClick={openCreate}>
          <FaPlus className="me-2" />Add Staff
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <InputGroup className="mb-3" style={{ maxWidth: '400px' }}>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </InputGroup>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Emp ID</th><th>Name</th><th>Department</th>
                  <th>Designation</th><th>Email</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No staff found</td></tr>
                ) : staff.map((s) => (
                  <tr key={s.id}>
                    <td><code>{s.employeeId}</code></td>
                    <td><strong>{s.firstName} {s.lastName}</strong></td>
                    <td>{s.department}</td>
                    <td>{s.designation?.replace(/_/g, ' ')}</td>
                    <td>{s.email}</td>
                    <td>{statusBadge(s.status)}</td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-2"
                        onClick={() => openEdit(s)}>
                        <FaEdit />
                      </Button>
                      <Button size="sm" variant="outline-danger"
                        onClick={() => handleDelete(s.id, `${s.firstName} ${s.lastName}`)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Staff' : 'Add New Staff'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            {[
              { name: 'firstName', label: 'First Name', type: 'text', required: true },
              { name: 'lastName',  label: 'Last Name',  type: 'text', required: true },
              { name: 'email',     label: 'Email',      type: 'email', required: true },
              { name: 'phone',     label: 'Phone',      type: 'text' },
              { name: 'gender',    label: 'Gender',     type: 'text' },
              { name: 'dateOfJoining', label: 'Date of Joining', type: 'date' },
              { name: 'dateOfBirth',   label: 'Date of Birth',   type: 'date' },
              { name: 'basicSalary',   label: 'Basic Salary',    type: 'number' },
            ].map(({ name, label, type, required }) => (
              <Col md={6} key={name}>
                <Form.Group>
                  <Form.Label>{label}{required && ' *'}</Form.Label>
                  <Form.Control type={type} name={name}
                    value={formData[name]} onChange={handleChange} required={required} />
                </Form.Group>
              </Col>
            ))}

            <Col md={6}>
              <Form.Group>
                <Form.Label>Department *</Form.Label>
                <Form.Select name="department" value={formData.department} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Designation *</Form.Label>
                <Form.Select name="designation" value={formData.designation} onChange={handleChange} required>
                  <option value="">Select Designation</option>
                  {DESIGNATIONS.map(d => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control as="textarea" rows={2} name="address"
                  value={formData.address} onChange={handleChange} />
              </Form.Group>
            </Col>

            {!editId && <>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Username (for login)</Form.Label>
                  <Form.Control name="username" value={formData.username} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} />
                </Form.Group>
              </Col>
            </>}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="me-2" /> : null}
            {editId ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StaffList;
