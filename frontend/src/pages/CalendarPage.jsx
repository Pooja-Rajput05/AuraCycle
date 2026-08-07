

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Heart, Droplets, Moon, Check, AlertCircle, FileText, Users, MessageCircle } from 'lucide-react';
import { getCalendarPredictions, calculateCycleState, getSymptomRemedies } from '../lib/cycleCalculator';
import { useToast } from '../components/ToastProvider';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  // Download Doctor Report PDF function
  const handleDownloadDoctorReport = () => {
    const reportWindow = window.open('', '_blank');
    const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const loggedSymptoms = logs.flatMap(l => l.symptoms || []);
    const symptomCounts = {};
    loggedSymptoms.forEach(s => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; });
    const topSymptomsStr = Object.keys(symptomCounts).length > 0 
      ? Object.entries(symptomCounts).map(([k, v]) => `${k.replace(/_/g, ' ')} (${v}x)`).join(', ')
      : 'No severe discomfort logged';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AuraCycle - Medical Summary Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #2d3748; background: #fff; }
            .header { border-bottom: 2px solid #93493c; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 26px; font-weight: bold; color: #93493c; }
            .badge { background: #fce7f3; color: #9d174d; padding: 6px 14px; borderRadius: 20px; font-weight: bold; font-size: 14px; }
            .section { background: #fdf8f6; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #f3d2cc; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
            .metric { background: #fff; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .metric-title { font-size: 12px; color: #718096; font-weight: bold; text-transform: uppercase; }
            .metric-val { font-size: 18px; color: #1a202c; font-weight: bold; margin-top: 4px; }
            .footer { margin-top: 40px; font-size: 12px; color: #a0aec0; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">🌸 AuraCycle Bio-Health Summary</div>
              <div style="font-size: 13px; color: 666;">Generated on: ${todayStr}</div>
            </div>
            <div class="badge">Gynecological Summary</div>
          </div>

          <div class="section">
            <h3 style="margin-top:0; color: #93493c;">👤 Patient Profile</h3>
            <div class="grid">
              <div class="metric"><div class="metric-title">Patient Name</div><div class="metric-val">${profile.name || 'User'}</div></div>
              <div class="metric"><div class="metric-title">Last Period Date</div><div class="metric-val">${profile.lastPeriodDate || 'N/A'}</div></div>
              <div class="metric"><div class="metric-title">Average Cycle Length</div><div class="metric-val">${profile.averageCycleLength || 28} Days</div></div>
              <div class="metric"><div class="metric-title">Average Period Length</div><div class="metric-val">${profile.periodLength || 5} Days</div></div>
            </div>
          </div>

          <div class="section">
            <h3 style="margin-top:0; color: #93493c;">📊 Logged Symptoms & Health Metrics</h3>
            <div class="grid">
              <div class="metric"><div class="metric-title">Total Days Logged</div><div class="metric-val">${logs.length} Days Recorded</div></div>
              <div class="metric"><div class="metric-title">Top Recurrent Symptoms</div><div class="metric-val" style="font-size: 14px;">${topSymptomsStr}</div></div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="background: #93493c; color: white; border: none; padding: 12px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 14px;">
              🖨️ Print / Save as PDF
            </button>
          </div>

          <div class="footer">
            AuraCycle Medical Summary • Intended for gynecological consultation & wellness tracking.
          </div>
        </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
    toast('Doctor PDF Summary Report Generated!', 'success');
  };
  
  // Form logging draft state
  const [selectedMood, setSelectedMood] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(0);
  const [selectedWater, setSelectedWater] = useState('');
  const [selectedSleep, setSelectedSleep] = useState('');
  const [selectedPads, setSelectedPads] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // WhatsApp Alert State
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');

  // Partner Sync State
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerRelation, setPartnerRelation] = useState('Partner');

  const handleSendWhatsappAlert = () => {
    if (!whatsappPhone || whatsappPhone.trim().length < 10) {
      toast('Please enter a valid 10-digit WhatsApp phone number!', 'error');
      return;
    }
    const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`🌸 AuraCycle Alert: Hey ${profile?.name || 'there'}! Your period is predicted in 2 days. Keep warm water, herbal tea & pads ready!`);
    window.open(`https://wa.me/91${cleanPhone}?text=${message}`, '_blank');
    toast('WhatsApp Period Alert sent successfully!', 'success');
    setShowWhatsappModal(false);
  };

  const handleSharePartnerSync = () => {
    if (!partnerPhone || partnerPhone.trim().length < 10) {
      toast('Please enter a valid 10-digit WhatsApp phone number!', 'error');
      return;
    }
    const cleanPhone = partnerPhone.replace(/[^0-9]/g, '');
    const todayState = calculateCycleState(profile.lastPeriodDate, profile.averageCycleLength, profile.periodLength);
    const message = encodeURIComponent(`🌸 AuraCycle Care Share for ${partnerRelation}:\n\nHey! ${profile?.name || 'Your loved one'} shared her bio-health status with you:\n\n• Current Phase: ${todayState.phase} (Day ${todayState.cycleDay})\n• Next Expected Period: ${todayState.daysUntilNext} days remaining\n• Care Note: ${todayState.phase === 'Menstrual' ? 'Period active. Extra care, warm tea & rest appreciated 💕' : 'All good & balanced! 💖'}`);
    
    window.open(`https://wa.me/91${cleanPhone}?text=${message}`, '_blank');
    toast(`Care Sync card shared with ${partnerRelation}!`, 'success');
    setShowPartnerModal(false);
  };

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchCalendarData = async () => {
    try {
      const profileRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profile`);
      const profileData = await profileRes.json();
      setProfile(profileData);

      const logsRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logs`);
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
      setSelectedMood(existingLog.mood || 0);
      setSelectedSymptoms(existingLog.symptoms || []);
      setSelectedFlow(existingLog.flow || 0);
      setSelectedWater(existingLog.water ? String(existingLog.water) : '');
      setSelectedSleep(existingLog.sleep ? String(existingLog.sleep) : '');
      setSelectedPads(existingLog.padsChanged || 0);
    } else {
      setSelectedMood(0);
      setSelectedSymptoms([]);
      setSelectedFlow(0);
      setSelectedWater('');
      setSelectedSleep('');
      setSelectedPads(0);
    }
  }, [selectedDate, logs]);

  // Saving logs handler
  const handleSaveLog = async () => {
    setIsSaving(true);
    const existingLog = logs.find(l => l.date === selectedDate) || {
      date: selectedDate,
      completedTasks: []
    };

    const newLog = {
      ...existingLog,
      date: selectedDate,
      mood: Number(selectedMood),
      symptoms: selectedSymptoms,
      flow: Number(selectedFlow),
      water: Number(selectedWater) || 0,
      sleep: Number(selectedSleep) || 0,
      padsChanged: Number(selectedPads) || 0
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (res.ok) {
        await fetchCalendarData();
        toast(`Wellness log saved for ${selectedDate}`, 'success');
      } else {
        const err = await res.json();
        toast(err.error || 'Failed to save log', 'error');
      }
    } catch (e) {
      console.error('Error saving log:', e);
    } finally {
      setIsSaving(false);
    }
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
        <p style={{ color: 'var(--text-secondary)' }}>Loading Cycle Calendar & Predictions...</p>
      </div>
    );
  }

  // Get predictions for up to 6 cycles out
  const predictions = getCalendarPredictions(
    profile.lastPeriodDate,
    profile.averageCycleLength,
    profile.periodLength,
    6
  );

  // Helper to map date status
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
  const selectedCycleState = calculateCycleState(
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

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedLog = logs.find(l => l.date === selectedDate);
  const selectedRemedies = getSymptomRemedies(selectedSymptoms);

  return (
    <div className="animate-fade-in font-body-md" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="font-label-sm" style={{ color: 'var(--accent-rose)', fontWeight: 700, letterSpacing: '0.06em' }}>CYCLE TRACKER & CALENDAR</span>
          <h1 className="font-display-lg" style={{ color: 'var(--text-primary)', margin: 0 }}>Menstrual & Bio-Health Calendar</h1>
          <p className="font-body-md" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Tap any date to log symptoms or check phase predictions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* 👫 FEATURE 4: Partner / Mom Care Sync Button (Soft Theme Pastel) */}
          <button
            onClick={() => setShowPartnerModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(236, 72, 153, 0.12)',
              color: '#db2777',
              border: '1.5px solid rgba(236, 72, 153, 0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Users size={16} />
            <span>Partner Sync</span>
          </button>

          {/* 📲 FEATURE 2: WhatsApp Alert Button (Soft Theme Pastel) */}
          <button
            onClick={() => setShowWhatsappModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(34, 197, 94, 0.12)',
              color: '#16a34a',
              border: '1.5px solid rgba(34, 197, 94, 0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <MessageCircle size={16} />
            <span>WhatsApp Alert</span>
          </button>

          {/* 📄 FEATURE 1: 1-Click Doctor PDF Report Button */}
          <button
            onClick={handleDownloadDoctorReport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(147, 73, 60, 0.12)',
              color: 'var(--accent-rose)',
              border: '1.5px solid rgba(147, 73, 60, 0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(147, 73, 60, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(147, 73, 60, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FileText size={16} />
            <span>Doctor Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Hero Wine Overview Card */}
      <div 
        className="glass-card animated-bento-card"
        style={{ 
          background: 'linear-gradient(135deg, #7c3a4d 0%, #4a2838 100%)', 
          color: 'white', 
          borderRadius: '24px', 
          padding: '24px 32px', 
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
            <Calendar size={18} style={{ color: '#ffd0d6' }} />
            <span style={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              SELECTED DATE: {selectedDate === todayStr ? 'Today' : selectedDate}
            </span>
          </div>
          <h2 className="font-headline-lg" style={{ color: '#fff', margin: 0, fontSize: '1.6rem' }}>
            Cycle Day {selectedCycleState.cycleDay} • {selectedCycleState.phase} Phase
          </h2>
          <p style={{ opacity: 0.9, margin: '6px 0 0', fontSize: '0.88rem', maxWidth: '640px', lineHeight: '1.5' }}>
            {selectedCycleState.phase === 'Menstrual' && "🌸 Period Phase: Focus on warm fluids, lower back rest, and light stretching."}
            {selectedCycleState.phase === 'Follicular' && "✨ Follicular Phase: Estrogen is rising! Energy, focus, and creativity are at their peak."}
            {selectedCycleState.phase === 'Ovulatory' && "🌟 Ovulatory Phase: Peak fertile window. Stamina and mood are naturally boosted."}
            {selectedCycleState.phase === 'Luteal' && "🍵 Luteal Phase: Wind-down time. Drink warm teas and prioritize 8-hour sleep."}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.74rem', opacity: 0.8, display: 'block', fontWeight: 600 }}>Conception Chance</span>
            <strong style={{ fontSize: '1rem', color: '#ffd0d6' }}>{selectedCycleState.conceptionChance}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Calendar Grid + Right Daily Log Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Left 6 columns: Compact Interactive Month Calendar */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-card animated-bento-card" style={{ padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '460px', margin: '0 auto', width: '100%' }}>
            
            {/* Month Header Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="font-headline-md" style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {monthNames[month]} {year}
              </h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={prevMonth} style={navBtnStyle} title="Previous Month">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextMonth} style={navBtnStyle} title="Next Month">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Weekdays Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--card-border)' }}>
              {weekdays.map((w, idx) => (
                <div key={idx} className="font-label-sm" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.74rem' }}>
                  {w}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center' }}>
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} style={{ padding: '4px', opacity: 0.1, fontSize: '0.75rem' }}>-</div>;
                }

                const isSelected = selectedDate === cell.dateStr;
                const isToday = cell.dateStr === todayStr;

                let cellBg = 'var(--bg-primary)';
                let textColor = 'var(--text-primary)';
                let border = '1px solid var(--card-border)';
                let badge = null;

                if (cell.type === 'menstrual-actual' || cell.type === 'menstrual') {
                  cellBg = 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)';
                  textColor = '#9d174d';
                  border = '1.5px solid #f472b6';
                  badge = '🩸';
                } else if (cell.type === 'fertile-peak') {
                  cellBg = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                  textColor = '#92400e';
                  border = '1.5px solid #f59e0b';
                  badge = '🌟';
                } else if (cell.type === 'fertile') {
                  cellBg = 'rgba(74, 101, 78, 0.08)';
                  textColor = 'var(--accent-sage)';
                  border = '1px solid rgba(74, 101, 78, 0.25)';
                }

                if (isSelected) {
                  border = '2px solid var(--accent-rose)';
                  cellBg = 'rgba(147, 73, 60, 0.12)';
                }

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    style={{
                      padding: '4px 0',
                      borderRadius: '12px',
                      aspectRatio: '1 / 1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justify: 'center',
                      position: 'relative',
                      background: cellBg,
                      color: textColor,
                      border: border,
                      fontWeight: isSelected || isToday ? '800' : '600',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 3px 8px rgba(147, 73, 60, 0.2)' : 'none'
                    }}
                  >
                    <span>{cell.dayNum}</span>
                    {badge && <span style={{ fontSize: '0.6rem', lineHeight: '1', marginTop: '1px' }}>{badge}</span>}
                    {cell.log && (
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-rose)', position: 'absolute', bottom: '3px' }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Visual Color Legend */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderTop: '1px solid var(--card-border)', paddingTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f472b6' }} />
                <span>Menstruation (Period)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                <span>Ovulation Peak</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-sage)' }} />
                <span>Fertile Window</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-rose)' }} />
                <span>Logged Day</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right 6 columns: Compact Interactive Logging & Remedies Panel */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Date Log Card */}
          <div className="glass-card animated-bento-card" style={{ padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '460px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <div>
                <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Log Details
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--accent-rose)', fontWeight: 700 }}>
                  {selectedDate === todayStr ? 'Today (Selected)' : selectedDate}
                </span>
              </div>
              <span style={{ background: 'rgba(147, 73, 60, 0.1)', color: 'var(--accent-rose)', padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                Day {selectedCycleState.cycleDay}
              </span>
            </div>

            {/* 1. Menstrual Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>💧 Menstrual Flow</span>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {[
                  { val: 0, label: 'None' },
                  { val: 1, label: 'Light' },
                  { val: 2, label: 'Medium' },
                  { val: 3, label: 'Heavy' },
                ].map(item => {
                  const isActive = selectedFlow === item.val;
                  return (
                    <button
                      key={item.val}
                      onClick={() => setSelectedFlow(isActive ? 0 : item.val)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: isActive ? '1.5px solid var(--accent-rose)' : '1px solid var(--card-border)',
                        background: isActive ? 'var(--accent-rose)' : 'var(--bg-secondary)',
                        color: isActive ? 'white' : 'var(--text-primary)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Today's Mood */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>😊 Mood Score</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { score: 1, icon: '😔' },
                  { score: 2, icon: '😢' },
                  { score: 3, icon: '😐' },
                  { score: 4, icon: '😊' },
                  { score: 5, icon: '🤩' },
                ].map(item => {
                  const isActive = selectedMood === item.score;
                  return (
                    <button
                      key={item.score}
                      onClick={() => setSelectedMood(isActive ? 0 : item.score)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: isActive ? '2px solid var(--accent-rose)' : '1px solid var(--card-border)',
                        background: isActive ? 'rgba(147, 73, 60, 0.15)' : 'var(--bg-secondary)',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Water & Sleep Input Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0284c7' }}>💧 Water (ml)</span>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={selectedWater}
                  onChange={e => setSelectedWater(e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-secondary)', fontSize: '0.78rem', fontWeight: 700 }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-sage)' }}>🌙 Sleep (hrs)</span>
                <input
                  type="number"
                  placeholder="e.g. 8"
                  value={selectedSleep}
                  onChange={e => setSelectedSleep(e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-secondary)', fontSize: '0.78rem', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* 4. Prominently Highlighted Pads / Cups Hygiene & Flow Card */}
            <div style={{ background: selectedPads >= 5 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(244, 114, 182, 0.1)', padding: '12px 14px', borderRadius: '16px', border: selectedPads >= 5 ? '1.5px solid #ef4444' : '1.5px solid var(--accent-rose)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-rose)', display: 'block' }}>🩸 Pads / Cups Changed Today</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>⏰ Change every 4–6 hrs for optimal hygiene</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                  <button
                    onClick={() => setSelectedPads(prev => Math.max(0, prev - 1))}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'rgba(147, 73, 60, 0.12)', color: 'var(--accent-rose)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, minWidth: '18px', textAlign: 'center', color: 'var(--accent-rose)' }}>{selectedPads}</span>
                  <button
                    onClick={() => {
                      const nextPads = selectedPads + 1;
                      setSelectedPads(nextPads);
                      if (nextPads >= 5) {
                        toast('⚠️ High Flow Warning: 5+ pads changed today! Make sure to stay hydrated & get extra rest.', 'error');
                      }
                    }}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--accent-rose)', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {selectedPads >= 5 && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>🚨</span>
                  <span><strong>Heavy Flow Notification:</strong> You have changed 5+ pads today (Menorrhagia risk). Drink iron-rich fluids & rest.</span>
                </div>
              )}
            </div>

            {/* 4. Symptoms Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-rose)' }}>🩹 Symptoms</span>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {[
                  { id: 'cramps', label: '⚡ Cramps' },
                  { id: 'bloating', label: '🎈 Bloating' },
                  { id: 'headache', label: '🤕 Headache' },
                  { id: 'fatigue', label: '😴 Fatigue' },
                  { id: 'back_pain', label: '🦴 Back Pain' },
                  { id: 'acne', label: '✨ Acne' },
                ].map(item => {
                  const isSelected = selectedSymptoms.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedSymptoms(prev =>
                          isSelected ? prev.filter(s => s !== item.id) : [...prev, item.id]
                        );
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        border: isSelected ? '1.5px solid var(--accent-rose)' : '1px solid var(--card-border)',
                        background: isSelected ? 'rgba(147, 73, 60, 0.12)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--accent-rose)' : 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSaveLog}
              disabled={isSaving}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--accent-rose) 0%, #7c3a4d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(147, 73, 60, 0.2)',
                marginTop: '2px'
              }}
            >
              <Check size={16} strokeWidth={3} />
              <span>{isSaving ? 'Saving...' : 'Save Log for Selected Date'}</span>
            </button>

          </div>

          {/* Selected Date Gharelu Nuskhe Remedies Card */}
          <div className="glass-card animated-bento-card" style={{ padding: '20px', borderRadius: '24px' }}>
            <h3 className="font-headline-md" style={{ fontSize: '1.05rem', margin: '0 0 12px', color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              🌿 Gharelu Remedies for {selectedDate}
            </h3>

            {selectedRemedies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedRemedies.map((remedy) => (
                  <div key={remedy.symptom} style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--accent-rose)', marginBottom: '6px' }}>
                      {remedy.symptom}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {remedy.remedies.map((remText, idx) => (
                        <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                          • {remText.replace(/\*\*/g, '')}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
                No active discomfort logged for this date.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* 💬 FEATURE 2: WHATSAPP ALERT MODAL POPUP */}
      {showWhatsappModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowWhatsappModal(false)}>
          <div style={{ background: 'var(--bg-primary)', padding: '28px', borderRadius: '24px', maxWidth: '440px', width: '100%', border: '1.5px solid var(--card-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#25d366', fontSize: '1.2rem', fontWeight: 800 }}>💬 WhatsApp Period Reminder</h3>
              <button onClick={() => setShowWhatsappModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              Get automated WhatsApp alerts <strong>2 Days Before Period Starts</strong> so you are always prepared with warm fluids & care essentials!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enter WhatsApp 10-Digit Phone Number</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--card-border)', fontWeight: 700, fontSize: '0.86rem' }}>+91</span>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={whatsappPhone}
                  onChange={e => setWhatsappPhone(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-secondary)', fontSize: '0.9rem', fontWeight: 700 }}
                />
              </div>
            </div>

            <button
              onClick={handleSendWhatsappAlert}
              style={{
                width: '100%',
                background: '#25d366',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,211,102,0.3)'
              }}
            >
              📲 Send Test WhatsApp Period Alert
            </button>
          </div>
        </div>
      )}

      {/* 💖 FEATURE 4: PARTNER / MOM CARE SYNC MODAL */}
      {showPartnerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowPartnerModal(false)}>
          <div style={{ background: 'var(--bg-primary)', padding: '28px', borderRadius: '24px', maxWidth: '440px', width: '100%', border: '1.5px solid var(--card-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#ec4899', fontSize: '1.2rem', fontWeight: 800 }}>💖 Partner / Mom Care Sync</h3>
              <button onClick={() => setShowPartnerModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              Share your real-time cycle status & care card with your <strong>Partner or Mom</strong> so they know when to support you with extra care!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Share With</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Partner', 'Mom', 'Friend'].map(r => (
                    <button
                      key={r}
                      onClick={() => setPartnerRelation(r)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '12px',
                        border: partnerRelation === r ? '1.5px solid #ec4899' : '1px solid var(--card-border)',
                        background: partnerRelation === r ? 'rgba(236,72,153,0.12)' : 'var(--bg-secondary)',
                        color: partnerRelation === r ? '#ec4899' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>WhatsApp Phone Number</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--card-border)', fontWeight: 700, fontSize: '0.86rem' }}>+91</span>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={partnerPhone}
                    onChange={e => setPartnerPhone(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-secondary)', fontSize: '0.9rem', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSharePartnerSync}
              style={{
                width: '100%',
                background: '#ec4899',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(236,72,153,0.3)'
              }}
            >
              💖 Share Care Status via WhatsApp
            </button>
          </div>
        </div>
      )}

      <style>{`
        .nav-btn {
          background: transparent;
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
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


