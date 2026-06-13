import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { FaListOl, FaBell, FaCheck, FaForward } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getWaitingQueue, callPatient, completeConsultation, skipPatient } from '../../api/queueApi';

const statusColors = { WAITING: 'warning', CALLED: 'info', IN_PROGRESS: 'primary', COMPLETED: 'success', SKIPPED: 'secondary' };

const QueueManagement = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await getWaitingQueue();
      setQueue(res.data.data || []);
    } catch { toast.error('Failed to load queue'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);  // Cleanup on unmount
  }, []);

  const handleCall = async (id) => {
    try { await callPatient(id); toast.info('Patient called'); fetchQueue(); }
    catch { toast.error('Failed'); }
  };

  const handleComplete = async (id) => {
    try { await completeConsultation(id); toast.success('Consultation complete'); fetchQueue(); }
    catch { toast.error('Failed'); }
  };

  const handleSkip = async (id) => {
    try { await skipPatient(id); toast.warning('Patient skipped'); fetchQueue(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaListOl className="me-2" />Queue Management</h4>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="warning" className="px-3 py-2">
            Waiting: {queue.filter(q => q.status === 'WAITING').length}
          </Badge>
          <Button variant="outline-primary" size="sm" onClick={fetchQueue}>Refresh</Button>
        </div>
      </div>

      {queue.length === 0 ? (
        <Alert variant="info">No patients in queue right now.</Alert>
      ) : (
        <Row className="g-3">
          {queue.map(q => (
            <Col md={6} lg={4} key={q.id}>
              <Card className={`border-0 shadow-sm h-100 border-start border-4 border-${statusColors[q.status]}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="display-6 fw-bold text-primary">#{q.tokenNumber}</div>
                      <div className="fw-semibold">
                        {q.appointment?.patient?.firstName} {q.appointment?.patient?.lastName}
                      </div>
                      <div className="text-muted small">
                        Dr. {q.doctor?.firstName} {q.doctor?.lastName}
                      </div>
                      <Badge bg={statusColors[q.status]} className="mt-2">{q.status}</Badge>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    {q.status === 'WAITING' && (
                      <Button size="sm" variant="info" onClick={() => handleCall(q.id)}>
                        <FaBell className="me-1" />Call
                      </Button>
                    )}
                    {(q.status === 'CALLED' || q.status === 'IN_PROGRESS') && (
                      <Button size="sm" variant="success" onClick={() => handleComplete(q.id)}>
                        <FaCheck className="me-1" />Done
                      </Button>
                    )}
                    {q.status === 'WAITING' && (
                      <Button size="sm" variant="secondary" onClick={() => handleSkip(q.id)}>
                        <FaForward className="me-1" />Skip
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default QueueManagement;
