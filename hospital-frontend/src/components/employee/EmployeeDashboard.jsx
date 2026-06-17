import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaMoneyBillWave, FaUserCircle, FaTicketAlt, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, getMyMonthlySummary, getMyPayrollHistory } from '../../api/employeeApi';

const StatCard = ({ icon, label, value, sub, color, onClick }) => (
  <Card className="border-0 h-100" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
    <Card.Body className="d-flex align-items-center gap-3">
      <div style={{
        width: 54, height: 54, borderRadius: 14, flexShrink: 0,
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{value ?? '--'}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{sub}</div>}
      </div>
    </Card.Body>
  </Card>
);

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({});
  const [latestPayroll, setLatestPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    const load = async () => {
      try {
        const [profRes, sumRes, payRes] = await Promise.allSettled([
          getMyProfile(),
          getMyMonthlySummary(month, year),
          getMyPayrollHistory(),
        ]);
        if (profRes.status === 'fulfilled') setProfile(profRes.value.data.data);
        if (sumRes.status === 'fulfilled')  setSummary(sumRes.value.data.data || {});
        if (payRes.status === 'fulfilled') {
          const list = payRes.value.data.data || [];
          setLatestPayroll(list[0] || null);
        }
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const present  = summary['PRESENT']  || 0;
  const absent   = summary['ABSENT']   || 0;
  const leave    = summary['ON_LEAVE'] || 0;
  const workDays = present + absent + leave;

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25))',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 18, padding: '24px 28px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{greeting()},</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{user?.fullName}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            {profile && (
              <>
                <span style={{ padding:'2px 10px', borderRadius:20, fontSize:'0.72rem', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)' }}>
                  {profile.employeeId}
                </span>
                <span style={{ padding:'2px 10px', borderRadius:20, fontSize:'0.72rem', background:'rgba(139,92,246,0.2)', border:'1px solid rgba(139,92,246,0.35)', color:'#c4b5fd' }}>
                  {profile.designation?.replace(/_/g,' ')}
                </span>
                <span style={{ padding:'2px 10px', borderRadius:20, fontSize:'0.72rem', background:'rgba(6,182,212,0.15)', border:'1px solid rgba(6,182,212,0.3)', color:'#67e8f9' }}>
                  {profile.department}
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{ marginLeft:'auto', textAlign:'right' }}>
          <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)' }}>Today</div>
          <div style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.8)', fontWeight:500 }}>
            {now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={4} xl={2}>
          <StatCard icon={<FaCheckCircle />} label="Present Days" value={present}
            sub={`This month (${now.toLocaleString('default',{month:'short'})})`}
            color="#10b981" onClick={() => navigate('/employee/attendance')} />
        </Col>
        <Col xs={6} md={4} xl={2}>
          <StatCard icon={<FaTimesCircle />} label="Absent Days" value={absent}
            sub="This month" color="#ef4444" onClick={() => navigate('/employee/attendance')} />
        </Col>
        <Col xs={6} md={4} xl={2}>
          <StatCard icon={<FaCalendarAlt />} label="Leave Days" value={leave}
            sub="This month" color="#f59e0b" onClick={() => navigate('/employee/attendance')} />
        </Col>
        <Col xs={6} md={4} xl={2}>
          <StatCard icon={<FaClock />} label="Work Days" value={workDays}
            sub="Recorded total" color="#8b5cf6" onClick={() => navigate('/employee/schedule')} />
        </Col>
        <Col xs={6} md={4} xl={2}>
          <StatCard icon={<FaMoneyBillWave />}
            label="Net Salary"
            value={latestPayroll ? `₹${Number(latestPayroll.netSalary).toLocaleString('en-IN')}` : 'N/A'}
            sub={latestPayroll ? `${latestPayroll.status}` : 'No payslip yet'}
            color="#06b6d4" onClick={() => navigate('/employee/payslips')} />
        </Col>
        <Col xs={6} md={4} xl={2}>
          <StatCard icon={<FaTicketAlt />} label="Tickets" value="View"
            sub="Support tickets" color="#f97316" onClick={() => navigate('/tickets')} />
        </Col>
      </Row>

      {/* Profile + Quick links */}
      <Row className="g-3">
        <Col lg={5}>
          <Card className="border-0 h-100">
            <Card.Header style={{ background:'transparent', borderBottom:'1px solid rgba(255,255,255,0.08)', fontWeight:600 }}>
              My Profile
            </Card.Header>
            <Card.Body>
              {profile ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { label:'Employee ID',  value: profile.employeeId },
                    { label:'Full Name',    value: `${profile.firstName} ${profile.lastName}` },
                    { label:'Email',        value: profile.email },
                    { label:'Phone',        value: profile.phone || '--' },
                    { label:'Department',   value: profile.department },
                    { label:'Designation',  value: profile.designation?.replace(/_/g,' ') },
                    { label:'Date Joined',  value: profile.dateOfJoining || '--' },
                    { label:'Status',       value: profile.status },
                  ].map(row => (
                    <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.45)' }}>{row.label}</span>
                      <span style={{ fontSize:'0.85rem', color:'#e2d9f3', fontWeight:500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted text-center py-3">Profile not linked to a staff record</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 h-100">
            <Card.Header style={{ background:'transparent', borderBottom:'1px solid rgba(255,255,255,0.08)', fontWeight:600 }}>
              Quick Actions
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {[
                  { icon:'📍', title:'Mark Attendance',   sub:'Geo-fence check-in',       path:'/employee/attendance',   color:'rgba(16,185,129,0.15)',  border:'rgba(16,185,129,0.3)' },
                  { icon:'📅', title:'Work Schedule',     sub:'View your weekly shifts',   path:'/employee/schedule',     color:'rgba(139,92,246,0.15)', border:'rgba(139,92,246,0.3)' },
                  { icon:'💰', title:'My Payslips',       sub:'Download payslips',         path:'/employee/payslips',     color:'rgba(6,182,212,0.15)',  border:'rgba(6,182,212,0.3)' },
                  { icon:'🎫', title:'Support Tickets',   sub:'Raise or view tickets',     path:'/tickets',               color:'rgba(249,115,22,0.15)', border:'rgba(249,115,22,0.3)' },
                ].map(item => (
                  <Col xs={6} key={item.title}>
                    <div
                      onClick={() => navigate(item.path)}
                      style={{
                        padding:'16px', borderRadius:14, cursor:'pointer',
                        background: item.color, border:`1px solid ${item.border}`,
                        transition:'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                    >
                      <div style={{ fontSize:'1.6rem', marginBottom:6 }}>{item.icon}</div>
                      <div style={{ fontWeight:600, fontSize:'0.88rem', color:'#fff' }}>{item.title}</div>
                      <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', marginTop:2 }}>{item.sub}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;
