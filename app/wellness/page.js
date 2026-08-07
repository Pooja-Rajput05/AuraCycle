'use client';

import React, { useState, useEffect } from 'react';
import { GlassWater, Moon, Smile, Flame, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import LogModal from '../../components/LogModal';
import { useToast } from '../../components/ToastProvider';

export default function WellnessPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSaveLog = async (logData) => {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        fetchLogs();
        toast('Wellness log updated', 'success');
      }
    } catch (e) {
      console.error('Error saving log:', e);
    }
  };

  const handleQuickAddWater = async (amount) => {
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
      water: Math.max(0, (todayLog.water || 0) + amount)
    };
    
    await handleSaveLog(updatedLog);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading wellness data...</p>
      </div>
    );
  }

  // Calculate metrics
  const last7Logs = [...logs].slice(-7);
  
  const avgSleep = logs.length > 0 
    ? (logs.reduce((sum, log) => sum + (log.sleep || 0), 0) / logs.length).toFixed(1)
    : '0';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr);
  const todayWater = todayLog?.water || 0;
  const todaySleep = todayLog?.sleep || 0;

  // Symptom counts
  const symptomCounts = {};
  logs.forEach(log => {
    if (log.symptoms) {
      log.symptoms.forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    }
  });
  
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Top 3 symptoms

  // Chart configuration
  const chartHeight = 100;
  const chartWidth = 320;
  const padding = 20;
  const maxWater = Math.max(...last7Logs.map(l => l.water || 0), 2000); 

  // SVG Water glass calculations
  const fillPercentage = Math.min(100, (todayWater / 2000) * 100);
  const waterY = 93 - (fillPercentage / 100) * 83; 
  
  return (
    <div className="animate-fade-in font-body-md" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div>
        <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>HEALTH & WELLNESS</span>
        <h1 className="font-display-lg" style={{ color: 'var(--text-primary)', margin: 0 }}>Wellness Tracking</h1>
      </div>

      {/* Grid structure matching Stitch stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Hydration Card (With visual SVG filling water glass) */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-sage)', marginBottom: '4px' }}>
              <GlassWater size={18} />
              <span className="font-label-md" style={{ fontWeight: '700' }}>Water Today</span>
            </div>
            <h2 className="font-headline-lg" style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.8rem' }}>
              {todayWater} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ml</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Target: 2000 ml</p>
            <button 
              onClick={() => handleQuickAddWater(250)} 
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                fontSize: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(74, 101, 78, 0.25)',
                background: 'rgba(74, 101, 78, 0.05)',
                color: 'var(--accent-sage)',
                cursor: 'pointer',
                fontWeight: 700,
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.target.style.background = 'rgba(74, 101, 78, 0.12)'}
              onMouseOut={e => e.target.style.background = 'rgba(74, 101, 78, 0.05)'}
            >
              Drink +250ml
            </button>
          </div>

          {/* SVG Animated Glass */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="60" height="90" viewBox="0 0 70 100" style={{ overflow: 'visible', cursor: 'pointer' }} onClick={() => handleQuickAddWater(250)} title="Click glass to log water">
              <defs>
                <linearGradient id="glassWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-sage)" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#4a654e" stopOpacity="0.45" />
                </linearGradient>
                <clipPath id="glassClip">
                  <path d="M 16.5,10 L 21.5,84 C 21.5,88 25.5,93 30,93 L 40,93 C 44.5,93 48.5,88 48.5,84 L 53.5,10 Z" />
                </clipPath>
              </defs>

              {/* Water Rect */}
              <g clipPath="url(#glassClip)">
                <rect
                  x="5"
                  y={waterY}
                  width="60"
                  height="100"
                  fill="url(#glassWaterGrad)"
                  style={{ transition: 'y 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
                
                {/* Surface ripple */}
                {todayWater > 0 && todayWater < 2200 && (
                  <ellipse
                    cx="35"
                    cy={waterY}
                    rx="22"
                    ry="3"
                    fill="#9dc5b1"
                    opacity="0.8"
                    style={{ transition: 'cy 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                )}
              </g>

              {/* Outlines */}
              <path
                d="M 15,10 L 20,85 C 20,90 25,95 30,95 L 40,95 C 45,95 50,90 50,85 L 55,10"
                fill="none"
                stroke="var(--text-secondary)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.65"
              />
            </svg>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justify: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', marginBottom: '8px' }}>
            <Moon size={18} />
            <span className="font-label-md" style={{ fontWeight: '700' }}>Average Sleep</span>
          </div>
          <h2 className="font-headline-lg" style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.8rem' }}>
            {avgSleep} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>hrs</span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>Today: {todaySleep || '--'} hrs</p>
        </div>
      </div>

      {/* Symptom Trends Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="font-headline-md" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          <Flame size={18} style={{ color: 'var(--accent-rose)' }} />
          Symptom Frequency
        </h3>

        {sortedSymptoms.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedSymptoms.map(([symptom, count]) => {
              const percentage = Math.round((count / logs.length) * 100);
              return (
                <div key={symptom} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="flex-between" style={{ fontSize: '0.85rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--text-primary)' }}>{symptom.replace('_', ' ')}</span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{count} times ({percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(147, 73, 60, 0.08)', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent-rose)', width: `${percentage}%`, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
            No symptoms logged yet. Complete logs to see frequency trends.
          </p>
        )}
      </div>

      {/* Custom SVG Chart: Hydration History */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="font-headline-md" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          <GlassWater size={18} style={{ color: 'var(--accent-sage)' }} />
          7-Day Hydration Trend
        </h3>

        {last7Logs.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', width: '100%' }}>
            <svg width={chartWidth} height={chartHeight + 30} style={{ overflow: 'visible' }}>
              {/* Target water dashed line */}
              {(() => {
                const targetY = chartHeight - (2000 / maxWater) * chartHeight + padding;
                return (
                  <>
                    <line
                      x1={0}
                      y1={targetY}
                      x2={chartWidth}
                      y2={targetY}
                      stroke="rgba(74, 101, 78, 0.25)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={chartWidth - 5}
                      y={targetY - 5}
                      fill="var(--accent-sage)"
                      fontSize="9"
                      textAnchor="end"
                      fontWeight="600"
                    >
                      Target (2L)
                    </text>
                  </>
                );
              })()}

              {last7Logs.map((log, idx) => {
                const barWidth = 24;
                const gapSize = (chartWidth - barWidth * last7Logs.length) / (last7Logs.length - 1 || 1);
                const x = idx * (barWidth + gapSize);
                const val = log.water || 0;
                const barHeight = (val / maxWater) * chartHeight;
                const y = chartHeight - barHeight + padding;
                const dateObj = new Date(log.date);
                const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);

                return (
                  <g key={log.date}>
                    <rect
                      x={x}
                      y={padding}
                      width={barWidth}
                      height={chartHeight}
                      fill="rgba(147, 73, 60, 0.04)"
                      rx="6"
                    />
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={val >= 2000 ? 'var(--accent-sage)' : 'var(--accent-pink)'}
                      rx="6"
                      style={{ transition: 'height 0.4s ease, y 0.4s ease' }}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + padding + 18}
                      fill="var(--text-secondary)"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {dayLabel}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      fill="var(--text-secondary)"
                      fontSize="8"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {val > 0 ? `${(val/1000).toFixed(1)}L` : '0'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
            Log hydration metrics over a few days to view timeline trends.
          </p>
        )}
      </div>

      {/* Recent History Logs List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="font-headline-md" style={{ fontSize: '1.15rem', marginBottom: '16px', color: 'var(--text-primary)', margin: 0 }}>Recent Logs</h3>
        {logs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...logs].reverse().slice(0, 5).map((log) => {
              const d = new Date(log.date);
              const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div
                  key={log.date}
                  onClick={() => {
                    setSelectedDate(log.date);
                    setIsLogOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid var(--card-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="log-row"
                >
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{formattedDate}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>({dayName})</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {log.flow > 0 && (
                      <span style={{ background: 'var(--accent-pink)', color: 'var(--text-primary)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '8px', fontWeight: '700' }}>
                        Period
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      💧 {log.water}ml | 😴 {log.sleep}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
            No log entries recorded.
          </p>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="quick-log-trigger"
        onClick={() => {
          setSelectedDate(todayStr);
          setIsLogOpen(true);
        }}
      >
        +
      </button>

      {/* Log Modal */}
      <LogModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        onSave={handleSaveLog}
        selectedDate={selectedDate}
        initialData={logs.find(l => l.date === selectedDate)}
      />
      
      <style jsx global>{`
        .log-row:hover {
          border-color: var(--card-hover-border) !important;
          background: rgba(255,255,255,0.7) !important;
          transform: translateX(3px);
        }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
