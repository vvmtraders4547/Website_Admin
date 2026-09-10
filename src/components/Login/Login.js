// admin/src/components/Login/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter username and password.'); return; }
    setLoading(true); setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <img 
            src="/logo.png" 
            alt="VVM Logo" 
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%',
              backgroundColor: '#fff',
              padding: '3px',
              objectFit: 'contain',
              border: '1.5px solid var(--gold)',
              margin: '0 auto 12px',
              display: 'block'
            }} 
          />
          <h1>Admin Panel</h1>
          <p>VVM Traders Management</p>
        </div>
        {error && <div className="login-alert">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="admin" value={username}
              onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <p className="login-hint">Hint: admin / admin123</p>
      </div>
    </div>
  );
}

export default Login;
