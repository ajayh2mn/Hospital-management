import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge, Spinner, Row, Col, Modal } from 'react-bootstrap';
import { FaClock, FaPlus, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaLocationArrow, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAttendanceByDate, markAttendance, bulkMarkAttendance, getHospitalLocation } from '../../api/attendanceApi';
import { getAllStaff } from '../../api/staffApi';

const statusColors = {
  PRESENT: 'success', ABSENT: 'danger', HALF_DAY: 'warning',
  ON_LEAVE: 'info', HOLIDAY: 'secondary', WEEKEND: 'light'
};

// Haversine formula — distance in meters between two GPS points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Returns current time as HH:MM string
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Returns today's date as YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [date, setDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hospitalLocation, setHospitalLocation] = useState(null);

  const [formData, setFormData] = useState({
    staffId: '', status: 'PRESENT',
    checkInTime: '', checkOutTime: '', remarks: '', overtimeHours: ''
  });

  // Geo state
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | detecting | inside | outside | denied
  const [userCoords, setUserCoords] = useState(null);
  const [distanceMeters, setDistanceMeters] = useState(null);

  useEffect(() => {
    getHospitalLocation()
      .then(res => setHospitalLocation(res.data.data))
      .catch(() => {});
    getAllStaff().then(res => setStaff(res.data.data || []));
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

  // Auto-detect location and set status + time + date
  const detectLocation = (hospital) => {
    const loc = hospital || hospitalLocation;
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      toast.error('Browser does not support location access');
      return;
    }
    setGeoStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ latitude, longitude });

        let dist = null;
        let inside = true;

        if (loc) {
          dist = Math.round(haversineDistance(latitude, longitude, loc.latitude, loc.longitude));
          inside = dist <= loc.fenceRadiusMeters;
        }

        setDistanceMeters(dist);
        setGeoStatus(inside ? 'inside' : 'outside');

        // Auto-set status, time, date
        setFormData(prev => ({
          ...prev,
          status: inside ? 'PRESENT' : 'ABSENT',
          checkInTime: getCurrentTime(),
          attendanceDate: getTodayDate(),
        }));

        toast.success(
          inside
            ? `You are inside the hospital — marked PRESENT`
            : `You are outside the hospital — marked ABSENT`
        );
      },
      (err) => {
        setGeoStatus('denied');
        if (err.code === 1) toast.error('Location permission denied. Please allow location in your browser.');
        else toast.error('Could not get location. Try again.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Open modal → reset → auto-detect immediately
  const openModal = () => {
    setFormData({
      staffId: '', status: 'PRESENT',
      checkInTime: getCurrentTime(),
      attendanceDate: getTodayDate(),
      checkOutTime: '', remarks: '', overtimeHours: ''
    });
    setGeoStatus('idle');
    setUserCoords(null);
    setDistanceMeters(null);
    setShowModal(true);
    // Small delay so modal renders before geolocation prompt
    setTimeout(() => detectLocation(hospitalLocation), 300);
  };

  const handleMark = async () => {
    if (!formData.staffId) { toast.warning('Please select a staff member'); return; }
    if (formData.status === 'PRESENT' && geoStatus === 'outside') {
      toast.error('Cannot mark PRESENT — you are outside the hospital');
      return;
    }
    setSaving(true);
    try {
      await markAttendance({
        ...formData,
        attendanceDate: getTodayDate(),
        latitude: userCoords?.latitude || null,
        longitude: userCoords?.longitude || null,
        distanceMeters: distanceMeters || null,
      });
      toast.success('Attendance marked successfully');
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark attendance');
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

  // ── Geo panel config ──
  const geoPanels = {
    idle:      { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)',  color: 'rgba(255,255,255,0.4)', icon: <FaMapMarkerAlt />,                       label: 'Waiting for location…' },
    detecting: { bg: 'rgba(79,172,254,0.08)',  border: 'rgba(79,172,254,0.3)',   color: '#93c5fd',               icon: <Spinner animation="border" size="sm" />, label: 'Detecting your location automatically…' },
    inside:    { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.45)',  color: '#6ee7b7',               icon: <FaCheckCircle />,                        label: `Inside hospital — ${distanceMeters}m away ✓` },
    outside:   { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.45)',   color: '#f87171',               icon: <FaTimesCircle />,                        label: `Outside hospital — ${distanceMeters}m away (limit: ${hospitalLocation?.fenceRadiusMeters}m)` },
    denied:    { bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.35)',   color: '#fde047',               icon: <FaTimesCircle />,                        label: 'Location access denied — allow in browser settings' },
  };
  const geo = geoPanels[geoStatus];
  const isMarkBlocked = formData.status === 'PRESENT' && geoStatus === 'outside';

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaClock className="me-2" />Attendance Management</h4>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="outline-success" onClick={handleBulkPresent}>Bulk Mark Present</Button>
          <Button variant="primary" onClick={openModal}>
            <FaPlus className="me-2" />Mark Attendance
          </Button>
        </div>
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
                <small style={{ color: 'rgba(255,255,255,0.4)' }}>
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
                          <small style={{ color: r.checkInDistanceMeters <= (hospitalLocation?.fenceRadiusMeters || 200) ? '#6ee7b7' : '#f87171' }}>
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

      {/* ── Mark Attendance Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaClock className="me-2" />Mark Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">

            {/* ── Geo-fence Auto Status Panel ── */}
            <Col md={12}>
              <div style={{
                background: geo.bg, border: `1px solid ${geo.border}`,
                borderRadius: 14, padding: '16px 20px',
              }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-12" style={{ gap: 12 }}>
                    <span style={{ color: geo.color, fontSize: '1.3rem' }}>{geo.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>
                        AUTO LOCATION DETECTION
                      </div>
                      <div style={{ fontSize: '0.9rem', color: geo.color, fontWeight: 600 }}>
                        {geo.label}
                      </div>
                      {userCoords && (
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
                          GPS: {userCoords.latitude.toFixed(5)}, {userCoords.longitude.toFixed(5)}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Re-detect button */}
                  {(geoStatus === 'inside' || geoStatus === 'outside' || geoStatus === 'denied') && (
                    <Button size="sm" variant="outline-secondary" onClick={() => detectLocation()}>
                      <FaRedo size={11} className="me-1" />Re-detect
                    </Button>
                  )}
                </div>

                {/* Auto-filled info chips */}
                {(geoStatus === 'inside' || geoStatus === 'outside') && (
                  <div className="d-flex gap-2 flex-wrap mt-3">
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem',
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    }}>
                      📅 Date: <strong>{getTodayDate()}</strong>
                    </span>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem',
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    }}>
                      🕐 Time: <strong>{formData.checkInTime}</strong>
                    </span>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem',
                      background: geoStatus === 'inside' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      border: `1px solid ${geoStatus === 'inside' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                      color: geoStatus === 'inside' ? '#6ee7b7' : '#f87171',
                    }}>
                      Status: <strong>{geoStatus === 'inside' ? 'PRESENT' : 'ABSENT'}</strong>
                    </span>
                  </div>
                )}
              </div>

              {geoStatus === 'outside' && (
                <div style={{
                  marginTop: 8, padding: '8px 14px',
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8, fontSize: '0.8rem', color: '#f87171',
                }}>
                  You are <strong>{distanceMeters}m</strong> from the hospital. Must be within <strong>{hospitalLocation?.fenceRadiusMeters}m</strong> to be marked PRESENT.
                  Status auto-set to <strong>ABSENT</strong>.
                </div>
              )}
            </Col>

            {/* ── Staff selector ── */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>Staff Member *</Form.Label>
                <Form.Select value={formData.staffId}
                  onChange={e => setFormData({ ...formData, staffId: e.target.value })}>
                  <option value="">— Select Staff Member —</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.employeeId} — {s.firstName} {s.lastName} ({s.department})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* ── Auto-filled fields (read-only display) ── */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Date <small className="text-muted">(auto)</small></Form.Label>
                <Form.Control value={getTodayDate()} readOnly
                  style={{ background: 'rgba(255,255,255,0.04)', cursor: 'default' }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Check In Time <small className="text-muted">(auto)</small></Form.Label>
                <Form.Control value={formData.checkInTime} readOnly
                  style={{ background: 'rgba(255,255,255,0.04)', cursor: 'default' }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status <small className="text-muted">(auto)</small></Form.Label>
                <Form.Control
                  value={formData.status}
                  readOnly
                  style={{
                    background: formData.status === 'PRESENT' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: formData.status === 'PRESENT' ? '#6ee7b7' : '#f87171',
                    cursor: 'default', fontWeight: 600,
                  }}
                />
              </Form.Group>
            </Col>

            {/* ── Optional overrides ── */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Check Out Time <small className="text-muted">(optional)</small></Form.Label>
                <Form.Control type="time" value={formData.checkOutTime}
                  onChange={e => setFormData({ ...formData, checkOutTime: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Overtime Hours <small className="text-muted">(optional)</small></Form.Label>
                <Form.Control type="number" step="0.5" min="0" value={formData.overtimeHours}
                  onChange={e => setFormData({ ...formData, overtimeHours: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Remarks <small className="text-muted">(optional)</small></Form.Label>
                <Form.Control value={formData.remarks} placeholder="Optional notes…"
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant={isMarkBlocked ? 'danger' : 'primary'}
            onClick={handleMark}
            disabled={saving || isMarkBlocked || geoStatus === 'detecting' || geoStatus === 'idle'}
            title={isMarkBlocked ? 'Outside hospital — cannot mark PRESENT' : ''}
          >
            {saving
              ? <><Spinner size="sm" className="me-2" />Saving…</>
              : geoStatus === 'detecting' || geoStatus === 'idle'
                ? <><Spinner size="sm" className="me-2" />Detecting location…</>
                : isMarkBlocked
                  ? 'Blocked — Outside Geo-fence'
                  : <><FaCheckCircle className="me-2" />Mark as {formData.status}</>
            }
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
