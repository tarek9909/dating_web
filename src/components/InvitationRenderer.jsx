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

  // Inject Theme CSS variables dynamically if defined
  useEffect(() => {
    if (theme?.tokens) {
      const root = document.documentElement;
      if (theme.tokens.accentColor) root.style.setProperty('--accent-pink', theme.tokens.accentColor);
      if (theme.tokens.primaryColor) root.style.setProperty('--bg-dark', theme.tokens.primaryColor);
      if (theme.tokens.goldColor) root.style.setProperty('--gold-accent', theme.tokens.goldColor);
      if (theme.tokens.fontFamily) root.style.setProperty('--font-main', theme.tokens.fontFamily);
    }
  }, [theme]);

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
