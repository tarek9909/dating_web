import React from 'react';
import { Check, Utensils } from 'lucide-react';
import { sound } from '../utils/sound';

const DEFAULT_FOODS = [
  {
    id: 'Lebanese',
    name: 'Lebanese 🇱🇧',
    quote: '“Because we have taste.”',
    description: 'Hummus, grilled skewers, and elite hospitality.',
    gif: '/gifs/food_lebanese.gif',
    fallbackGif: 'https://media.tenor.com/X1nlfLKP6toAAAAM/cat-eat.gif',
    tag: 'Elite Choice'
  },
  {
    id: 'Italian',
    name: 'Italian 🇮🇹',
    quote: '“A little pasta never hurt anyone. 🍝”',
    description: 'Creamy carbs, warm bread, and maximum comfort.',
    gif: '/gifs/food_italian.gif',
    fallbackGif: 'https://media.tenor.com/7eCINPbJcMIAAAAM/lasagna-theoreocat.gif',
    tag: 'Romantic Classic'
  },
  {
    id: 'Sandwiches',
    name: 'Sandwiches 🥪',
    quote: '“Keeping it simple 😌”',
    description: 'Chill, effortless, and undeniably delicious.',
    gif: '/gifs/food_sandwiches.gif',
    fallbackGif: 'https://media.tenor.com/uZoMIdlrWdYAAAAM/hamster-rolled.gif',
    tag: 'Cozy & Chill'
  }
];

export default function ScreenFood({
  foodOptions,
  title,
  subtitle,
  categoryType = 'food',
  badgeText,
  selected,
  onSelect,
  onNext
}) {
  const defaultBadge = categoryType === 'activity' ? 'The Adventure' : categoryType === 'drinks' ? 'The Vibe' : 'The Feast';
  const defaultTitle = categoryType === 'activity' ? 'What are we doing? 🎯' : categoryType === 'drinks' ? 'What are we sipping? 🍸' : 'And what are we eating?';
  const defaultSubtitle = categoryType === 'activity' ? 'Pick the fun we are having together:' : categoryType === 'drinks' ? 'Pick your preferred refreshment:' : 'Food speaks louder than words. Pick your craving:';

  const items = (foodOptions && foodOptions.length > 0)
    ? foodOptions.map(f => ({
        id: f.name,
        name: f.name,
        quote: f.quote || (f.emoji && f.emoji !== f.description ? `${f.emoji} Pick` : ''),
        description: f.description,
        gif: f.imageUrl || f.image_url || f.gif || '/gifs/food_lebanese.gif',
        fallbackGif: f.fallbackGif || 'https://media.tenor.com/X1nlfLKP6toAAAAM/cat-eat.gif',
        tag: f.tag || (categoryType === 'activity' ? 'Adventure' : 'Craving'),
      }))
    : DEFAULT_FOODS;

  const handleCardClick = (id) => {
    sound.playPop();
    onSelect(id);
  };

  return (
    <div className="screen-container animate-fade-in">
      <div className="screen-header">
        <div className="badge-pill">
          <Utensils size={14} />
          <span>{badgeText || defaultBadge}</span>
        </div>
        <h2 className="screen-title">
          {title || defaultTitle}
        </h2>
        <p className="screen-subtitle">
          {subtitle || defaultSubtitle}
        </p>
      </div>

      <div className="cards-grid">
        {items.map((food) => {
          const isSelected = selected === food.id;
          return (
            <div
              key={food.id}
              className={`choice-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleCardClick(food.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(food.id)}
            >
              <div className="card-badge">{food.tag}</div>

              <div className="card-media-wrapper">
                <img
                  src={food.gif}
                  alt={food.name}
                  className="card-gif"
                  onError={(e) => {
                    e.target.src = food.fallbackGif;
                  }}
                />
                {isSelected && (
                  <div className="selected-indicator">
                    <Check size={18} />
                  </div>
                )}
              </div>

              <div className="card-info">
                <h3 className="card-name">{food.name}</h3>
                {food.quote && food.quote !== food.description && (
                  <p className="card-quote">{food.quote}</p>
                )}
                <p className="card-desc">{food.description}</p>
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
          id="confirm-food-btn"
        >
          Sounds good 😋
        </button>
      </div>
    </div>
  );
}
