import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { FaTicketAlt, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createTicket, getMyTickets, addComment } from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';

const priorityColors = { LOW:'success', MEDIUM:'warning', HIGH:'orange', CRITICAL:'danger' };
const statusColors = { OPEN:'primary', IN_PROGRESS:'warning', RESOLVED:'success', CLOSED:'secondary', REOPENED:'info' };

const SupportTickets = () => {
  const { isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject: '', description: '', category: 'GENERAL_INQUIRY', priority: 'MEDIUM'
  });

  const fetchTickets = async () => {
    try {
      const res = await getMyTickets();
      setTickets(res.data.data || []);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createTicket(formData);
      toast.success('Ticket created successfully');
      setShowCreate(false);
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment(selectedTicket.id, comment);
      toast.success('Comment added');
      setComment('');
      fetchTickets();
    } catch { toast.error('Failed to add comment'); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaTicketAlt className="me-2" />Support Tickets</h4>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <FaPlus className="me-2" />New Ticket
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr><th>Ticket #</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th><th>View</th></tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">No tickets yet</td></tr>
              ) : tickets.map(t => (
                <tr key={t.id}>
                  <td><code>{t.ticketNumber}</code></td>
                  <td><strong>{t.subject}</strong></td>
                  <td>{t.category?.replace(/_/g, ' ')}</td>
                  <td><Badge bg={priorityColors[t.priority] || 'secondary'}>{t.priority}</Badge></td>
                  <td><Badge bg={statusColors[t.status] || 'secondary'}>{t.status}</Badge></td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button size="sm" variant="outline-primary"
                      onClick={() => { setSelectedTicket(t); setShowDetail(true); }}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create Ticket Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton><Modal.Title>New Support Ticket</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Subject *</Form.Label>
                <Form.Control value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}>
                  {['ACCOUNT_ACCESS','PASSWORD_RESET','SYSTEM_ERROR','PAYROLL_ISSUE','ATTENDANCE_ISSUE','GENERAL_INQUIRY','OTHER'].map(c => (
                    <option key={c} value={c}>{c.replace(/_/g,' ')}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Priority</Form.Label>
                <Form.Select value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}>
                  {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p}>{p}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description *</Form.Label>
                <Form.Control as="textarea" rows={4} value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={saving}>
            {saving ? <Spinner size="sm" className="me-2" /> : null}Submit Ticket
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedTicket?.ticketNumber} — {selectedTicket?.subject}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <>
              <p className="text-muted">{selectedTicket.description}</p>
              <hr />
              <h6>Comments</h6>
              {selectedTicket.comments?.length > 0 ? selectedTicket.comments.map(c => (
                <div key={c.id} className="bg-light p-2 rounded mb-2">
                  <small className="fw-bold">{c.commentedBy?.fullName}</small>
                  <p className="mb-0 small">{c.comment}</p>
                </div>
              )) : <p className="text-muted small">No comments yet</p>}
              <Form.Group className="mt-3">
                <Form.Control placeholder="Add a comment..." value={comment}
                  onChange={e => setComment(e.target.value)} />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddComment}>Add Comment</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SupportTickets;
