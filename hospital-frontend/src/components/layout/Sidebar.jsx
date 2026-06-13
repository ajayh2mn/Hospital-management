import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaUsers, FaCalendarCheck, FaMoneyBillWave,
  FaUserInjured, FaClock, FaListOl, FaEnvelope, FaTicketAlt,
  FaSignOutAlt, FaHospital, FaBars, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const menuItems = [
  { label: 'Dashboard',       path: '/admin/dashboard', icon: <FaTachometerAlt />, roles: ['ROLE_ADMIN'] },
  { label: 'Staff',           path: '/staff',            icon: <FaUsers />,         roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  { label: 'Attendance',      path: '/attendance',       icon: <FaClock />,         roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_NURSE'] },
  { label: 'Payroll',         path: '/payroll',          icon: <FaMoneyBillWave />, roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTANT', 'ROLE_HR'] },
  { label: 'Patients',        path: '/patients',         icon: <FaUserInjured />,   roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST'] },
  { label: 'Appointments',    path: '/appointments',     icon: <FaCalendarCheck />, roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST'] },
  { label: 'Queue',           path: '/queue',            icon: <FaListOl />,        roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST'] },
  { label: 'Support Tickets', path: '/tickets',          icon: <FaTicketAlt />,     roles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST', 'ROLE_HR', 'ROLE_ACCOUNTANT'] },
  { label: 'Email Support',   path: '/email',            icon: <FaEnvelope />,      roles: ['ROLE_ADMIN', 'ROLE_HR'] },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const visibleItems = menuItems.filter(item =>
    item.roles.some(role => hasRole(role))
  );

  // On mobile: slide in/out. On desktop: collapsed or full.
  return (
    <aside
      className={`hms-sidebar ${collapsed ? 'hms-sidebar--collapsed' : ''} ${mobileOpen ? 'hms-sidebar--mobile-open' : ''}`}
    >
      {/* Logo + Toggle */}
      <div className="hms-sidebar__header">
        {!collapsed && (
          <div className="hms-sidebar__logo">
            <div className="hms-sidebar__logo-icon">
              <FaHospital size={16} />
            </div>
            <span>HMS</span>
          </div>
        )}
        <button
          className="hms-sidebar__toggle"
          onClick={() => {
            // On mobile, close the drawer. On desktop, collapse/expand.
            if (window.innerWidth < 992) {
              setMobileOpen(false);
            } else {
              setCollapsed(prev => !prev);
            }
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {mobileOpen ? <FaTimes size={13} /> : <FaBars size={13} />}
        </button>
      </div>

      {/* User chip */}
      {!collapsed && user && (
        <div className="hms-sidebar__user">
          <div className="hms-sidebar__user-chip">
            <div className="hms-sidebar__user-name">{user.fullName}</div>
            <div className="hms-sidebar__user-role">
              {user.roles?.[0]?.replace('ROLE_', '')}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="hms-sidebar__nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}   // close drawer on link click (mobile)
            className={({ isActive }) =>
              `hms-sidebar__link hover-bg ${isActive ? 'active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="hms-sidebar__link-icon">{item.icon}</span>
            {!collapsed && <span className="hms-sidebar__link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="hms-sidebar__footer">
        <button className="hms-sidebar__logout" onClick={handleLogout}>
          <FaSignOutAlt size={14} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
