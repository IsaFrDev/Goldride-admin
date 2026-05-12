import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Map, 
  Settings, 
  LogOut, 
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Clock
} from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Simplest way to trigger App.tsx auth check
  };
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-box-admin">
          <Car size={24} color="#000" strokeWidth={2.5} />
        </div>
        <h1 className="logo-text">Gold<span className="logo-accent">ride</span></h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/new-drivers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Clock size={20} />
          <span>Yangi haydovchilar</span>
        </NavLink>

        <NavLink to="/drivers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Car size={20} />
          <span>Haydovchilar</span>
        </NavLink>

        <NavLink to="/passengers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>Yo'lovchilar</span>
        </NavLink>

        <NavLink to="/rides" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Map size={20} />
          <span>Safarlar</span>
        </NavLink>

        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <TrendingUp size={20} />
          <span>Analitika</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Settings size={20} />
          <span>Sozlamalar</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
