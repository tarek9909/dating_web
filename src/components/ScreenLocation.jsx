import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

const DEFAULT_LOCATIONS = [
  {
    id: 'Fancy',
    name: 'Fancy',
    subtitle: 'Fine dining & candlelight ✨',
    description: 'Boujee, elegant, and dress-to-impress energy.',
    gif: '/gifs/loc_skymate.gif',
    fallbackGif: 'https://media.tenor.com/tVvUqObiD_cAAAAM/bebendo-sendo-servido.gif',
    tag: 'Boujee'
  },
  {
    id: 'Rooftop',
    name: 'Rooftop',
    subtitle: 'Panoramic skyline view 🌃',
    description: 'City lights, cool night breeze, and immaculate vibes.',
    gif: '/gifs/loc_hawana.gif',
    fallbackGif: 'https://media.tenor.com/8vz9S65UdIgAAAAM/pusheen-pusheen-the-cat.gif',
    tag: 'Atmospheric'
  },
  {
    id: 'Beach',
    name: 'Beach',
    subtitle: 'Marina & seaside breeze 🌊',
    description: 'Gentle waves, relaxed romantic coastal atmosphere.',
    gif: '/gifs/loc_jia.gif',
    fallbackGif: 'https://media.tenor.com/rLdg8-y99E4AAAAM/cat-deckchair.gif',
    tag: 'Scenic'
  }
];

export default function ScreenLocation({
  locations,
  title,
  subtitle,
  badgeText = 'Decision Time',
  selected,
  onSelect,
  onNext
}) {
  const items = (locations && locations.length > 0)
    ? locations.map(l => ({
        id: l.name,
        name: l.name,
        subtitle: l.subtitle || (l.category && l.category !== l.description ? `${l.category} Vibe` : ''),
        description: l.description,
        gif: l.imageUrl || l.image_url || l.gif || '/gifs/loc_skymate.gif',
        fallbackGif: l.fallbackGif || 'https://media.tenor.com/tVvUqObiD_cAAAAM/bebendo-sendo-servido.gif',
        tag: l.tag || l.category || 'Atmospheric',
      }))
    : DEFAULT_LOCATIONS;

  const handleCardClick = (id) => {
    sound.playPop();
    onSelect(id);
  };

  return (
    <div className="screen-container animate-fade-in">
      <div className="screen-header">
        <div className="badge-pill">
          <Sparkles size={14} />
          <span>{badgeText}</span>
        </div>
        <h2 className="screen-title">
          {title || 'Okay… since you said YES 😌❤️'}
        </h2>
        <p className="screen-subtitle">
          {subtitle || 'Now we have some important decisions to make. Where are we heading?'}
        </p>
      </div>

      <div className="cards-grid">
        {items.map((loc) => {
          const isSelected = selected === loc.id;
          return (
            <div
              key={loc.id}
              className={`choice-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleCardClick(loc.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(loc.id)}
            >
              <div className="card-badge">{loc.tag}</div>

              <div className="card-media-wrapper">
                <img
                  src={loc.gif}
                  alt={loc.name}
                  className="card-gif"
                  onError={(e) => {
                    e.target.src = loc.fallbackGif;
                  }}
                />
                {isSelected && (
                  <div className="selected-indicator">
                    <Check size={18} />
                  </div>
                )}
              </div>

              <div className="card-info">
                <h3 className="card-name">{loc.name}</h3>
                {loc.subtitle && loc.subtitle !== loc.description && (
                  <p className="card-tagline">{loc.subtitle}</p>
                )}
                <p className="card-desc">{loc.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="screen-actions">
        <button
          className={`btn btn-primary ${selected ? 'pulse-glow' : 'btn-disabled'}`}
          disabled={!selected}
          onClick={() => {
            sound.playPop();
            onNext();
          }}
          id="confirm-location-btn"
        >
          This one ❤️
        </button>
      </div>
    </div>
  );
}
