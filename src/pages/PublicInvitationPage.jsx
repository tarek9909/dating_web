import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HeartCrack, Sparkles, RefreshCw } from 'lucide-react';
import InvitationRenderer from '../components/InvitationRenderer';
import api from '../api/client';

export default function PublicInvitationPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchInvitation() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.public.getInvitation(slug);
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Invitation not found or no longer active');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (slug) {
      fetchInvitation();
    }
    return () => { isMounted = false; };
  }, [slug]);

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
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', letterSpacing: '0.05em' }}>
            Preparing your invitation... ❤️
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
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', marginBottom: '12px', color: '#fff' }}>
            Invitation Unavailable
          </h2>
          <p style={{ color: '#ffb3c1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
            {error || 'This invitation does not exist, has been paused, or is still being drafted.'}
          </p>
          <Link
            to="/"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <Sparkles size={16} />
            <span>Create Your Own Invitation</span>
          </Link>
        </div>
      </div>
    );
  }

  return <InvitationRenderer data={data} isPreview={false} />;
}
