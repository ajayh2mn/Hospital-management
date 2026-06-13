import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaBell, FaBars, FaEnvelope, FaIdBadge, FaUser, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TopNavbar = ({ onHamburgerClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const roleName = user?.roles?.[0]?.replace('ROLE_', '') || '';
  const roleColors = {
    ADMIN: { bg: 'rgba(139,92,246,0.25)', border: 'rgba(139,92,246,0.5)', text: '#c4b5fd' },
    DOCTOR: { bg: 'rgba(16,185,129,0.25)', border: 'rgba(16,185,129,0.5)', text: '#6ee7b7' },
    NURSE: { bg: 'rgba(6,182,212,0.25)', border: 'rgba(6,182,212,0.5)', text: '#67e8f9' },
    HR: { bg: 'rgba(245,158,11,0.25)', border: 'rgba(245,158,11,0.5)', text: '#fcd34d' },
    ACCOUNTANT: { bg: 'rgba(239,68,68,0.25)', border: 'rgba(239,68,68,0.5)', text: '#fca5a5' },
    RECEPTIONIST: { bg: 'rgba(79,172,254,0.25)', border: 'rgba(79,172,254,0.5)', text: '#93c5fd' },
  };
  const roleStyle = roleColors[roleName] || roleColors.ADMIN;

  // Avatar initials
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="hms-topbar">
      {/* Hamburger — visible only on mobile/tablet */}
      <button className="hms-topbar__hamburger" onClick={onHamburgerClick} aria-label="Open menu">
        <FaBars size={18} />
      </button>

      <span className="hms-topbar__date">
        {new Date().toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}
      </span>

      <div className="hms-topbar__right">
        <div className="hms-topbar__bell">
          <FaBell size={14} />
        </div>

        {/* Profile trigger — relative container holds the popup */}
        <div ref={popupRef} style={{ position: 'relative' }}>
          <div
            className="hms-topbar__user"
            onClick={() => setProfileOpen(prev => !prev)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title="View profile"
          >
            {/* Avatar circle with initials */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, color: '#fff',
              flexShrink: 0, boxShadow: '0 2px 8px rgba(124,58,237,0.5)',
            }}>
              {initials}
            </div>
            <div className="hms-topbar__user-info">
              <div className="hms-topbar__user-name">{user?.fullName}</div>
              <div className="hms-topbar__user-role">{roleName}</div>
            </div>
          </div>

          {/* ── Profile Popup ── */}
          {profileOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 300,
              background: 'rgba(15, 10, 40, 0.92)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 18,
              boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
              zIndex: 1100,
              overflow: 'hidden',
              animation: 'fadeSlideDown 0.18s ease',
            }}>
              {/* Header band */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(79,70,229,0.5))',
                padding: '20px 20px 16px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                {/* Large avatar */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 800, color: '#fff',
                  margin: '0 auto 12px',
                  boxShadow: '0 4px 18px rgba(124,58,237,0.6)',
                  border: '2px solid rgba(255,255,255,0.25)',
                }}>
                  {initials}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                  {user?.fullName}
                </div>
                {/* Role badge */}
                <span style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '3px 12px',
                  borderRadius: 20,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: roleStyle.bg,
                  border: `1px solid ${roleStyle.border}`,
                  color: roleStyle.text,
                  letterSpacing: '0.05em',
                }}>
                  <FaShieldAlt size={9} style={{ marginRight: 4 }} />{roleName}
                </span>
              </div>

              {/* Detail rows */}
              <div style={{ padding: '14px 18px 6px' }}>
                {[
                  { icon: <FaUser size={12} />, label: 'Username', value: user?.username },
                  { icon: <FaEnvelope size={12} />, label: 'Email', value: user?.email },
                  { icon: <FaIdBadge size={12} />, label: 'User ID', value: `#${user?.id}` },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(255,255,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.5)', flexShrink: 0,
                    }}>
                      {row.icon}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>
                        {row.label}
                      </div>
                      <div style={{
                        fontSize: '0.84rem', color: '#e2d9f3', fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {row.value || '--'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Logout button */}
              <div style={{ padding: '10px 18px 16px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '9px 0',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    borderRadius: 10,
                    color: '#f87171',
                    fontSize: '0.86rem', fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.28)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171'; }}
                >
                  <FaSignOutAlt size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
