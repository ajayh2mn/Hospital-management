/**
 * ProtectedRoute.jsx — guards routes that require authentication.
 *
 * If the user is not logged in → redirect to /login
 * If a required role is specified and user doesn't have it → show "Access Denied"
 *
 * Usage in App.js:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
 *     <Route path="/admin/users" element={<UserManagement />} />
 *   </Route>
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Container } from 'react-bootstrap';

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth();

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check — if specific role required and user doesn't have it
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>You don't have permission to view this page.</p>
        </Alert>
      </Container>
    );
  }

  // All checks passed — render the nested route
  return <Outlet />;
};

export default ProtectedRoute;
