import React, { useState } from 'react';
import { Mail, Lock, Car, ArrowRight, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../services/api';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState(localStorage.getItem('remembered_phone') || '+998');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('remembered_phone'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await adminAPI.login({ phone, password });
      const { access } = response.data;
      
      localStorage.setItem('token', access);
      
      if (rememberMe) {
        localStorage.setItem('remembered_phone', phone);
      } else {
        localStorage.removeItem('remembered_phone');
      }

      onLogin();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kirishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <Car size={32} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <h2>Xush Kelibsiz!</h2>
          <p>Taksi Admin boshqaruv paneliga kiring</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error-msg">{error}</div>}

          <div className="form-group">
            <label>Telefon raqami</label>
            <div className="input-box">
              <Mail size={20} color="#94A3B8" />
              <input 
                type="text" 
                placeholder="+998901234567" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Parol</label>
            <div className="input-box">
              <Lock size={20} color="#94A3B8" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-footer">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Eslab qolish</span>
            </label>
            <a href="#" className="forgot-pass">Parolni unutdingizmi?</a>
          </div>

          <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? 'Kirilmoqda...' : 'Kirish'}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="login-footer">
          <ShieldCheck size={16} color="#10B981" />
          <span>Xavfsiz tizim ulanishi</span>
        </div>
      </div>
      
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
    </div>
  );
};

export default Login;
