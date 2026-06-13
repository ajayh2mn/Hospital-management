import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { FaPlus, FaCalendarCheck, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getTodayAppointments, bookAppointment, checkInPatient, updateAppointmentStatus } from '../../api/appointmentApi';
import { getAllPatients } from '../../api/patientApi';
import { getAllStaff } from '../../api/staffApi';

const statusColors = {
  SCHEDULED: 'primary', CONFIRMED: 'info', IN_QUEUE: 'warning',
  IN_PROGRESS: 'secondary', COMPLETED: 'success',
  CANCELLED: 'danger', NO_SHOW: 'dark'
};

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '',
    department: '', reasonForVisit: ''
  });

  const fetchAll = async () => {
    try {
      const [apptRes, patRes, staffRes] = await Promise.all([
        getTodayAppointments(), getAllPatients(), getAllStaff()
      ]);
      setAppointments(apptRes.data.data || []);
      setPatients(patRes.data.data || []);
      // Filter only doctors
      setDoctors((staffRes.data.data || []).filter(s =>
        s.designation?.includes('DOCTOR') || s.designation?.includes('OFFICER')
      ));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleBook = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      // Strip empty-string values so optional enum fields don't cause backend parse errors
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      await bookAppointment(payload);
      toast.success('Appointment booked');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to book');
    } finally { setSaving(false); }
  };

  const handleCheckIn = async (id) => {
    try {
      await checkInPatient(id);
      toast.success('Patient checked in, token assigned');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaCalendarCheck className="me-2" />Appointments — Today</h4>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />Book Appointment
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Token</th><th>Appointment #</th><th>Patient</th>
                <th>Doctor</th><th>Time</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td><strong className="text-primary">{a.tokenNumber || '--'}</strong></td>
                  <td><code>{a.appointmentNumber}</code></td>
                  <td>{a.patient?.firstName} {a.patient?.lastName}</td>
                  <td>Dr. {a.doctor?.firstName} {a.doctor?.lastName}</td>
                  <td>{a.appointmentTime}</td>
                  <td><Badge bg={statusColors[a.status]}>{a.status}</Badge></td>
                  <td>
                    {a.status === 'SCHEDULED' || a.status === 'CONFIRMED' ? (
                      <Button size="sm" variant="outline-success" onClick={() => handleCheckIn(a.id)}>
                        <FaCheckCircle className="me-1" />Check In
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">No appointments today</td></tr>
              )}
            </tbody>
          </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book New Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Patient *</Form.Label>
                <Form.Select value={formData.patientId}
                  onChange={e => setFormData({...formData, patientId: e.target.value})}>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.patientId} — {p.firstName} {p.lastName}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Doctor *</Form.Label>
                <Form.Select value={formData.doctorId}
                  onChange={e => {
                    const selected = doctors.find(d => String(d.id) === e.target.value);
                    setFormData({
                      ...formData,
                      doctorId: e.target.value,
                      department: selected?.department || ''
                    });
                  }}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} ({d.department})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Date *</Form.Label>
                <Form.Control type="date" value={formData.appointmentDate}
                  onChange={e => setFormData({...formData, appointmentDate: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Time *</Form.Label>
                <Form.Control type="time" value={formData.appointmentTime}
                  onChange={e => setFormData({...formData, appointmentTime: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Reason for Visit</Form.Label>
                <Form.Control as="textarea" rows={2} value={formData.reasonForVisit}
                  onChange={e => setFormData({...formData, reasonForVisit: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleBook} disabled={saving}>
            {saving ? <Spinner size="sm" className="me-2" /> : null}Book Appointment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AppointmentList;
