import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Send, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap, Music, Calendar } from 'lucide-react';
import BackgroundParticles from '../components/BackgroundParticles';
import api from '../api/client';
import { sound } from '../utils/sound';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    recipientName: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      sound.playPop();
      await api.public.submitRequest(formData);
      setSubmitted(true);
      sound.playCelebration();
    } catch (err) {
      setError(err.message || 'Failed to submit invitation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-viewport" style={{ overflowY: 'auto', minHeight: '100vh', padding: '0 0 60px 0' }}>
      <BackgroundParticles />

      {/* Navigation Bar */}
      <header className="app-top-bar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="brand-tag">
          <Sparkles size={14} className="sparkle-icon" />
          <span>DateCraft Invitations</span>
        </div>
        <div>
          <Link
            to="/login"
            className="btn btn-secondary-outline"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Customer / Admin Login</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div style={{ maxWidth: '840px', margin: '40px auto 20px', padding: '0 20px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          background: 'rgba(255, 77, 109, 0.15)',
          border: '1px solid rgba(255, 77, 109, 0.35)',
          borderRadius: '999px',
          color: '#ff758f',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          <Heart size={14} fill="#ff4d6d" stroke="#ff4d6d" />
          <span>The Most Romantic & Playful Way to Ask Someone Out</span>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          color: '#ffffff',
          marginBottom: '20px'
        }}>
          Turn Your Date Invitation Into An <span style={{ color: '#ff4d6d' }}>Unforgettable Story</span>
        </h1>

        <p style={{
          color: '#ffb3c1',
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          lineHeight: 1.6,
          maxWidth: '620px',
          margin: '0 auto 36px'
        }}>
          Give your special someone a cinematic, interactive web proposal featuring runaway "NO" physics, playful scolding, procedural audio, confetti, and an instant WhatsApp RSVP ticket pass.
        </p>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '50px'
        }}>
          <div className="glass-card" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <Zap size={22} color="#ffd166" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Evasive "NO" Button</h4>
            <p style={{ color: '#ffc2d1', fontSize: '12px' }}>Collision-avoidance physics & 12 cycling taunts</p>
          </div>
          <div className="glass-card" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <Music size={22} color="#ff758f" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Web Audio Synthesizer</h4>
            <p style={{ color: '#ffc2d1', fontSize: '12px' }}>Charming retro sound effects and fanfare</p>
          </div>
          <div className="glass-card" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <Calendar size={22} color="#4ade80" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Interactive Choices</h4>
            <p style={{ color: '#ffc2d1', fontSize: '12px' }}>Location, cuisine, timing, and dress code cards</p>
          </div>
          <div className="glass-card" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <ShieldCheck size={22} color="#38bdf8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>WhatsApp RSVP Pass</h4>
            <p style={{ color: '#ffc2d1', fontSize: '12px' }}>Official ticket summary sent straight to chat</p>
          </div>
        </div>

        {/* Request Form Section */}
        <div className="glass-card animate-fade-in" style={{
          maxWidth: '540px',
          margin: '0 auto',
          padding: '36px 28px',
          textAlign: 'left'
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: 'rgba(74, 222, 128, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={36} color="#4ade80" />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#fff', marginBottom: '12px' }}>
                Request Submitted! ❤️
              </h2>
              <p style={{ color: '#ffb3c1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Thank you, <strong>{formData.name}</strong>! We will review your request and contact you via WhatsApp or Email within a few hours to arrange your manual payment and activate your builder account.
              </p>
              <button
                className="btn btn-secondary-outline"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', recipientName: '', notes: '' });
                }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>
                  Request Your Custom Invitation
                </h3>
                <p style={{ color: '#ffb3c1', fontSize: '0.9rem' }}>
                  Submit the details below. Our team will verify and activate your invitation builder dashboard.
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(20, 4, 12, 0.65)',
                        border: '1px solid rgba(255, 77, 109, 0.25)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      required
                      value={formData.recipientName}
                      onChange={handleChange}
                      placeholder="Dana"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(20, 4, 12, 0.65)',
                        border: '1px solid rgba(255, 77, 109, 0.25)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(20, 4, 12, 0.65)',
                      border: '1px solid rgba(255, 77, 109, 0.25)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                    WhatsApp Phone Number (with Country Code) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+961 71 273 152"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(20, 4, 12, 0.65)',
                      border: '1px solid rgba(255, 77, 109, 0.25)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                    Special Requests / Preferred Date (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="E.g., Rooftop dinner date for Valentine's weekend..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(20, 4, 12, 0.65)',
                      border: '1px solid rgba(255, 77, 109, 0.25)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary pulse-glow"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Invitation Request</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
