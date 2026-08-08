

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Heart, Shield, Activity, Calendar, Award, CheckCircle } from 'lucide-react';
import { calculateCycleState } from '../lib/cycleCalculator';

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/insights`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data?.profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <Activity size={32} style={{ color: 'var(--accent-rose)', animation: 'spin 2s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Analyzing your health patterns & bio-metrics...</p>
      </div>
    );
  }

  const { profile, analytics } = data;
  const cycleState = calculateCycleState(
    profile.lastPeriodDate,
    profile.averageCycleLength,
    profile.periodLength,
    new Date()
  );

  const {
    moodPatterns = [],
    symptomFrequency = [],
    wellnessSuggestions = [],
    personalizedInsights = [],
    cycleConsistency = {},
    wellness = {},
  } = analytics || {};

  return (
    <div className="animate-fade-in font-body-md" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="font-label-sm" style={{ color: 'var(--accent-rose)', fontWeight: 700, letterSpacing: '0.06em' }}>BIO-HEALTH ANALYTICS</span>
          <h1 className="font-display-lg" style={{ color: 'var(--text-primary)', margin: 0 }}>Insights & Patterns</h1>
          <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Personalized health trends, mood stability & symptom analysis based on your logged days
          </p>
        </div>
      </div>

      {/* Hero Wine Analytics Summary */}
      <div 
        className="glass-card animated-bento-card"
        style={{ 
          background: 'linear-gradient(135deg, #7c3a4d 0%, #4a2838 100%)', 
          color: 'white', 
          borderRadius: '24px', 
          padding: '28px 32px', 
          display: 'flex', 
          alignItems: 'center', 
          justify: 'space-between',
          boxShadow: '0 12px 32px rgba(124, 58, 77, 0.25)',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.95, marginBottom: '6px' }}>
            <Sparkles size={18} style={{ color: '#ffd0d6' }} />
            <span style={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '0.04em' }}>HEALTH REPORT SUMMARY</span>
          </div>
          <h2 className="font-headline-lg" style={{ color: '#fff', margin: 0, fontSize: '1.6rem' }}>
            {cycleConsistency.score >= 80 ? "✨ Healthy & Regular Cycle Pattern" : "📊 Cycle Regularity Baseline Building"}
          </h2>
          <p style={{ opacity: 0.9, margin: '6px 0 0', fontSize: '0.88rem', maxWidth: '640px', lineHeight: '1.5' }}>
            Your average cycle length is <strong>{profile.averageCycleLength} days</strong>. Total <strong>{wellness.totalLogs || 0} days recorded</strong> in your MongoDB Atlas cluster.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.74rem', opacity: 0.8, display: 'block', fontWeight: 600 }}>Logging Streak</span>
            <strong style={{ fontSize: '1.2rem', color: '#ffd0d6' }}>🔥 {wellness.loggingStreak || 0} Days</strong>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Left 8 columns: Mood Trends & Symptom Frequency */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Mood Patterns Chart Card */}
          <div className="glass-card animated-bento-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <div>
                <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                  📊 Mood Stability & Cycle Weeks
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Average emotional energy across 4 weeks of cycle</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', overflowX: 'auto' }}>
              <svg width="600" height="150" style={{ overflow: 'visible' }}>
                {[20, 60, 100].map((y) => (
                  <line key={y} x1="40" y1={y} x2="560" y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                ))}
                <text x="20" y="25" fontSize="14" textAnchor="middle">🤩</text>
                <text x="20" y="65" fontSize="14" textAnchor="middle">😐</text>
                <text x="20" y="105" fontSize="14" textAnchor="middle">😔</text>
                
                {moodPatterns.map((week, idx) => {
                  const x = 70 + idx * 130;
                  const barHeight = week.sampleSize > 0 ? Math.max(15, ((week.avgMood - 1) / 4) * 80) : 20;
                  const y = 110 - barHeight;
                  const color = week.avgMood >= 4 ? '#4a654e' : week.avgMood >= 3 ? 'var(--accent-rose)' : '#ffb4a7';
                  
                  return (
                    <g key={week.week}>
                      <rect x={x} y={y} width="36" height={barHeight} fill={color} rx="8" opacity={week.sampleSize > 0 ? 1 : 0.4} />
                      <text x={x + 18} y="130" fill="var(--text-primary)" fontSize="11" fontWeight="700" textAnchor="middle">
                        Week {week.week}
                      </text>
                      {week.sampleSize > 0 && (
                        <text x={x + 18} y={y - 6} fill="var(--accent-rose)" fontSize="9" fontWeight="800" textAnchor="middle">
                          {week.label}
                        </text>
                      )}
                    </g>
                  );
                })}
                <line x1="40" y1="110" x2="560" y2="110" stroke="var(--card-border)" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Symptom Frequency Card */}
          <div className="glass-card animated-bento-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                🩹 Top Recurrent Symptoms
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Most frequent physical discomforts recorded in logs</span>
            </div>

            {symptomFrequency.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {symptomFrequency.slice(0, 5).map((s) => {
                  const maxCount = symptomFrequency[0]?.count || 1;
                  const pct = Math.round((s.count / maxCount) * 100);
                  return (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>⚡ {s.label}</span>
                        <span style={{ color: 'var(--accent-rose)' }}>{s.count} logs ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-rose) 0%, #7c3a4d 100%)', width: `${pct}%`, borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
                No recurrent symptoms logged yet. Use Calendar Page to record symptoms!
              </p>
            )}
          </div>

        </div>

        {/* Right 4 columns: Personalized Recommendations */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Personalized Insights Bento */}
          <div className="glass-card animated-bento-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
              💡 Smart Wellness Advice
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(wellnessSuggestions.length > 0 ? wellnessSuggestions : [
                { icon: 'directions_walk', title: '🏃‍♀️ Recommended Exercise', description: 'Avoid heavy intense workouts today — focus on light walking and gentle stretching.' },
                { icon: 'restaurant', title: '🥗 Healthy Diet Advice', description: 'Sip warm fluids, ginger tea, and eat leafy greens or iron-rich healthy foods.' },
                { icon: 'local_fire_department', title: '⚡ Natural Cramp Relief', description: 'Apply a hot water bottle to your lower abdomen and enjoy warm herbal chamomile tea.' }
              ]).slice(0, 3).map((s) => (
                <div key={s.title} style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Heart size={16} style={{ color: 'var(--accent-rose)' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.title}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}



