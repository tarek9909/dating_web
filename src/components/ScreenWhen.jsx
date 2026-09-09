import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Lock, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 18 * 60; // 6:00 PM
  const s = String(timeStr).trim().toLowerCase();
  const match = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return 18 * 60;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3];

  if (period === 'pm' && hours < 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes) {
  const mins = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  let displayHour = hours % 12;
  if (displayHour === 0) displayHour = 12;
  const displayMins = m === 0 ? '00' : m < 10 ? `0${m}` : m;
  return `${displayHour}:${displayMins} ${period}`;
}

export function generateHoursRange(startTimeStr, endTimeStr, intervalMinutes = 30) {
  const startMins = parseTimeToMinutes(startTimeStr || '6:00 PM');
  let endMins = parseTimeToMinutes(endTimeStr || '11:00 PM');

  // Handle cross-midnight (e.g. 9:00 PM to 2:00 AM)
  if (endMins <= startMins) {
    endMins += 1440;
  }

  const slots = [];
  for (let m = startMins; m <= endMins; m += intervalMinutes) {
    slots.push(formatMinutesToTime(m));
  }
  return slots.length > 0 ? slots : ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];
}

export default function ScreenWhen({
  scheduleMode = 'strict',
  dateText = 'TOMORROW',
  timeText = '6:00 PM',
  startTime = '6:00 PM',
  endTime = '11:00 PM',
  gifUrl = '/gifs/when_tomorrow.gif',
  title = 'When? ⏰',
  subtitle,
  badgeText,
  recipientName = 'My Love',
  onSelectDate,
  onNext
}) {
  // Generate next 10 days for interactive picker
  const generateDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i + 1); // starting tomorrow
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      const fullFormatted = `${dayName}, ${monthName} ${dayNum}`;
      days.push({
        id: fullFormatted,
        label: i === 0 ? 'Tomorrow' : dayName,
        dayNum,
        monthName,
        fullFormatted
      });
    }
    return days;
  };

  const daysList = generateDays();
  const availableTimes = useMemo(() => generateHoursRange(startTime, endTime, 30), [startTime, endTime]);

  const [chosenDay, setChosenDay] = useState(dateText || daysList[0].fullFormatted);
  const [chosenTime, setChosenTime] = useState(() => {
    if (timeText && availableTimes.includes(timeText)) return timeText;
    return availableTimes[0] || '7:00 PM';
  });

  const handleConfirmPicker = () => {
    sound.playPop();
    if (onSelectDate) {
      onSelectDate(chosenDay, chosenTime);
    }
    onNext();
  };

  const isPicker = scheduleMode === 'picker';

  return (
    <div className="screen-container animate-fade-in">
      <div className="screen-header">
        <div className="badge-pill">
          <Calendar size={14} />
          <span>{badgeText || (isPicker ? 'Pick Your Date' : 'Strict Schedule')}</span>
        </div>
        <h2 className="screen-title">
          {title || (isPicker ? 'When are you free? 📅✨' : 'When? ⏰')}
        </h2>
        <p className="screen-subtitle">
          {subtitle || (isPicker
            ? 'Pick the day and time that work best for you:'
            : "(Spoiler: There is no date picker, don't even look for one)")}
        </p>
      </div>

      {!isPicker ? (
        /* MODE A: Playful Strict Schedule */
        <div className="glass-card single-focus-card">
          <div className="card-media-wrapper date-media">
            <img
              src={gifUrl || '/gifs/when_tomorrow.gif'}
              alt="Cat changing clock"
              className="card-gif"
              onError={(e) => {
                e.target.src = 'https://media.tenor.com/yz_7VcX0WjYAAAAM/cat-changing-the-clock-changing-the-time.gif';
              }}
            />
          </div>

          <div className="date-announcement">
            <div className="locked-badge">
              <Lock size={14} />
              <span>Firmly Locked In</span>
            </div>

            <div className="big-date-highlight">
              <span className="big-day">{dateText}</span>
              <span className="heart-inline">❤️</span>
            </div>

            <div className="time-badge">
              <Clock size={20} />
              <span>{timeText}</span>
            </div>
          </div>

          <div className="playful-callout">
            <p className="callout-main">
              “{dateText} at {timeText}. It's already decided. 😂❤️”
            </p>
            <p className="callout-sub">
              Yes, {dateText.toLowerCase()}. Don’t worry, you have approximately enough time to mentally prepare. 😌
            </p>
          </div>

          <div className="date-picker-mock">
            <span className="strike-through">📅 Select alternative date</span>
            <span className="nope-badge">Option Disabled by {recipientName} 💅</span>
          </div>
        </div>
      ) : (
        /* MODE B: Interactive Flexible Date & Time Picker */
        <div className="glass-card single-focus-card" style={{ padding: '24px' }}>
          <div className="card-media-wrapper date-media" style={{ marginBottom: '16px' }}>
            <img
              src={gifUrl || '/gifs/when_tomorrow.gif'}
              alt="Calendar Cat"
              className="card-gif"
              style={{ maxHeight: '150px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.src = 'https://media.tenor.com/yz_7VcX0WjYAAAAM/cat-changing-the-clock-changing-the-time.gif';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#ffc2d1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              1. Choose a Day:
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'thin'
            }}>
              {daysList.map((d) => {
                const isSelected = chosenDay === d.fullFormatted || chosenDay === d.label;
                return (
                  <button
                    key={d.fullFormatted}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setChosenDay(d.fullFormatted);
                    }}
                    style={{
                      flex: '0 0 auto',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--accent-pink)' : '1px solid var(--border-subtle, rgba(255, 77, 109, 0.25))',
                      background: isSelected ? 'var(--badge-bg, rgba(255, 77, 109, 0.25))' : 'rgba(20, 4, 12, 0.5)',
                      color: isSelected ? '#fff' : 'var(--accent-blush, #ffb3c1)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      minWidth: '70px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? 'var(--glow-pink, 0 0 12px rgba(255, 77, 109, 0.4))' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8 }}>{d.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0' }}>{d.dayNum}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7 }}>{d.monthName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-blush, #ffc2d1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Choose Preferred Hour:
              </label>
              <span style={{ fontSize: '11px', color: 'var(--accent-blush, #ffb3c1)', opacity: 0.85, fontWeight: 600 }}>
                Window: {startTime} – {endTime}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
              {availableTimes.map((t) => {
                const isSelected = chosenTime === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setChosenTime(t);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '999px',
                      border: isSelected ? '2px solid var(--accent-pink)' : '1px solid var(--border-subtle, rgba(255, 77, 109, 0.25))',
                      background: isSelected ? 'var(--badge-bg, rgba(255, 77, 109, 0.35))' : 'rgba(20, 4, 12, 0.5)',
                      color: isSelected ? '#fff' : 'var(--accent-blush, #ffc2d1)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--glow-pink, 0 0 10px rgba(255, 77, 109, 0.5))' : 'none'
                    }}
                  >
                    <Clock size={12} />
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            padding: '12px 16px',
            background: 'var(--badge-bg, rgba(255, 77, 109, 0.12))',
            border: '1px solid var(--border-active, rgba(255, 77, 109, 0.3))',
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#fff'
          }}>
            Selected: <strong style={{ color: '#ffd166' }}>{chosenDay}</strong> at <strong style={{ color: '#ffd166' }}>{chosenTime}</strong> ❤️
          </div>
        </div>
      )}

      <div className="screen-actions">
        <button
          className="btn btn-primary pulse-glow"
          onClick={isPicker ? handleConfirmPicker : () => {
            sound.playPop();
            onNext();
          }}
          id="confirm-time-btn"
        >
          {isPicker ? 'Lock in this Date & Time 📅✨' : "Understood, I'll be ready 🫡❤️"}
        </button>
      </div>
    </div>
  );
}
