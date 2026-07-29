'use client';

import React from 'react';
import styles from './CycleRing.module.css';

export default function CycleRing({ cycleDay = 1, cycleLength = 28, phase = 'Follicular', daysUntilNext = 14 }) {
  // SVG configuration
  const radius = 90;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = cycleDay / cycleLength;
  const strokeDashoffset = circumference - progress * circumference;

  // Phase color theme map (using pastel soothing comfort colors)
  const phaseColors = {
    Menstrual: 'var(--phase-menstrual)',
    Follicular: 'var(--phase-follicular)',
    Ovulatory: 'var(--phase-ovulatory)',
    Luteal: 'var(--phase-luteal)'
  };

  const currentColor = phaseColors[phase] || 'var(--accent-rose)';

  return (
    <div className={styles.container}>
      <div className={styles.ringWrapper}>
        {/* Soft breathing background glow */}
        <div className={styles.auraGlow} style={{ '--aura-color': currentColor }} />
        
        <svg className={styles.svg} width="220" height="220" viewBox="0 0 220 220">
          <defs>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={currentColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentColor} />
              <stop offset="100%" stopColor="var(--accent-pink)" />
            </linearGradient>
          </defs>

          {/* Inner Glow */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="url(#glowGrad)"
            className={styles.glowCircle}
          />

          {/* Background Track */}
          <circle
            className={styles.track}
            cx="110"
            cy="110"
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Active Progress */}
          <circle
            className={styles.progress}
            cx="110"
            cy="110"
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke="url(#ringGrad)"
            strokeLinecap="round"
            fill="transparent"
            transform="rotate(-90 110 110)"
          />
        </svg>

        {/* Center Content */}
        <div className={styles.content}>
          <span className={styles.subLabel}>DAY</span>
          <h2 className={styles.dayNumber} style={{ color: 'var(--text-primary)' }}>
            {cycleDay}
          </h2>
          <div 
            className={styles.phaseBadge} 
            style={{ 
              backgroundColor: `${currentColor}18`, 
              borderColor: `${currentColor}50`, 
              color: 'var(--text-primary)' 
            }}
          >
            {phase} Phase
          </div>
        </div>
      </div>

      <div className={styles.summaryBox}>
        <p className={styles.daysLeft}>
          <strong>{daysUntilNext}</strong> {daysUntilNext === 1 ? 'day' : 'days'} until next cycle
        </p>
      </div>
    </div>
  );
}
