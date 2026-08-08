

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, RefreshCw, Eye, Sparkles, AlertCircle, HeartHandshake, CheckSquare, Square, Check } from 'lucide-react';
import CycleRing from '../components/CycleRing';
import LogModal from '../components/LogModal';
import OnboardingModal from '../components/OnboardingModal';
import PersonalChatbot from '../components/PersonalChatbot';
import { useToast } from '../components/ToastProvider';
import { calculateCycleState, getSymptomRemedies } from '../lib/cycleCalculator';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Profile Settings State
  const [name, setName] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Inline Log Form Draft State
  const [draftFlow, setDraftFlow] = useState(0);
  const [draftMood, setDraftMood] = useState(0);
  const [draftSymptoms, setDraftSymptoms] = useState([]);
  const [draftWater, setDraftWater] = useState('');
  const [draftSleep, setDraftSleep] = useState('');
  const [isSavingLog, setIsSavingLog] = useState(false);

  // Presentation Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simDay, setSimDay] = useState(1);

  // Fetch all dashboard data
  const fetchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/insights`);
      const json = await res.json();
      setData(json);
      
      // Read stored user from localStorage first (set via Navigation inline edit or Register)
      let localUserName = '';
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          localUserName = userObj.name || '';
        }
      } catch {}

      if (json.profile) {
        setName(localUserName || json.profile.name || '');
        setLastPeriodDate(json.profile.lastPeriodDate || '');
        setCycleLength(json.profile.averageCycleLength || 28);
        setPeriodLength(json.profile.periodLength || 5);
      } else if (localUserName) {
        setName(localUserName);
      }

      // Fetch logs
      const logsRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logs`);
      const logsJson = await logsRes.json();
      setLogs(logsJson);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayL = logsJson.find(l => l.date === todayStr);
      if (todayL) {
        setDraftFlow(todayL.flow || 0);
        setDraftMood(todayL.mood || 0);
        setDraftSymptoms(todayL.symptoms || []);
        setDraftWater(todayL.water ? String(todayL.water) : '');
        setDraftSleep(todayL.sleep ? String(todayL.sleep) : '');
      }
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
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, logs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isSimulating', isSimulating ? 'true' : 'false');
      localStorage.setItem('simulationDay', simDay.toString());
    }
  }, [isSimulating, simDay]);

  // Save log entry
  const handleSaveLog = async (logData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logs`, {
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
        const resInsights = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/insights`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profile`, {
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
        <style>{`
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
  const todayLog = logs.find(l => l.date === todayStr) || null;
  const todayWater = todayLog ? (todayLog.water || 0) : 0;

  // Define active calculations based on lastPeriodDate, cycleLength, periodLength
  const effectiveLastPeriodDate = lastPeriodDate || profile?.lastPeriodDate;
  const effectiveCycleLength = isSimulating ? Number(cycleLength) : (profile?.averageCycleLength || Number(cycleLength) || 28);
  const effectivePeriodLength = isSimulating ? Number(periodLength) : (profile?.periodLength || Number(periodLength) || 5);

  let activeCycleState = calculateCycleState(
    effectiveLastPeriodDate,
    effectiveCycleLength,
    effectivePeriodLength,
    new Date(),
    isSimulating ? simDay : null
  );

  let activeSymptoms = todayLog?.symptoms || [];

  if (isSimulating) {
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

  // Generate Dynamic Daily Action Plan recommendations (Simple friendly guidance)
  const getActionPlanTasks = (phase, log) => {
    const recommendations = [];
    const waterGlasses = log ? Math.round((log.water || 0) / 250) : 0;
    const sleepHrs = log ? (log.sleep || 0) : 0;
    const symptomsList = log ? (log.symptoms || []) : [];

    // 1. Water Guidance
    if (waterGlasses === 0) {
      recommendations.push({ icon: '💧', text: 'Drink at least 8 glasses (2 Liters) of water today to keep your body hydrated.' });
    } else if (waterGlasses < 8) {
      recommendations.push({ icon: '💧', text: `Drink ${8 - waterGlasses} more glasses of water. Staying hydrated reduces cramps and fatigue.` });
    } else {
      recommendations.push({ icon: '🎉', text: 'Great job! You have reached your daily hydration goal (2 Liters).' });
    }

    // 2. Sleep Guidance
    if (sleepHrs === 0) {
      recommendations.push({ icon: '🌙', text: 'Aim for at least 7 to 8 hours of restful sleep tonight.' });
    } else if (sleepHrs < 7) {
      recommendations.push({ icon: '⚠️', text: 'Sleep was a bit low. Take a 20-minute power rest this afternoon or sleep early tonight.' });
    } else {
      recommendations.push({ icon: '✨', text: 'Great sleep! This will keep your energy and mood balanced throughout the day.' });
    }

    // 3. Symptom & Phase Guidance
    if (symptomsList.includes('cramps')) {
      recommendations.push({ icon: '☕', text: 'For cramps: Sip warm ginger-jaggery tea and use a hot water heating pad.' });
    } else if (phase === 'Follicular') {
      recommendations.push({ icon: '✨', text: 'Energy Phase: Excellent day to start new tasks and stay active.' });
    } else if (phase === 'Ovulatory') {
      recommendations.push({ icon: '🌟', text: 'Peak Energy: Your mood and stamina are at their highest today. Great for workouts!' });
    } else {
      recommendations.push({ icon: '🍵', text: 'Luteal Phase: Avoid late caffeine, eat light meals, and rest early.' });
    }

    return recommendations;
  };

  const actionTasks = getActionPlanTasks(currentPhase, todayLog);

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
            {getGreeting()}, {name || profile?.name || 'there'}.
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

      {/* Prominent Top Interactive AI Assistant Banner */}
      <div 
        className="glass-card animated-bento-card"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 73, 60, 0.09) 0%, rgba(74, 101, 78, 0.08) 100%)',
          border: '1.5px solid rgba(147, 73, 60, 0.25)',
          padding: '18px 24px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(147, 73, 60, 0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-rose) 0%, #7a3a2e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 14px rgba(147, 73, 60, 0.3)',
                position: 'relative'
              }}
            >
              <Sparkles size={24} color="#ffd700" />
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', border: '2px solid white' }}></span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  AuraBot Personal Health Assistant
                </h3>
                <span style={{ fontSize: '0.7rem', background: 'rgba(74, 101, 78, 0.15)', color: 'var(--accent-sage)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Active AI
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Ask anything right here about your <strong>{activeCycleState?.phase || 'Follicular'} Phase</strong>, cramp remedies, or water goals!
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/chatbot')}
            style={{
              background: 'linear-gradient(135deg, var(--accent-rose) 0%, #7a3a2e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 22px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(147, 73, 60, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>Open AI Chat Page →</span>
            <Sparkles size={16} color="#ffd700" />
          </button>
        </div>
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

      {/* Main Bento Grid / Vertical Flow Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* TOP HERO: Cycle Overview Ring Card */}
        <div 
          className="glass-card animated-bento-card hero-cycle-card" 
          style={{ 
            width: '100%',
            padding: '32px', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: '32px',
            flexWrap: 'wrap',
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(147, 73, 60, 0.08)'
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
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(147, 73, 60, 0.08)', border: '1px solid rgba(147, 73, 60, 0.18)', borderRadius: '10px', padding: '10px 14px', flex: '1 1 140px' }}>
                <span className="font-label-sm" style={{ color: 'var(--accent-rose)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📅</span> Expected Period
                </span>
                <span className="font-label-md" style={{ color: 'var(--text-primary)', fontWeight: '800', marginTop: '2px', display: 'block', fontSize: '0.95rem' }}>
                  {(() => {
                    const lpd = lastPeriodDate || profile?.lastPeriodDate;
                    if (!lpd) return 'Not set';
                    const avgLen = isSimulating ? Number(cycleLength) : (profile?.averageCycleLength || 28);
                    
                    // Parse YYYY-MM-DD explicitly to prevent UTC timezone offsets
                    const parts = String(lpd).split('T')[0].split('-');
                    if (parts.length < 3) return lpd;
                    
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    
                    const expectedDate = new Date(year, month, day + avgLen);
                    return expectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  })()}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--accent-rose)', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                  In {activeCycleState?.daysUntilNext} days
                </span>
              </div>

              <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '10px 14px', flex: '1 1 110px' }}>
                <span className="font-label-sm" style={{ color: 'var(--text-secondary)', display: 'block' }}>Cycle Length</span>
                <span className="font-label-md" style={{ color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {isSimulating ? Number(cycleLength) : profile?.averageCycleLength} Days avg
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Standard
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Insight (Sequential Scroll Card) */}
        <div 
          className="glass-card daily-insight-animated-card scroll-reveal" 
          style={{ 
            width: '100%',
            background: 'linear-gradient(135deg, #7c3a4d 0%, #4a2840 50%, #93493c 100%)', 
            color: '#ffffff', 
            padding: '28px 32px', 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            borderRadius: '24px',
            boxShadow: '0 12px 30px rgba(124, 58, 77, 0.35)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/insights')}
        >
          {/* Animated Background Shimmer Glow */}
          <div className="insight-card-glow" />

          {/* Floating Sparkle Icon */}
          <div style={{ position: 'relative', zIndex: 2, flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
                <Sparkles size={16} style={{ color: '#ffb4a7', filter: 'drop-shadow(0 0 4px rgba(255,180,167,0.8))' }} />
                <span className="font-label-md" style={{ fontWeight: '700', letterSpacing: '0.6px', color: '#ffffff', fontSize: '0.78rem', textTransform: 'uppercase' }}>Daily Insight</span>
              </div>
            </div>
            
            <h3 className="font-headline-md" style={{ marginTop: '8px', color: '#ffffff', fontSize: '1.3rem', fontWeight: '700', lineHeight: 1.3 }}>
              {dailyInsight.title}
            </h3>
            <p className="font-body-md" style={{ marginTop: '6px', color: 'rgba(255, 255, 255, 0.92)', lineHeight: '1.55', fontSize: '0.9rem', fontWeight: '500' }}>
              {dailyInsight.desc}
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate('/insights'); }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #ffe9e4 100%)',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 24px',
                color: '#7c3a4d',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <span>Explore Guidance</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </div>
        </div>

        {/* INLINE ANIMATED WELLNESS LOG CARD (Clean Bento Format) */}
        <div 
          className="glass-card animated-bento-card scroll-reveal" 
          style={{ 
            width: '100%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 245, 243, 0.95) 100%)', 
            border: '1.5px solid rgba(147, 73, 60, 0.22)',
            borderRadius: '24px',
            padding: '28px 32px',
            boxShadow: '0 12px 32px rgba(147, 73, 60, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--card-border)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(147, 73, 60, 0.1)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>edit_note</span>
              </div>
              <div>
                <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Daily Wellness Log</h3>
                <p className="font-body-md" style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Log your flow, mood & symptoms to update your daily guidance</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsLogOpen(true)}
              style={{
                background: 'var(--accent-rose)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(147, 73, 60, 0.25)'
              }}
            >
              <span>Full Log Form</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
            </button>
          </div>

          {/* Clean 2-column grid layout for all quick inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Quick Flow Selection */}
            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <span className="font-label-sm" style={{ fontWeight: 700, color: 'var(--accent-rose)', display: 'block', marginBottom: '8px' }}>
                💧 Menstrual Flow
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { val: 0, label: 'None' },
                  { val: 1, label: 'Light' },
                  { val: 2, label: 'Medium' },
                  { val: 3, label: 'Heavy' },
                ].map((item) => {
                  const isActive = draftFlow === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDraftFlow(isActive ? 0 : item.val)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: isActive ? '1.5px solid var(--accent-rose)' : '1px solid var(--card-border)',
                        background: isActive ? 'var(--accent-rose)' : 'var(--bg-secondary)',
                        color: isActive ? 'white' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Mood Selection */}
            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <span className="font-label-sm" style={{ fontWeight: 700, color: 'var(--accent-rose)', display: 'block', marginBottom: '8px' }}>
                😊 Today's Mood
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { score: 1, icon: '😔' },
                  { score: 2, icon: '😢' },
                  { score: 3, icon: '😐' },
                  { score: 4, icon: '😊' },
                  { score: 5, icon: '🤩' },
                ].map((item) => {
                  const isActive = draftMood === item.score;
                  return (
                    <button
                      key={item.score}
                      type="button"
                      onClick={() => setDraftMood(isActive ? 0 : item.score)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: isActive ? '2px solid var(--accent-rose)' : '1px solid var(--card-border)',
                        background: isActive ? 'rgba(147, 73, 60, 0.15)' : 'var(--bg-secondary)',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        transform: isActive ? 'scale(1.15)' : 'none'
                      }}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Water Direct Input */}
            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="font-label-sm" style={{ fontWeight: 700, color: '#0284c7', display: 'block' }}>
                💧 Water Intake Today (ml)
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  step="250"
                  min="0"
                  max="5000"
                  value={draftWater}
                  onChange={(e) => setDraftWater(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--card-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ml</span>
              </div>
            </div>

            {/* Quick Sleep Direct Input */}
            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="font-label-sm" style={{ fontWeight: 700, color: 'var(--accent-sage)', display: 'block' }}>
                🌙 Hours of Sleep Logged
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="e.g. 7.5"
                  step="0.5"
                  min="0"
                  max="24"
                  value={draftSleep}
                  onChange={(e) => setDraftSleep(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--card-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>hours</span>
              </div>
            </div>

            {/* Quick Symptoms Selection */}
            <div style={{ gridColumn: '1 / -1', background: 'var(--bg-primary)', padding: '14px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <span className="font-label-sm" style={{ fontWeight: 700, color: 'var(--accent-rose)', display: 'block', marginBottom: '8px' }}>
                🩹 Discomfort Symptoms Log
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'cramps', label: '⚡ Cramps' },
                  { id: 'bloating', label: '🎈 Bloating' },
                  { id: 'headache', label: '🤕 Headache' },
                  { id: 'fatigue', label: '😴 Fatigue' },
                  { id: 'back_pain', label: '🦴 Back Pain' },
                  { id: 'acne', label: '✨ Acne' },
                  { id: 'mood_swings', label: '🌊 Mood Swings' },
                  { id: 'cravings', label: '🍫 Cravings' },
                  { id: 'nausea', label: '🤢 Nausea' },
                  { id: 'breast_tenderness', label: '🌸 Sensitivity' },
                ].map((item) => {
                  const isSelected = draftSymptoms.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDraftSymptoms(prev => 
                          isSelected ? prev.filter(s => s !== item.id) : [...prev, item.id]
                        );
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '16px',
                        border: isSelected ? '1.5px solid var(--accent-rose)' : '1px solid var(--card-border)',
                        background: isSelected ? 'rgba(147, 73, 60, 0.12)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--accent-rose)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* CONFIRM & SAVE BUTTON AT BOTTOM */}
          <div style={{ marginTop: '8px', borderTop: '1px dashed var(--card-border)', paddingTop: '16px' }}>
            <button
              onClick={async () => {
                setIsSavingLog(true);
                const dateStr = new Date().toISOString().split('T')[0];
                const logPayload = {
                  date: dateStr,
                  flow: Number(draftFlow),
                  mood: Number(draftMood),
                  symptoms: draftSymptoms,
                  water: Number(draftWater) || 0,
                  sleep: Number(draftSleep) || 0,
                  completedTasks: todayLog?.completedTasks || []
                };
                await handleSaveLog(logPayload);
                setIsSavingLog(false);
              }}
              disabled={isSavingLog}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--accent-rose) 0%, #7c3a4d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 20px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(147, 73, 60, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Check size={20} strokeWidth={3} />
              <span>{isSavingLog ? 'Saving Your Log...' : 'Confirm & Save Daily Log'}</span>
            </button>
          </div>
        </div>

        {/* Wellness Stats Row (Dynamic Smart Feedback Cards) */}
        <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '4px' }}>
          
          {/* Sleep Smart Feedback Card */}
          <div className="glass-card animated-bento-card scroll-reveal" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-sage)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bedtime</span>
                  <span className="font-label-md" style={{ fontWeight: 700 }}>Sleep Analysis</span>
                </div>
                {todayLog?.sleep && todayLog.sleep >= 8 && (
                  <span style={{ background: 'var(--accent-sage)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>Optimal</span>
                )}
              </div>

              <div className="font-headline-md" style={{ color: 'var(--text-primary)', fontSize: '1.45rem', fontWeight: 800 }}>
                {todayLog?.sleep && todayLog.sleep > 0 ? `${todayLog.sleep} hours` : 'Not logged yet'}
              </div>
            </div>

            <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {(() => {
                const s = todayLog?.sleep || 0;
                if (s === 0) return '👉 Log your sleep hours above to see recommendations.';
                if (s < 7) return `⚠️ Sleep is low. ${(8 - s).toFixed(1)} more hours recommended tonight. Rest early.`;
                if (s >= 7 && s <= 9) return `✅ Optimal Sleep! Your energy levels will stay high today.`;
                return `😴 Sleep logged (${s}h) is above average. Stay gently active today.`;
              })()}
            </div>
          </div>

          {/* Mood Smart Feedback Card */}
          <div className="glass-card animated-bento-card scroll-reveal" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', marginBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mood</span>
                <span className="font-label-md" style={{ fontWeight: 700 }}>Mood & Energy Status</span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {todayLog?.mood && todayLog.mood > 0 ? (
                  <span style={{ background: 'rgba(147, 73, 60, 0.12)', color: 'var(--accent-rose)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.86rem', fontWeight: 700 }}>
                    {todayLog.mood === 5 && '🤩 Radiant & High Energy'}
                    {todayLog.mood === 4 && '😊 Energetic & Positive'}
                    {todayLog.mood === 3 && '😐 Calm & Balanced'}
                    {todayLog.mood === 2 && '😢 Sensitive / Emotional'}
                    {todayLog.mood === 1 && '😔 Low Energy / Tired'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Mood not recorded today</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {(() => {
                const m = todayLog?.mood || 0;
                if (m === 0) return '👉 Select your mood above for personalized wellness tips.';
                if (m <= 2) return `🌸 Rest & Self-care mode: Keep workload light and enjoy warm fluids.`;
                if (m === 3) return `🌿 Balanced state: Continue your steady daily routine.`;
                return `🚀 High Energy: Great day for creative work or an active workout!`;
              })()}
            </div>
          </div>

          {/* Hydration Smart Feedback Card */}
          <div className="glass-card animated-bento-card scroll-reveal" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', color: '#0284c7', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>water_drop</span>
                  <span className="font-label-md" style={{ fontWeight: 700 }}>Hydration Feedback</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                  {Math.round(todayWater / 250)} / 8 glasses
                </span>
              </div>
              
              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden', marginTop: '6px' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: todayWater > 3000 ? '#eab308' : 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)', 
                    width: `${Math.min(100, (todayWater / 2000) * 100)}%`,
                    transition: 'width 0.4s ease' 
                  }} 
                />
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {(() => {
                if (todayWater === 0) return '👉 Enter your water intake (in ml) above to log.';
                if (todayWater < 2000) {
                  const remMl = 2000 - todayWater;
                  const remGlasses = Math.ceil(remMl / 250);
                  return `💧 Hydration tip: Drink ${remMl} ml (${remGlasses} glasses) more to reach your daily 2L goal.`;
                }
                if (todayWater >= 2000 && todayWater <= 3000) {
                  return `🎉 Perfect Hydration! Daily target achieved (2.0 Liters).`;
                }
                const extraMl = todayWater - 3000;
                return `⚠️ Hydration Notice: You logged ${extraMl} ml over the standard 2L target. Take a gentle pause.`;
              })()}
            </div>
          </div>
        </div>

      </div>



      {/* Remedies & Action Checklists Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* Smart Daily Action Plan (Checklist) */}
        <div className="glass-card animated-bento-card scroll-reveal" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
            {actionTasks.map((rec, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid var(--card-border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>{rec.icon}</span>
                <span className="font-body-md" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '600', lineHeight: '1.45' }}>
                  {rec.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comfort Remedies Board */}
        <div className="glass-card animated-bento-card scroll-reveal" style={{ padding: '20px', minHeight: '210px' }}>
          <h3 className="font-headline-md" style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '12px' }}>
            <HeartHandshake size={18} style={{ color: 'var(--accent-rose)' }} />
            Symptom Remedies
          </h3>

          {remedies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {remedies.map((remedy) => (
                <div key={remedy.symptom} style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-rose)', marginBottom: '8px' }}>
                    {remedy.symptom} Natural Remedies
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {remedy.remedies.map((remText, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.45', fontWeight: '500' }}>
                        • {remText.split(': ').map((part, pIdx) => pIdx === 0 ? <strong key={pIdx} style={{ color: 'var(--accent-rose)' }}>{part.replace(/\*\*/g, '')}: </strong> : part)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', height: '140px', color: 'var(--text-muted)', textAlign: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--accent-rose)' }}>spa</span>
              <p className="font-body-md" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                No physical discomfort logged for today 🎉
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Select a symptom in the log form above to view personalized natural Desi Nuskhe remedies!
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
        title="Quick Log Entry"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>edit_note</span>
      </button>

      {/* Log Modal */}
      <LogModal 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        onSave={handleSaveLog}
        initialData={todayLog}
      />


      
      <style>{`
        /* Hero Cycle Card (Smooth Lift) */
        .hero-cycle-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important;
          will-change: transform;
        }
        .hero-cycle-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 32px rgba(147, 73, 60, 0.14) !important;
          border-color: rgba(147, 73, 60, 0.3) !important;
        }

        /* Generic Animated Bento Cards (Sleep, Mood, Hydration, Action Plan, Remedies) */
        .animated-bento-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important;
          will-change: transform;
        }
        .animated-bento-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 10px 24px rgba(147, 73, 60, 0.12) !important;
          border-color: rgba(147, 73, 60, 0.32) !important;
        }

        /* Daily Insight Card (Vibrant Wine Card Lift) */
        .daily-insight-animated-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease !important;
          will-change: transform;
        }
        .daily-insight-animated-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 16px 36px rgba(124, 58, 77, 0.45) !important;
        }
        .insight-card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,180,167,0.2) 0%, transparent 60%);
          animation: glowRotate 8s linear infinite;
          pointer-events: none;
        }
        @keyframes glowRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hover-glow:hover {
          box-shadow: 0 8px 24px rgba(147, 73, 60, 0.08);
          border-color: rgba(147, 73, 60, 0.28);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        @media (max-width: 860px) {
          .daily-insight-animated-card {
            transform: none !important;
            animation: none !important;
          }
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


