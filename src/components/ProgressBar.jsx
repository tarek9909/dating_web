import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { sound } from '../utils/sound';

export default function ProgressBar({ currentStep, totalSteps = 5, onBack }) {
  const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="planner-header">
      <div className="planner-nav">
        {onBack && (
          <button
            className="back-btn"
            onClick={() => {
              sound.playPop();
              onBack();
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="step-indicator">
          Step {currentStep} of {totalSteps}
        </div>
        <div className="header-heart">❤️</div>
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
