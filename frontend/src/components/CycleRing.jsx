

import React from 'react';
import styles from './CycleRing.module.css';

export default function CycleRing({ cycleDay = 1, cycleLength = 28, phase = 'Follicular' }) {
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = cycleDay / cycleLength;
  const strokeDashoffset = circumference - progress * circumference;

  // Phase color theme map
  const phaseColors = {
    Menstrual: 'var(--phase-menstrual)',
    Follicular: 'var(--phase-follicular)',
    Ovulatory: 'var(--phase-ovulatory)',
    Luteal: 'var(--phase-luteal)'
  };

  const currentColor = phaseColors[phase] || 'var(--accent-rose)';

  return (
    <div className={styles.ringWrapper}>
      <svg className={styles.svg} viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          fill="transparent" 
          stroke="var(--bg-secondary)" 
          strokeWidth={strokeWidth}
        />
        {/* Foreground Progress */}
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          fill="transparent" 
          stroke={currentColor} 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={styles.progressRing}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
        />
      </svg>
      {/* Absolute Centered Text Overlay */}
      <div className={styles.overlayContent}>
        <span className={styles.dayText}>Day {cycleDay}</span>
        <span className={styles.phaseLabel}>{phase}</span>
      </div>
    </div>
  );
}
