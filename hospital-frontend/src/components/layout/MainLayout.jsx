import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const MainLayout = () => {
  // collapsed = icon-only mode on desktop
  // mobileOpen = drawer is open on mobile/tablet
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="bg-orb-mid" />

      {/* Mobile backdrop — closes sidebar when tapped outside */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
          }}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Content area — margin adjusts per breakpoint via CSS class */}
      <div className={`main-content ${collapsed ? 'main-content-collapsed' : ''}`}>
        <TopNavbar onHamburgerClick={() => setMobileOpen(prev => !prev)} />
        <main className="p-3 p-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
