import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BarChart3, Heart, Shield, Droplets, Moon, FileText, MessageCircle, Users, Coffee, Sparkles, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Cycle & Fertile Window Prediction',
    desc: 'Predict your next period, peak ovulation window, and cycle phases with precision.',
    badge: 'Core Feature'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Period Alert System',
    desc: 'Get automated 2-day prior WhatsApp reminders so you are always prepared with care essentials.',
    badge: 'Founder Choice'
  },
  {
    icon: FileText,
    title: '1-Click Doctor PDF Summary Report',
    desc: 'Download a clean, printable medical report of your cycle metrics & symptoms for gynecological visits.',
    badge: 'Medical Grade'
  },
  {
    icon: Users,
    title: 'Partner & Mom Care Sync',
    desc: 'Share a real-time health card with your partner or mom via WhatsApp so they can care for you better.',
    badge: 'Care Sync'
  },
  {
    icon: Droplets,
    title: 'Pad Usage Counter & Heavy Flow Warning',
    desc: 'Track daily pads/cups changed with instant smart health alerts if heavy flow exceeds 5+ pads.',
    badge: 'Hygiene Guard'
  },
  {
    icon: Coffee,
    title: 'Desi Nuskhe & Herbal Tea Remedies',
    desc: 'Phase-tailored home remedies like Ajwain-Adrak tea for cramps and Peppermint water for bloating.',
    badge: 'Wellness'
  },
];

const STEPS = [
  {
    num: 'STEP 01',
    title: 'Create Your Profile',
    desc: 'Enter your name, last period date, and cycle length to set up your personal baseline.',
    icon: '👤',
    previewWidget: (
      <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', width: '100%', maxWidth: '340px' }}>
        <span style={{ fontSize: '1.4rem' }}>📝</span>
        <div style={{ textAlign: 'left' }}>
          <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'block' }}>Pooja Rajput</strong>
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-rose)', fontWeight: 700 }}>28 Days Average Cycle • 5 Days Period</span>
        </div>
      </div>
    )
  },
  {
    num: 'STEP 02',
    title: 'Record Daily Wellness',
    desc: 'Log your mood, symptoms, water intake, sleep, and pad changes in just 30 seconds.',
    icon: '📝',
    previewWidget: (
      <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', width: '100%', maxWidth: '340px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ background: 'rgba(147,73,60,0.12)', color: 'var(--accent-rose)', padding: '4px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>⚡ Cramps</span>
          <span style={{ background: 'rgba(74,101,78,0.12)', color: 'var(--accent-sage)', padding: '4px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>💧 1500ml</span>
        </div>
        <strong style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', fontWeight: 800 }}>🩸 2 Pads</strong>
      </div>
    )
  },
  {
    num: 'STEP 03',
    title: 'Get Smart Guidance',
    desc: 'Receive automated WhatsApp alerts, Doctor PDF reports, and phase-tailored desi nuskhe remedies.',
    icon: '✨',
    previewWidget: (
      <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', width: '100%', maxWidth: '340px' }}>
        <span style={{ fontSize: '1.4rem' }}>📲</span>
        <div style={{ textAlign: 'left' }}>
          <strong style={{ fontSize: '0.82rem', color: '#16a34a', display: 'block', fontWeight: 800 }}>WhatsApp Alert & PDF Ready!</strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Period in 2 days • Ajwain Tea remedy suggested</span>
        </div>
      </div>
    )
  },
];

export default function LandingPage() {
  return (
    <div className="animate-fade-in font-body-md" style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={heroTextCol}>
          <div style={badgeStyle}>
            <Sparkles size={14} style={{ color: 'var(--accent-rose)' }} />
            <span>BIO-HEALTH & WELLNESS COMPANION</span>
          </div>
          
          <h1 className="font-display-lg" style={{ color: 'var(--text-primary)', margin: '12px 0 16px', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', lineHeight: 1.15 }}>
            Understand your body,<br />
            <span style={{ color: 'var(--accent-rose)' }}>honor your natural rhythm.</span>
          </h1>
          
          <p className="font-body-lg" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '520px', fontSize: '1.05rem' }}>
            AuraCycle is your gentle digital health companion for menstrual tracking, automated WhatsApp period alerts, 1-click doctor PDF reports, and desi nuskhe remedies.
          </p>

          <div style={{ display: 'flex', gap: '14px', marginTop: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/login" className="hero-primary-btn">
              <span>Start Tracking Free</span>
              <ArrowRight size={18} style={{ transition: 'transform 0.3s' }} />
            </Link>
            <a href="#how-it-works" className="hero-secondary-btn">See How It Works</a>
          </div>
        </div>

        {/* Dynamic Glass Interactive 3D Tilted Widget Mockup */}
        <div style={mockupCol}>
          <div className="glass-card animated-bento-card tilted-hero-mockup" style={mockupCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--accent-rose)' }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>AuraCycle Live Preview</span>
              </div>
              <span style={{ background: 'rgba(74, 101, 78, 0.12)', color: 'var(--accent-sage)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                Day 14 • Ovulatory
              </span>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 700 }}>Conception Chance</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-rose)' }}>🌟 High (Peak Fertile)</strong>
              </div>
              <span style={{ fontSize: '1.6rem' }}>🌸</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>💧 Daily Hydration</span>
                <span style={{ color: 'var(--accent-sage)' }}>1500 / 2000 ml</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--accent-sage)', width: '75%', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(147, 73, 60, 0.1)', color: 'var(--accent-rose)', fontWeight: 700 }}>
                📲 WhatsApp Alerts Active
              </span>
              <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(74, 101, 78, 0.1)', color: 'var(--accent-sage)', fontWeight: 700 }}>
                📄 Doctor Report Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Animated Fast Auto-Swiping Carousel */}
      <section id="how-it-works" style={sectionStyle}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px' }}>
          <span className="font-label-sm" style={{ color: 'var(--accent-rose)', fontWeight: 700, letterSpacing: '0.06em' }}>EASY 3-STEP WORKFLOW</span>
          <h2 className="font-headline-lg" style={{ margin: '4px 0 8px', color: 'var(--text-primary)' }}>How AuraCycle Works</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Automated preview showing step-by-step how the app functions
          </p>
        </div>

        {/* Auto-Swiping Carousel Component */}
        <HowItWorksCarousel steps={STEPS} />
      </section>

      {/* Features Bento Grid */}
      <section id="features" style={sectionStyle}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
          <span className="font-label-sm" style={{ color: 'var(--accent-sage)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>POWERFUL WELLNESS FEATURES</span>
          <h2 className="font-headline-lg" style={{ margin: '6px 0 10px', color: 'var(--text-primary)', fontSize: '2.2rem' }}>Everything You Need</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
            A complete bio-health companion built for ultimate peace of mind
          </p>
        </div>

        <div style={featuresGrid}>
          {FEATURES.map(({ icon: Icon, title, desc, badge }) => (
            <div 
              key={title} 
              className="glass-card animated-bento-card" 
              style={{ 
                padding: '28px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px', 
                position: 'relative',
                borderRadius: '24px',
                border: '1.5px solid var(--card-border)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'var(--accent-rose)';
                e.currentTarget.style.boxShadow = '0 14px 30px rgba(147, 73, 60, 0.12)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--card-border)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '18px', background: 'rgba(147, 73, 60, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
                  <Icon size={24} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderRadius: '14px', background: 'var(--bg-secondary)', color: 'var(--accent-sage)', border: '1px solid var(--card-border)' }}>
                  {badge}
                </span>
              </div>
              <h3 className="font-headline-md" style={{ fontSize: '1.18rem', margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>{title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" style={{ ...sectionStyle, marginBottom: '20px' }}>
        <div 
          className="glass-card animated-bento-card" 
          style={{ 
            padding: '44px 36px', 
            textAlign: 'center', 
            maxWidth: '820px', 
            margin: '0 auto', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '20px',
            borderRadius: '32px',
            background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(74,101,78,0.05) 100%)',
            border: '1.5px solid var(--accent-sage)',
            boxShadow: '0 16px 40px rgba(74, 101, 78, 0.1)'
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74, 101, 78, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sage)', border: '1.5px solid rgba(74, 101, 78, 0.3)' }}>
            <Shield size={32} />
          </div>
          <div>
            <h2 className="font-headline-lg" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 800 }}>100% Private & Encrypted Health Data</h2>
            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '640px', margin: '10px auto 0' }}>
              Your personal wellness log, cycle predictions, and symptoms are encrypted and stored safely in your dedicated MongoDB database cluster. AuraCycle will never sell or monetize your personal health data to third parties.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ background: 'rgba(74, 101, 78, 0.12)', color: 'var(--accent-sage)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 800 }}>
              🛡️ Encrypted Database
            </span>
            <span style={{ background: 'rgba(147, 73, 60, 0.12)', color: 'var(--accent-rose)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 800 }}>
              🚫 Zero Third-Party Ads
            </span>
            <span style={{ background: 'rgba(74, 101, 78, 0.12)', color: 'var(--accent-sage)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 800 }}>
              🔒 Patient Data Ownership
            </span>
          </div>

          <Link to="/login" className="hero-primary-btn" style={{ marginTop: '8px' }}>
            <span>Start Tracking Free</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Fast Continuous Auto-Swiping Carousel Component with Simulated Action Animations
function HowItWorksCarousel({ steps }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [typedText, setTypedText] = React.useState('');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % steps.length);
    }, 3800); // 3.8 seconds per step for relaxed, smooth reading
    return () => clearInterval(timer);
  }, [steps.length]);

  // Typing animation effect for Step 01
  React.useEffect(() => {
    if (activeIndex === 0) {
      setTypedText('');
      const fullText = 'Pooja Rajput';
      let idx = 0;
      const typeInterval = setInterval(() => {
        if (idx <= fullText.length) {
          setTypedText(fullText.slice(0, idx));
          idx++;
        } else {
          clearInterval(typeInterval);
        }
      }, 100);
      return () => clearInterval(typeInterval);
    }
  }, [activeIndex]);

  const currentStep = steps[activeIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* Active Step Card */}
      <div 
        key={activeIndex}
        className="glass-card animated-bento-card smooth-carousel-card" 
        style={{ 
          padding: '32px 28px', 
          width: '100%', 
          borderRadius: '28px', 
          textAlign: 'center', 
          background: 'var(--card-bg)',
          border: '1.5px solid var(--accent-rose)',
          boxShadow: '0 12px 32px rgba(147, 73, 60, 0.12)',
          minHeight: '270px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'center'
        }}
      >
        <span style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--accent-rose)', letterSpacing: '0.08em', background: 'rgba(147, 73, 60, 0.1)', padding: '4px 12px', borderRadius: '12px', marginBottom: '8px' }}>
          {currentStep.num}
        </span>
        <h3 className="font-headline-md" style={{ margin: '4px 0 8px', fontSize: '1.35rem', color: 'var(--text-primary)', fontWeight: 800 }}>
          {currentStep.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: '480px' }}>
          {currentStep.desc}
        </p>

        {/* 🎬 DYNAMIC STEP ACTION ANIMATION WIDGETS */}
        {activeIndex === 0 && (
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '16px', border: '1.5px solid var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px', width: '100%', maxWidth: '360px', boxShadow: '0 4px 12px rgba(147,73,60,0.1)' }}>
            <span style={{ fontSize: '1.4rem' }}>⌨️</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block' }}>Simulating Name Input...</span>
              <strong style={{ fontSize: '0.92rem', color: 'var(--accent-rose)', display: 'inline-block' }}>
                {typedText}<span style={{ animation: 'blink 0.8s infinite' }}>|</span>
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Cycle: 28 Days • Period: 5 Days</span>
            </div>
          </div>
        )}

        {activeIndex === 1 && (
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '16px', border: '1.5px solid var(--accent-sage)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', width: '100%', maxWidth: '360px', boxShadow: '0 4px 12px rgba(74,101,78,0.1)' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ background: 'var(--accent-rose)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, animation: 'pulse 1.5s infinite' }}>⚡ Cramps</span>
              <span style={{ background: 'var(--accent-sage)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>💧 1500ml</span>
            </div>
            <span style={{ background: 'rgba(147,73,60,0.15)', color: 'var(--accent-rose)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>🩸 2 Pads</span>
          </div>
        )}

        {activeIndex === 2 && (
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '16px', border: '1.5px solid #25d366', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', width: '100%', maxWidth: '360px', boxShadow: '0 4px 12px rgba(37,211,102,0.15)' }}>
            <span style={{ fontSize: '1.4rem' }}>📲</span>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '0.84rem', color: '#16a34a', display: 'block', fontWeight: 800 }}>WhatsApp Alert Sent!</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>📄 Doctor PDF Report generated & ready</span>
            </div>
          </div>
        )}
      </div>

      {/* Clean Auto-Pill Indicators */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {steps.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            style={{
              width: activeIndex === idx ? '32px' : '10px',
              height: '10px',
              borderRadius: '10px',
              background: activeIndex === idx ? 'var(--accent-rose)' : 'var(--card-border)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        ))}
      </div>
    </div>
  );
}

const heroStyle = { display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between', minHeight: '55vh', padding: '10px 0' };
const heroTextCol = { flex: '1 1 340px' };
const badgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent-rose)', background: 'rgba(147,73,60,0.1)', padding: '6px 14px', borderRadius: '20px' };
const primaryBtn = { padding: '14px 28px', background: 'var(--accent-rose)', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(147,73,60,0.25)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' };
const secondaryBtn = { padding: '14px 28px', border: '1.5px solid var(--card-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block' };
const mockupCol = { flex: '1 1 320px', display: 'flex', justifyContent: 'center' };
const mockupCard = { width: '100%', maxWidth: '380px', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.06)' };
const sectionStyle = { padding: '24px 0' };
const stepsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' };
const featuresGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };
