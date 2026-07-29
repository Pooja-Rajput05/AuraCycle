'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Apple, Activity, Flame, ChevronRight, HelpCircle, Info } from 'lucide-react';
import { getPhaseDetails } from '../../lib/cycleCalculator';

export default function InsightsPage() {
  const [currentPhase, setCurrentPhase] = useState('Follicular');
  const [selectedPhase, setSelectedPhase] = useState('Follicular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentState = async () => {
      try {
        const res = await fetch('/api/insights');
        const json = await res.json();
        if (json.cycleState?.phase) {
          setCurrentPhase(json.cycleState.phase);
          setSelectedPhase(json.cycleState.phase); // Pre-select current phase
        }
      } catch (e) {
        console.error('Error fetching cycle insights:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentState();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading insights...</p>
      </div>
    );
  }

  const phaseNames = ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'];
  const details = getPhaseDetails(selectedPhase);

  // Phase color theme map
  const phaseColors = {
    Menstrual: 'var(--phase-menstrual)',
    Follicular: 'var(--phase-follicular)',
    Ovulatory: 'var(--phase-ovulatory)',
    Luteal: 'var(--phase-luteal)'
  };

  const activeColor = phaseColors[selectedPhase];

  // Dynamic calculations for Hormone Wave Diagram
  // We represent the selected day based on the phase selected:
  const getPhaseCoordinates = (phase) => {
    switch (phase) {
      case 'Menstrual':
        return { dayNum: 3, lineX: 52, estrogenY: 95, progesteroneY: 100 };
      case 'Follicular':
        return { dayNum: 9, lineX: 116, estrogenY: 60, progesteroneY: 100 };
      case 'Ovulatory':
        return { dayNum: 14, lineX: 170, estrogenY: 28, progesteroneY: 90 };
      case 'Luteal':
        return { dayNum: 22, lineX: 256, estrogenY: 50, progesteroneY: 20 };
      default:
        return { dayNum: 9, lineX: 116, estrogenY: 60, progesteroneY: 100 };
    }
  };

  const coords = getPhaseCoordinates(selectedPhase);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '1px' }}>PERSONALIZED RECOMMENDATIONS</span>
        <h1>Cycle Insights</h1>
      </div>

      {/* Phase Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        {phaseNames.map((phase) => {
          const isSelected = selectedPhase === phase;
          const isCurrent = currentPhase === phase;
          const color = phaseColors[phase];
          
          return (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              style={{
                background: isSelected ? `${color}22` : 'rgba(255, 255, 255, 0.45)',
                border: '1px solid',
                borderColor: isSelected ? color : 'rgba(232, 165, 152, 0.12)',
                borderRadius: '12px',
                padding: '10px 4px',
                color: isSelected ? color : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{phase}</span>
              {isCurrent && (
                <span style={{
                  fontSize: '0.55rem',
                  background: 'var(--accent-rose)',
                  color: 'white',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontWeight: '800'
                }}>
                  CURRENT
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hormone Fluctuations Interactive Diagram */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="flex-between">
          <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-rose)' }} />
            Estrogen & Progesterone Waves
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Day {coords.dayNum} in Cycle</span>
        </div>

        {/* SVG Drawing of the hormone waveforms */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '10px 0', position: 'relative' }}>
          <svg width="340" height="130" style={{ overflow: 'visible' }}>
            <defs>
              {/* Gradients for filling waves */}
              <linearGradient id="estrogenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-pink)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="progesteroneGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Flat Zero Line (baseline) */}
            <line x1="20" y1="100" x2="320" y2="100" stroke="rgba(232, 165, 152, 0.15)" strokeWidth="1" />

            {/* Estrogen Wave Area & Path */}
            <path
              d="M 20 100 Q 60 100 100 70 T 170 25 T 215 80 Q 235 75 255 50 T 295 50 T 320 100"
              fill="url(#estrogenGrad)"
            />
            <path
              d="M 20 100 Q 60 100 100 70 T 170 25 T 215 80 Q 235 75 255 50 T 295 50 T 320 100"
              fill="none"
              stroke="var(--accent-rose)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Progesterone Wave Area & Path */}
            <path
              d="M 20 100 L 160 100 C 190 100 220 15 255 15 C 285 15 310 90 320 100"
              fill="url(#progesteroneGrad)"
            />
            <path
              d="M 20 100 L 160 100 C 190 100 220 15 255 15 C 285 15 310 90 320 100"
              fill="none"
              stroke="var(--accent-purple)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1 0"
            />

            {/* Vertical Cycle Tracker Indicator Line */}
            <line
              x1={coords.lineX}
              y1="10"
              x2={coords.lineX}
              y2="110"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              style={{ transition: 'x1 0.4s ease, x2 0.4s ease' }}
            />

            {/* Estrogen Tracking Node */}
            <circle
              cx={coords.lineX}
              cy={coords.estrogenY}
              r="6"
              fill="var(--accent-rose)"
              stroke="white"
              strokeWidth="2"
              style={{ transition: 'cx 0.4s ease, cy 0.4s ease', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
            />

            {/* Progesterone Tracking Node */}
            <circle
              cx={coords.lineX}
              cy={coords.progesteroneY}
              r="6"
              fill="var(--accent-purple)"
              stroke="white"
              strokeWidth="2"
              style={{ transition: 'cx 0.4s ease, cy 0.4s ease', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
            />

            {/* Labels */}
            <text x="20" y="115" fill="var(--text-muted)" fontSize="9" fontWeight="700">Day 1</text>
            <text x="170" y="115" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Day 14 (Ovulation)</text>
            <text x="320" y="115" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="end">Day 28</text>
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', borderTop: '1px solid rgba(232, 165, 152, 0.12)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-rose)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Estrogen (Energy & Mood)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Progesterone (Calm & Rest)</span>
          </div>
        </div>
      </div>

      {/* Phase Details Card */}
      <div className="glass-panel" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Title */}
        <div className="flex-between" style={{ borderBottom: '1px solid rgba(232, 165, 152, 0.12)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ color: activeColor, fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>
              {details.name}
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              {details.range}
            </span>
          </div>
          {currentPhase === selectedPhase && (
            <span style={{
              fontSize: '0.75rem',
              background: `${activeColor}18`,
              color: 'var(--text-primary)',
              border: `1px solid ${activeColor}`,
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              Active Now
            </span>
          )}
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          {details.summary}
        </p>

        {/* Hormone Status Indicator */}
        <div style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(232, 165, 152, 0.12)', borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            ACTIVE HORMONE FOCUS
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estrogen</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{details.hormones.estrogen}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(0,0,0,0.04)', borderRadius: '2px' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--accent-rose)',
                  borderRadius: '2px',
                  width: details.hormones.estrogen.includes('Peak') ? '100%' 
                    : details.hormones.estrogen.includes('High') ? '80%'
                    : details.hormones.estrogen.includes('Rising') || details.hormones.estrogen.includes('Moderate') ? '50%'
                    : '15%'
                }} />
              </div>
            </div>
            
            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Progesterone</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{details.hormones.progesterone}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(0,0,0,0.04)', borderRadius: '2px' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--accent-purple)',
                  borderRadius: '2px',
                  width: details.hormones.progesterone.includes('High') ? '90%'
                    : details.hormones.progesterone.includes('Rising') || details.hormones.progesterone.includes('Moderate') ? '50%'
                    : '15%'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Diet Card */}
        <div style={adviceBlockStyle}>
          <div style={{ ...adviceIconStyle, color: 'var(--accent-rose)', background: 'rgba(232, 165, 152, 0.15)' }}>
            <Apple size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Nutrition Recommendations</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: '1.4' }}>
              {details.diet}
            </p>
          </div>
        </div>

        {/* Exercise Card */}
        <div style={adviceBlockStyle}>
          <div style={{ ...adviceIconStyle, color: 'var(--accent-sage)', background: 'rgba(139, 176, 154, 0.15)' }}>
            <Activity size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Optimal Physical Activity</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: '1.4' }}>
              {details.exercise}
            </p>
          </div>
        </div>
      </div>

      {/* Cycle Phases 101 Q&A */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} style={{ color: 'var(--accent-rose)' }} />
          Wellness Education
        </h3>
        
        <details style={qaDetailsStyle}>
          <summary style={qaSummaryStyle}>What is "Cycle Syncing"? <ChevronRight size={14} style={qaIconStyle} /></summary>
          <p style={qaTextStyle}>
            Cycle syncing is the practice of aligning your diet, exercise, and productivity styles with the phases of your menstrual cycle to optimize your energy levels and balance hormones naturally.
          </p>
        </details>
        
        <details style={qaDetailsStyle}>
          <summary style={qaSummaryStyle}>How does stress affect my cycle? <ChevronRight size={14} style={qaIconStyle} /></summary>
          <p style={qaTextStyle}>
            High stress triggers cortisol production, which can suppress gonadotropin-releasing hormone (GnRH), leading to delayed ovulation, irregular periods, or more intense PMS symptoms.
          </p>
        </details>
      </div>

    </div>
  );
}

// Inline Styles
const adviceBlockStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  marginTop: '4px',
};

const adviceIconStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const qaDetailsStyle = {
  background: 'rgba(255, 255, 255, 0.45)',
  border: '1px solid rgba(232, 165, 152, 0.12)',
  borderRadius: '12px',
  padding: '12px 14px',
};

const qaSummaryStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  listStyle: 'none', // Remove default list arrow
};

const qaIconStyle = {
  color: 'var(--text-muted)',
  transition: 'transform 0.2s',
};

const qaTextStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginTop: '8px',
  lineHeight: '1.5',
};
