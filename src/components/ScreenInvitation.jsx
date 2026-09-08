import React, { useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import AngryModal from './AngryModal';

const DEFAULT_NO_PHRASES = [
  'Nice try 😏',
  'Nope 😂',
  'Too slow!',
  'You really thought? 💀',
  'Try again 😂',
  'Absolutely not.',
  'Wrong button 😌',
  'I don\'t think so ❤️',
  'Denied 🚫',
  'Be serious 😭',
  'Not in this lifetime 😉',
  'Error 404: No not found 💅'
];

export default function ScreenInvitation({
  content = {},
  recipientName,
  openingText,
  questionText,
  yesText,
  noText: initialNoText,
  noPhrases,
  openingGif,
  heroGif = '/gifs/invitation_pleading.gif',
  angryGif = '/gifs/angry_strike_3.gif',
  angryConfig,
  onAccept,
  onNoClick
}) {
  const phrases = (noPhrases && noPhrases.length > 0)
    ? noPhrases
    : (content.noPhrases && content.noPhrases.length > 0)
      ? content.noPhrases
      : DEFAULT_NO_PHRASES;

  const resolvedOpeningText = openingText || content.openingText || 'I have a very important question for you…';
  const resolvedQuestionText = questionText || content.questionText || (recipientName ? `Will you go on a date with me, ${recipientName}?` : 'Will you go on a date with me?');
  const resolvedYesText = yesText || content.yesButtonText || 'YES ❤️';
  const resolvedHeroGif = openingGif || heroGif || '/gifs/invitation_pleading.gif';
  const resolvedAngryGif = angryGif || '/gifs/angry_strike_3.gif';
  const resolvedAngry = angryConfig || content.angry;

  const [noCount, setNoCount] = useState(0);
  const [noText, setNoText] = useState(initialNoText || content.noButtonText || 'NO 🙄');
  const [noPos, setNoPos] = useState(null); // null = static initial position
  const [isAngryModalOpen, setIsAngryModalOpen] = useState(false);
  const [hasDodged, setHasDodged] = useState(false);
  const [yesScale, setYesScale] = useState(1);

  const noBtnRef = useRef(null);
  const yesBtnRef = useRef(null);

  // Calculate a safe position inside viewport that doesn't overlap the YES button
  const moveNoButton = useCallback(() => {
    sound.playDodge();
    setHasDodged(true);

    const pad = 20;
    const btnW = noBtnRef.current ? noBtnRef.current.offsetWidth : 140;
    const btnH = noBtnRef.current ? noBtnRef.current.offsetHeight : 54;

    const maxW = Math.max(pad, window.innerWidth - btnW - pad);
    const maxH = Math.max(pad, window.innerHeight - btnH - pad);

    // Get YES button bounding box to avoid overlapping it
    let yesRect = null;
    if (yesBtnRef.current) {
      yesRect = yesBtnRef.current.getBoundingClientRect();
    }

    let nextX = pad;
    let nextY = pad;
    let attempts = 0;
    let safe = false;

    while (!safe && attempts < 15) {
      attempts++;
      nextX = Math.floor(Math.random() * (maxW - pad) + pad);
      nextY = Math.floor(Math.random() * (maxH - pad) + pad);

      if (yesRect) {
        // Check collision with yes button + generous 40px buffer
        const overlapX = nextX + btnW > yesRect.left - 40 && nextX < yesRect.right + 40;
        const overlapY = nextY + btnH > yesRect.top - 40 && nextY < yesRect.bottom + 40;
        if (!overlapX || !overlapY) {
          safe = true;
        }
      } else {
        safe = true;
      }
    }

    setNoPos({ x: nextX, y: nextY });

    const nextCount = noCount + 1;
    setNoCount(nextCount);

    if (onNoClick) {
      onNoClick(nextCount);
    }

    // Pick next funny text
    const nextPhrase = phrases[(nextCount - 1) % phrases.length];
    setNoText(nextPhrase);

    // Increase YES button scale slightly to make it even more enticing
    setYesScale((prev) => Math.min(prev + 0.08, 1.45));

    // Trigger modal strictly at the 3rd attempt
    if (nextCount === 3) {
      setTimeout(() => {
        setIsAngryModalOpen(true);
      }, 250);
    }
  }, [noCount, phrases, onNoClick]);

  // Handle pointer / touch interactions
  const handleNoInteraction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveNoButton();
  };

  const handleYesClick = () => {
    sound.playCelebration();

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffd166', '#ffffff']
    });

    // Second wave confetti
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff4d6d', '#ff8fa3', '#fff0f3']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff4d6d', '#ff8fa3', '#fff0f3']
      });
    }, 200);

    setTimeout(() => {
      onAccept();
    }, 850);
  };

  return (
    <div className="screen-container animate-fade-in">
      <div className="invitation-card glass-card">
        <div className="badge-pill">
          <span>💌 Exclusive Invitation</span>
        </div>

        <div className="invitation-gif-container">
          <img
            src={resolvedHeroGif}
            alt="Pleading cute cat"
            className="cute-gif-hero"
            onError={(e) => {
              e.target.src = 'https://media.tenor.com/F7ypx136ZigAAAAM/cat-cute.gif';
            }}
          />
        </div>

        <p className="invitation-lead">
          {resolvedOpeningText}
        </p>

        <h1 className="invitation-headline">
          {resolvedQuestionText} <span className="heart-pulse">❤️</span>
        </h1>

        <p className="invitation-hint">
          Choose carefully. Your answer determines our future. 😌
        </p>

        <div className="button-group-invitation">
          <button
            ref={yesBtnRef}
            className="btn btn-yes pulse-glow"
            style={{ transform: `scale(${yesScale})` }}
            onClick={handleYesClick}
            id="yes-button"
          >
            {resolvedYesText}
          </button>

          <button
            ref={noBtnRef}
            className={`btn btn-no ${hasDodged ? 'is-dodging' : ''}`}
            style={
              noPos
                ? {
                    position: 'fixed',
                    left: `${noPos.x}px`,
                    top: `${noPos.y}px`,
                    zIndex: 999
                  }
                : {}
            }
            onMouseEnter={handleNoInteraction}
            onTouchStart={handleNoInteraction}
            onClick={handleNoInteraction}
            id="no-button"
            type="button"
          >
            {noText}
          </button>
        </div>

        {noCount > 0 && (
          <div className="dodge-counter-badge animate-fade-in">
            {noCount === 1 && 'Dodged: 1 time 😏'}
            {noCount === 2 && 'Dodged: 2 times 😂'}
            {noCount >= 3 && `Dodged: ${noCount} times! Give it up 😭`}
          </div>
        )}
      </div>

      <AngryModal
        isOpen={isAngryModalOpen}
        onClose={() => setIsAngryModalOpen(false)}
        angry={resolvedAngry}
        angryGif={resolvedAngryGif}
      />
    </div>
  );
}
