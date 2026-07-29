'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Droplet, Heart, Smile, Plus } from 'lucide-react';
import LogModal from '../../components/LogModal';
import { getCalendarPredictions } from '../../lib/cycleCalculator';

export default function CalendarPage() {
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Month navigation state
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
    } catch (e) {
      console.error('Error fetching calendar data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const handleSaveLog = async (logData) => {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        fetchCalendarData();
      }
    } catch (e) {
      console.error('Error saving log:', e);
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Calendar...</p>
      </div>
    );
  }

  // Get predictions starting from the last period date
  const predictions = getCalendarPredictions(
    profile.lastPeriodDate,
    profile.averageCycleLength,
    profile.periodLength,
    6 // Predict 6 cycles out
  );

  // Helper: map a date string "YYYY-MM-DD" to its category
  const getDateStatus = (dateStr) => {
    // Check actual logged flow first
    const actualLog = logs.find((l) => l.date === dateStr);
    if (actualLog) {
      if (actualLog.flow > 0) {
        return { type: 'menstrual-actual', log: actualLog };
      }
      return { type: 'logged', log: actualLog };
    }

    // Fall back to predictions
    const pred = predictions.find((p) => p.date === dateStr);
    if (pred) {
      return { type: pred.type, log: null };
    }

    return { type: 'regular', log: null };
  };

  // Generate calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday

  // We want to start the calendar week on Sunday.
  const calendarCells = [];

  // Empty cells for padding before the 1st of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }

  // Actual days of the month
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

  const selectedDayDetails = selectedDate ? getDateStatus(selectedDate) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TRACK & PREDICT</span>
        <h1>Cycle Calendar</h1>
      </div>

      {/* Calendar Card */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {/* Calendar Header */}
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
            {monthNames[month]} {year}
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={prevMonth} style={navBtnStyle}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} style={navBtnStyle}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
          {weekdays.map((day, i) => (
            <span key={i} style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Cells Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} style={{ height: '36px' }} />;
            }

            const { dayNum, dateStr, type, log } = cell;
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            // Compute background and border based on category
            let cellStyle = { ...cellBaseStyle };
            
            if (isToday) {
              cellStyle.border = '1px solid var(--text-primary)';
            }
            if (isSelected) {
              cellStyle.boxShadow = '0 0 12px rgba(229, 152, 155, 0.4)';
              cellStyle.border = '2px solid var(--accent-rose)';
            }

            // Cell styling matching theme
            if (type === 'menstrual-actual') {
              cellStyle.background = 'var(--phase-menstrual)';
              cellStyle.color = '#3b172a';
              cellStyle.fontWeight = 'bold';
            } else if (type === 'menstrual') {
              cellStyle.border = '1px dashed var(--phase-menstrual)';
              cellStyle.color = 'var(--phase-menstrual)';
              cellStyle.background = 'rgba(229, 152, 155, 0.08)';
            } else if (type === 'fertile-peak') {
              cellStyle.background = 'var(--phase-ovulatory)';
              cellStyle.color = '#1f0d30';
              cellStyle.fontWeight = 'bold';
            } else if (type === 'fertile') {
              cellStyle.background = 'rgba(192, 132, 252, 0.15)';
              cellStyle.color = 'var(--accent-purple)';
              cellStyle.border = '1px solid rgba(192, 132, 252, 0.3)';
            } else if (type === 'logged') {
              cellStyle.border = '1px solid var(--accent-pink)';
              cellStyle.background = 'rgba(240, 166, 202, 0.05)';
            }

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                style={cellStyle}
              >
                <span>{dayNum}</span>
                {/* Visual tiny indicator dot */}
                {log && (
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: type === 'menstrual-actual' ? '#3b172a' : 'var(--accent-rose)',
                    marginTop: '2px'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', justifyContent: 'center' }}>
          <div style={legendItemStyle}>
            <span style={{ ...legendDotStyle, background: 'var(--phase-menstrual)' }} />
            <span style={legendLabelStyle}>Period</span>
          </div>
          <div style={legendItemStyle}>
            <span style={{ ...legendDotStyle, border: '1px dashed var(--phase-menstrual)', background: 'rgba(229, 152, 155, 0.08)' }} />
            <span style={legendLabelStyle}>Predicted Period</span>
          </div>
          <div style={legendItemStyle}>
            <span style={{ ...legendDotStyle, background: 'var(--phase-ovulatory)' }} />
            <span style={legendLabelStyle}>Peak Fertile</span>
          </div>
          <div style={legendItemStyle}>
            <span style={{ ...legendDotStyle, background: 'rgba(192, 132, 252, 0.15)', border: '1px solid rgba(192, 132, 252, 0.3)' }} />
            <span style={legendLabelStyle}>Fertile Window</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDate && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex-between">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setIsLogOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Log Data
            </button>
          </div>

          {selectedDayDetails?.log ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={detailsBoxStyle}>
                  <span style={detailsTitleStyle}><Droplet size={14} style={{ color: 'var(--accent-rose)' }} /> Flow</span>
                  <span style={detailsValueStyle}>
                    {['None', 'Light', 'Medium', 'Heavy'][selectedDayDetails.log.flow || 0]}
                  </span>
                </div>
                <div style={detailsBoxStyle}>
                  <span style={detailsTitleStyle}><Smile size={14} style={{ color: 'var(--accent-purple)' }} /> Mood</span>
                  <span style={detailsValueStyle}>
                    {['', 'Muted', 'Sad', 'Neutral', 'Happy', 'Energetic'][selectedDayDetails.log.mood || 3]}
                  </span>
                </div>
              </div>

              {selectedDayDetails.log.symptoms?.length > 0 && (
                <div style={detailsBoxStyle}>
                  <span style={detailsTitleStyle}><Heart size={14} style={{ color: 'var(--accent-rose)' }} /> Symptoms</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {selectedDayDetails.log.symptoms.map(s => (
                      <span key={s} style={symptomBadgeStyle}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Water Intake: <strong>{selectedDayDetails.log.water || 0} ml</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Sleep: <strong>{selectedDayDetails.log.sleep || 0} hrs</strong>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No wellness data logged for this date.
              {selectedDayDetails?.type === 'menstrual' && ' Predicted period day.'}
              {selectedDayDetails?.type === 'fertile' && ' Predicted fertile day.'}
              {selectedDayDetails?.type === 'fertile-peak' && ' Predicted peak ovulation day.'}
            </p>
          )}
        </div>
      )}

      {/* Log Modal */}
      <LogModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        onSave={handleSaveLog}
        selectedDate={selectedDate}
        initialData={selectedDayDetails?.log}
      />
    </div>
  );
}

// Styling components
const navBtnStyle = {
  background: 'rgba(232, 165, 152, 0.08)',
  border: '1px solid rgba(232, 165, 152, 0.25)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const cellBaseStyle = {
  background: 'rgba(255, 255, 255, 0.45)',
  border: '1px solid rgba(232, 165, 152, 0.12)',
  borderRadius: '12px',
  height: '42px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-sans)',
};

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const legendDotStyle = {
  width: '10px',
  height: '10px',
  borderRadius: '3px',
  display: 'inline-block',
};

const legendLabelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  fontWeight: '500',
};

const detailsBoxStyle = {
  background: 'rgba(255, 255, 255, 0.6)',
  border: '1px solid rgba(232, 165, 152, 0.15)',
  borderRadius: '12px',
  padding: '10px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const detailsTitleStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: '600',
  textTransform: 'uppercase',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

const detailsValueStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const symptomBadgeStyle = {
  fontSize: '0.75rem',
  background: 'rgba(232, 165, 152, 0.12)',
  border: '1px solid rgba(232, 165, 152, 0.25)',
  color: 'var(--accent-rose)',
  padding: '2px 8px',
  borderRadius: '20px',
  textTransform: 'capitalize',
};
