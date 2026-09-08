import React, { useState, useRef } from 'react';
import {
  Heart,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Music,
  Calendar,
  ArrowRight,
  Smile,
  ChevronDown
} from 'lucide-react';
import api from '../api/client';
import { sound } from '../utils/sound';
import './LandingPage.css';

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

  // Interactive teaser state
  const [teaserNoCount, setTeaserNoCount] = useState(0);
  const [teaserSaidYes, setTeaserSaidYes] = useState(false);
  const [teaserNoPos, setTeaserNoPos] = useState({ x: 0, y: 0 });

  const formRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const teaserTaunts = [
    'No',
    'Are you sure?',
    'Think again! 😉',
    'Wait, really?',
    'Nice try! 😂',
    'Cannot click me!',
    'Try the green one! ✨'
  ];

  const handleTeaserNoHover = () => {
    sound.playWhoosh();
    setTeaserNoCount((prev) => prev + 1);
    const randomX = (Math.random() - 0.5) * 160;
    const randomY = (Math.random() - 0.5) * 80;
    setTeaserNoPos({ x: randomX, y: randomY });
  };

  const handleTeaserYesClick = () => {
    sound.playCelebration();
    setTeaserSaidYes(true);
  };

  return (
    <div className="yalla-landing-root">
      {/* Navigation Bar */}
      <nav className="yalla-nav">
        <div className="yalla-nav-inner">
          <div className="yalla-brand-logo">
            <div className="yalla-brand-icon-box">
              <Heart size={18} fill="#e11d48" stroke="#e11d48" />
            </div>
            <div>
              <span className="yalla-brand-title">Yalla Yes</span>
              <span className="yalla-brand-subtitle">Romantic Invitations</span>
            </div>
          </div>

          <div className="yalla-nav-actions">
            <button
              onClick={() => scrollToSection(featuresRef)}
              className="yalla-nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              The Experience
            </button>
            <button
              onClick={() => scrollToSection(stepsRef)}
              className="yalla-nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection(formRef)}
              className="yalla-btn-nav-cta"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="yalla-hero-section">
        <div className="yalla-hero-badge">
          <Sparkles size={14} />
          <span>The New Art of Asking Someone Out</span>
        </div>

        <h1 className="yalla-hero-title">
          Turn "Will You Go Out With Me?" Into An Unforgettable{' '}
          <span className="highlight">"Yalla Yes!"</span>
        </h1>

        <p className="yalla-hero-subtitle">
          Give your special someone a playful, cinematic web proposal with runaway "No" physics,
          delightful audio chimes, interactive date planning, and an instant WhatsApp RSVP ticket.
        </p>

        <div className="yalla-hero-cta-group">
          <button
            onClick={() => scrollToSection(formRef)}
            className="yalla-btn-primary"
          >
            <span>Request Your Custom Link</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => scrollToSection(featuresRef)}
            className="yalla-btn-secondary"
          >
            <span>See How It Works</span>
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="yalla-trust-row">
          <div className="yalla-trust-item">
            <Zap size={16} color="#e11d48" />
            <span>100% "Yes" Guaranteed Physics</span>
          </div>
          <div className="yalla-trust-item">
            <Music size={16} color="#e11d48" />
            <span>Built-In Sound Synthesizer</span>
          </div>
          <div className="yalla-trust-item">
            <ShieldCheck size={16} color="#e11d48" />
            <span>Instant WhatsApp Boarding Pass</span>
          </div>
        </div>
      </section>

      {/* Interactive Teaser Mockup */}
      <section className="yalla-preview-wrapper">
        <div className="yalla-preview-card">
          <div className="yalla-preview-top-badge">
            <Sparkles size={12} color="#e11d48" />
            <span>Interactive Live Teaser — Try It!</span>
          </div>

          <h2 className="yalla-preview-question">
            "Will you go on a date with me this weekend?"
          </h2>

          <p className="yalla-preview-desc">
            {teaserSaidYes
              ? "🎉 She said YES! Confetti bursts, sweet music plays, and the date agenda unlocks!"
              : "Hover over 'No' to witness our evasion physics in action..."}
          </p>

          {teaserSaidYes ? (
            <div style={{ padding: '16px 0' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ecfdf5',
                  color: '#065f46',
                  padding: '10px 24px',
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                <CheckCircle2 size={18} color="#10b981" />
                <span>Ticket Generated & RSVP Sent to WhatsApp! ❤️</span>
              </div>
            </div>
          ) : (
            <div className="yalla-preview-buttons">
              <button
                onClick={handleTeaserYesClick}
                className="yalla-demo-btn-yes"
              >
                <span>YES! ❤️</span>
              </button>

              <button
                onMouseEnter={handleTeaserNoHover}
                onClick={handleTeaserNoHover}
                className="yalla-demo-btn-no"
                style={{
                  transform: `translate(${teaserNoPos.x}px, ${teaserNoPos.y}px)`,
                  transition: 'transform 0.16s ease-out'
                }}
              >
                <span>{teaserTaunts[teaserNoCount % teaserTaunts.length]}</span>
              </button>
            </div>
          )}

          <div className="yalla-preview-footnote">
            Tip: The "No" button is physically evasive — guaranteed to make them laugh!
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="yalla-features-section">
        <div className="yalla-features-container">
          <div className="yalla-section-header">
            <span className="yalla-section-tag">Why Yalla Yes Works</span>
            <h2 className="yalla-section-title">An Experience They Won't Stop Smiling About</h2>
            <p className="yalla-section-desc">
              Every detail is meticulously crafted to make asking someone out feel exciting, modern, and memorable.
            </p>
          </div>

          <div className="yalla-grid-4">
            <div className="yalla-feature-card">
              <div className="yalla-feature-icon" style={{ background: '#fef2f2', color: '#e11d48' }}>
                <Zap size={22} />
              </div>
              <h3>Evasive "No" Physics</h3>
              <p>
                The "No" button intelligently escapes cursor and touch taps with witty randomized taunts, making a "Yes" playful and inevitable.
              </p>
            </div>

            <div className="yalla-feature-card">
              <div className="yalla-feature-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Calendar size={22} />
              </div>
              <h3>Collaborative Itinerary</h3>
              <p>
                Once they say yes, they pick their favorite cuisine (Italian, sushi, burgers), activity vibe, and timing preferences.
              </p>
            </div>

            <div className="yalla-feature-card">
              <div className="yalla-feature-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
                <Music size={22} />
              </div>
              <h3>Tactile Sound Synthesizer</h3>
              <p>
                Zero static silence. Procedural sound effects, joyful pops, and triumphant victory fanfares accompany each click.
              </p>
            </div>

            <div className="yalla-feature-card">
              <div className="yalla-feature-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <ShieldCheck size={22} />
              </div>
              <h3>WhatsApp RSVP Pass</h3>
              <p>
                Generates a clean date ticket summary pre-formatted to send straight to your WhatsApp so you can finalize plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section ref={stepsRef} className="yalla-steps-section">
        <div className="yalla-section-header">
          <span className="yalla-section-tag">Simple 3-Step Journey</span>
          <h2 className="yalla-section-title">From Idea to Date Night</h2>
          <p className="yalla-section-desc">
            Fast, seamless, and completely bespoke for you and your special someone.
          </p>
        </div>

        <div className="yalla-steps-grid">
          <div className="yalla-step-card">
            <div className="yalla-step-num">01</div>
            <h4>Request Your Link</h4>
            <p>
              Fill out the form below with your name, their name, and any special preferences or custom date ideas.
            </p>
          </div>

          <div className="yalla-step-card">
            <div className="yalla-step-num">02</div>
            <h4>Get Your Custom Proposal</h4>
            <p>
              Our team activates your private invitation link with your recipient's name locked in and personalized.
            </p>
          </div>

          <div className="yalla-step-card">
            <div className="yalla-step-num">03</div>
            <h4>Share & Celebrate</h4>
            <p>
              Send them the link over WhatsApp or Instagram, watch their reaction, and receive their RSVP ticket!
            </p>
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section ref={formRef} className="yalla-form-section">
        <div className="yalla-form-wrapper">
          {submitted ? (
            <div className="yalla-success-box">
              <div className="yalla-success-icon-wrap">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="yalla-success-title">Request Received! ❤️</h2>
              <p className="yalla-success-desc">
                Thank you, <strong>{formData.name}</strong>! We have received your request for{' '}
                <strong>{formData.recipientName}</strong>. Our team will contact you via WhatsApp or Email within a few hours with your customized link.
              </p>
              <button
                className="yalla-btn-secondary"
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
              <div className="yalla-form-header">
                <h3 className="yalla-form-title">Create Your Invitation</h3>
                <p className="yalla-form-subtitle">
                  Fill in your details to get your personalized date invitation link.
                </p>
              </div>

              {error && (
                <div className="yalla-error-box">
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="yalla-form-row">
                  <div>
                    <label className="yalla-label">Your Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex"
                      className="yalla-input"
                    />
                  </div>

                  <div>
                    <label className="yalla-label">Recipient's Name *</label>
                    <input
                      type="text"
                      name="recipientName"
                      required
                      value={formData.recipientName}
                      onChange={handleChange}
                      placeholder="e.g. Sarah"
                      className="yalla-input"
                    />
                  </div>
                </div>

                <div className="yalla-form-group">
                  <label className="yalla-label">WhatsApp Phone Number (with Country Code) *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+961 71 273 152"
                    className="yalla-input"
                  />
                </div>

                <div className="yalla-form-group">
                  <label className="yalla-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    className="yalla-input"
                  />
                </div>

                <div className="yalla-form-group">
                  <label className="yalla-label">Special Requests / Date Vision (Optional)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Sunset beach walk followed by Italian pasta..."
                    className="yalla-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="yalla-submit-btn"
                >
                  {loading ? (
                    <span>Submitting Your Request...</span>
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
      </section>

      {/* Luxury Minimalist Footer */}
      <footer className="yalla-footer">
        <div className="yalla-footer-brand">
          <Heart size={16} fill="#e11d48" stroke="#e11d48" />
          <span>Yalla Yes</span>
        </div>
        <p className="yalla-footer-tagline">
          Bespoke digital romance experiences & interactive date proposals.
        </p>
        <p className="yalla-footer-copy">
          © {new Date().getFullYear()} Yalla Yes. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
