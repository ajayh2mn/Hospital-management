import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

const initialForm = { to: '', subject: '', body: '' };

const EmailSupport = () => {
  const [formData, setFormData] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const [sentList, setSentList] = useState([]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axiosInstance.post('/api/email/send', formData);
      toast.success('Email sent successfully');
      setSentList([{ ...formData, sentAt: new Date().toLocaleTimeString() }, ...sentList]);
      setFormData(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <FaEnvelope className="me-2 text-primary" size={22} />
        <h4 className="fw-bold mb-0">Email Support</h4>
      </div>

      <Alert variant="info" className="mb-4">
        <strong>Note:</strong> Email is currently in log-only mode. Messages are recorded in the
        server logs. To enable real sending, configure SMTP credentials in{' '}
        <code>application.yml</code>.
      </Alert>

      <Row>
        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-semibold">Compose Email</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSend}>
                <Form.Group className="mb-3">
                  <Form.Label>To (recipient email) *</Form.Label>
                  <Form.Control
                    type="email"
                    name="to"
                    placeholder="recipient@example.com"
                    value={formData.to}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Subject *</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    placeholder="Email subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="body"
                    placeholder="Write your message here..."
                    value={formData.body}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={sending}>
                  {sending
                    ? <><Spinner size="sm" className="me-2" />Sending...</>
                    : <><FaPaperPlane className="me-2" />Send Email</>
                  }
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-semibold">Sent This Session</Card.Header>
            <Card.Body style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {sentList.length === 0 ? (
                <p className="text-muted text-center py-4">No emails sent yet</p>
              ) : (
                sentList.map((item, i) => (
                  <div key={i} className="border-bottom pb-2 mb-2">
                    <div className="small fw-semibold">{item.subject}</div>
                    <div className="small text-muted">To: {item.to}</div>
                    <div className="small text-muted">{item.sentAt}</div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmailSupport;
