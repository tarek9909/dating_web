import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Globe, Eye, Copy, Check, LogOut, Save, Share2,
  Calendar, Clock, Shirt, MessageSquare, AlertCircle, CheckCircle2,
  ExternalLink, BarChart3, Heart, MapPin, Utensils, Compass, Plus, Trash2, Image as ImageIcon, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import GifPickerModal from '../components/GifPickerModal';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('proposal'); // 'proposal' | 'venues' | 'options' | 'schedule' | 'dress'

  // Invitation state
  const [invitation, setInvitation] = useState(null);
  const [content, setContent] = useState({
    openingText: '',
    questionText: '',
    yesButtonText: 'YES ❤️',
    noButtonText: 'NO',
    angry: { title: '', message: '', button: '' },
    sectionTitles: { locations: '', food: '', when: '', dressCode: '' },
    subtitles: { locations: '', food: '', when: '', dressCode: '' },
    categoryType: 'food',
    final: { title: '', message: '' }
  });

  const [locations, setLocations] = useState([]);
  const [options, setOptions] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState({
    mode: 'strict',
    text: 'Tomorrow',
    time: '6:00 PM',
  });
  const [dressConfig, setDressConfig] = useState({
    value: 'Casual',
    quote: 'Nothing too serious. Just look cute.',
    checklist: ['Clean kicks & cozy vibes', 'Fragrance on point', 'Your best smile (mandatory)'],
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Media slots
  const [mediaSlots, setMediaSlots] = useState({
    openingGif: '/gifs/invitation_pleading.gif',
    angryGif: '/gifs/angry_strike_3.gif',
    whenGif: '/gifs/when_tomorrow.gif',
    dressGif: '/gifs/dress_casual.gif',
    finalGif: '/gifs/final_date.gif',
  });

  // GIF Picker Modal state
  const [gifPicker, setGifPicker] = useState({
    open: false,
    title: '',
    targetType: '', // 'mediaSlot' | 'location' | 'option'
    targetIndex: null,
    targetField: '',
    currentUrl: '',
  });

  const [stats, setStats] = useState({ views: 0, yesClicks: 0, noClicks: 0, rsvpShares: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.customer.getDashboard();
      const firstInv = res.data?.invitations?.[0];
      if (!firstInv) {
        setFeedback({ type: 'error', message: 'No invitation found for this customer account.' });
        return;
      }

      const pId = firstInv.public_id || firstInv.publicId;
      const fullRes = await api.customer.getInvitation(pId);
      const invData = fullRes.data;

      const invObj = {
        ...(invData.invitation || {}),
        publicId: pId,
        slug: invData.invitation?.slug || firstInv.slug,
        status: invData.invitation?.status || firstInv.status,
        recipientName: invData.invitation?.recipient_name || firstInv.recipient_name || firstInv.recipientName,
        scheduleMode: invData.invitation?.schedule_mode || 'strict',
        isClaimed: Boolean(invData.invitation?.is_claimed || firstInv.is_claimed),
        claimedAt: invData.invitation?.claimed_at || firstInv.claimed_at,
        claimedPayload: invData.invitation?.claimed_payload || firstInv.claimed_payload,
      };
      setInvitation(invObj);

      if (invData.content) {
        let checklistArr = ['Clean kicks & cozy vibes', 'Fragrance on point', 'Your best smile (mandatory)'];
        if (invData.content.dress_code_checklist) {
          try {
            checklistArr = typeof invData.content.dress_code_checklist === 'string'
              ? JSON.parse(invData.content.dress_code_checklist)
              : invData.content.dress_code_checklist;
          } catch {
            // keep default
          }
        }

        setContent({
          openingText: invData.content.opening_text || '',
          questionText: invData.content.question_text || '',
          yesButtonText: invData.content.yes_button_text || 'YES ❤️',
          noButtonText: invData.content.no_button_text || 'NO',
          categoryType: invData.content.category_type || 'food',
          angry: {
            title: invData.content.angry_title || 'EXCUSE ME?! 😤',
            message: invData.content.angry_message || 'You have pressed NO THREE TIMES. I am starting to take this personally. 😭💔',
            button: invData.content.angry_button || 'Okay okay… ❤️'
          },
          sectionTitles: {
            locations: invData.content.location_title || 'Okay… since you said YES 😌❤️',
            food: invData.content.food_title || 'And what are we eating?',
            when: invData.content.when_title || 'When? ⏰',
            dressCode: invData.content.dress_code_title || 'What should you wear? 👕',
          },
          subtitles: {
            locations: invData.content.location_subtitle || 'Now we have some important decisions to make. Where are we heading?',
            food: invData.content.food_subtitle || 'Food speaks louder than words. Pick your craving:',
            when: invData.content.when_subtitle || "(Spoiler: There is no date picker, don't even look for one)",
            dressCode: invData.content.dress_code_subtitle || 'The official dress code instructions.',
          },
          final: {
            title: invData.content.final_title || "IT'S A DATE. ❤️",
            message: invData.content.final_message || 'Congratulations. You have successfully agreed to go on a date with me. 😂❤️',
          }
        });

        setDressConfig({
          value: invData.invitation?.dress_code || 'Casual',
          quote: invData.invitation?.dress_code_text || 'Nothing too serious. Just look cute.',
          checklist: Array.isArray(checklistArr) ? checklistArr : ['Clean kicks & cozy vibes', 'Fragrance on point', 'Your best smile (mandatory)'],
        });
      }

      if (invData.invitation) {
        setScheduleConfig({
          mode: invData.invitation.schedule_mode || 'strict',
          text: invData.invitation.date_text || 'Tomorrow',
          time: invData.invitation.time_value ? String(invData.invitation.time_value).slice(0, 5) : '6:00 PM'
        });
      }

      if (Array.isArray(invData.locations)) {
        setLocations(invData.locations.map(l => ({
          id: l.id,
          name: l.name,
          tag: l.tag || l.category || 'Vibe',
          description: l.description,
          imageUrl: l.imageUrl || l.image_url || '/gifs/loc_skymate.gif'
        })));
      }

      if (Array.isArray(invData.foodOptions)) {
        setOptions(invData.foodOptions.map(f => ({
          id: f.id,
          name: f.name,
          description: f.description,
          emoji: f.emoji || '🍴',
          imageUrl: f.imageUrl || f.image_url || '/gifs/food_lebanese.gif'
        })));
      }

      // Fetch media
      if (invData.media) {
        setMediaSlots(prev => ({
          ...prev,
          openingGif: invData.media.openingGif || invData.media.hero?.url || prev.openingGif,
          angryGif: invData.media.angryGif || invData.media.angry?.url || prev.angryGif,
          whenGif: invData.media.whenGif || invData.media.when?.url || prev.whenGif,
          dressGif: invData.media.dressGif || invData.media.dress?.url || prev.dressGif,
          finalGif: invData.media.finalGif || invData.media.final?.url || prev.finalGif,
        }));
      }

      // Fetch analytics stats
      if (pId) {
        try {
          const statsRes = await api.customer.getAnalytics(pId);
          if (statsRes.data) {
            setStats({
              views: statsRes.data.views || 0,
              yesClicks: statsRes.data.yesClicks || 0,
              noClicks: statsRes.data.noClicks || 0,
              rsvpShares: statsRes.data.rsvps || statsRes.data.shares || 0
            });
          }
        } catch {
          // Analytics might be empty initially
        }
      }

    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load invitation' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGifPicker = (targetType, targetIndex, targetField, title, currentUrl) => {
    setGifPicker({
      open: true,
      title,
      targetType,
      targetIndex,
      targetField,
      currentUrl: currentUrl || '',
    });
  };

  const handleGifSelected = (url) => {
    if (gifPicker.targetType === 'mediaSlot') {
      setMediaSlots(prev => ({ ...prev, [gifPicker.targetField]: url }));
    } else if (gifPicker.targetType === 'location') {
      setLocations(prev => prev.map((loc, idx) => idx === gifPicker.targetIndex ? { ...loc, imageUrl: url } : loc));
    } else if (gifPicker.targetType === 'option') {
      setOptions(prev => prev.map((opt, idx) => idx === gifPicker.targetIndex ? { ...opt, imageUrl: url } : opt));
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setDressConfig(prev => ({
      ...prev,
      checklist: [...prev.checklist, newChecklistItem.trim()]
    }));
    setNewChecklistItem('');
  };

  const handleRemoveChecklistItem = (idx) => {
    setDressConfig(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async () => {
    if (!invitation?.publicId) return;
    if (invitation.isClaimed) {
      setFeedback({ type: 'error', message: 'This invitation has already been accepted and locked. No further edits are permitted.' });
      return;
    }
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      await Promise.all([
        // 1. Update general content
        api.customer.updateContent(invitation.publicId, {
          opening_text: content.openingText,
          question_text: content.questionText,
          yes_button_text: content.yesButtonText,
          no_button_text: content.noButtonText,
          angry_title: content.angry.title,
          angry_message: content.angry.message,
          angry_button: content.angry.button,
          category_type: content.categoryType,
          location_title: content.sectionTitles.locations,
          location_subtitle: content.subtitles.locations,
          food_title: content.sectionTitles.food,
          food_subtitle: content.subtitles.food,
          when_title: content.sectionTitles.when,
          when_subtitle: content.subtitles.when,
          dress_code_title: content.sectionTitles.dressCode,
          dress_code_subtitle: content.subtitles.dressCode,
          dress_code_checklist: dressConfig.checklist,
          opening_gif: mediaSlots.openingGif,
          angry_gif: mediaSlots.angryGif,
          when_gif: mediaSlots.whenGif,
          dress_gif: mediaSlots.dressGif,
          final_gif: mediaSlots.finalGif,
          final_title: content.final.title,
          final_message: content.final.message,
        }),

        // 2. Update invitation schedule & dress code
        api.customer.updateInvitation(invitation.publicId, {
          scheduleMode: scheduleConfig.mode,
          dateText: scheduleConfig.text,
          timeValue: scheduleConfig.time,
          dressCode: dressConfig.value,
          dressCodeText: dressConfig.quote,
          recipientName: invitation.recipientName,
        }),

        // 3. Update custom locations (Step 1)
        api.customer.updateCustomLocations(invitation.publicId, locations),

        // 4. Update custom options (Step 2)
        api.customer.updateCustomOptions(invitation.publicId, options),
      ]);

      setFeedback({ type: 'success', message: 'All invitation screens and settings saved successfully! ✨' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!invitation?.publicId) return;
    setPublishing(true);
    setFeedback({ type: '', message: '' });

    try {
      if (invitation.status === 'published') {
        await api.customer.unpublish(invitation.publicId);
        setInvitation(prev => ({ ...prev, status: 'draft' }));
        setFeedback({ type: 'success', message: 'Invitation unpublished. It is now back in Draft mode.' });
      } else {
        const res = await api.customer.publish(invitation.publicId);
        setInvitation(prev => ({ ...prev, status: 'published', slug: res.data?.slug || prev.slug }));
        setFeedback({ type: 'success', message: 'Your invitation is now live! 🥂 Share your link with your date!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update publication status' });
    } finally {
      setPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    if (!invitation?.slug) return;
    const url = `${window.location.origin}/d/${invitation.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="app-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <Sparkles className="sparkle-icon pulse-glow" size={32} />
          <p style={{ marginTop: '12px', color: '#ffb3c1' }}>Loading your romantic date builder...</p>
        </div>
      </div>
    );
  }

  const publicUrl = invitation?.slug ? `${window.location.origin}/d/${invitation.slug}` : '';

  return (
    <div className="app-viewport" style={{ overflowY: 'auto', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Top Header */}
      <header className="app-top-bar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="brand-tag">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Interactive Invitation Builder</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {invitation?.publicId && (
            <Link
              to={`/preview/${invitation.publicId}`}
              target="_blank"
              className="btn btn-secondary-outline"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Eye size={14} />
              <span>Preview Draft</span>
            </Link>
          )}
          <button
            onClick={() => logout().then(() => navigate('/login'))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffc2d1',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '920px', margin: '24px auto', padding: '0 20px' }}>
        {/* Feedback Alert */}
        {feedback.message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: feedback.type === 'success' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            borderRadius: '10px',
            color: feedback.type === 'success' ? '#86efac' : '#fca5a5',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Status & Publication Card */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          {invitation?.isClaimed && (
            <div style={{
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#fef08a'
            }}>
              <Lock size={22} color="#fde047" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#ffd166', marginBottom: '2px' }}>
                  Date Proposal Accepted & Locked! 💍❤️
                </strong>
                <span style={{ fontSize: '12px', opacity: 0.95, color: '#fef08a' }}>
                  {invitation?.recipientName} has accepted this date invitation. The date and venue choices are permanently sealed as a romantic keepsake. No further edits can be made.
                </span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                  {invitation?.recipientName}'s Date Proposal
                </h2>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(255, 77, 109, 0.2)',
                  border: '1px solid rgba(255, 77, 109, 0.4)',
                  color: '#ffc2d1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Lock size={10} />
                  <span>Locked to Order</span>
                </span>
                {invitation?.isClaimed ? (
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'rgba(234, 179, 8, 0.2)',
                    border: '1px solid #eab308',
                    color: '#fde047'
                  }}>
                    Claimed & Sealed 💍
                  </span>
                ) : (
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: invitation?.status === 'published' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                    border: `1px solid ${invitation?.status === 'published' ? '#4ade80' : '#eab308'}`,
                    color: invitation?.status === 'published' ? '#4ade80' : '#fde047'
                  }}>
                    {invitation?.status || 'Draft'}
                  </span>
                )}
              </div>
              <p style={{ color: '#ffb3c1', fontSize: '0.85rem', margin: 0 }}>
                {invitation?.isClaimed
                  ? 'Agreement confirmed! The public link is now a permanent romantic souvenir.'
                  : invitation?.status === 'published'
                    ? 'Your invitation is live! Anyone with the link can view it.'
                    : 'Your invitation is in Draft mode. Customize below, test in Preview, and publish when ready!'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePublishToggle}
                disabled={publishing || invitation?.isClaimed}
                className={invitation?.status === 'published' ? 'btn btn-secondary-outline' : 'btn btn-primary pulse-glow'}
                style={{ padding: '10px 18px', fontSize: '13px', cursor: invitation?.isClaimed ? 'not-allowed' : 'pointer', opacity: invitation?.isClaimed ? 0.7 : 1 }}
              >
                {invitation?.isClaimed ? 'Sealed 💍' : publishing ? 'Updating...' : invitation?.status === 'published' ? 'Unpublish' : 'Publish Live ❤️'}
              </button>
            </div>
          </div>

          {/* Public Link Box */}
          {invitation?.status === 'published' && (
            <div style={{
              marginTop: '18px',
              padding: '12px 16px',
              background: 'rgba(20, 4, 12, 0.65)',
              border: '1px solid rgba(255, 77, 109, 0.25)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
                <Globe size={16} color="#ff758f" />
                <span style={{ fontSize: '13px', color: '#fff', wordBreak: 'break-all' }}>{publicUrl}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={copyPublicUrl}
                  className="btn btn-secondary-outline"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary-outline"
                  style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={14} />
                  <span>Open</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#ffc2d1' }}>Total Views</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{stats.views}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#ffc2d1' }}>YES Clicks</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#4ade80', marginTop: '4px' }}>{stats.yesClicks}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#ffc2d1' }}>NO Dodges</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f87171', marginTop: '4px' }}>{stats.noClicks}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#ffc2d1' }}>WhatsApp RSVPs</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffd166', marginTop: '4px' }}>{stats.rsvpShares}</div>
          </div>
        </div>

        {/* Navigation Tabs for All 5 Builder Screens */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin'
        }}>
          <button
            onClick={() => setActiveTab('proposal')}
            className={activeTab === 'proposal' ? 'btn btn-primary' : 'btn btn-secondary-outline'}
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Heart size={14} />
            <span>1. Proposal Screen</span>
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={activeTab === 'venues' ? 'btn btn-primary' : 'btn btn-secondary-outline'}
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <MapPin size={14} />
            <span>2. Venues / Outings</span>
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={activeTab === 'options' ? 'btn btn-primary' : 'btn btn-secondary-outline'}
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Compass size={14} />
            <span>3. Activities & Dining</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={activeTab === 'schedule' ? 'btn btn-primary' : 'btn btn-secondary-outline'}
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Calendar size={14} />
            <span>4. Date & Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab('dress')}
            className={activeTab === 'dress' ? 'btn btn-primary' : 'btn btn-secondary-outline'}
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Shirt size={14} />
            <span>5. Dress Code</span>
          </button>
        </div>

        {/* Tab 1: Proposal Screen (Screen 1) */}
        {activeTab === 'proposal' && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#fff', marginBottom: '18px' }}>
              Screen 1: Proposal Copy & Interactive Teasing
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                  Opening Lead Text
                </label>
                <input
                  type="text"
                  value={content.openingText}
                  onChange={(e) => setContent(prev => ({ ...prev, openingText: e.target.value }))}
                  placeholder="I have a very important question for you…"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 4, 12, 0.65)', border: '1px solid rgba(255, 77, 109, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                  The Big Proposal Question
                </label>
                <input
                  type="text"
                  value={content.questionText}
                  onChange={(e) => setContent(prev => ({ ...prev, questionText: e.target.value }))}
                  placeholder="Will you go on a date with me? ❤️"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 4, 12, 0.65)', border: '1px solid rgba(255, 77, 109, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                    YES Button Text
                  </label>
                  <input
                    type="text"
                    value={content.yesButtonText}
                    onChange={(e) => setContent(prev => ({ ...prev, yesButtonText: e.target.value }))}
                    placeholder="YES ❤️"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 4, 12, 0.65)', border: '1px solid rgba(255, 77, 109, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ffc2d1', marginBottom: '6px' }}>
                    NO Button Text (Runaway)
                  </label>
                  <input
                    type="text"
                    value={content.noButtonText}
                    onChange={(e) => setContent(prev => ({ ...prev, noButtonText: e.target.value }))}
                    placeholder="NO"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 4, 12, 0.65)', border: '1px solid rgba(255, 77, 109, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <h4 style={{ color: '#ff758f', fontSize: '14px', marginBottom: '12px' }}>
              Strike 3 Angry Cat Modal (If they keep chasing NO)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#ffc2d1', marginBottom: '4px' }}>Angry Title</label>
                <input
                  type="text"
                  value={content.angry.title}
                  onChange={(e) => setContent(prev => ({ ...prev, angry: { ...prev.angry, title: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#ffc2d1', marginBottom: '4px' }}>Surrender Button</label>
                <input
                  type="text"
                  value={content.angry.button}
                  onChange={(e) => setContent(prev => ({ ...prev, angry: { ...prev.angry, button: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#ffc2d1', marginBottom: '4px' }}>Angry Message</label>
              <textarea
                rows={2}
                value={content.angry.message}
                onChange={(e) => setContent(prev => ({ ...prev, angry: { ...prev.angry, message: e.target.value } }))}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Venues / Outings (Screen 2) */}
        {activeTab === 'venues' && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
              Screen 2: Outings & Location Choices
            </h3>
            <p style={{ color: '#ffb3c1', fontSize: '0.85rem', marginBottom: '20px' }}>
              Customize the heading, subtitle, and the 3 venue cards presented to your partner.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Section Heading
                </label>
                <input
                  type="text"
                  value={content.sectionTitles.locations}
                  onChange={(e) => setContent(prev => ({ ...prev, sectionTitles: { ...prev.sectionTitles, locations: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={content.subtitles.locations}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitles: { ...prev.subtitles, locations: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {locations.map((loc, idx) => (
                <div key={loc.id || idx} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(20, 4, 12, 0.45)',
                  border: '1px solid rgba(255, 77, 109, 0.2)',
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={loc.imageUrl}
                      alt={loc.name}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,77,109,0.3)' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenGifPicker('location', idx, 'imageUrl', `Select GIF for ${loc.name}`, loc.imageUrl)}
                      style={{ marginTop: '6px', background: 'transparent', border: 'none', color: '#ff758f', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <ImageIcon size={12} /> Change GIF
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#ffc2d1', marginBottom: '2px' }}>Venue Name</label>
                      <input
                        type="text"
                        value={loc.name}
                        onChange={(e) => setLocations(prev => prev.map((l, i) => i === idx ? { ...l, name: e.target.value } : l))}
                        style={{ width: '100%', padding: '6px 10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#ffc2d1', marginBottom: '2px' }}>Category Tag</label>
                      <input
                        type="text"
                        value={loc.tag}
                        onChange={(e) => setLocations(prev => prev.map((l, i) => i === idx ? { ...l, tag: e.target.value } : l))}
                        style={{ width: '100%', padding: '6px 10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#ffc2d1', marginBottom: '2px' }}>Description</label>
                      <input
                        type="text"
                        value={loc.description}
                        onChange={(e) => setLocations(prev => prev.map((l, i) => i === idx ? { ...l, description: e.target.value } : l))}
                        style={{ width: '100%', padding: '6px 10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Activities & Dining (Screen 3) */}
        {activeTab === 'options' && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
              Screen 3: Activities, Cuisine & Experiences
            </h3>
            <p style={{ color: '#ffb3c1', fontSize: '0.85rem', marginBottom: '18px' }}>
              Choose whether this screen asks for a <strong>food craving</strong>, an <strong>adventure/activity</strong> (e.g. cinema, bowling, arcade), or <strong>custom drinks/nightlife</strong>!
            </p>

            {/* Category Mode Selector */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '8px' }}>
                Category Theme:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'food', label: '🍴 Food & Cuisine', title: 'And what are we eating?', sub: 'Food speaks louder than words. Pick your craving:' },
                  { id: 'activity', label: '🎯 Activities & Fun', title: 'What are we doing? 🎯', sub: 'Pick the activity you are most excited for:' },
                  { id: 'drinks', label: '🍸 Drinks & Nightlife', title: 'What are we sipping? 🍸', sub: 'Pick our evening refreshment:' },
                  { id: 'custom', label: '✨ Custom Experience', title: 'What should we pick next?', sub: 'Make your choice:' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setContent(prev => ({
                        ...prev,
                        categoryType: cat.id,
                        sectionTitles: { ...prev.sectionTitles, food: prev.sectionTitles.food || cat.title },
                        subtitles: { ...prev.subtitles, food: prev.subtitles.food || cat.sub },
                      }));
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: content.categoryType === cat.id ? '2px solid #ff4d6d' : '1px solid rgba(255, 77, 109, 0.25)',
                      background: content.categoryType === cat.id ? 'rgba(255, 77, 109, 0.25)' : 'rgba(20, 4, 12, 0.5)',
                      color: content.categoryType === cat.id ? '#fff' : '#ffb3c1',
                      cursor: 'pointer',
                      fontWeight: content.categoryType === cat.id ? 700 : 500
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Section Heading
                </label>
                <input
                  type="text"
                  value={content.sectionTitles.food}
                  onChange={(e) => setContent(prev => ({ ...prev, sectionTitles: { ...prev.sectionTitles, food: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={content.subtitles.food}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitles: { ...prev.subtitles, food: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {options.map((opt, idx) => (
                <div key={opt.id || idx} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(20, 4, 12, 0.45)',
                  border: '1px solid rgba(255, 77, 109, 0.2)',
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={opt.imageUrl}
                      alt={opt.name}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,77,109,0.3)' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenGifPicker('option', idx, 'imageUrl', `Select GIF for ${opt.name}`, opt.imageUrl)}
                      style={{ marginTop: '6px', background: 'transparent', border: 'none', color: '#ff758f', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <ImageIcon size={12} /> Change GIF
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#ffc2d1', marginBottom: '2px' }}>Option Name</label>
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, name: e.target.value } : o))}
                        style={{ width: '100%', padding: '6px 10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#ffc2d1', marginBottom: '2px' }}>Emoji</label>
                      <input
                        type="text"
                        value={opt.emoji}
                        onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, emoji: e.target.value } : o))}
                        style={{ width: '100%', padding: '6px 10px', textAlign: 'center', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#ffc2d1', marginBottom: '2px' }}>Description</label>
                      <input
                        type="text"
                        value={opt.description}
                        onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, description: e.target.value } : o))}
                        style={{ width: '100%', padding: '6px 10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Date & Schedule (Screen 4) */}
        {activeTab === 'schedule' && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
              Screen 4: Date & Scheduling Experience
            </h3>
            <p style={{ color: '#ffb3c1', fontSize: '0.85rem', marginBottom: '20px' }}>
              Choose whether to present a <strong>Playful Locked-In Date</strong> or a <strong>Flexible Interactive Date Picker</strong> for your partner.
            </p>

            {/* Schedule Mode Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '8px' }}>
                Scheduling Experience:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setScheduleConfig(prev => ({ ...prev, mode: 'strict' }))}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: scheduleConfig.mode === 'strict' ? '2px solid #ff4d6d' : '1px solid rgba(255,77,109,0.25)',
                    background: scheduleConfig.mode === 'strict' ? 'rgba(255,77,109,0.25)' : 'rgba(20,4,12,0.5)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span>🔒 Playful Strict Schedule</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#ffb3c1', lineHeight: '1.4' }}>
                    Firmly locked in. Hilarious fake disabled button says "Option Disabled by {invitation?.recipientName || 'You'} 💅".
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleConfig(prev => ({ ...prev, mode: 'picker' }))}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: scheduleConfig.mode === 'picker' ? '2px solid #ff4d6d' : '1px solid rgba(255,77,109,0.25)',
                    background: scheduleConfig.mode === 'picker' ? 'rgba(255,77,109,0.25)' : 'rgba(20,4,12,0.5)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span>📅 Interactive Date Picker</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#ffb3c1', lineHeight: '1.4' }}>
                    Partner can click and select their preferred day from calendar day pills and choose a time slot!
                  </div>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  {scheduleConfig.mode === 'strict' ? 'Date Text (e.g. Tomorrow / This Friday)' : 'Default Suggested Day'}
                </label>
                <input
                  type="text"
                  value={scheduleConfig.text}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, text: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 4, 12, 0.65)', border: '1px solid rgba(255, 77, 109, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Default Suggested Time
                </label>
                <input
                  type="text"
                  value={scheduleConfig.time}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 4, 12, 0.65)', border: '1px solid rgba(255, 77, 109, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Section Heading
                </label>
                <input
                  type="text"
                  value={content.sectionTitles.when}
                  onChange={(e) => setContent(prev => ({ ...prev, sectionTitles: { ...prev.sectionTitles, when: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={content.subtitles.when}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitles: { ...prev.subtitles, when: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Dress Code (Screen 5) */}
        {activeTab === 'dress' && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
              Screen 5: Dress Code & Vibe Check
            </h3>
            <p style={{ color: '#ffb3c1', fontSize: '0.85rem', marginBottom: '20px' }}>
              Define the dress instructions and dynamic checklist bullets for your date.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Dress Code Style
                </label>
                <input
                  type="text"
                  value={dressConfig.value}
                  onChange={(e) => setDressConfig(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Casual / Fancy / Cozy Hoodie"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 4, 12, 0.65)', border: '1px solid rgba(255, 77, 109, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Dress Code Quote
                </label>
                <input
                  type="text"
                  value={dressConfig.quote}
                  onChange={(e) => setDressConfig(prev => ({ ...prev, quote: e.target.value }))}
                  placeholder="Nothing too serious. Just look cute."
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 4, 12, 0.65)', border: '1px solid rgba(255, 77, 109, 0.25)', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Checklist Editor */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '8px' }}>
                Checklist Instructions:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {dressConfig.checklist.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDressConfig(prev => ({
                          ...prev,
                          checklist: prev.checklist.map((it, i) => i === idx ? val : it)
                        }));
                      }}
                      style={{ flex: 1, padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px' }}
                      title="Remove checklist item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add a new checklist rule (e.g. Bring your smile)..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="btn btn-secondary-outline"
                  style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            onClick={handleSave}
            disabled={saving || invitation?.isClaimed}
            className={invitation?.isClaimed ? 'btn btn-secondary-outline' : 'btn btn-primary pulse-glow'}
            style={{
              padding: '12px 28px',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: invitation?.isClaimed ? 'not-allowed' : 'pointer',
              opacity: invitation?.isClaimed ? 0.7 : 1
            }}
          >
            {invitation?.isClaimed ? (
              <>
                <Lock size={18} />
                <span>Date Plan Sealed & Locked 🔒</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{saving ? 'Saving All Settings...' : 'Save All Changes ✨'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GIF Library Picker Modal */}
      <GifPickerModal
        isOpen={gifPicker.open}
        title={gifPicker.title}
        currentGifUrl={gifPicker.currentUrl}
        onClose={() => setGifPicker(prev => ({ ...prev, open: false }))}
        onSelect={handleGifSelected}
      />
    </div>
  );
}
