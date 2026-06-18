import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { FaMoneyBillWave, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getMyPayrollHistory, downloadMyPayslip } from '../../api/employeeApi';

const statusColors = { PENDING:'secondary', PROCESSED:'warning', PAID:'success', CANCELLED:'danger' };

const MyPayslips = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    getMyPayrollHistory()
      .then(r => setPayrolls(r.data.data || []))
      .catch(() => toast.error('Failed to load payslips'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (p) => {
    setDownloading(p.id);
    try {
      const res = await downloadMyPayslip(p.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${p.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Payslip downloaded');
    } catch { toast.error('Failed to download'); }
    finally { setDownloading(null); }
  };

  const totalEarned = payrolls.filter(p=>p.status==='PAID').reduce((s,p)=>s+(p.netSalary||0),0);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaMoneyBillWave className="me-2" />My Payslips</h4>
        <div style={{ padding:'6px 16px', borderRadius:12, background:'rgba(6,182,212,0.12)', border:'1px solid rgba(6,182,212,0.3)', fontSize:'0.85rem', color:'#0e7490' }}>
          Total Received: <strong>₹{totalEarned.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {payrolls.length === 0 ? (
        <Card className="border-0">
          <Card.Body className="text-center py-5">
            <FaMoneyBillWave size={40} style={{ color:'rgba(100,116,139,0.3)', marginBottom:12 }} />
            <div className="text-muted">No payslips generated yet</div>
            <small className="text-muted">Contact HR to generate your payslip</small>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Month / Year</th><th>Basic Salary</th><th>Gross</th>
                    <th>Deductions</th><th>Net Salary</th>
                    <th>Days</th><th>Status</th><th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>
                          {new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long' })} {p.year}
                        </strong>
                      </td>
                      <td>₹{Number(p.basicSalary).toLocaleString('en-IN')}</td>
                      <td>₹{Number(p.grossSalary).toLocaleString('en-IN')}</td>
                      <td style={{ color:'#dc2626' }}>₹{Number(p.totalDeductions).toLocaleString('en-IN')}</td>
                      <td style={{ color:'#059669', fontWeight:700 }}>₹{Number(p.netSalary).toLocaleString('en-IN')}</td>
                      <td><small>{p.presentDays}P / {p.absentDays}A</small></td>
                      <td>
                        <Badge bg={statusColors[p.status]||'secondary'}>
                          {p.status==='PAID' && <FaCheckCircle className="me-1" size={10}/>}
                          {p.status}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-primary"
                          onClick={() => handleDownload(p)}
                          disabled={downloading === p.id}>
                          {downloading === p.id
                            ? <Spinner size="sm" />
                            : <><FaDownload size={12} className="me-1"/>PDF</>}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MyPayslips;
