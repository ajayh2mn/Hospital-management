import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { FaMoneyBillWave, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { generatePayroll, getMonthlyPayroll, markPayrollPaid, downloadPayslip } from '../../api/payrollApi';
import { getAllStaff } from '../../api/staffApi';

const statusColors = { PENDING: 'secondary', PROCESSED: 'warning', PAID: 'success', CANCELLED: 'danger' };

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedStaff, setSelectedStaff] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await getMonthlyPayroll(month, year);
      setPayrolls(res.data.data || []);
    } catch { toast.error('Failed to load payroll'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    getAllStaff().then(res => setStaff(res.data.data || []));
  }, []);

  useEffect(() => { fetchPayroll(); }, [month, year]);

  const handleGenerate = async () => {
    if (!selectedStaff) { toast.warning('Select a staff member'); return; }
    setGenerating(true);
    try {
      await generatePayroll(selectedStaff, month, year);
      toast.success('Payroll generated successfully');
      fetchPayroll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate payroll');
    } finally { setGenerating(false); }
  };

  const handleMarkPaid = async (payrollId) => {
    try {
      await markPayrollPaid(payrollId);
      toast.success('Marked as paid');
      fetchPayroll();
    } catch { toast.error('Failed'); }
  };

  const handleDownload = async (payrollId, staffName) => {
    try {
      const res = await downloadPayslip(payrollId);
      // Create a download link for the PDF blob
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${staffName}-${month}-${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Payslip downloaded');
    } catch { toast.error('Failed to download payslip'); }
  };

  const totalNet = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div>
      <h4 className="fw-bold mb-4"><FaMoneyBillWave className="me-2" />Payroll Management</h4>

      {/* Generate Payroll Panel */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white fw-semibold">Generate Payroll</Card.Header>
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Staff Member</Form.Label>
                <Form.Select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                  <option value="">Select Staff</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.employeeId} — {s.firstName} {s.lastName}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Month</Form.Label>
                <Form.Select value={month} onChange={e => setMonth(Number(e.target.value))}>
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>
                      {new Date(2000, i).toLocaleString('default', {month: 'long'})}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Control type="number" value={year} onChange={e => setYear(Number(e.target.value))} />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button variant="primary" onClick={handleGenerate} disabled={generating}>
                {generating ? <Spinner size="sm" className="me-2" /> : null}
                Generate
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Payroll Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold">
            Payroll — {new Date(year, month-1).toLocaleString('default', {month:'long'})} {year}
          </span>
          <strong>Total: ₹{totalNet.toLocaleString('en-IN')}</strong>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-3"><Spinner animation="border" /></div>
          ) : (
            <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Employee</th><th>Basic</th><th>Gross</th>
                  <th>Deductions</th><th>Net Salary</th>
                  <th>Present/Absent</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted py-4">No payroll data</td></tr>
                ) : payrolls.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.staff?.firstName} {p.staff?.lastName}</strong>
                      <br /><small className="text-muted">{p.staff?.employeeId}</small>
                    </td>
                    <td>₹{p.basicSalary?.toLocaleString('en-IN')}</td>
                    <td>₹{p.grossSalary?.toLocaleString('en-IN')}</td>
                    <td className="text-danger">₹{p.totalDeductions?.toLocaleString('en-IN')}</td>
                    <td className="text-success fw-bold">₹{p.netSalary?.toLocaleString('en-IN')}</td>
                    <td>{p.presentDays}P / {p.absentDays}A</td>
                    <td><Badge bg={statusColors[p.status]}>{p.status}</Badge></td>
                    <td className="d-flex gap-1">
                      {p.status !== 'PAID' && (
                        <Button size="sm" variant="outline-success" onClick={() => handleMarkPaid(p.id)}>
                          <FaCheckCircle />
                        </Button>
                      )}
                      <Button size="sm" variant="outline-primary"
                        onClick={() => handleDownload(p.id, `${p.staff?.firstName}-${p.staff?.lastName}`)}>
                        <FaDownload />
                      </Button>
                    </td>
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

export default PayrollManagement;
