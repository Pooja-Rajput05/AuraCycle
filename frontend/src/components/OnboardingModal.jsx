

import React, { useState } from 'react';
import { Sparkles, Calendar, Heart } from 'lucide-react';
import styles from './OnboardingModal.module.css';

export default function OnboardingModal({ isOpen, onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to AuraCycle',
      desc: 'Your compassionate companion for menstrual health, wellness tracking, and personalized insights.',
    },
    {
      icon: Calendar,
      title: 'Tell us about your cycle',
      desc: 'This helps us predict phases and provide tailored wellness guidance.',
    },
    {
      icon: Heart,
      title: 'You\'re all set!',
      desc: 'Start logging daily to unlock personalized insights about your unique patterns.',
    },
  ];

  const CurrentIcon = steps[step].icon;

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim() || !lastPeriodDate) return;
      setSaving(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            lastPeriodDate,
            averageCycleLength: Number(cycleLength),
            periodLength: Number(periodLength),
            onboarded: true,
          }),
        });
        if (res.ok) {
          setStep(2);
        }
      } catch (e) {
        console.error('Onboarding save failed:', e);
      } finally {
        setSaving(false);
      }
      return;
    }

    if (step === 2) {
      onComplete();
      return;
    }

    setStep(step + 1);
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass-panel`}>
        <div className={styles.iconWrap}>
          <CurrentIcon size={28} />
        </div>

        <h2 className={styles.title}>{steps[step].title}</h2>
        <p className={styles.desc}>{steps[step].desc}</p>

        {step === 1 && (
          <div className={styles.form}>
            <label>
              Your name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aria"
                maxLength={50}
                required
              />
            </label>
            <label>
              Last period start date
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                required
              />
            </label>
            <div className={styles.row}>
              <label>
                Cycle length (days)
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  min={20}
                  max={45}
                />
              </label>
              <label>
                Period length (days)
                <input
                  type="number"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value)}
                  min={2}
                  max={10}
                />
              </label>
            </div>
          </div>
        )}

        <div className={styles.dots}>
          {steps.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === step ? styles.activeDot : ''}`} />
          ))}
        </div>

        <button
          type="button"
          className={`btn btn-primary ${styles.cta}`}
          onClick={handleNext}
          disabled={saving || (step === 1 && (!name.trim() || !lastPeriodDate))}
        >
          {saving ? 'Saving...' : step === 2 ? 'Go to Dashboard' : step === 1 ? 'Save & Continue' : 'Get Started'}
        </button>

        {step === 0 && (
          <p className={styles.disclaimer}>
            AuraCycle is a wellness tracker, not a medical device. Consult a healthcare provider for medical advice.
          </p>
        )}
      </div>
    </div>
  );
}


