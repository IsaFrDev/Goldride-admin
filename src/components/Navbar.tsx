import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Search, 
  User, 
  ChevronDown,
  AlertTriangle,
  X
} from 'lucide-react';
import { adminSocketService } from '../services/socket';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    adminSocketService.connect();
    const unsubscribe = adminSocketService.subscribe((data) => {
      if (data.type === 'admin_notification') {
        setNotifications(prev => [data, ...prev].slice(0, 10));
        // Simple audio alert could be added here
      }
    });

    return () => unsubscribe();
  }, []);

  const removeNotification = (idx: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <header className="navbar glass">
      <div className="search-bar">
        <Search size={18} color="#94A3B8" />
        <input type="text" placeholder="Qidirish... (id, ism, raqam)" />
      </div>

      <div className="nav-actions">
        <div className="notification-wrapper">
          <button 
            className={`action-btn ${notifications.length > 0 ? 'has-new' : ''}`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="badge">{notifications.length}</span>
            )}
          </button>

          {showDropdown && (
            <div className="notification-dropdown glass">
              <div className="dropdown-header">
                <span>Xabarnomalar</span>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])}>Hammasini o'chirish</button>
                )}
              </div>
              <div className="dropdown-content">
                {notifications.length === 0 ? (
                  <div className="empty-notif">Yangi xabarlar yo'q</div>
                ) : (
                  notifications.map((notif, i) => (
                    <div key={i} className={`notif-item ${notif.notification_type}`}>
                      <div className="notif-icon">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="notif-body">
                        <p>{notif.message}</p>
                        <span className="notif-time">Hozirgina</span>
                      </div>
                      <button className="notif-close" onClick={() => removeNotification(i)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="divider"></div>

        <div className="user-profile">
          <div className="avatar">
            <User size={20} color="#000" />
          </div>
          <div className="user-info">
            <span className="user-name">Goldride Admin</span>
            <span className="user-role">Super foydalanuvchi</span>
          </div>
          <ChevronDown size={16} color="#94A3B8" />
        </div>

        <a 
          href={import.meta.env.VITE_SITE_URL || "http://localhost:5500"} 
          target="_blank" 
          className="visit-site-btn glass"
          style={{ 
            marginLeft: '12px', 
            padding: '8px 12px', 
            fontSize: '12px', 
            color: '#FFB800', 
            textDecoration: 'none',
            borderRadius: '8px',
            border: '1px solid rgba(255,184,0,0.2)',
            fontWeight: '600'
          }}
        >
          Saytni ko'rish
        </a>
      </div>
    </header>
  );
};

export default Navbar;
