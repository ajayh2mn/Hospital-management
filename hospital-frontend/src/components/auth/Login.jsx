import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaHospital, FaUser, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { loginApi } from '../../api/authApi';

const Login = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginApi(formData);
      const authData = response.data.data;
      login(authData);
      toast.success(`Welcome back, ${authData.fullName}!`);
      if (authData.roles.includes('ROLE_ADMIN')) navigate('/admin/dashboard');
      else if (authData.roles.includes('ROLE_DOCTOR')) navigate('/appointments');
      else navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Extra login-page orbs */}
      <div style={{
        position:'fixed', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)',
        top:'-150px', right:'-100px', zIndex:0, pointerEvents:'none',
        animation:'driftOrb 12s ease-in-out infinite',
      }} />
      <div style={{
        position:'fixed', width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)',
        bottom:'-120px', left:'-80px', zIndex:0, pointerEvents:'none',
        animation:'driftOrb 9s ease-in-out infinite reverse',
      }} />

      {/* Glass card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          minWidth: 0,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(79,70,229,0.6))',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '32px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <FaHospital size={30} style={{ color: '#ffffff' }} />
          </div>
          <h4 style={{ margin: 0, fontWeight: 700, color: '#ffffff', fontSize: '1.15rem' }}>
            Hospital Management System
          </h4>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '0.83rem' }}>
            Sign in to your account
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 28px 24px' }}>
          {error && (
            <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.85rem' }}>
                <FaUser size={12} className="me-2" style={{ opacity: 0.7 }} />
                Username or Email
              </Form.Label>
              <Form.Control
                type="text"
                name="usernameOrEmail"
                placeholder="Enter username or email"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
                style={{ padding: '10px 14px' }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontSize: '0.85rem' }}>
                <FaLock size={12} className="me-2" style={{ opacity: 0.7 }} />
                Password
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ padding: '10px 14px' }}
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={loading} style={{ padding: '11px' }}>
              {loading
                ? <><Spinner size="sm" className="me-2" />Signing in...</>
                : 'Sign In'
              }
            </Button>
          </Form>

          <div
            style={{
              marginTop: 20,
              padding: '10px 14px',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 10,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
              Default admin: <strong style={{ color: '#c4b5fd' }}>admin</strong>
              {' / '}
              <strong style={{ color: '#c4b5fd' }}>Admin@123</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
