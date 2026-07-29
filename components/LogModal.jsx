'use client';

import React, { useState, useEffect } from 'react';
import { X, Droplet, Smile, Heart, Coffee, RefreshCw } from 'lucide-react';
import styles from './LogModal.module.css';

export default function LogModal({ isOpen, onClose, onSave, initialData = null, selectedDate = null }) {
  const [flow, setFlow] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [water, setWater] = useState(1000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSymptoms = [
    { id: 'cramps', label: 'Cramps' },
    { id: 'headache', label: 'Headache' },
    { id: 'bloating', label: 'Bloating' },
    { id: 'acne', label: 'Acne' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'back_pain', label: 'Back Pain' },
  ];

  const moodLevels = [
    { score: 1, label: 'Muted', icon: '😔' },
    { score: 2, label: 'Sad', icon: '😢' },
    { score: 3, label: 'Neutral', icon: '😐' },
    { score: 4, label: 'Happy', icon: '😊' },
    { score: 5, label: 'Energetic', icon: '🤩' },
  ];

  // Set initial states when initialData or selectedDate changes
  useEffect(() => {
    if (initialData) {
      setFlow(initialData.flow || 0);
      setSelectedSymptoms(initialData.symptoms || []);
      setMood(initialData.mood || 3);
      setSleep(initialData.sleep || 7);
      setWater(initialData.water || 1000);
    } else {
      // Reset to defaults
      setFlow(0);
      setSelectedSymptoms([]);
      setMood(3);
      setSleep(7);
      setWater(1000);
    }
  }, [initialData, isOpen, selectedDate]);

  if (!isOpen) return null;

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const dateStr = selectedDate || new Date().toISOString().split('T')[0];
    const logData = {
      date: dateStr,
      flow,
      symptoms: selectedSymptoms,
      mood,
      sleep: Number(sleep),
      water: Number(water),
    };
    await onSave(logData);
    setIsSubmitting(false);
    onClose();
  };

  const addWater = (amount) => {
    setWater((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass-panel`}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div>
            <h3>Log Daily Wellness</h3>
            <p className={styles.dateSub}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Today'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className={styles.content}>
          
          {/* Section: Menstrual Flow */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              <Droplet size={16} className={styles.sectionIcon} />
              Menstrual Flow
            </label>
            <div className={styles.flowSelectors}>
              {[
                { val: 0, label: 'None' },
                { val: 1, label: 'Light' },
                { val: 2, label: 'Medium' },
                { val: 3, label: 'Heavy' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  className={`${styles.flowBtn} ${flow === item.val ? styles.flowActive : ''}`}
                  onClick={() => setFlow(item.val)}
                >
                  {item.val > 0 && <Droplet fill="currentColor" size={14 + item.val * 2} />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Mood */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              <Smile size={16} className={styles.sectionIcon} />
              Mood
            </label>
            <div className={styles.moodSelectors}>
              {moodLevels.map((item) => (
                <button
                  key={item.score}
                  type="button"
                  className={`${styles.moodBtn} ${mood === item.score ? styles.moodActive : ''}`}
                  onClick={() => setMood(item.score)}
                >
                  <span className={styles.moodEmoji}>{item.icon}</span>
                  <span className={styles.moodLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Symptoms */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              <Heart size={16} className={styles.sectionIcon} />
              Symptoms
            </label>
            <div className={styles.symptomsGrid}>
              {availableSymptoms.map((symptom) => {
                const isActive = selectedSymptoms.includes(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    type="button"
                    className={`${styles.symptomTag} ${isActive ? styles.symptomActive : ''}`}
                    onClick={() => toggleSymptom(symptom.id)}
                  >
                    {symptom.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Wellness Trackers (Sleep & Water) */}
          <div className={styles.rowGrid}>
            {/* Water Tracker */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                <RefreshCw size={16} className={styles.sectionIcon} />
                Hydration ({water} ml)
              </label>
              <div className={styles.waterControls}>
                <button type="button" className={styles.waterQuickBtn} onClick={() => addWater(250)}>
                  +250ml
                </button>
                <button type="button" className={styles.waterQuickBtn} onClick={() => addWater(500)}>
                  +500ml
                </button>
                <button type="button" className={styles.waterResetBtn} onClick={() => setWater(0)}>
                  Reset
                </button>
              </div>
            </div>

            {/* Sleep Tracker */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                <Coffee size={16} className={styles.sectionIcon} />
                Sleep ({sleep} hrs)
              </label>
              <div className={styles.sleepInputWrapper}>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={sleep}
                  onChange={(e) => setSleep(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <button className={`${styles.cancelBtn} btn btn-secondary`} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className={`${styles.saveBtn} btn btn-primary`} onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </div>
    </div>
  );
}
