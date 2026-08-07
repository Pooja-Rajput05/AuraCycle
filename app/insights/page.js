'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { calculateCycleState } from '../../lib/cycleCalculator';

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simDay, setSimDay] = useState(1);

  useEffect(() => {
    const simActive = localStorage.getItem('isSimulating') === 'true';
    const savedDay = Number(localStorage.getItem('simulationDay') || '1');
    setIsSimulating(simActive);
    setSimDay(savedDay);

    fetch('/api/insights')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data?.profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Analyzing your wellness patterns...</p>
      </div>
    );
  }

  const { profile, analytics } = data;
  let activeDay = calculateCycleState(
    profile.lastPeriodDate,
    profile.averageCycleLength,
    profile.periodLength
  ).cycleDay;

  if (isSimulating) activeDay = simDay;

  const cycleState = calculateCycleState(
    profile.lastPeriodDate,
    profile.averageCycleLength,
    profile.periodLength,
    new Date(),
    activeDay
  );

  const {
    moodPatterns = [],
    symptomFrequency = [],
    wellnessSuggestions = [],
    personalizedInsights = [],
    cycleConsistency = {},
    wellness = {},
  } = analytics || {};

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = (activeDay / profile.averageCycleLength) * circumference;

  const moodInsight = personalizedInsights.find((i) => i.type === 'mood');
  const moodDesc = moodInsight
    ? moodInsight.description
    : wellness.totalLogs > 0
      ? `Based on ${wellness.totalLogs} logged days, your mood patterns are being analyzed across cycle weeks.`
      : 'Start logging daily to discover mood patterns across your cycle.';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="font-display-lg" style={{ margin: 0 }}>Your Insights</h1>
        <p className="font-body-lg" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Personalized patterns from your wellness data
        </p>
      </div>

      {/* Personalized insight cards */}
      {personalizedInsights.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {personalizedInsights.slice(0, 3).map((insight) => (
            <div key={insight.title} className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-rose)', letterSpacing: '0.04em' }}>
                {insight.type}
              </span>
              <h3 className="font-headline-md" style={{ fontSize: '1rem', margin: '6px 0' }}>{insight.title}</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{insight.description}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        {/* Phase focus */}
        <div className="glass-card" style={{ gridColumn: 'span 8', padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth="6" />
              <circle cx="50" cy="50" fill="none" r={radius} stroke="var(--accent-rose)" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={circumference - progressPercent} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-headline-md" style={{ color: 'var(--accent-rose)', fontSize: '1.25rem' }}>Day {activeDay}</span>
              <span className="font-label-sm" style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', textTransform: 'uppercase' }}>{cycleState.phase}</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <span className="font-label-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Phase Focus</span>
            <h2 className="font-headline-md" style={{ margin: '4px 0 8px' }}>{cycleState.phase} Phase</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              {cycleState.phaseDetails?.summary}
            </p>
          </div>
        </div>

        {/* Cycle consistency */}
        <div className="glass-card" style={{ gridColumn: 'span 4', padding: '24px' }}>
          <h3 className="font-label-md" style={{ fontWeight: 700, margin: 0 }}>Cycle Length</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cycleConsistency.label || 'Building baseline'}</span>
          <h2 className="font-headline-lg" style={{ margin: '16px 0', fontSize: '1.8rem' }}>
            {cycleConsistency.cycleLength || profile.averageCycleLength}{' '}
            <span style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>days avg</span>
          </h2>
          <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
            <div style={{ width: `${cycleConsistency.score || 85}%`, height: '100%', background: 'var(--accent-rose)', borderRadius: '3px' }} />
          </div>
          {wellness.loggingStreak > 0 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-sage)', fontWeight: 600, marginTop: '10px' }}>
              {wellness.loggingStreak}-day logging streak
            </p>
          )}
        </div>
      </div>

      {/* Mood patterns - REAL DATA */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="font-headline-md" style={{ fontSize: '1.15rem', margin: '0 0 4px' }}>Mood Patterns</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>{moodDesc}</p>
        <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '8px 0' }}>
          <svg width="680" height="150" style={{ overflow: 'visible' }}>
            {[20, 60, 100].map((y) => (
              <line key={y} x1="40" y1={y} x2="660" y2={y} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
            ))}
            <text x="25" y="25" fontSize="14" textAnchor="middle">😊</text>
            <text x="25" y="65" fontSize="14" textAnchor="middle">😐</text>
            <text x="25" y="105" fontSize="14" textAnchor="middle">😔</text>
            {moodPatterns.map((week, idx) => {
              const x = 55 + idx * 130;
              const barHeight = week.sampleSize > 0 ? ((week.avgMood - 1) / 4) * 80 : 20;
              const y = 110 - barHeight;
              const color = week.avgMood >= 4 ? '#4a654e' : week.avgMood >= 3 ? '#b0ceb2' : '#ffb4a7';
              return (
                <g key={week.week}>
                  <rect x={x} y={y} width="28" height={barHeight} fill={color} rx="4" opacity={week.sampleSize > 0 ? 1 : 0.3} />
                  <text x={x + 14} y="130" fill="var(--text-secondary)" fontSize="10" fontWeight="700" textAnchor="middle">
                    Week {week.week}
                  </text>
                  {week.sampleSize > 0 && (
                    <text x={x + 14} y={y - 6} fill="var(--text-secondary)" fontSize="8" textAnchor="middle">
                      {week.label}
                    </text>
                  )}
                </g>
              );
            })}
            <line x1="40" y1="110" x2="660" y2="110" stroke="var(--card-border)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Wellness suggestions - REAL */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="font-headline-md" style={{ fontSize: '1.15rem', margin: '0 0 16px' }}>Wellness Suggestions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {wellnessSuggestions.map((s) => (
              <div key={s.title} style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(147,73,60,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--accent-rose)' }}>{s.icon}</span>
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>{s.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0', lineHeight: 1.4 }}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Symptom frequency - REAL */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="font-headline-md" style={{ fontSize: '1.15rem', margin: '0 0 16px' }}>Symptom Frequency</h3>
          {symptomFrequency.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {symptomFrequency.slice(0, 5).map((s) => {
                const maxCount = symptomFrequency[0]?.count || 1;
                return (
                  <div key={s.id}>
                    <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{s.label}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.count} logs</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--accent-plum)', width: `${(s.count / maxCount) * 100}%`, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No symptoms logged yet. Track symptoms on your calendar to see frequency trends.
            </p>
          )}
          <Link href="/calendar" style={{ display: 'block', marginTop: '16px', padding: '10px', border: '1px solid var(--card-border)', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.84rem' }}>
            View Full Symptom Log
          </Link>
        </div>
      </div>
    </div>
  );
}
