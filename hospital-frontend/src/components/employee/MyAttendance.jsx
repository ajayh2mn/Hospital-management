import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaClock, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaLocationArrow, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getMyAttendance, markMyAttendance, getMyMonthlySummary, getHospitalLocation } from '../../api/employeeApi';

const statusColors = {
  PRESENT:'success', ABSENT:'danger', HALF_DAY:'warning',
  ON_LEAVE:'info', HOLIDAY:'secondary', WEEKEND:'light'
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getCurrentTime = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
};

const MyAttendance = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [records, setRecords]   = useState([]);
  const [summary, setSummary]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [hospitalLocation, setHospitalLocation] = useState(null);
  const [formData, setFormData] = useState({ status:'PRESENT', checkInTime:'', checkOutTime:'', remarks:'' });

  // Geo state
  const [geoStatus, setGeoStatus]     = useState('idle');
  const [userCoords, setUserCoords]   = useState(null);
  const [distanceMeters, setDistanceMeters] = useState(null);

  useEffect(() => {
    getHospitalLocation().then(r => setHospitalLocation(r.data.data)).catch(()=>{});
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const from = `${year}-${String(month).padStart(2,'0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to   = `${year}-${String(month).padStart(2,'0')}-${lastDay}`;
    try {
      const [recRes, sumRes] = await Promise.all([
        getMyAttendance(from, to),
        getMyMonthlySummary(month, year),
      ]);
      setRecords(recRes.data.data || []);
      setSummary(sumRes.data.data || {});
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const detectLocation = (hosp) => {
    const loc = hosp || hospitalLocation;
    if (!navigator.geolocation) { setGeoStatus('denied'); return; }
    setGeoStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ latitude, longitude });
        let dist = null, inside = true;
        if (loc) {
          dist = Math.round(haversineDistance(latitude, longitude, loc.latitude, loc.longitude));
          inside = dist <= loc.fenceRadiusMeters;
        }
        setDistanceMeters(dist);
        setGeoStatus(inside ? 'inside' : 'outside');
        setFormData(prev => ({ ...prev, status: inside ? 'PRESENT' : 'ABSENT', checkInTime: getCurrentTime() }));
        toast.success(inside ? 'Inside hospital — marked PRESENT' : 'Outside hospital — marked ABSENT');
      },
      () => { setGeoStatus('denied'); toast.error('Location access denied'); },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const openModal = () => {
    setFormData({ status:'PRESENT', checkInTime: getCurrentTime(), checkOutTime:'', remarks:'' });
    setGeoStatus('idle');
    setUserCoords(null);
    setDistanceMeters(null);
    setShowModal(true);
    setTimeout(() => detectLocation(hospitalLocation), 300);
  };

  const handleMark = async () => {
    if (formData.status === 'PRESENT' && geoStatus === 'outside') {
      toast.error('You are outside the hospital premises'); return;
    }
    setSaving(true);
    try {
      await markMyAttendance({
        status: formData.status,
        checkInTime: formData.checkInTime || null,
        checkOutTime: formData.checkOutTime || null,
        remarks: formData.remarks || null,
        attendanceDate: new Date().toISOString().split('T')[0],
        latitude: userCoords?.latitude || null,
        longitude: userCoords?.longitude || null,
        distanceMeters: distanceMeters || null,
      });
      toast.success('Attendance marked!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const geoPanels = {
    idle:      { bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.1)',  color:'rgba(255,255,255,0.4)', icon:<FaMapMarkerAlt />,                     label:'Detecting your location…' },
    detecting: { bg:'rgba(79,172,254,0.08)',  border:'rgba(79,172,254,0.3)',   color:'#93c5fd', icon:<Spinner animation="border" size="sm" />,             label:'Detecting your location…' },
    inside:    { bg:'rgba(16,185,129,0.1)',   border:'rgba(16,185,129,0.45)',  color:'#6ee7b7', icon:<FaCheckCircle />,                                    label:`Inside hospital — ${distanceMeters}m away ✓` },
    outside:   { bg:'rgba(239,68,68,0.1)',    border:'rgba(239,68,68,0.45)',   color:'#f87171', icon:<FaTimesCircle />,                                    label:`Outside hospital — ${distanceMeters}m away (limit: ${hospitalLocation?.fenceRadiusMeters}m)` },
    denied:    { bg:'rgba(234,179,8,0.08)',   border:'rgba(234,179,8,0.35)',   color:'#fde047', icon:<FaTimesCircle />,                                    label:'Location access denied — allow in browser settings' },
  };
  const geo = geoPanels[geoStatus];

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaClock className="me-2" />My Attendance</h4>
        <Button variant="primary" onClick={openModal}>
          <FaLocationArrow className="me-2" />Mark Today's Attendance
        </Button>
      </div>

      {/* Month selector + summary cards */}
      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="border-0">
            <Card.Body className="py-2">
              <div className="d-flex align-items-center gap-2">
                <Form.Select size="sm" value={month} onChange={e=>setMonth(Number(e.target.value))} style={{width:'auto'}}>
                  {monthNames.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
                </Form.Select>
                <Form.Control size="sm" type="number" value={year} min="2020" max="2099"
                  onChange={e=>setYear(Number(e.target.value))} style={{width:90}} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        {[
          { label:'Present', key:'PRESENT', color:'#10b981' },
          { label:'Absent',  key:'ABSENT',  color:'#ef4444' },
          { label:'Leave',   key:'ON_LEAVE',color:'#f59e0b' },
        ].map(s=>(
          <Col xs={4} md={2} key={s.key}>
            <Card className="border-0 text-center">
              <Card.Body className="py-2 px-1">
                <div style={{fontSize:'1.4rem', fontWeight:700, color:s.color}}>{summary[s.key]||0}</div>
                <div style={{fontSize:'0.72rem', color:'rgba(255,255,255,0.45)'}}>{s.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Attendance table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? <div className="text-center py-4"><Spinner animation="border" /></div> : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Date</th><th>Day</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Distance</th><th>Remarks</th></tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">No records for this period</td></tr>
                  ) : records.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.attendanceDate}</strong></td>
                      <td><small className="text-muted">{new Date(r.attendanceDate).toLocaleDateString('en-IN',{weekday:'short'})}</small></td>
                      <td>{r.checkInTime || '--'}</td>
                      <td>{r.checkOutTime || '--'}</td>
                      <td><Badge bg={statusColors[r.status]||'secondary'}>{r.status}</Badge></td>
                      <td>
                        {r.checkInDistanceMeters != null ? (
                          <small style={{color: r.checkInDistanceMeters<=(hospitalLocation?.fenceRadiusMeters||200)?'#6ee7b7':'#f87171'}}>
                            <FaMapMarkerAlt size={10} className="me-1"/>{r.checkInDistanceMeters}m
                          </small>
                        ) : <small className="text-muted">--</small>}
                      </td>
                      <td><small>{r.remarks||'--'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mark Modal */}
      <Modal show={showModal} onHide={()=>setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><FaLocationArrow className="me-2"/>Mark Today's Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            {/* Geo panel */}
            <Col md={12}>
              <div style={{ background:geo.bg, border:`1px solid ${geo.border}`, borderRadius:12, padding:'14px 16px' }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-3">
                    <span style={{color:geo.color, fontSize:'1.2rem'}}>{geo.icon}</span>
                    <div>
                      <div style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.4)'}}>AUTO LOCATION DETECTION</div>
                      <div style={{fontSize:'0.88rem', color:geo.color, fontWeight:600}}>{geo.label}</div>
                      {userCoords && (
                        <div style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginTop:2}}>
                          {userCoords.latitude.toFixed(5)}, {userCoords.longitude.toFixed(5)}
                        </div>
                      )}
                    </div>
                  </div>
                  {(geoStatus==='inside'||geoStatus==='outside'||geoStatus==='denied') && (
                    <Button size="sm" variant="outline-secondary" onClick={()=>detectLocation()}>
                      <FaRedo size={10} className="me-1"/>Re-detect
                    </Button>
                  )}
                </div>

                {(geoStatus==='inside'||geoStatus==='outside') && (
                  <div className="d-flex gap-2 flex-wrap mt-3">
                    {[
                      {label:`📅 ${new Date().toLocaleDateString('en-IN')}`},
                      {label:`🕐 ${formData.checkInTime}`},
                      {label:`✅ ${formData.status}`, color: geoStatus==='inside'?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)', border: geoStatus==='inside'?'rgba(16,185,129,0.4)':'rgba(239,68,68,0.4)', text: geoStatus==='inside'?'#6ee7b7':'#f87171'},
                    ].map((chip,i)=>(
                      <span key={i} style={{
                        padding:'3px 10px', borderRadius:20, fontSize:'0.76rem',
                        background: chip.color||'rgba(255,255,255,0.07)',
                        border:`1px solid ${chip.border||'rgba(255,255,255,0.12)'}`,
                        color: chip.text||'rgba(255,255,255,0.7)',
                      }}>{chip.label}</span>
                    ))}
                  </div>
                )}
              </div>
              {geoStatus==='outside' && (
                <div style={{marginTop:8, padding:'8px 12px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, fontSize:'0.8rem', color:'#f87171'}}>
                  You are <strong>{distanceMeters}m</strong> from the hospital (limit: <strong>{hospitalLocation?.fenceRadiusMeters}m</strong>). Marked ABSENT automatically.
                </div>
              )}
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Check Out Time <small className="text-muted">(optional)</small></Form.Label>
                <Form.Control type="time" value={formData.checkOutTime}
                  onChange={e=>setFormData({...formData,checkOutTime:e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status <small className="text-muted">(auto-set)</small></Form.Label>
                <Form.Control readOnly value={formData.status}
                  style={{background:formData.status==='PRESENT'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', color:formData.status==='PRESENT'?'#6ee7b7':'#f87171', fontWeight:600}} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Remarks</Form.Label>
                <Form.Control placeholder="Optional notes…" value={formData.remarks}
                  onChange={e=>setFormData({...formData,remarks:e.target.value})} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleMark}
            disabled={saving||geoStatus==='detecting'||geoStatus==='idle'||(formData.status==='PRESENT'&&geoStatus==='outside')}>
            {saving ? <><Spinner size="sm" className="me-2"/>Saving…</>
              : geoStatus==='detecting'||geoStatus==='idle' ? <><Spinner size="sm" className="me-2"/>Detecting…</>
              : <><FaCheckCircle className="me-2"/>Mark as {formData.status}</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyAttendance;
