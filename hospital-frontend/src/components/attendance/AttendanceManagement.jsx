import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge, Spinner, Row, Col, Modal } from 'react-bootstrap';
import { FaClock, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAttendanceByDate, markAttendance, bulkMarkAttendance } from '../../api/attendanceApi';
import { getAllStaff } from '../../api/staffApi';

const statusColors = { PRESENT:'success', ABSENT:'danger', HALF_DAY:'warning', ON_LEAVE:'info', HOLIDAY:'secondary', WEEKEND:'light' };

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    staffId: '', attendanceDate: date, status: 'PRESENT',
    checkInTime: '', checkOutTime: '', remarks: '', overtimeHours: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceByDate(date);
      setRecords(res.data.data || []);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    getAllStaff().then(res => setStaff(res.data.data || []));
  }, []);

  useEffect(() => { fetchRecords(); }, [date]);

  const handleMark = async () => {
    setSaving(true);
    try {
      await markAttendance({ ...formData, attendanceDate: date });
      toast.success('Attendance marked');
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const handleBulkPresent = async () => {
    if (!window.confirm(`Mark all staff as PRESENT for ${date}?`)) return;
    try {
      await bulkMarkAttendance(date, 'PRESENT');
      toast.success('Bulk attendance marked as PRESENT');
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaClock className="me-2" />Attendance Management</h4>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="outline-success" onClick={handleBulkPresent}>Bulk Mark Present</Button>
          <Button variant="primary" onClick={() => { setFormData({...formData, attendanceDate: date}); setShowModal(true); }}>
            <FaPlus className="me-2" />Mark Attendance
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="py-2">
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Group className="d-flex align-items-center gap-2 mb-0">
                <Form.Label className="mb-0">Date:</Form.Label>
                <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} />
              </Form.Group>
            </Col>
            <Col>
              <span className="text-muted small">
                {records.length} records — Present: {records.filter(r => r.status === 'PRESENT').length} |
                Absent: {records.filter(r => r.status === 'ABSENT').length} |
                Leave: {records.filter(r => r.status === 'ON_LEAVE').length}
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? <div className="text-center py-3"><Spinner animation="border" /></div> : (
            <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Employee</th><th>Department</th><th>Check In</th>
                  <th>Check Out</th><th>Status</th><th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No records for this date</td></tr>
                ) : records.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.staff?.firstName} {r.staff?.lastName}</strong><br /><small className="text-muted">{r.staff?.employeeId}</small></td>
                    <td>{r.staff?.department}</td>
                    <td>{r.checkInTime || '--'}</td>
                    <td>{r.checkOutTime || '--'}</td>
                    <td><Badge bg={statusColors[r.status] || 'secondary'}>{r.status}</Badge></td>
                    <td>{r.remarks || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Mark Attendance</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Staff Member</Form.Label>
                <Form.Select value={formData.staffId}
                  onChange={e => setFormData({...formData, staffId: e.target.value})}>
                  <option value="">Select Staff</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.employeeId} — {s.firstName} {s.lastName}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}>
                  {['PRESENT','ABSENT','HALF_DAY','ON_LEAVE','HOLIDAY','WEEKEND'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Check In</Form.Label>
                <Form.Control type="time" value={formData.checkInTime}
                  onChange={e => setFormData({...formData, checkInTime: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Check Out</Form.Label>
                <Form.Control type="time" value={formData.checkOutTime}
                  onChange={e => setFormData({...formData, checkOutTime: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Overtime Hours</Form.Label>
                <Form.Control type="number" step="0.5" value={formData.overtimeHours}
                  onChange={e => setFormData({...formData, overtimeHours: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Remarks</Form.Label>
                <Form.Control value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleMark} disabled={saving}>
            {saving ? <Spinner size="sm" className="me-2" /> : null}Mark
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
