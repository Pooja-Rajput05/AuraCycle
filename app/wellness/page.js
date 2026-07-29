'use client';

import React, { useState, useEffect } from 'react';
import { GlassWater, Moon, Smile, Flame, Plus, ChevronRight } from 'lucide-react';
import LogModal from '../../components/LogModal';

export default function WellnessPage() {
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
      }
    } catch (e) {
      console.error('Error saving log:', e);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
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

  // Find most frequent symptom
  const topSymptomName = sortedSymptoms[0] ? sortedSymptoms[0][0] : 'None';
  const topSymptomCount = sortedSymptoms[0] ? sortedSymptoms[0][1] : 0;

  // Custom SVG Bar Chart Calculation for Hydration
  const chartHeight = 100;
  const chartWidth = 320;
  const padding = 20;
  const maxWater = Math.max(...last7Logs.map(l => l.water || 0), 2000); // at least 2000ml scale
  
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>HEALTH & WELLNESS</span>
        <h1>Wellness Tracking</h1>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-lavender)', marginBottom: '8px' }}>
            <GlassWater size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Water Today</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{todayWater} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ml</span></h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Target: 2000 ml</p>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', marginBottom: '8px' }}>
            <Moon size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Average Sleep</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{avgSleep} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>hrs</span></h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Today: {todaySleep || '--'} hrs</p>
        </div>
      </div>

      {/* Symptom Trends Card */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} style={{ color: 'var(--accent-rose)' }} />
          Symptom Frequency
        </h3>

        {sortedSymptoms.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedSymptoms.map(([symptom, count]) => {
              const percentage = Math.round((count / logs.length) * 100);
              return (
                <div key={symptom} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="flex-between" style={{ fontSize: '0.85rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{symptom.replace('_', ' ')}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} times ({percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(232, 165, 152, 0.1)', borderRadius: '3px', width: '100%', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent-rose)', width: `${percentage}%`, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No symptoms logged yet. Start logging symptoms using the calendar or dashboard.
          </p>
        )}
      </div>

      {/* Custom SVG Chart: Hydration History */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GlassWater size={18} style={{ color: 'var(--accent-sage)' }} />
          7-Day Hydration Trend
        </h3>

        {last7Logs.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', width: '100%' }}>
            <svg width={chartWidth} height={chartHeight + 30} style={{ overflow: 'visible' }}>
              {/* Horizontal grid line at 2000 ml */}
              {(() => {
                const targetY = chartHeight - (2000 / maxWater) * chartHeight + padding;
                return (
                  <>
                    <line
                      x1={0}
                      y1={targetY}
                      x2={chartWidth}
                      y2={targetY}
                      stroke="rgba(139, 176, 154, 0.25)"
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
                    {/* Background track */}
                    <rect
                      x={x}
                      y={padding}
                      width={barWidth}
                      height={chartHeight}
                      fill="rgba(232, 165, 152, 0.06)"
                      rx="6"
                    />
                    {/* Active bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={val >= 2000 ? 'var(--accent-sage)' : 'var(--accent-rose)'}
                      rx="6"
                      style={{ transition: 'height 0.5s ease, y 0.5s ease' }}
                    />
                    {/* Date label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + padding + 18}
                      fill="var(--text-muted)"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {dayLabel}
                    </text>
                    {/* Value label on top */}
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
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
            Not enough data yet. Log hydration over a few days to see trends.
          </p>
        )}
      </div>

      {/* Recent History Logs List */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px' }}>Recent Logs</h3>
        {logs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.45)',
                    border: '1px solid rgba(232, 165, 152, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="log-row"
                >
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{formattedDate}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({dayName})</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {log.flow > 0 && (
                      <span style={{ background: 'rgba(232,165,152,0.15)', color: 'var(--accent-rose)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', fontWeight: '600' }}>
                        Period
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      💧 {log.water}ml | 😴 {log.sleep}h
                    </span>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No log entries yet.
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
        <Plus size={28} />
      </button>

      {/* Log Modal */}
      <LogModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        onSave={handleSaveLog}
        selectedDate={selectedDate}
        initialData={logs.find(l => l.date === selectedDate)}
      />
    </div>
  );
}
