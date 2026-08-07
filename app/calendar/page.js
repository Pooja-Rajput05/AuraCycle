'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCalendarPredictions, calculateCycleState } from '../../lib/cycleCalculator';
import { useToast } from '../../components/ToastProvider';

export default function CalendarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Form logging state
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(0); // 0 = None, 1 = Light, 2 = Medium, 3 = Heavy

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchCalendarData = async () => {
    try {
      const profileRes = await fetch('/api/profile');
      const profileData = await profileRes.json();
      setProfile(profileData);

      const logsRes = await fetch('/api/logs');
      const logsData = await logsRes.json();
      setLogs(logsData);

      // Pre-select today's date on mount
      const todayStr = new Date().toISOString().split('T')[0];
      setSelectedDate(prev => prev || todayStr);
    } catch (e) {
      console.error('Error fetching calendar data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Pre-load logging form when selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    const existingLog = logs.find(l => l.date === selectedDate);
    if (existingLog) {
      // Map mood level to key
      if (existingLog.mood === 5) setSelectedMood('Energized');
      else if (existingLog.mood === 4) setSelectedMood('Happy');
      else if (existingLog.mood === 3) setSelectedMood('Calm');
      else if (existingLog.mood === 2) setSelectedMood('Sensitive');
      else if (existingLog.mood === 1) setSelectedMood('Anxious');
      else setSelectedMood('');

      setSelectedSymptoms(existingLog.symptoms || []);
      setSelectedFlow(existingLog.flow || 0);
    } else {
      setSelectedMood('');
      setSelectedSymptoms([]);
      setSelectedFlow(0);
    }
  }, [selectedDate, logs]);

  // Saving logs handler
  const handleSaveLog = async () => {
    let numericMood = 3;
    if (selectedMood === 'Energized') numericMood = 5;
    else if (selectedMood === 'Happy') numericMood = 4;
    else if (selectedMood === 'Calm') numericMood = 3;
    else if (selectedMood === 'Sensitive') numericMood = 2;
    else if (selectedMood === 'Anxious') numericMood = 1;

    const existingLog = logs.find(l => l.date === selectedDate) || {
      date: selectedDate,
      water: 0,
      sleep: 7,
      completedTasks: []
    };

    const newLog = {
      ...existingLog,
      date: selectedDate,
      mood: numericMood,
      symptoms: selectedSymptoms,
      flow: Number(selectedFlow)
    };

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (res.ok) {
        fetchCalendarData();
        toast(`Log saved for ${selectedDate}`, 'success');
      } else {
        const err = await res.json();
        toast(err.error || 'Failed to save log', 'error');
      }
    } catch (e) {
      console.error('Error saving log:', e);
    }
  };

  // Symptoms checklist toggling
  const handleToggleSymptom = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Navigating months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Calendar...</p>
      </div>
    );
  }

  // Get predictions
  const predictions = getCalendarPredictions(
    profile.lastPeriodDate,
    profile.averageCycleLength,
    profile.periodLength,
    6 // Predict 6 cycles out
  );

  // Helper to map date key
  const getDateStatus = (dateStr) => {
    const actualLog = logs.find((l) => l.date === dateStr);
    if (actualLog && actualLog.flow > 0) {
      return { type: 'menstrual-actual', log: actualLog };
    } else if (actualLog) {
      return { type: 'logged', log: actualLog };
    }

    const pred = predictions.find((p) => p.date === dateStr);
    if (pred) {
      return { type: pred.type, log: null };
    }

    return { type: 'regular', log: null };
  };

  // Calculate day-of-cycle metrics for selectedDate
  const activeCycleState = calculateCycleState(
    profile.lastPeriodDate,
    profile.averageCycleLength,
    profile.periodLength,
    new Date(selectedDate)
  );

  // Generate grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNum: d,
      dateStr: dString,
      ...getDateStatus(dString),
    });
  }

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Helper circle calculations for circular progress in Hero card
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = (activeCycleState.cycleDay / profile.averageCycleLength) * circumference;

  return (
    <div className="animate-fade-in font-body-md" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div>
        <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>TRACK & PREDICT</span>
        <h1 className="font-display-lg" style={{ color: 'var(--text-primary)', margin: 0 }}>Cycle Calendar</h1>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Calendar & Overview (col-span-8) */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Hero Insight Card (Stitch styled) */}
          <div 
            style={{ 
              background: 'var(--accent-plum)', 
              color: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 className="font-headline-lg" style={{ color: '#fff', margin: 0 }}>
                Day {activeCycleState.cycleDay} of Cycle
              </h1>
              <p className="font-body-md" style={{ opacity: 0.9, margin: 0 }}>
                {activeCycleState.phase === 'Menstrual' && "Period cycle active. Prioritize physical comfort."}
                {activeCycleState.phase === 'Follicular' && "Follicular phase. Energy and focus are building."}
                {activeCycleState.phase === 'Ovulatory' && "Ovulation window predicted to begin tomorrow."}
                {activeCycleState.phase === 'Luteal' && "Luteal phase. Wind-down phase begins."}
              </p>
            </div>

            {/* Circular progress indicators */}
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="transform -rotate-90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" fill="none" r={radius} stroke="rgba(255,255,255,0.18)" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  fill="none" 
                  r={radius} 
                  stroke="var(--accent-pink)" 
                  strokeWidth="8" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={circumference - progressPercent}
                  strokeLinecap="round" 
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="font-headline-md" style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>
                  {activeCycleState.cycleDay}
                </span>
                <span className="font-label-sm" style={{ color: '#fff', opacity: 0.8, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Days
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Calendar Card */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', margin: 0 }}>
                {monthNames[month]} {year}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={prevMonth} style={navBtnStyle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                </button>
                <button onClick={nextMonth} style={navBtnStyle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                </button>
              </div>
            </div>

            {/* Grid Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--card-border)' }}>
              {weekdays.map((w, idx) => (
                <div key={idx} className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>
                  {w}
                </div>
              ))}
            </div>

            {/* Grid Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} style={{ padding: '8px', opacity: 0.1 }}>-</div>;
                }

                const isSelected = selectedDate === cell.dateStr;
                let bgStyle = { color: 'var(--text-primary)', cursor: 'pointer' };
                let borderStyle = '1px solid transparent';
                let indicatorDot = null;

                if (cell.type === 'menstrual-actual') {
                  bgStyle.backgroundColor = 'var(--accent-pink)';
                  bgStyle.color = 'var(--text-primary)';
                  bgStyle.fontWeight = '700';
                } else if (cell.type === 'menstrual') {
                  bgStyle.backgroundColor = 'var(--accent-pink)';
                  bgStyle.color = 'var(--text-primary)';
                  bgStyle.opacity = 0.85;
                } else if (cell.type === 'fertile-peak') {
                  bgStyle.backgroundColor = 'var(--accent-coral)';
                  bgStyle.color = 'var(--text-primary)';
                  bgStyle.fontWeight = '700';
                } else if (cell.type === 'fertile') {
                  bgStyle.backgroundColor = 'rgba(74, 101, 78, 0.12)';
                  bgStyle.color = 'var(--accent-sage)';
                  bgStyle.fontWeight = '600';
                } else if (cell.type === 'logged') {
                  // Small indicator dot for logged wellness info
                  indicatorDot = <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-sage)', position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)' }} />;
                }

                if (isSelected) {
                  borderStyle = '2px solid var(--accent-rose)';
                  bgStyle.fontWeight = '700';
                }

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    style={{
                      padding: '8px 0',
                      borderRadius: '50%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      border: borderStyle,
                      transition: 'all 0.18s',
                      ...bgStyle
                    }}
                    className="calendar-day-cell"
                  >
                    <span style={{ fontSize: '0.88rem' }}>{cell.dayNum}</span>
                    {indicatorDot}
                  </div>
                );
              })}
            </div>

            {/* Legend indicators */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderTop: '1px solid var(--card-border)', paddingTop: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-pink)', display: 'inline-block' }} />
                <span>Menstruation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(74, 101, 78, 0.12)', display: 'inline-block' }} />
                <span>Fertile Window</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-sage)', display: 'inline-block' }} />
                <span>Logged Wellness Data</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Logging Sidebar & Trends (col-span-4) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Log Symptoms Card */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex-between">
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.15rem' }}>
                Log Symptoms
              </h2>
              <span className="font-label-md" style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>
                {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
              </span>
            </div>

            {/* Mood selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 className="font-label-md" style={{ color: 'var(--text-primary)', fontWeight: '600', margin: 0 }}>Mood</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Calm', 'Happy', 'Energized', 'Sensitive', 'Anxious'].map(m => {
                  const isActive = selectedMood === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMood(m)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: isActive ? 'transparent' : 'var(--card-border)',
                        background: isActive ? 'var(--accent-sage)' : 'transparent',
                        color: isActive ? 'white' : 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Physical Symptoms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 className="font-label-md" style={{ color: 'var(--text-primary)', fontWeight: '600', margin: 0 }}>Physical</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['cramps', 'headache', 'bloating', 'fatigue', 'acne', 'back_pain'].map(s => {
                  const cleanName = s.replace(/_/g, ' ');
                  const isActive = selectedSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => handleToggleSymptom(s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: isActive ? 'transparent' : 'var(--card-border)',
                        background: isActive ? 'var(--accent-rose)' : 'transparent',
                        color: isActive ? 'white' : 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isActive && '✓ '} {cleanName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flow selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 className="font-label-md" style={{ color: 'var(--text-primary)', fontWeight: '600', margin: 0 }}>Flow</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { label: 'Light', val: 1 },
                  { label: 'Medium', val: 2 },
                  { label: 'Heavy', val: 3 },
                ].map(f => {
                  const isActive = selectedFlow === f.val;
                  return (
                    <label 
                      key={f.val} 
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: isActive ? 700 : 500 }}
                    >
                      <input 
                        type="radio" 
                        name="flowRadio"
                        checked={isActive} 
                        onChange={() => setSelectedFlow(f.val)}
                        style={{ accentColor: 'var(--accent-rose)', cursor: 'pointer' }}
                      />
                      {f.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={handleSaveLog}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent-rose)',
                color: 'white',
                fontFamily: 'inherit',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(147,73,60,0.15)',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.target.style.background = 'var(--text-secondary)'}
              onMouseOut={e => e.target.style.background = 'var(--accent-rose)'}
            >
              Save Log
            </button>
          </div>

          {/* Historical Trends Teaser Card */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="font-label-md" style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--accent-plum)' }}>trending_up</span> 
              Historical Trend
            </h3>
            <p className="font-body-md" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Your average cycle length over the last 6 months is consistent at {profile.averageCycleLength} days.
            </p>
            <Link 
              href="/wellness" 
              style={{ 
                fontSize: '0.8rem', 
                color: 'var(--accent-rose)', 
                fontWeight: '700', 
                textDecoration: 'none', 
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              View full insights →
            </Link>
          </div>

        </div>

      </div>

      <style jsx global>{`
        .nav-btn {
          background: transparent;
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
        }
        .calendar-day-cell:hover {
          background-color: var(--bg-secondary) !important;
          color: var(--text-primary) !important;
        }
        @media (max-width: 960px) {
          div[style*="grid-template-columns: repeat(12"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridColumn: span 8"],
          div[style*="gridColumn: span 4"] {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
}

const navBtnStyle = {
  background: 'transparent',
  border: '1px solid var(--card-border)',
  color: 'var(--text-secondary)',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s'
};
