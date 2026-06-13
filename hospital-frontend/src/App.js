/**
 * App.js — the root component that sets up routing.
 *
 * react-router-dom v6 concepts:
 * - BrowserRouter: enables URL-based routing in the browser
 * - Routes: container for all Route definitions
 * - Route: maps a URL path to a component
 * - Outlet: renders child routes inside a layout component
 * - Navigate: programmatic redirect
 *
 * Route tree:
 *   /login           → Login (no auth required)
 *   /               → redirect to /admin/dashboard
 *   / (protected)
 *     MainLayout (sidebar + navbar)
 *       /admin/dashboard → AdminDashboard
 *       /staff           → StaffList
 *       /patients        → PatientList
 *       /attendance      → AttendanceManagement
 *       /payroll         → PayrollManagement
 *       /appointments    → AppointmentList
 *       /queue           → QueueManagement
 *       /tickets         → SupportTickets
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import StaffList from './components/staff/StaffList';
import PatientList from './components/patient/PatientList';
import AttendanceManagement from './components/attendance/AttendanceManagement';
import PayrollManagement from './components/payroll/PayrollManagement';
import AppointmentList from './components/appointment/AppointmentList';
import QueueManagement from './components/queue/QueueManagement';
import SupportTickets from './components/support/SupportTickets';
import EmailSupport from './components/email/EmailSupport';

function App() {
  return (
    // AuthProvider wraps everything — any component can now call useAuth()
    <AuthProvider>
      <BrowserRouter>
        {/* ToastContainer renders notification toasts in the corner */}
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Protected routes — require login */}
          <Route element={<ProtectedRoute />}>
            {/* All these routes render inside MainLayout (with sidebar) */}
            <Route element={<MainLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/staff" element={<StaffList />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/attendance" element={<AttendanceManagement />} />
              <Route path="/payroll" element={<PayrollManagement />} />
              <Route path="/appointments" element={<AppointmentList />} />
              <Route path="/queue" element={<QueueManagement />} />
              <Route path="/tickets" element={<SupportTickets />} />
              <Route path="/email" element={<EmailSupport />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Catch-all — redirect unknown URLs to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
