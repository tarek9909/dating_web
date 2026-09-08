import React, { useEffect } from 'react';
import { sound } from '../utils/sound';

export default function AngryModal({
  isOpen,
  onClose,
  angry = {},
  angryGif = '/gifs/angry_strike_3.gif'
}) {
  useEffect(() => {
    if (isOpen) {
      sound.playAngry();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content angry-modal animate-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="angry-title"
      >
        <div className="angry-emoji-banner">
          <span>😤</span>
          <span>😭</span>
          <span>💀</span>
          <span>🙄</span>
          <span>😒</span>
        </div>

        <div className="angry-gif-wrapper">
          <img
            src={angryGif}
            alt="Angry dramatic reaction"
            className="angry-gif"
            onError={(e) => {
              // Fallback if local file fails
              e.target.src = 'https://media.tenor.com/yNMKhuE2zYgAAAAM/angry-cat-angry-cat-zoom.gif';
            }}
          />
        </div>

        <h2 id="angry-title" className="angry-title">
          {angry.title || 'EXCUSE ME?! 😤'}
        </h2>

        <div className="angry-body">
          {angry.message ? (
            <p className="angry-highlight">{angry.message}</p>
          ) : (
            <>
              <p className="angry-highlight">You have pressed NO <strong>THREE TIMES</strong>.</p>
              <p>I am starting to take this personally. 😭💔</p>
              <p className="angry-subtext">This was <em>not</em> the correct answer. 😒</p>
            </>
          )}
        </div>

        <button
          className="btn btn-primary modal-close-btn pulse-glow"
          onClick={() => {
            sound.playPop();
            onClose();
          }}
        >
          {angry.button || 'Okay okay… ❤️'}
        </button>

        <div className="angry-footer-emojis">
          🥲 💀 ❤️ 😤
        </div>
      </div>
    </div>
  );
}
