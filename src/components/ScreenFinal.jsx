import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Send, Copy, Check, Heart, MapPin, Utensils, Calendar, Clock, Shirt, RotateCcw } from 'lucide-react';
import { getWhatsAppUrl, getDateSummaryText } from '../utils/whatsapp';
import { sound } from '../utils/sound';

export default function ScreenFinal({ selections, onRestart, config = {}, onCompleteRsvp }) {
  const [copied, setCopied] = useState(false);

  const recipientName = config.recipientName || 'Dana';
  const whatsappPhone = config.whatsappPhone || '96171273152';
  const ticketNum = config.ticketCode || `#${recipientName.toUpperCase().slice(0, 4)}-001`;
  const dateValue = config.dateText || selections.when || 'Tomorrow';
  const timeValue = config.timeText || '6:00 PM';
  const dressCodeValue = config.dressCodeText || selections.dressCode || 'Casual 😌 (just look cute)';
  const gifSrc = config.gifUrl || '/gifs/final_date.gif';
  const finalTitle = config.title || "IT'S A DATE.";
  const finalMessage = config.message || "Congratulations. You have successfully agreed to go on a date with me. 😂❤️";
  const finalSubtext = config.subtext || "See you soon. No backing out now. 😌❤️";

  useEffect(() => {
    sound.playCelebration();

    // Trigger double confetti celebration
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffd166', '#ffffff']
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 100,
        origin: { y: 0.3 },
        colors: ['#ff4d6d', '#ffd166', '#ffffff']
      });
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const whatsappUrl = getWhatsAppUrl({
    location: selections.location,
    food: selections.food,
    time: timeValue,
    date: dateValue,
    dressCode: dressCodeValue,
    phone: whatsappPhone,
    recipientName
  });

  const handleCopySummary = async () => {
    sound.playPop();
    const text = getDateSummaryText({
      location: selections.location,
      food: selections.food,
      time: timeValue,
      date: dateValue,
      dressCode: dressCodeValue,
      recipientName
    });

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Failed to copy
    }
  };

  const handleWhatsAppClick = () => {
    sound.playPop();
    if (onCompleteRsvp) {
      try {
        onCompleteRsvp();
      } catch (err) {
        console.error('Failed to report RSVP:', err);
      }
    }
    // Open in new window/tab or WhatsApp app
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="screen-container animate-fade-in">
      <div className="final-celebration-card glass-card">
        <div className="badge-pill celebration-pill">
          <Heart size={14} fill="#ff4d6d" stroke="#ff4d6d" />
          <span>Official Agreement Signed</span>
        </div>

        <div className="final-gif-wrapper">
          <img
            src={gifSrc}
            alt="Celebration dance"
            className="card-gif"
            onError={(e) => {
              e.target.src = 'https://media.tenor.com/vYwVBjCjK5EAAAAM/arena-breakout-infinit.gif';
            }}
          />
        </div>

        <h1 className="final-title">
          {finalTitle} <span className="heart-pulse">❤️</span>
        </h1>

        <p className="final-lead">
          {finalMessage}
        </p>

        {/* Date Ticket Pass */}
        <div className="date-ticket">
          <div className="ticket-header">
            <span className="ticket-badge">OFFICIAL RSVP TICKET</span>
            <span className="ticket-num">{ticketNum}</span>
          </div>

          <div className="ticket-details-grid">
            <div className="ticket-item">
              <div className="ticket-icon">
                <MapPin size={18} />
              </div>
              <div className="ticket-text">
                <span className="ticket-label">Location</span>
                <span className="ticket-value">{selections.location || 'Rooftop'}</span>
              </div>
            </div>

            <div className="ticket-item">
              <div className="ticket-icon">
                <Utensils size={18} />
              </div>
              <div className="ticket-text">
                <span className="ticket-label">Cuisine</span>
                <span className="ticket-value">{selections.food || 'Lebanese'}</span>
              </div>
            </div>

            <div className="ticket-item">
              <div className="ticket-icon">
                <Calendar size={18} />
              </div>
              <div className="ticket-text">
                <span className="ticket-label">Date</span>
                <span className="ticket-value">{dateValue}</span>
              </div>
            </div>

            <div className="ticket-item">
              <div className="ticket-icon">
                <Clock size={18} />
              </div>
              <div className="ticket-text">
                <span className="ticket-label">Time</span>
                <span className="ticket-value">{timeValue}</span>
              </div>
            </div>

            <div className="ticket-item ticket-item-full">
              <div className="ticket-icon">
                <Shirt size={18} />
              </div>
              <div className="ticket-text">
                <span className="ticket-label">Dress Code</span>
                <span className="ticket-value">{dressCodeValue}</span>
              </div>
            </div>
          </div>

          <div className="ticket-cutout-left" />
          <div className="ticket-cutout-right" />
        </div>

        <p className="final-subtext">
          {finalSubtext}
        </p>

        {/* WhatsApp Send Confirmation Action */}
        <div className="whatsapp-action-block">
          <button
            className="btn btn-whatsapp pulse-glow"
            onClick={handleWhatsAppClick}
            id="send-whatsapp-btn"
          >
            <Send size={18} />
            <span>Send Confirmation on WhatsApp</span>
          </button>

          <button
            className="btn btn-secondary-outline"
            onClick={handleCopySummary}
          >
            {copied ? (
              <>
                <Check size={16} color="#4ade80" />
                <span>Copied to Clipboard! ✨</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Date Summary</span>
              </>
            )}
          </button>
        </div>

        <button
          className="btn-restart"
          onClick={() => {
            sound.playPop();
            onRestart();
          }}
        >
          <RotateCcw size={14} />
          <span>Change your answers? (Nice try)</span>
        </button>
      </div>
    </div>
  );
}
