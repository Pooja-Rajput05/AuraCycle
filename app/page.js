'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Settings, GlassWater, Moon, RefreshCw, Sparkles, Smile, Flame, CheckSquare, Square, BellRing } from 'lucide-react';
import CycleRing from '../components/CycleRing';
import LogModal from '../components/LogModal';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings Form State
  const [name, setName] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Smart Daily Action Plan Checked Items (Stored in state)
  const [checkedActions, setCheckedActions] = useState({});

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
    fetchData();
  }, []);

  // Save log entry
  const handleSaveLog = async (logData) => {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        fetchData(); // reload dashboard
      }
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  // Quick water log (+250ml for today)
  const handleQuickWater = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr) || {
      date: todayStr,
      water: 0,
      flow: 0,
      symptoms: [],
      mood: 3,
      sleep: 7
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
        fetchData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Toggle Action Plan Checkbox
  const toggleAction = (actionId) => {
    setCheckedActions(prev => ({
      ...prev,
      [actionId]: !prev[actionId]
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--accent-rose)', animation: 'spin 2s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Gathering your aura wellness metrics...</p>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const { profile, cycleState } = data || {};
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);

  // Generate Smart Notifications / Nudges based on active phase
  const getSmartNotification = (phase) => {
    switch (phase) {
      case 'Menstrual':
        return {
          title: "Period Care Nudge",
          message: "Your body is working hard. Support it with warm chamomile infusion, prioritize at least 8 hours of sleep, and keep your space cozy to ease menstrual cramps.",
          color: 'var(--phase-menstrual)'
        };
      case 'Follicular':
        return {
          title: "Energy Shift Nudge",
          message: "Estrogen is climbing, raising your focus and metabolism! Great window for scheduling cardios, exploring new ideas, and eating fiber-rich salads.",
          color: 'var(--phase-follicular)'
        };
      case 'Ovulatory':
        return {
          title: "Fertility window Nudge",
          message: "You're likely entering your fertile window today or tomorrow. Consider increasing hydration, prioritizing quality sleep, and doing some strength training.",
          color: 'var(--phase-ovulatory)'
        };
      case 'Luteal':
        return {
          title: "Pre-Period Cozy Nudge",
          message: "Progesterone is high, preparing your body to slow down. Wind down screens 1 hour early, stock up on magnesium (dark chocolate helps!), and do low-intensity Pilates.",
          color: 'var(--phase-luteal)'
        };
      default:
        return {
          title: "Aura Nudge",
          message: "Log your mood and symptoms to get customized insights tailored to your hormone cycle.",
          color: 'var(--accent-rose)'
        };
    }
  };

  const smartNudge = getSmartNotification(cycleState?.phase);

  // Generate Action Plan Tasks based on phase
  const getActionPlanTasks = (phase) => {
    switch (phase) {
      case 'Menstrual':
        return [
          { id: 'm1', text: 'Infuse warm raspberry leaf or ginger tea' },
          { id: 'm2', text: 'Complete 10 minutes of gentle yoga or pelvic stretching' },
          { id: 'm3', text: 'Log flow level and note any cramps' }
        ];
      case 'Follicular':
        return [
          { id: 'f1', text: 'Complete a moderate strength or cardio workout' },
          { id: 'f2', text: 'Add fermented foods (kimchi/yogurt) to support digestion' },
          { id: 'f3', text: 'Spend 15 minutes planning key tasks for the cycle' }
        ];
      case 'Ovulatory':
        return [
          { id: 'o1', text: 'Increase water intake to at least 2.5 Liters' },
          { id: 'o2', text: 'Perform a high-energy HIIT or running routine' },
          { id: 'o3', text: 'Connect socially (ovulation peaks verbal communication)' }
        ];
      case 'Luteal':
        return [
          { id: 'l1', text: 'Slow down with a 20-minute restorative walk' },
          { id: 'l2', text: 'Eat a magnesium-rich snack (dark chocolate/banana)' },
          { id: 'l3', text: 'Disconnect from screens 45 minutes before sleep' }
        ];
      default:
        return [
          { id: 'd1', text: 'Log hydration level' },
          { id: 'd2', text: 'Note sleep duration' },
          { id: 'd3', text: 'Practice 5 minutes of mindful breathing' }
        ];
    }
  };

  const actionTasks = getActionPlanTasks(cycleState?.phase);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Panel */}
      <div className="flex-between">
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '1px' }}>YOUR WELLNESS COMPANION</span>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            AuraCycle
          </h1>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          style={{
            background: 'rgba(232, 165, 152, 0.1)',
            border: '1px solid rgba(232, 165, 152, 0.25)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Form (Toggleable Panel) */}
      {showSettings && (
        <form onSubmit={handleUpdateSettings} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', fontFamily: 'var(--font-serif)', color: 'var(--accent-plum)' }}>Configure Your Cycle</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>NAME</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(232, 165, 152, 0.3)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>LAST PERIOD START DATE</label>
            <input 
              type="date" 
              value={lastPeriodDate} 
              onChange={e => setLastPeriodDate(e.target.value)} 
              required
              style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(232, 165, 152, 0.3)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CYCLE LENGTH (DAYS)</label>
              <input 
                type="number" 
                value={cycleLength} 
                onChange={e => setCycleLength(e.target.value)} 
                min="20" 
                max="45" 
                required
                style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(232, 165, 152, 0.3)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>PERIOD LENGTH (DAYS)</label>
              <input 
                type="number" 
                value={periodLength} 
                onChange={e => setPeriodLength(e.target.value)} 
                min="3" 
                max="10" 
                required
                style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(232, 165, 152, 0.3)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSettings(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={updatingSettings}>
              {updatingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Smart Notifications Feed Card */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px 20px', 
          borderLeft: `5px solid ${smartNudge.color}`,
          display: 'flex', 
          gap: '14px',
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 24px rgba(135, 100, 110, 0.04)'
        }}
      >
        <div style={{ 
          background: `${smartNudge.color}15`, 
          borderRadius: '50%', 
          width: '42px', 
          height: '42px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: smartNudge.color, 
          flexShrink: 0 
        }}>
          <BellRing size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: smartNudge.color }}>
              Smart Nudge
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{smartNudge.title}</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4' }}>
            {smartNudge.message}
          </p>
        </div>
      </div>

      {/* Main Cycle Ring Dashboard */}
      <div className="glass-panel" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CycleRing 
          cycleDay={cycleState?.cycleDay} 
          cycleLength={profile?.averageCycleLength} 
          phase={cycleState?.phase} 
          daysUntilNext={cycleState?.daysUntilNext} 
        />
      </div>

      {/* Smart Daily Action Plan Checklist */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="flex-between" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-rose)' }} />
            Smart Daily Action Plan
          </h3>
          <span style={{ fontSize: '0.75rem', background: 'rgba(139, 176, 154, 0.12)', color: 'var(--accent-sage)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
            {cycleState?.phase} Phase
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {actionTasks.map((task) => {
            const isChecked = !!checkedActions[task.id];
            return (
              <div 
                key={task.id}
                onClick={() => toggleAction(task.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isChecked ? 'rgba(139, 176, 154, 0.05)' : 'rgba(0,0,0,0.01)',
                  border: isChecked ? '1px solid rgba(139, 176, 154, 0.15)' : '1px solid rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ color: isChecked ? 'var(--accent-sage)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <span style={{ 
                  fontSize: '0.9rem', 
                  color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  transition: 'all 0.2s',
                  fontWeight: isChecked ? '400' : '500'
                }}>
                  {task.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Trackers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Hydration Tracker */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-sage)' }}>
              <GlassWater size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Hydration</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{todayLog?.water || 0}ml</span>
          </div>
          <div>
            <div style={{ background: 'rgba(139, 176, 154, 0.1)', borderRadius: '6px', height: '6px', width: '100%', overflow: 'hidden' }}>
              <div style={{ background: 'var(--accent-sage)', height: '100%', width: `${Math.min(100, ((todayLog?.water || 0) / 2000) * 100)}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
          <button onClick={handleQuickWater} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', width: '100%', borderRadius: '8px', border: '1px solid rgba(139, 176, 154, 0.2)', color: 'var(--accent-sage)', background: 'rgba(139, 176, 154, 0.05)' }}>
            +250 ml Water
          </button>
        </div>

        {/* Wellness Summary (Mood & Sleep) */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smile size={18} />
            Wellness Log
          </span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Moon size={12} /> Sleep</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{todayLog?.sleep || '--'} hrs</span>
            </div>
            <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={12} /> Symptoms</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{todayLog?.symptoms?.length || 0} logged</span>
            </div>
          </div>

          <button onClick={() => setIsLogOpen(true)} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', width: '100%', borderRadius: '8px', marginTop: 'auto' }}>
            Update Log
          </button>
        </div>
      </div>

      {/* Floating Action Button (Log Modal) */}
      <button 
        className="quick-log-trigger"
        onClick={() => setIsLogOpen(true)}
        aria-label="Open Log Modal"
      >
        <Plus size={28} />
      </button>

      {/* Log Modal */}
      <LogModal 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        onSave={handleSaveLog}
        initialData={todayLog}
      />
    </div>
  );
}
