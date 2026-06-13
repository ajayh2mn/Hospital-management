import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Form, InputGroup, Modal,
  Badge, Spinner, Alert, Row, Col, Tabs, Tab
} from 'react-bootstrap';
import { FaPlus, FaSearch, FaEdit, FaUserInjured } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllPatients, registerPatient, updatePatient, searchPatients } from '../../api/patientApi';

const initialForm = {
  firstName: '', lastName: '', email: '', phone: '', gender: '',
  dateOfBirth: '', bloodGroup: '', address: '', city: '', state: '',
  emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
  allergies: '', chronicConditions: '', currentMedications: '',
  insuranceProvider: '', insurancePolicyNumber: '',
};

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    try {
      const res = await getAllPatients();
      setPatients(res.data.data || []);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.length >= 2) {
      const res = await searchPatients(q);
      setPatients(res.data.data || []);
    } else if (q === '') { fetch(); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openCreate = () => { setEditId(null); setFormData(initialForm); setShowModal(true); };

  const openEdit = (p) => {
    setEditId(p.id);
    setFormData({ ...initialForm, ...p });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) { await updatePatient(editId, formData); toast.success('Patient updated'); }
      else { await registerPatient(formData); toast.success('Patient registered'); }
      setShowModal(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaUserInjured className="me-2" />Patient Management</h4>
        <Button variant="primary" onClick={openCreate}><FaPlus className="me-2" />Register Patient</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <InputGroup className="mb-3" style={{ maxWidth: '400px' }}>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control placeholder="Search patients..." value={search} onChange={handleSearch} />
          </InputGroup>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Patient ID</th><th>Name</th><th>Age/Gender</th>
                  <th>Blood Group</th><th>Phone</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => {
                  const age = p.dateOfBirth
                    ? Math.floor((new Date() - new Date(p.dateOfBirth)) / 31557600000) : '--';
                  return (
                    <tr key={p.id}>
                      <td><code>{p.patientId}</code></td>
                      <td><strong>{p.firstName} {p.lastName}</strong><br /><small className="text-muted">{p.email}</small></td>
                      <td>{age} yrs / {p.gender || '--'}</td>
                      <td><Badge bg="info">{p.bloodGroup || '--'}</Badge></td>
                      <td>{p.phone}</td>
                      <td><Badge bg={p.status === 'ACTIVE' ? 'success' : 'secondary'}>{p.status}</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" onClick={() => openEdit(p)}>
                          <FaEdit />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {patients.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No patients found</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Patient' : 'Register New Patient'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="basic" className="mb-3">
            <Tab eventKey="basic" title="Basic Info">
              <Row className="g-3">
                {[['firstName','First Name','text'],['lastName','Last Name','text'],
                  ['email','Email','email'],['phone','Phone','text'],
                  ['dateOfBirth','Date of Birth','date'],['gender','Gender','text']].map(([n,l,t]) => (
                  <Col md={6} key={n}>
                    <Form.Group>
                      <Form.Label>{l}</Form.Label>
                      <Form.Control type={t} name={n} value={formData[n]} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                ))}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Blood Group</Form.Label>
                    <Form.Select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Address</Form.Label>
                    <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="medical" title="Medical History">
              <Row className="g-3">
                {[['allergies','Allergies'],['chronicConditions','Chronic Conditions'],['currentMedications','Current Medications']].map(([n,l]) => (
                  <Col md={12} key={n}>
                    <Form.Group>
                      <Form.Label>{l}</Form.Label>
                      <Form.Control as="textarea" rows={2} name={n} value={formData[n]} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Tab>
            <Tab eventKey="emergency" title="Emergency Contact">
              <Row className="g-3">
                {[['emergencyContactName','Name'],['emergencyContactPhone','Phone'],['emergencyContactRelation','Relation']].map(([n,l]) => (
                  <Col md={6} key={n}>
                    <Form.Group>
                      <Form.Label>{l}</Form.Label>
                      <Form.Control name={n} value={formData[n]} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" className="me-2" /> : null}
            {editId ? 'Update' : 'Register'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PatientList;
