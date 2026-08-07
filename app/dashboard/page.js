'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, RefreshCw, Eye, Sparkles, AlertCircle, HeartHandshake, CheckSquare, Square, Check } from 'lucide-react';
import CycleRing from '../../components/CycleRing';
import LogModal from '../../components/LogModal';
import OnboardingModal from '../../components/OnboardingModal';
import { useToast } from '../../components/ToastProvider';
import { calculateCycleState, getSymptomRemedies } from '../../lib/cycleCalculator';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Settings Form State
  const [name, setName] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Presentation Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simDay, setSimDay] = useState(1);

  // Fetch all dashboard data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/insights');
      const json = await res.json();
      setData(json);
      
      if (json.profile) {
        setName(json.profile.name || '');
        setLastPeriodDate(json.profile.lastPeriodDate || '');
        setCycleLength(json.profile.averageCycleLength || 28);
        setPeriodLength(json.profile.periodLength || 5);
        if (!json.profile.onboarded) {
          setShowOnboarding(true);
        }
      }

      // Fetch logs
      const logsRes = await fetch('/api/logs');
      const logsJson = await logsRes.json();
      setLogs(logsJson);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('isSimulating') === 'true';
      const day = Number(localStorage.getItem('simulationDay') || '1');
      setIsSimulating(active);
      setSimDay(day);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isSimulating', isSimulating ? 'true' : 'false');
      localStorage.setItem('simulationDay', simDay.toString());
    }
  }, [isSimulating, simDay]);

  // Save log entry
  const handleSaveLog = async (logData) => {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        toast('Wellness log saved successfully', 'success');
        const updatedLogs = [...logs];
        const idx = updatedLogs.findIndex(l => l.date === logData.date);
        if (idx > -1) {
          updatedLogs[idx] = logData;
        } else {
          updatedLogs.push(logData);
        }
        setLogs(updatedLogs);
        
        // Refresh insights
        const resInsights = await fetch('/api/insights');
        const jsonInsights = await resInsights.json();
        setData(jsonInsights);
      }
    } catch (error) {
      console.error('Error saving log:', error);
      toast('Failed to save log. Please try again.', 'error');
    }
  };

  // Quick water addition (+250ml)
  const handleQuickWater = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr) || {
      date: todayStr,
      water: 0,
      flow: 0,
      symptoms: [],
      mood: 3,
      sleep: 7,
      completedTasks: []
    };
    
    const updatedLog = {
      ...todayLog,
      water: todayLog.water + 250
    };
    
    await handleSaveLog(updatedLog);
  };

  // Update Settings
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setUpdatingSettings(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          lastPeriodDate,
          averageCycleLength: Number(cycleLength),
          periodLength: Number(periodLength),
        }),
      });
      if (res.ok) {
        setShowSettings(false);
        toast('Profile updated successfully', 'success');
        fetchData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUpdatingSettings(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <RefreshCw size={32} style={{ color: 'var(--accent-rose)', animation: 'spin 2s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>Synchronizing your dashboard wellness metrics...</p>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const { profile, cycleState: initialCycleState } = data || {};
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr) || {
    date: todayStr,
    water: 0,
    flow: 0,
    symptoms: [],
    mood: 3,
    sleep: 7,
    completedTasks: []
  };
  const todayWater = todayLog.water || 0;

  // Define active calculations based on standard vs simulation day
  let activeCycleState = initialCycleState;
  let activeSymptoms = todayLog.symptoms || [];

  if (isSimulating) {
    activeCycleState = calculateCycleState(
      lastPeriodDate || profile?.lastPeriodDate,
      Number(cycleLength),
      Number(periodLength),
      new Date(),
      simDay
    );

    // Mock symptoms in simulator mode
    if (simDay >= 1 && simDay <= Number(periodLength)) {
      activeSymptoms = ['cramps', 'fatigue'];
    } else if (simDay > Number(cycleLength) - 4) {
      activeSymptoms = ['bloating', 'headache'];
    } else {
      activeSymptoms = [];
    }
  }

  // Get active phase details
  const currentPhase = activeCycleState?.phase || 'Follicular';

  // Dynamic daily insight content based on cycle phase (Stitch design card)
  const getDailyInsight = (phase) => {
    switch (phase) {
      case 'Menstrual':
        return {
          title: "Estrogen & Progesterone Low",
          desc: "Your body is entering self-care mode. Low hormones mean resting is highly productive. Focus on slow breathing, warm fluids, and light stretching."
        };
      case 'Follicular':
        return {
          title: "Estrogen Rising",
          desc: "Estrogen levels are steadily rising, bringing a welcome surge in mental sharpness. A wonderful day to kick off creative plans or higher-intensity workouts."
        };
      case 'Ovulatory':
        return {
          title: "Estrogen Peak",
          desc: "High estrogen levels today might make you feel more sociable and energetic. It's a great day for a high-intensity workout or community networking."
        };
      case 'Luteal':
        return {
          title: "Progesterone Domination",
          desc: "Progesterone is the dominant hormone now, calming your nervous system. Replace cardio workouts with strength/pilates blocks, and rest early."
        };
      default:
        return {
          title: "Wellness Synchronization",
          desc: "Understand your unique hormonal cycles. Log symptoms daily to receive phase-tailored nutritional and physiological updates."
        };
    }
  };

  const dailyInsight = getDailyInsight(currentPhase);

  // Generate Daily Checklist tasks
  const getActionPlanTasks = (phase) => {
    switch (phase) {
      case 'Menstrual':
        return [
          { id: 'm1', text: 'Steep a cup of warm ginger or chamomile infusion' },
          { id: 'm2', text: 'Complete 10 minutes of gentle yoga pelvic release stretches' },
          { id: 'm3', text: 'Rest with a warm heating pad to relax muscles' }
        ];
      case 'Follicular':
        return [
          { id: 'f1', text: 'Perform a moderate strength-training or cardio workout' },
          { id: 'f2', text: 'Add fermented fiber-rich greens to optimize estrogen metabolism' },
          { id: 'f3', text: 'Spend 15 minutes planning important creative tasks' }
        ];
      case 'Ovulatory':
        return [
          { id: 'o1', text: 'Increase water intake to at least 2.5 Liters' },
          { id: 'o2', text: 'Push yourself with a HIIT or high-impact training session' },
          { id: 'o3', text: 'Connect socially (estrogen peaks verbal and social clarity)' }
        ];
      case 'Luteal':
        return [
          { id: 'l1', text: 'Perform 20 minutes of steady-state Pilates or walk' },
          { id: 'l2', text: 'Enjoy a portion of dark chocolate to replenish magnesium' },
          { id: 'l3', text: 'Disconnect from digital screens 45 minutes before sleep' }
        ];
      default:
        return [
          { id: 'd1', text: 'Log water hydration levels' },
          { id: 'd2', text: 'Note sleep metrics' },
          { id: 'd3', text: 'Practice 5 minutes of mindful breathwork' }
        ];
    }
  };

  const actionTasks = getActionPlanTasks(currentPhase);

  // Persistence toggling
  const isTaskCompleted = (taskId) => {
    return todayLog.completedTasks?.includes(taskId);
  };

  const handleToggleTask = async (taskId) => {
    const isCompleted = isTaskCompleted(taskId);
    const newCompleted = isCompleted
      ? todayLog.completedTasks.filter(id => id !== taskId)
      : [...(todayLog.completedTasks || []), taskId];

    const updatedLog = {
      ...todayLog,
      completedTasks: newCompleted
    };

    handleSaveLog(updatedLog);
  };

  const remedies = getSymptomRemedies(activeSymptoms);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Welcome Greetings Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="font-display-lg" style={{ color: 'var(--text-primary)', margin: 0 }}>
            {getGreeting()}, {profile?.name || 'there'}.
          </h1>
          <p className="font-body-lg" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Here is your wellness overview for today.
          </p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          style={{
            background: 'rgba(147, 73, 60, 0.08)',
            border: '1px solid rgba(147, 73, 60, 0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-rose)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Configure Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Form (Toggleable Panel) */}
      {showSettings && (
        <form onSubmit={handleUpdateSettings} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="font-headline-md" style={{ color: 'var(--accent-rose)', margin: 0 }}>Configure Your Cycle</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>NAME</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>LAST PERIOD START DATE</label>
            <input 
              type="date" 
              value={lastPeriodDate} 
              onChange={e => setLastPeriodDate(e.target.value)} 
              required
              style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>CYCLE LENGTH (DAYS)</label>
              <input 
                type="number" 
                value={cycleLength} 
                onChange={e => setCycleLength(e.target.value)} 
                min="20" 
                max="45" 
                required
                style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>PERIOD LENGTH (DAYS)</label>
              <input 
                type="number" 
                value={periodLength} 
                onChange={e => setPeriodLength(e.target.value)} 
                min="3" 
                max="10" 
                required
                style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '8px' }} onClick={() => setShowSettings(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--accent-rose)', color: '#white' }} disabled={updatingSettings}>
              {updatingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Main Bento Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Cycle Overview (Large Bento Card - col-span-8) */}
        <div 
          className="glass-card" 
          style={{ 
            gridColumn: 'span 8', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: '24px',
            flexWrap: 'wrap'
          }}
        >
          {/* Radial aesthetic blur filter */}
          <div style={{
            position: 'absolute',
            top: 0, right: 0,
            width: '240px', height: '240px',
            background: 'var(--accent-coral)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            opacity: 0.18,
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          {/* Left part: Cycle Circle */}
          <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0, zIndex: 1, margin: '0 auto' }}>
            <CycleRing 
              cycleDay={activeCycleState?.cycleDay} 
              cycleLength={isSimulating ? Number(cycleLength) : profile?.averageCycleLength} 
              phase={currentPhase} 
            />
          </div>

          {/* Right part: Description */}
          <div style={{ flex: 1, zIndex: 1, minWidth: '220px' }}>
            <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', margin: 0 }}>
              {currentPhase === 'Ovulatory' ? 'Fertile Window' : `${currentPhase} Phase`}
            </h2>
            <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
              {currentPhase === 'Menstrual' && "Your uterine lining is shedding. Energy is low; cellular comfort is highly encouraged."}
              {currentPhase === 'Follicular' && "Estrogen builds. Stamina and physical energy are rising. Wonderful time to coordinate planning."}
              {currentPhase === 'Ovulatory' && "You are likely in your fertile window. Your energy and vitality levels peak today."}
              {currentPhase === 'Luteal' && "Progesterone dominates, inviting soft wind-down rhythms. Engage in low-impact movement."}
            </p>
            
            {/* Cycle stats chips row */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px 14px', flex: 1 }}>
                <span className="font-label-sm" style={{ color: 'var(--text-secondary)', display: 'block' }}>Next Period</span>
                <span className="font-label-md" style={{ color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {activeCycleState?.daysUntilNext} Days
                </span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px 14px', flex: 1 }}>
                <span className="font-label-sm" style={{ color: 'var(--text-secondary)', display: 'block' }}>Cycle Length</span>
                <span className="font-label-md" style={{ color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {isSimulating ? Number(cycleLength) : profile?.averageCycleLength} Days avg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Insight (Small Bento Card - col-span-4) */}
        <div 
          className="glass-card" 
          style={{ 
            gridColumn: 'span 4', 
            background: 'var(--accent-plum)', 
            color: 'white', 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lightbulb</span>
              <span className="font-label-md" style={{ fontWeight: '700', letterSpacing: '0.5px' }}>Daily Insight</span>
            </div>
            
            <h3 className="font-headline-md" style={{ marginTop: '16px', color: '#fff', fontSize: '1.25rem' }}>
              {dailyInsight.title}
            </h3>
            <p className="font-body-md" style={{ marginTop: '8px', opacity: 0.9, lineHeight: '1.4', fontSize: '0.88rem' }}>
              {dailyInsight.desc}
            </p>
          </div>

          <button 
            onClick={() => router.push('/insights')}
            style={{
              marginTop: '20px',
              background: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              color: 'var(--accent-plum)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.84rem',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.target.style.background = 'var(--bg-secondary)'}
            onMouseOut={e => e.target.style.background = 'white'}
          >
            Read More
          </button>
        </div>

        {/* Wellness Stats Row (col-span-12, grid of 3) */}
        <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '4px' }}>
          
          {/* Sleep Stats Card */}
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-sage)', marginBottom: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bedtime</span>
                <span className="font-label-md" style={{ fontWeight: 600 }}>Sleep</span>
              </div>
              <div className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: '1.45rem', fontWeight: 700 }}>
                {todayLog?.sleep ? `${todayLog.sleep}h 00m` : '-- hrs'}
              </div>
              <div className="font-label-sm" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                Goal: 8h
              </div>
            </div>
            
            {/* Green badge check indicator */}
            {todayLog?.sleep >= 7.5 ? (
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-sage)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center' }}>
                <Check size={18} strokeWidth={3} />
              </div>
            ) : (
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justify: 'center', border: '1px dashed var(--card-border)' }} />
            )}
          </div>

          {/* Mood Stats Card */}
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', marginBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mood</span>
                <span className="font-label-md" style={{ fontWeight: 600 }}>Mood</span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {todayLog?.mood ? (
                  <>
                    <span style={{ background: 'var(--accent-coral)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {todayLog.mood === 5 && 'Radiant'}
                      {todayLog.mood === 4 && 'Energetic'}
                      {todayLog.mood === 3 && 'Calm'}
                      {todayLog.mood === 2 && 'Sensitive'}
                      {todayLog.mood === 1 && 'Low Energy'}
                    </span>
                    {activeSymptoms.slice(0, 1).map(s => (
                      <span key={s} style={{ background: 'rgba(147, 73, 60, 0.08)', color: 'var(--accent-rose)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {s.replace('_', ' ')}
                      </span>
                    ))}
                  </>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No mood logged</span>
                )}
              </div>
            </div>

            <button 
              onClick={() => setIsLogOpen(true)}
              style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--card-border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justify: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.target.style.background = 'rgba(0,0,0,0.03)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              +
            </button>
          </div>

          {/* Hydration Stats Card */}
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justify: 'center' }} onClick={handleQuickWater} title="Click to log water +250ml" className="glass-card hover-glow cursor-pointer">
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', color: 'var(--accent-plum)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>water_drop</span>
                <span className="font-label-md" style={{ fontWeight: 600 }}>Hydration</span>
              </div>
              <span className="font-label-sm" style={{ fontWeight: 700 }}>
                {Math.round(todayWater / 250)} / 8 glasses
              </span>
            </div>
            
            {/* Progress line */}
            <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.04)', overflow: 'hidden', marginTop: '12px' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'var(--accent-sage)', 
                  width: `${Math.min(100, (todayWater / 2000) * 100)}%`,
                  transition: 'width 0.4s ease' 
                }} 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Simulator bar / presentation mode card */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '16px 20px', 
          background: 'rgba(250, 246, 255, 0.95)', 
          border: '1.5px solid rgba(142, 115, 178, 0.35)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-label-md" style={{ color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
            <Eye size={16} />
            Presentation Simulator Mode
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={isSimulating} 
              onChange={e => setIsSimulating(e.target.checked)} 
              style={{ accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
            />
            Enable Simulator
          </label>
        </div>

        {isSimulating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Adjust cycle days to preview phase-syncing features:</span>
              <strong>Day {simDay} of {cycleLength}</strong>
            </div>
            <input 
              type="range" 
              min="1" 
              max={cycleLength} 
              value={simDay} 
              onChange={e => setSimDay(Number(e.target.value))} 
              style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'ew-resize', height: '6px', background: 'rgba(142, 115, 178, 0.2)', borderRadius: '3px', outline: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Remedies & Action Checklists Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* Smart Daily Action Plan (Checklist) */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
            <h3 className="font-headline-md" style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-rose)' }} />
              Daily Action Plan
            </h3>
            <span style={{ fontSize: '0.72rem', background: 'rgba(74, 101, 78, 0.1)', color: 'var(--accent-sage)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
              {currentPhase} Phase
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {actionTasks.map((task) => {
              const isChecked = isTaskCompleted(task.id);
              return (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isChecked ? 'rgba(74, 101, 78, 0.04)' : 'rgba(0,0,0,0.01)',
                    border: isChecked ? '1px solid rgba(74, 101, 78, 0.12)' : '1px solid rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ color: isChecked ? 'var(--accent-sage)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <span className="font-body-md" style={{ 
                    fontSize: '0.86rem', 
                    color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    fontWeight: isChecked ? '400' : '500'
                  }}>
                    {task.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comfort Remedies Board */}
        <div className="glass-card" style={{ padding: '20px', minHeight: '210px' }}>
          <h3 className="font-headline-md" style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '12px' }}>
            <HeartHandshake size={18} style={{ color: 'var(--accent-rose)' }} />
            Symptom Remedies
          </h3>

          {remedies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {remedies.map((remedy) => (
                <div key={remedy.symptom} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: '700', color: 'var(--accent-rose)' }}>
                    <AlertCircle size={14} />
                    <span>{remedy.symptom} Comfort Care</span>
                  </div>
                  <p className="font-body-md" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {remedy.solution}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', height: '120px', color: 'var(--text-muted)', textAlign: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', opacity: 0.5 }}>spa</span>
              <p className="font-body-md" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                No active discomfort symptoms logged. Your bio-energy levels are stabilized.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        className="quick-log-trigger"
        onClick={() => setIsLogOpen(true)}
        aria-label="Open Log Drawer"
      >
        +
      </button>

      {/* Log Modal */}
      <LogModal 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        onSave={handleSaveLog}
        initialData={todayLog}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          fetchData();
        }}
      />
      
      <style jsx global>{`
        .hover-glow:hover {
          box-shadow: 0 8px 24px rgba(147, 73, 60, 0.08);
          border-color: rgba(147, 73, 60, 0.28);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        @media (max-width: 860px) {
          /* Wrap grid cells on small tablets */
          div[style*="grid-template-columns: repeat(12"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridColumn: span 8"],
          div[style*="gridColumn: span 4"],
          div[style*="gridColumn: span 12"] {
            grid-column: span 12 !important;
          }
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
