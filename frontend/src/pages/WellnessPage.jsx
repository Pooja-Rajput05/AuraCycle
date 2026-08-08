import React, { useState, useEffect } from 'react';
import { GlassWater, Moon, Flame, Sparkles, Coffee, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { calculateCycleState } from '../lib/cycleCalculator';
import YogaExerciseVisualizer from '../components/YogaExerciseVisualizer';

export default function WellnessPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWellnessData = async () => {
    try {
      const [profileRes, logsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profile`),
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logs`)
      ]);
      const profileData = await profileRes.json();
      const logsData = await logsRes.json();
      setProfile(profileData);
      setLogs(logsData);
    } catch (e) {
      console.error('Error fetching wellness data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWellnessData();
  }, []);

  const handleQuickAddWater = async (amount) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr) || {
      date: todayStr,
      water: 0,
      flow: 0,
      symptoms: [],
      mood: 3,
      sleep: 7
    };

    const updatedWater = Math.max(0, (todayLog.water || 0) + amount);
    const updatedLog = { ...todayLog, water: updatedWater };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLog),
      });
      if (res.ok) {
        setLogs(prev => prev.map(l => l.date === todayStr ? updatedLog : l));
        toast(`Hydration updated: ${updatedWater} ml`, 'success');
      }
    } catch (e) {
      console.error('Error updating water:', e);
    }
  };

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <GlassWater size={32} style={{ color: 'var(--accent-sage)', animation: 'spin 2s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading your wellness routines & remedies...</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);
  const todayWater = todayLog?.water || 0;
  const todaySleep = todayLog?.sleep || 7;

  const cycleState = calculateCycleState(profile.lastPeriodDate, profile.averageCycleLength, profile.periodLength);

  return (
    <div className="animate-fade-in font-body-md" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div>
        <span className="font-label-sm" style={{ color: 'var(--accent-sage)', fontWeight: 700, letterSpacing: '0.06em' }}>LIFESTYLE & BIO-CARE</span>
        <h1 className="font-display-lg" style={{ color: 'var(--text-primary)', margin: 0 }}>Daily Wellness & Desi Nuskhe</h1>
        <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Phase-aligned hydration targets, herbal tea remedies & self-care exercises
        </p>
      </div>

      {/* Hero Bento Overview (Matching Theme Wine Gradient) */}
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
            <span style={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '0.04em', color: '#ffd0d6' }}>TODAY'S PHASE WELLNESS</span>
          </div>
          <h2 className="font-headline-lg" style={{ color: '#fff', margin: 0, fontSize: '1.6rem' }}>
            {cycleState.phase} Phase Care Routine
          </h2>
          <p style={{ opacity: 0.9, margin: '6px 0 0', fontSize: '0.88rem', maxWidth: '640px', lineHeight: '1.5' }}>
            {cycleState.phase === 'Menstrual' && "🍵 Menstrual Day: Focus on warm Ajwain tea, lower back heat therapy, and light butterfly pose."}
            {cycleState.phase === 'Follicular' && "✨ Follicular Day: Estrogen is rising! Perfect time for high-protein meals and energetic cardio."}
            {cycleState.phase === 'Ovulatory' && "🌟 Ovulatory Day: Peak fertility & stamina! Eat antioxidant-rich berries and stay hydrated."}
            {cycleState.phase === 'Luteal' && "🌸 Luteal Day: Avoid excess salt/caffeine to reduce bloating. Drink Chamomile tea before bed."}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.74rem', opacity: 0.8, display: 'block', fontWeight: 600 }}>Daily Goal</span>
          <strong style={{ fontSize: '1.2rem', color: '#ffd0d6' }}>2000 ml Water</strong>
        </div>
      </div>

      {/* 4 Bento Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Card 1: Interactive Water Hydration Tracker */}
        <div className="glass-card animated-bento-card" style={{ gridColumn: 'span 6', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GlassWater size={20} style={{ color: 'var(--accent-sage)' }} />
              <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                💧 Hydration Tracker
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-sage)' }}>Target: 2000 ml</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {todayWater} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ml</span>
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                {Math.round((todayWater / 2000) * 100)}% of daily goal reached
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Minus / Undo Water Button */}
              <button
                onClick={() => handleQuickAddWater(-250)}
                title="Undo / Reduce 250ml"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  border: '1.5px solid rgba(239, 68, 68, 0.25)',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                -250ml
              </button>

              {/* Plus 250ml Glass Button */}
              <button
                onClick={() => handleQuickAddWater(250)}
                style={{
                  background: 'rgba(74, 101, 78, 0.12)',
                  color: 'var(--accent-sage)',
                  border: '1.5px solid rgba(74, 101, 78, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                +250ml
              </button>

              {/* Plus 500ml Bottle Button */}
              <button
                onClick={() => handleQuickAddWater(500)}
                style={{
                  background: 'var(--accent-sage)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(74, 101, 78, 0.25)'
                }}
              >
                +500ml
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-sage) 0%, #2c4230 100%)', width: `${Math.min(100, (todayWater / 2000) * 100)}%`, borderRadius: '5px' }} />
          </div>
        </div>

        {/* Card 2: Desi Nuskhe & Herbal Teas */}
        <div className="glass-card animated-bento-card" style={{ gridColumn: 'span 6', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
            <Coffee size={20} style={{ color: 'var(--accent-rose)' }} />
            <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              🍵 Gharelu Nuskhe & Herbal Teas
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '14px', border: '1px solid var(--card-border)' }}>
              <strong style={{ fontSize: '0.84rem', color: 'var(--accent-rose)', display: 'block' }}>🌱 Ajwain & Adrak Tea (Cramps Relief)</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Boil 1/2 tsp ajwain + crushed ginger in water for 5 mins. Reduces period pain instantly.</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '14px', border: '1px solid var(--card-border)' }}>
              <strong style={{ fontSize: '0.84rem', color: 'var(--accent-sage)', display: 'block' }}>🍃 Pudina (Peppermint) Water (Bloating Relief)</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Soak fresh mint leaves in warm water. Soothes stomach swelling & digestion.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Symptom-Targeted Animated Yoga & Exercise Visualizer */}
        <YogaExerciseVisualizer phase={cycleState.phase} loggedSymptoms={todayLog?.symptoms || []} />

        {/* Card 4: Sleep & Mind Self-Care */}
        <div className="glass-card animated-bento-card" style={{ gridColumn: 'span 6', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
            <Moon size={20} style={{ color: '#8b5cf6' }} />
            <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              😴 Sleep & Evening Routine
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Logged Sleep Today</span>
              <strong style={{ fontSize: '1.4rem', color: '#8b5cf6' }}>{todaySleep} Hours</strong>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--accent-sage)', fontWeight: 700, background: 'rgba(74, 101, 78, 0.1)', padding: '4px 10px', borderRadius: '10px' }}>
              Optimal: 7–8 hrs
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--accent-sage)' }} />
              <span>No blue light screens 30 mins before bed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--accent-sage)' }} />
              <span>Keep room temperature cool & comfortable</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
