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

// Admin pages
import AdminDashboard    from './components/admin/AdminDashboard';
import StaffList         from './components/staff/StaffList';
import PatientList       from './components/patient/PatientList';
import AttendanceManagement from './components/attendance/AttendanceManagement';
import PayrollManagement from './components/payroll/PayrollManagement';
import AppointmentList   from './components/appointment/AppointmentList';
import QueueManagement   from './components/queue/QueueManagement';
import SupportTickets    from './components/support/SupportTickets';
import EmailSupport      from './components/email/EmailSupport';

// Employee pages
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import MyAttendance      from './components/employee/MyAttendance';
import WorkSchedule      from './components/employee/WorkSchedule';
import MyPayslips        from './components/employee/MyPayslips';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* All protected routes share the same MainLayout (sidebar + navbar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>

              {/* ── Admin routes ── */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/staff"           element={<StaffList />} />
              <Route path="/attendance"      element={<AttendanceManagement />} />
              <Route path="/payroll"         element={<PayrollManagement />} />
              <Route path="/email"           element={<EmailSupport />} />

              {/* ── Shared routes (admin + employee) ── */}
              <Route path="/patients"        element={<PatientList />} />
              <Route path="/appointments"    element={<AppointmentList />} />
              <Route path="/queue"           element={<QueueManagement />} />
              <Route path="/tickets"         element={<SupportTickets />} />

              {/* ── Employee routes ── */}
              <Route path="/employee/dashboard"  element={<EmployeeDashboard />} />
              <Route path="/employee/attendance" element={<MyAttendance />} />
              <Route path="/employee/schedule"   element={<WorkSchedule />} />
              <Route path="/employee/payslips"   element={<MyPayslips />} />

            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
