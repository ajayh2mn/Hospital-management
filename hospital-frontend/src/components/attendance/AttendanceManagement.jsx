import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAttendanceByDate, getHospitalLocation } from '../../api/attendanceApi';

const statusColors = {
  PRESENT: 'success', ABSENT: 'danger', HALF_DAY: 'warning',
  ON_LEAVE: 'info', HOLIDAY: 'secondary', WEEKEND: 'light'
};

// Returns today's date as YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);
  const [hospitalLocation, setHospitalLocation] = useState(null);

  useEffect(() => {
    getHospitalLocation()
      .then(res => setHospitalLocation(res.data.data))
      .catch(() => {});
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceByDate(date);
      setRecords(res.data.data || []);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, [date]);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaClock className="me-2" />Attendance Management</h4>
      </div>

      {/* Date filter + summary */}
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
            {hospitalLocation && (
              <Col md="auto">
                <small style={{ color: 'rgba(30,41,59,0.5)' }}>
                  <FaMapMarkerAlt size={11} className="me-1" />
                  {hospitalLocation.name} · {hospitalLocation.fenceRadiusMeters}m fence
                </small>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Attendance table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? <div className="text-center py-3"><Spinner animation="border" /></div> : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th><th>Department</th><th>Date</th>
                    <th>Check In</th><th>Check Out</th><th>Status</th>
                    <th>Distance</th><th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted py-4">No records for this date</td></tr>
                  ) : records.map(r => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.staff?.firstName} {r.staff?.lastName}</strong>
                        <br /><small className="text-muted">{r.staff?.employeeId}</small>
                      </td>
                      <td>{r.staff?.department}</td>
                      <td><small>{r.attendanceDate}</small></td>
                      <td>{r.checkInTime || '--'}</td>
                      <td>{r.checkOutTime || '--'}</td>
                      <td><Badge bg={statusColors[r.status] || 'secondary'}>{r.status}</Badge></td>
                      <td>
                        {r.checkInDistanceMeters != null ? (
                          <small style={{ color: r.checkInDistanceMeters <= (hospitalLocation?.fenceRadiusMeters || 200) ? '#059669' : '#dc2626' }}>
                            <FaMapMarkerAlt size={10} className="me-1" />{r.checkInDistanceMeters}m
                          </small>
                        ) : <small className="text-muted">--</small>}
                      </td>
                      <td><small>{r.remarks || '--'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
