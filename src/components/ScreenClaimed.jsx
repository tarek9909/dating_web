import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, MapPin, Utensils, Calendar, Clock, Shirt, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export default function ScreenClaimed({
  recipientName = 'My Love',
  claimedAt,
  claimedData = {},
  theme = {},
  gifUrl = '/gifs/final_date.gif'
}) {
  useEffect(() => {
    sound.playCelebration();
    // Gentle ambient celebratory sparkles
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.4 },
      colors: ['#ff4d6d', '#ffd166', '#ffffff']
    });
  }, []);

  const formattedClaimDate = claimedAt
    ? new Date(claimedAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  const location = claimedData?.location || 'Romantic Destination';
  const food = claimedData?.food || 'Dinner & Drinks';
  const dateStr = claimedData?.date || 'Agreed Date';
  const timeStr = claimedData?.time || 'Agreed Time';
  const dressCode = claimedData?.dressCode || 'Casual 😌 (just look cute)';

  return (
    <div className="screen-container animate-fade-in" style={{ maxWidth: '520px', margin: '0 auto', padding: '20px' }}>
      <div className="glass-card single-focus-card" style={{
        padding: '32px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 77, 109, 0.45)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 77, 109, 0.2)'
      }}>
        {/* Glow Header */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--badge-bg, rgba(255, 77, 109, 0.2))',
          border: '1px solid var(--accent-pink, #ff4d6d)',
          borderRadius: '999px',
          padding: '6px 16px',
          fontSize: '12px',
          fontWeight: 700,
          color: '#ffd166',
          marginBottom: '16px',
          boxShadow: 'var(--glow-pink, 0 0 15px rgba(255, 77, 109, 0.4))'
        }}>
          <Sparkles size={14} />
          <span>Official Date Agreement Sealed</span>
          <Heart size={14} fill="var(--accent-pink)" stroke="var(--accent-pink)" />
        </div>

        {/* Hero GIF */}
        <div style={{
          width: '140px',
          height: '140px',
          margin: '0 auto 18px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '2px solid var(--border-active, rgba(255, 77, 109, 0.4))',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <img
            src={gifUrl}
            alt="Date agreed celebrate"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://media.tenor.com/vYwVBjCjK5EAAAAM/arena-breakout-infinit.gif';
            }}
          />
        </div>

        {/* Big Headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem',
          color: '#fff',
          lineHeight: '1.2',
          marginBottom: '8px',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          {recipientName} Already Said YES! <span style={{ color: 'var(--accent-pink)' }}>❤️</span>
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: '#ffb3c1',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          This invitation was officially accepted and confirmed on <strong style={{ color: '#ffd166' }}>{formattedClaimDate}</strong>.
          The date is locked in and cannot be altered or repurposed. 😌✨
        </p>

        {/* Agreed Itinerary Card */}
        <div style={{
          background: 'rgba(20, 4, 12, 0.75)',
          border: '1px solid rgba(255, 77, 109, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '24px',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#ffd166',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={14} color="#ffd166" />
            <span>The Agreed Date Plan</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255, 77, 109, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <MapPin size={16} color="#ff758f" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#ffc2d1', opacity: 0.8 }}>Destination</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{location}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255, 77, 109, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Utensils size={16} color="#ff758f" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#ffc2d1', opacity: 0.8 }}>Dining / Activity</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{food}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255, 77, 109, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Calendar size={16} color="#ff758f" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#ffc2d1', opacity: 0.8 }}>Scheduled Time</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffd166' }}>{dateStr} at {timeStr}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255, 77, 109, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Shirt size={16} color="#ff758f" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#ffc2d1', opacity: 0.8 }}>Dress Code</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{dressCode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lock Footer Notice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#ffc2d1',
          opacity: 0.85,
          padding: '8px 12px',
          background: 'rgba(255, 77, 109, 0.08)',
          borderRadius: '10px',
          border: '1px dashed rgba(255, 77, 109, 0.25)'
        }}>
          <Lock size={14} color="#ff758f" />
          <span>Single-Use Event Pass • Preserved Forever as a Romantic Souvenir</span>
        </div>
      </div>
    </div>
  );
}
