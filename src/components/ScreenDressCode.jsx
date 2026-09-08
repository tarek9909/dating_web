import React from 'react';
import { Shirt, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';

const DEFAULT_CHECKLIST = [
  'Clean kicks & cozy vibes',
  'Fragrance on point',
  'Your best smile (mandatory)'
];

export default function ScreenDressCode({
  dressCode = 'CASUAL',
  quote = 'Nothing too serious. Just look cute.',
  checklist = DEFAULT_CHECKLIST,
  gifUrl = '/gifs/dress_casual.gif',
  title = 'What should you wear? 👕',
  subtitle = 'The official dress code instructions.',
  onNext
}) {
  const items = (checklist && checklist.length > 0) ? checklist : DEFAULT_CHECKLIST;

  return (
    <div className="screen-container animate-fade-in">
      <div className="screen-header">
        <div className="badge-pill">
          <Shirt size={14} />
          <span>Vibe Check</span>
        </div>
        <h2 className="screen-title">
          {title}
        </h2>
        <p className="screen-subtitle">
          {subtitle}
        </p>
      </div>

      <div className="glass-card single-focus-card">
        <div className="card-media-wrapper date-media">
          <img
            src={gifUrl}
            alt="Cool cat in casual hoodie"
            className="card-gif"
            onError={(e) => {
              e.target.src = 'https://media.tenor.com/jp4SpsychxIAAAAM/cool-cat-cat.gif';
            }}
          />
        </div>

        <div className="dress-announcement">
          <div className="dress-title-row">
            <span className="big-dress">{dressCode.toUpperCase()}</span>
            <span className="dress-emoji">😌✨</span>
          </div>

          <p className="dress-quote">
            “{quote}”
          </p>
        </div>

        <div className="dress-checklist">
          {items.map((item, idx) => (
            <div key={idx} className="check-item">
              <CheckCircle2 size={16} className="check-icon" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="screen-actions">
        <button
          className="btn btn-primary pulse-glow"
          onClick={() => {
            sound.playCelebration();
            onNext();
          }}
          id="confirm-dress-btn"
        >
          Lock it in 🔐❤️
        </button>
      </div>
    </div>
  );
}
