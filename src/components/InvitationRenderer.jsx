import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import BackgroundParticles from './BackgroundParticles';
import ProgressBar from './ProgressBar';
import ScreenInvitation from './ScreenInvitation';
import ScreenLocation from './ScreenLocation';
import ScreenFood from './ScreenFood';
import ScreenWhen from './ScreenWhen';
import ScreenDressCode from './ScreenDressCode';
import ScreenFinal from './ScreenFinal';
import ScreenClaimed from './ScreenClaimed';
import { sound } from '../utils/sound';
import api from '../api/client';

export default function InvitationRenderer({ data = {}, isPreview = false }) {
  const invitation = data?.invitation || {};
  const content = data?.content || {};
  const theme = data?.theme || {};
  const locations = data?.locations;
  const foodOptions = data?.foodOptions;
  const media = data?.media || {};

  const [screen, setScreen] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selections, setSelections] = useState({
    location: '',
    food: '',
    time: invitation.date?.time || '6:00 PM',
    date: invitation.date?.text || 'Tomorrow',
    dressCode: invitation.dressCode?.value || 'Casual'
  });

  // Helper to convert hex to RGB channels for rgba() usage
  const hexToRgb = (hex) => {
    if (!hex) return null;
    let c = String(hex).replace('#', '').trim();
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    if (c.length !== 6) return null;
    const num = parseInt(c, 16);
    if (isNaN(num)) return null;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return { r, g, b, str: `${r}, ${g}, ${b}` };
  };

  // Inject Theme CSS variables dynamically if defined across the entire public link
  useEffect(() => {
    if (theme || content?.themeAccentColor || content?.theme_accent_color) {
      const root = document.documentElement;

      let config = theme?.configuration || theme?.tokens || {};
      if (typeof config === 'string') {
        try { config = JSON.parse(config); } catch { config = {}; }
      }

      const primary = content?.themeAccentColor || content?.theme_accent_color || theme?.primaryColor || theme?.primary_color || '#ff4d6d';
      const secondary = theme?.secondaryColor || theme?.secondary_color || '#ff758f';
      const bgDark = theme?.backgroundColor || theme?.background_color || '#0f0207';
      const textMain = theme?.textColor || theme?.text_color || '#ffffff';
      const font = theme?.fontFamily || theme?.font_family || 'Outfit';

      const primaryRgb = hexToRgb(primary);
      const secondaryRgb = hexToRgb(secondary);
      const primaryStr = primaryRgb ? primaryRgb.str : (config.primaryRgb || '255, 77, 109');
      const secondaryStr = secondaryRgb ? secondaryRgb.str : (config.secondaryRgb || '255, 117, 143');

      // Core Color Variables
      root.style.setProperty('--accent-pink', primary);
      root.style.setProperty('--accent-pink-light', secondary);
      root.style.setProperty('--accent-blush', `rgba(${primaryStr}, 0.85)`);
      root.style.setProperty('--primary-rgb', primaryStr);
      root.style.setProperty('--secondary-rgb', secondaryStr);

      // Deep Atmospheric Background Variables
      root.style.setProperty('--bg-dark', bgDark);
      root.style.setProperty('--bg-wine', config.wine || '#220412');
      root.style.setProperty('--bg-burgundy', config.burgundy || '#3a0820');
      root.style.setProperty('--bg-card', config.cardBg || `rgba(${config.wine ? '20, 10, 30' : '35, 8, 22'}, 0.75)`);
      root.style.setProperty('--bg-card-hover', config.cardHoverBg || `rgba(${config.wine ? '30, 15, 45' : '55, 12, 35'}, 0.85)`);

      // Card & Selection Styling
      const cardSelectedBg = config.cardSelectedBg || `linear-gradient(160deg, rgba(${primaryStr}, 0.35), rgba(15, 2, 7, 0.95))`;
      root.style.setProperty('--card-selected-bg', cardSelectedBg);
      root.style.setProperty('--border-subtle', config.borderSubtle || `rgba(${secondaryStr}, 0.22)`);
      root.style.setProperty('--border-active', config.borderActive || `rgba(${primaryStr}, 0.75)`);
      root.style.setProperty('--glow-pink', config.glowPink || `0 0 25px rgba(${primaryStr}, 0.5)`);
      root.style.setProperty('--glow-primary', config.glowPink || `0 0 25px rgba(${primaryStr}, 0.5)`);

      // Badges & Buttons
      root.style.setProperty('--badge-bg', `rgba(${primaryStr}, 0.16)`);
      root.style.setProperty('--badge-border', `rgba(${primaryStr}, 0.4)`);
      root.style.setProperty('--btn-primary-bg', `linear-gradient(135deg, ${primary}, ${secondary})`);
      root.style.setProperty('--btn-primary-hover-bg', `linear-gradient(135deg, ${secondary}, ${primary})`);
      root.style.setProperty('--btn-yes-bg', `linear-gradient(135deg, ${primary}, ${secondary})`);
      root.style.setProperty('--btn-yes-hover-bg', `linear-gradient(135deg, ${secondary}, ${primary})`);

      // Typography
      root.style.setProperty('--text-main', textMain);
      root.style.setProperty('--font-sans', font);
    }

    return () => {
      // Reset variables on leave to prevent bleeding into dashboard
      const root = document.documentElement;
      const properties = [
        '--accent-pink', '--accent-pink-light', '--accent-blush', '--primary-rgb', '--secondary-rgb',
        '--bg-dark', '--bg-wine', '--bg-burgundy', '--bg-card', '--bg-card-hover',
        '--card-selected-bg', '--border-subtle', '--border-active', '--glow-pink', '--glow-primary',
        '--badge-bg', '--badge-border', '--btn-primary-bg', '--btn-primary-hover-bg',
        '--btn-yes-bg', '--btn-yes-hover-bg', '--text-main', '--font-sans'
      ];
      properties.forEach(p => root.style.removeProperty(p));
    };
  }, [theme, content]);

  // Record initial view event for public invitations
  useEffect(() => {
    if (!isPreview && invitation.slug) {
      api.public.recordEvent(invitation.slug, {
        eventType: 'view',
        eventData: { referrer: document.referrer || null }
      }).catch(() => {});
    }
  }, [invitation.slug, isPreview]);

  const sendEvent = (eventType, eventData = {}) => {
    if (!isPreview && invitation.slug) {
      api.public.recordEvent(invitation.slug, {
        eventType,
        eventData
      }).catch(() => {});
    }
  };


  const toggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  const handleRestart = () => {
    sendEvent('button_click', 'final', { action: 'restart' });
    setSelections({
      location: '',
      food: '',
      time: invitation.date?.time || '6:00 PM',
      date: invitation.date?.text || 'Tomorrow',
      dressCode: invitation.dressCode?.value || 'Casual'
    });
    setScreen(1);
  };

  const recipientName = invitation.recipientName || 'Dana';

  return (
    <div className="app-viewport">
      <BackgroundParticles />

      {/* Top Floating Control Bar */}
      <header className="app-top-bar">
        <div className="brand-tag">
          <Sparkles size={14} className="sparkle-icon" />
          <span>{invitation.title || `${recipientName}'s Date Invite`}</span>
          {isPreview && (
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(255, 77, 109, 0.2)',
              border: '1px solid var(--accent-pink)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#ff758f'
            }}>
              PREVIEW MODE
            </span>
          )}
        </div>

        <button
          className="sound-toggle-btn"
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          title={soundEnabled ? 'Sound FX On' : 'Sound FX Muted'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        {invitation.isClaimed && !isPreview ? (
          <ScreenClaimed
            recipientName={recipientName}
            claimedAt={invitation.claimedAt}
            claimedData={invitation.claimedPayload}
            gifUrl={media.finalGif || media.final?.url || '/gifs/final_date.gif'}
            theme={theme}
          />
        ) : (
          <>
            {screen > 1 && screen < 6 && (
          <ProgressBar
            currentStep={screen - 1}
            totalSteps={4}
            onBack={() => setScreen((prev) => Math.max(1, prev - 1))}
          />
        )}

        {screen === 1 && (
          <ScreenInvitation
            recipientName={recipientName}
            openingText={content.openingText}
            questionText={content.questionText}
            yesText={content.yesButtonText}
            noText={content.noButtonText}
            noPhrases={content.noPhrases}
            openingGif={media.openingGif || media.hero?.url}
            angryGif={media.angryGif || media.angry?.url}
            angryConfig={content.angry}
            onAccept={() => {
              sendEvent('yes_click');
              setScreen(2);
            }}
          />
        )}

        {screen === 2 && (
          <ScreenLocation
            selected={selections.location}
            locations={locations}
            title={content.sectionTitles?.locations}
            subtitle={content.subtitles?.locations}
            onSelect={(loc) => {
              sendEvent('location_select', { location: loc });
              setSelections((prev) => ({ ...prev, location: loc }));
            }}
            onNext={() => setScreen(3)}
          />
        )}

        {screen === 3 && (
          <ScreenFood
            selected={selections.food}
            foodOptions={foodOptions}
            title={content.sectionTitles?.food}
            subtitle={content.subtitles?.food}
            categoryType={content.categoryType || 'food'}
            onSelect={(food) => {
              sendEvent('food_select', { food });
              setSelections((prev) => ({ ...prev, food }));
            }}
            onNext={() => setScreen(4)}
          />
        )}

        {screen === 4 && (
          <ScreenWhen
            scheduleMode={invitation.scheduleMode || 'strict'}
            dateText={selections.date || invitation.date?.text || 'Tomorrow'}
            timeText={selections.time || invitation.date?.time || '6:00 PM'}
            startTime={content.picker_start_time || content.pickerStartTime || '6:00 PM'}
            endTime={content.picker_end_time || content.pickerEndTime || '11:00 PM'}
            gifUrl={media.whenGif || '/gifs/when_tomorrow.gif'}
            title={content.sectionTitles?.when}
            subtitle={content.subtitles?.when}
            recipientName={recipientName}
            onSelectDate={(newDate, newTime) => {
              setSelections((prev) => ({ ...prev, date: newDate, time: newTime }));
              sendEvent('date_select', { date: newDate, time: newTime });
            }}
            onNext={() => setScreen(5)}
          />
        )}

        {screen === 5 && (
          <ScreenDressCode
            dressCode={invitation.dressCode?.value || 'Casual'}
            quote={invitation.dressCode?.description || 'Nothing too serious. Just look cute.'}
            checklist={content.dressCodeChecklist}
            gifUrl={media.dressGif || '/gifs/dress_casual.gif'}
            title={content.sectionTitles?.dressCode}
            subtitle={content.subtitles?.dressCode}
            onNext={() => setScreen(6)}
          />
        )}

        {screen === 6 && (
          <ScreenFinal
            selections={selections}
            onRestart={handleRestart}
            config={{
              recipientName,
              whatsappPhone: invitation.customerPhone,
              ticketCode: invitation.ticketCode || `#${recipientName.toUpperCase().slice(0, 4)}-001`,
              title: content.final?.title,
              message: content.final?.message,
              subtext: content.final?.subtext,
              dateText: selections.date || invitation.date?.text,
              timeText: selections.time || invitation.date?.time,
              dressCodeText: invitation.dressCode?.value || selections.dressCode,
              gifUrl: media.finalGif || '/gifs/final_date.gif'
            }}
            onCompleteRsvp={() => {
              sendEvent('rsvp_complete', {
                location: selections.location,
                food: selections.food,
                date: selections.date,
                time: selections.time,
                dressCode: selections.dressCode
              });
            }}
          />
        )}
          </>
        )}
      </main>
    </div>
  );
}
