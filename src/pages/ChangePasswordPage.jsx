import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BackgroundParticles from '../components/BackgroundParticles';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.auth.changePassword({
        currentPassword,
        newPassword
      });

      if (updateUser) {
        updateUser({ mustChangePassword: false });
      }

      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <BackgroundParticles />

      <div className="glass-card animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(255, 77, 109, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <KeyRound size={26} color="#ff4d6d" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>
            Set New Password
          </h1>
          <p style={{ color: '#ffb3c1', fontSize: '0.9rem' }}>
            Please update your temporary password to secure your account.
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
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
              Temporary / Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#ff758f" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
              New Password (min 8 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#ff758f" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#ff758f" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              <span>Saving Password...</span>
            ) : (
              <>
                <span>Save New Password</span>
                <CheckCircle2 size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
