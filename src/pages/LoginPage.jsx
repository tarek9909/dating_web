import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackgroundParticles from '../components/BackgroundParticles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      if (userData.mustChangePassword) {
        navigate('/change-password');
      } else if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {

      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <BackgroundParticles />

      <div className="glass-card animate-fade-in" style={{ maxWidth: '420px', width: '100%', padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(255, 77, 109, 0.15)',
            border: '1px solid rgba(255, 77, 109, 0.3)',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#ff758f',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} />
            <span>Invitation Platform Portal</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.9rem', color: '#fff', marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#ffb3c1', fontSize: '0.9rem' }}>
            Sign in to customize, preview, and publish your invitations.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#ff758f" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(20, 4, 12, 0.65)',
                  border: '1px solid rgba(255, 77, 109, 0.25)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#ff758f" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(20, 4, 12, 0.65)',
                  border: '1px solid rgba(255, 77, 109, 0.25)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary pulse-glow"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#ffb3c1' }}>
          <span>Don't have an active account yet? </span>
          <Link to="/" style={{ color: '#ff4d6d', fontWeight: 600, textDecoration: 'none' }}>
            Submit a Request
          </Link>
        </div>
      </div>
    </div>
  );
}
