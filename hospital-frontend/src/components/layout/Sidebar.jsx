import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaUsers, FaCalendarCheck, FaMoneyBillWave,
  FaUserInjured, FaClock, FaListOl, FaEnvelope, FaTicketAlt,
  FaSignOutAlt, FaHospital, FaBars, FaTimes, FaHome,
  FaCalendarAlt, FaFileInvoiceDollar, FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// ── Admin menu ──────────────────────────────────────────────────
const adminMenu = [
  { label:'Dashboard',     path:'/admin/dashboard', icon:<FaTachometerAlt /> },
  { label:'Staff',         path:'/staff',           icon:<FaUsers /> },
  { label:'Attendance',    path:'/attendance',      icon:<FaClock /> },
  { label:'Payroll',       path:'/payroll',         icon:<FaMoneyBillWave /> },
  { label:'Patients',      path:'/patients',        icon:<FaUserInjured /> },
  { label:'Appointments',  path:'/appointments',    icon:<FaCalendarCheck /> },
  { label:'Queue',         path:'/queue',           icon:<FaListOl /> },
  { label:'Tickets',       path:'/tickets',         icon:<FaTicketAlt /> },
  { label:'Email Support', path:'/email',           icon:<FaEnvelope /> },
];

// ── Employee menu — filtered per role ──────────────────────────
const employeeMenu = [
  { label:'My Dashboard',   path:'/employee/dashboard',  icon:<FaHome />,             roles:['ROLE_DOCTOR','ROLE_NURSE','ROLE_RECEPTIONIST','ROLE_HR','ROLE_ACCOUNTANT','ROLE_PHARMACIST'] },
  { label:'My Attendance',  path:'/employee/attendance', icon:<FaMapMarkerAlt />,     roles:['ROLE_DOCTOR','ROLE_NURSE','ROLE_RECEPTIONIST','ROLE_HR','ROLE_ACCOUNTANT','ROLE_PHARMACIST'] },
  { label:'Work Schedule',  path:'/employee/schedule',   icon:<FaCalendarAlt />,      roles:['ROLE_DOCTOR','ROLE_NURSE','ROLE_RECEPTIONIST','ROLE_HR','ROLE_ACCOUNTANT','ROLE_PHARMACIST'] },
  { label:'My Payslips',    path:'/employee/payslips',   icon:<FaFileInvoiceDollar />,roles:['ROLE_DOCTOR','ROLE_NURSE','ROLE_RECEPTIONIST','ROLE_HR','ROLE_ACCOUNTANT','ROLE_PHARMACIST'] },
  { label:'Appointments',   path:'/appointments',        icon:<FaCalendarCheck />,    roles:['ROLE_DOCTOR','ROLE_NURSE','ROLE_RECEPTIONIST'] },
  { label:'Patients',       path:'/patients',            icon:<FaUserInjured />,      roles:['ROLE_DOCTOR','ROLE_NURSE','ROLE_RECEPTIONIST'] },
  { label:'Queue',          path:'/queue',               icon:<FaListOl />,           roles:['ROLE_DOCTOR','ROLE_NURSE','ROLE_RECEPTIONIST'] },
  { label:'Support Tickets',path:'/tickets',             icon:<FaTicketAlt />,        roles:['ROLE_DOCTOR','ROLE_NURSE','ROLE_RECEPTIONIST','ROLE_HR','ROLE_ACCOUNTANT','ROLE_PHARMACIST'] },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole('ROLE_ADMIN');

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const menuItems = isAdmin
    ? adminMenu
    : employeeMenu.filter(item => item.roles.some(r => hasRole(r)));

  const roleName = user?.roles?.[0]?.replace('ROLE_', '') || '';
  const roleColors = {
    ADMIN:'#475569', DOCTOR:'#10b981', NURSE:'#06b6d4',
    HR:'#f59e0b', ACCOUNTANT:'#ef4444', RECEPTIONIST:'#3b82f6', PHARMACIST:'#14b8a6',
  };
  const roleColor = roleColors[roleName] || '#475569';

  return (
    <aside className={`hms-sidebar ${collapsed ? 'hms-sidebar--collapsed' : ''} ${mobileOpen ? 'hms-sidebar--mobile-open' : ''}`}>

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
            if (window.innerWidth < 992) setMobileOpen(false);
            else setCollapsed(prev => !prev);
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
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:28, height:28, borderRadius:'50%', flexShrink:0,
                background:`${roleColor}33`, border:`1px solid ${roleColor}66`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.68rem', fontWeight:700, color:roleColor,
              }}>
                {user.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div>
                <div className="hms-sidebar__user-name">{user.fullName}</div>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:roleColor, display:'inline-block' }} />
                  <span style={{ fontSize:'0.68rem', color:roleColor }}>{roleName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role label above nav when collapsed */}
      {collapsed && (
        <div style={{ padding:'8px 0', borderBottom:'1px solid rgba(100,116,139,0.15)', display:'flex', justifyContent:'center' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:`${roleColor}33`, border:`1px solid ${roleColor}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700, color:roleColor }}>
            {user?.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="hms-sidebar__nav">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `hms-sidebar__link hover-bg ${isActive ? 'active' : ''}`}
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
