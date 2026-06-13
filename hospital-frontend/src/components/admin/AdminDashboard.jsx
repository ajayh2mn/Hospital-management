/**
 * AdminDashboard.jsx — the main admin overview page.
 *
 * Shows stat cards and a department chart.
 * Data comes from GET /api/admin/dashboard via getDashboardStats().
 *
 * React hooks used:
 * - useEffect: fetch data when the component mounts (loads)
 * - useState: store the fetched stats
 *
 * Recharts: a React charting library for the department bar chart.
 */

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FaUsers, FaUserInjured, FaCalendarCheck, FaMoneyBillWave,
  FaListOl, FaTicketAlt
} from 'react-icons/fa';
import { getDashboardStats } from '../../api/ticketApi';

// Reusable stat card component
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="d-flex align-items-center">
      <div
        className="rounded-circle d-flex align-items-center justify-content-center me-3"
        style={{ width: 56, height: 56, backgroundColor: `${color}20` }}
      >
        <span style={{ color, fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div>
        <div className="text-muted small">{title}</div>
        <div className="fs-4 fw-bold">{value ?? '--'}</div>
        {subtitle && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{subtitle}</div>}
      </div>
    </Card.Body>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect runs once when the component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []); // Empty [] = run only once on mount

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <div className="mt-2 text-muted">Loading dashboard...</div>
    </div>
  );

  if (error) return <Alert variant="danger">{error}</Alert>;

  // Transform department data for Recharts
  const deptChartData = stats?.staffByDepartment
    ? Object.entries(stats.staffByDepartment).map(([dept, count]) => ({
        name: dept.substring(0, 8),  // Shorten for display
        count,
      }))
    : [];

  return (
    <div>
      <h4 className="mb-4 fw-bold">Admin Dashboard</h4>

      {/* Stat Cards Row */}
      <Row className="g-3 mb-4">
        <Col md={4} xl={2}>
          <StatCard title="Total Staff" value={stats?.totalStaff}
            icon={<FaUsers />} color="#0d6efd"
            subtitle={`${stats?.activeStaff} active`} />
        </Col>
        <Col md={4} xl={2}>
          <StatCard title="Total Patients" value={stats?.totalPatients}
            icon={<FaUserInjured />} color="#198754"
            subtitle={`${stats?.activePatients} active`} />
        </Col>
        <Col md={4} xl={2}>
          <StatCard title="Today's Appointments" value={stats?.todayAppointments}
            icon={<FaCalendarCheck />} color="#ffc107"
            subtitle={`${stats?.pendingAppointments} pending`} />
        </Col>
        <Col md={4} xl={2}>
          <StatCard title="Monthly Payroll" value={`₹${stats?.monthlyPayroll ?? 0}`}
            icon={<FaMoneyBillWave />} color="#6f42c1" />
        </Col>
        <Col md={4} xl={2}>
          <StatCard title="Queue Size" value={stats?.currentQueueSize}
            icon={<FaListOl />} color="#fd7e14"
            subtitle="currently waiting" />
        </Col>
        <Col md={4} xl={2}>
          <StatCard title="Open Tickets" value={stats?.openTickets}
            icon={<FaTicketAlt />} color="#dc3545" />
        </Col>
      </Row>

      {/* Department Chart */}
      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-semibold border-bottom">
              Staff by Department
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white fw-semibold border-bottom">
              Quick Summary
            </Card.Header>
            <Card.Body>
              {[
                { label: 'Active Staff', value: stats?.activeStaff, color: 'primary' },
                { label: 'Active Patients', value: stats?.activePatients, color: 'success' },
                { label: 'Pending Appointments', value: stats?.pendingAppointments, color: 'warning' },
                { label: 'Open Tickets', value: stats?.openTickets, color: 'danger' },
              ].map((item) => (
                <div key={item.label} className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">{item.label}</span>
                  <span className={`badge bg-${item.color} rounded-pill px-3`}>{item.value ?? 0}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
