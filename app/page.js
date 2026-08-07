'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, BarChart3, Heart, Shield, Droplets, Moon } from 'lucide-react';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Cycle Tracking',
    desc: 'Predict periods, fertile windows, and phases with a visual calendar tailored to your unique rhythm.',
  },
  {
    icon: Heart,
    title: 'Symptom Logging',
    desc: 'Track cramps, mood, flow, sleep, and hydration daily — with compassionate, phase-aware remedies.',
  },
  {
    icon: BarChart3,
    title: 'Personalized Insights',
    desc: 'Discover mood patterns, symptom trends, and wellness suggestions powered by your own data.',
  },
  {
    icon: Droplets,
    title: 'Wellness Metrics',
    desc: 'Monitor hydration and sleep with beautiful visualizations and gentle daily action plans.',
  },
  {
    icon: Moon,
    title: 'Phase-Aware Guidance',
    desc: 'Get nutrition, exercise, and self-care recommendations synced to your menstrual cycle phase.',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your health data stays on your device. No accounts required — start tracking in seconds.',
  },
];

const STEPS = [
  { num: '01', title: 'Set up your profile', desc: 'Enter your name and last period date to calibrate predictions.' },
  { num: '02', title: 'Log daily wellness', desc: 'Record mood, symptoms, flow, sleep, and hydration in under a minute.' },
  { num: '03', title: 'Unlock insights', desc: 'AuraCycle analyzes your patterns and delivers personalized guidance.' },
];

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section style={heroStyle}>
        <div style={heroTextCol}>
          <span style={badgeStyle}>Women&apos;s Health & Wellness</span>
          <h1 className="font-display-lg" style={{ color: 'var(--accent-rose)', margin: 0, fontSize: 'clamp(2rem, 5vw, 2.8rem)', lineHeight: 1.15 }}>
            Understand your body,<br />
            <span style={{ color: 'var(--accent-plum)' }}>honor your rhythm.</span>
          </h1>
          <p className="font-body-lg" style={{ color: 'var(--text-secondary)', marginTop: '20px', lineHeight: 1.6, maxWidth: '480px' }}>
            AuraCycle is your compassionate digital health companion for menstrual tracking, wellness logging, and personalized insights — without clinical overwhelm.
          </p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={primaryBtn}>Start Your Journey</Link>
            <a href="#how-it-works" style={secondaryBtn}>See How It Works</a>
          </div>
        </div>

        <div style={mockupCol}>
          <div className="glass-card" style={mockupCard}>
            <MiniWidget icon="spa" label="Cycle Status" title="Day 14" sub="Ovulation Phase" ring />
            <MiniWidget icon="water_drop" label="Hydration" bar={62} text="5 / 8 glasses" />
            <MiniWidget icon="mood" label="Today's Energy" tags={['Energetic', 'Calm']} last />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={sectionStyle}>
        <h2 className="font-headline-lg" style={{ textAlign: 'center', marginBottom: '8px' }}>How It Works</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '36px' }}>
          Three simple steps to start understanding your cycle
        </p>
        <div style={stepsGrid}>
          {STEPS.map((step) => (
            <div key={step.num} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-coral)', opacity: 0.6 }}>{step.num}</span>
              <h3 className="font-headline-md" style={{ margin: '8px 0', fontSize: '1.1rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={sectionStyle}>
        <h2 className="font-headline-lg" style={{ textAlign: 'center', marginBottom: '8px' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '36px' }}>
          A complete wellness companion built for real life
        </p>
        <div style={featuresGrid}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(147,73,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)', marginBottom: '12px' }}>
                <Icon size={22} />
              </div>
              <h3 className="font-headline-md" style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{title}</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" style={{ ...sectionStyle, marginBottom: '20px' }}>
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <Shield size={32} style={{ color: 'var(--accent-sage)', marginBottom: '12px' }} />
          <h2 className="font-headline-md" style={{ marginBottom: '8px' }}>Your Data, Your Control</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 20px' }}>
            AuraCycle stores your wellness data locally on your device. We don&apos;t sell your health information.
            This app is a wellness tracker — not a medical device. Always consult a healthcare provider for medical advice.
          </p>
          <Link href="/dashboard" style={primaryBtn}>Get Started Free</Link>
        </div>
      </section>
    </div>
  );
}

function MiniWidget({ icon, label, title, sub, ring, bar, text, tags, last }) {
  return (
    <div style={{ ...miniWidget, ...(last ? { borderBottom: 'none', paddingBottom: 0 } : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--accent-rose)', fontSize: '18px' }}>{icon}</span>
        <span className="font-label-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <div>
            <h3 className="font-headline-md" style={{ fontSize: '1.2rem', margin: 0 }}>{title}</h3>
            <span className="font-label-sm" style={{ color: 'var(--accent-sage)', fontWeight: 700 }}>{sub}</span>
          </div>
          {ring && (
            <svg width="46" height="46" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg-secondary)" strokeWidth="4" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="var(--accent-rose)" strokeWidth="4" strokeDasharray="88" strokeDashoffset="44" strokeLinecap="round" transform="rotate(-90 18 18)" />
            </svg>
          )}
        </div>
      )}
      {bar !== undefined && (
        <>
          <div className="flex-between" style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>{text}</span>
          </div>
          <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'var(--bg-secondary)', overflow: 'hidden', marginTop: '6px' }}>
            <div style={{ width: `${bar}%`, height: '100%', background: 'var(--accent-sage)' }} />
          </div>
        </>
      )}
      {tags && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
          {tags.map((t) => (
            <span key={t} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--accent-coral)', fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const heroStyle = { display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between', minHeight: '60vh', padding: '20px 0' };
const heroTextCol = { flex: '1 1 320px' };
const badgeStyle = { display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent-sage)', background: 'rgba(74,101,78,0.1)', padding: '4px 12px', borderRadius: '20px', marginBottom: '16px' };
const primaryBtn = { padding: '14px 28px', background: 'var(--accent-rose)', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(147,73,60,0.2)', display: 'inline-block' };
const secondaryBtn = { padding: '14px 28px', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block' };
const mockupCol = { flex: '1 1 300px', display: 'flex', justifyContent: 'center' };
const mockupCard = { width: '100%', maxWidth: '340px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' };
const miniWidget = { display: 'flex', flexDirection: 'column', paddingBottom: '14px', borderBottom: '1px solid var(--card-border)' };
const sectionStyle = { padding: '48px 0' };
const stepsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' };
const featuresGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' };
