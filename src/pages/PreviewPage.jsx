import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, HeartCrack } from 'lucide-react';
import InvitationRenderer from '../components/InvitationRenderer';
import api from '../api/client';

export default function PreviewPage() {
  const { publicId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchPreview() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.customer.getPreview(publicId);
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load invitation preview');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (publicId) {
      fetchPreview();
    }
    return () => { isMounted = false; };
  }, [publicId]);

  if (loading) {
    return (
      <div className="app-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#ffb3c1' }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            border: '3px solid rgba(255, 77, 109, 0.2)',
            borderTopColor: '#ff4d6d',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem' }}>
            Loading Live Preview... ✨
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'rgba(255, 77, 109, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HeartCrack size={32} color="#ff4d6d" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '12px', color: '#fff' }}>
            Preview Error
          </h2>
          <p style={{ color: '#ffb3c1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
            {error || 'Unable to load preview. Ensure you are logged into your account.'}
          </p>
          <Link
            to="/dashboard"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(15, 2, 7, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 77, 109, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        borderRadius: '999px',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{ fontSize: '13px', color: '#ffd166', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} />
          Draft Preview Mode
        </span>
        <Link
          to="/dashboard"
          style={{
            background: 'linear-gradient(135deg, #ff4d6d, #ff758f)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft size={14} />
          Back to Editor
        </Link>
      </div>
      <InvitationRenderer data={data} isPreview={true} />
    </>
  );
}
