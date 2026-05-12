import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import NewDrivers from './pages/NewDrivers';
import Passengers from './pages/Passengers';
import Rides from './pages/Rides';
import SettingsPage from './pages/Settings';
import Analytics from './pages/Analytics';
import { adminAPI } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const bypassLogin = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await adminAPI.login({ phone: 'admin', password: 'admin123' });
      localStorage.setItem('token', resp.data.access);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Bypass login failed:', err);
      setError('Tizimga kirishda xatolik yuz berdi. Backend ishlayotganiga ishonch hosil qiling.');
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        await bypassLogin();
        return;
      }

      try {
        // Simple verification - try to get dashboard stats
        await adminAPI.getStats();
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (err) {
        console.warn('Existing token invalid, retrying bypass:', err);
        await bypassLogin();
      }
    };

    initAuth();
  }, [bypassLogin]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column', 
        background: '#000000',
        gap: 20 
      }}>
        <div style={{ 
          padding: '16px 32px', 
          borderRadius: '16px', 
          backgroundColor: '#0A0A0A', 
          border: '1px solid #1E1E1E',
          color: '#FFB800', 
          fontWeight: '800',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{ 
            width: 24, 
            height: 24, 
            border: '3px solid #1A1A1A', 
            borderTopColor: '#FFB800', 
            borderRadius: '50%',
            animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite'
          }} />
          <span style={{ letterSpacing: '0.5px' }}>Goldride Admin yuklanmoqda...</span>
        </div>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ color: '#E53935', fontWeight: 'bold' }}>{error}</div>
        <button 
          onClick={bypassLogin}
          style={{ padding: '10px 20px', backgroundColor: '#6C5CE7', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Router>
      <div className="admin-layout">
        <Sidebar />
        <main className="main-content">
          <Navbar />
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-drivers" element={<NewDrivers />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/passengers" element={<Passengers />} />
              <Route path="/rides" element={<Rides />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
