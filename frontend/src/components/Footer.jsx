import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Linkedin, Heart, Shield, Sparkles } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#' + sectionId);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer} style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--card-border)', padding: '48px 20px 24px' }}>
      <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        
        {/* Main 3-Column Bento Footer Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', textAlign: 'left' }}>
          
          {/* Column 1: Brand & Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.logo} style={{ fontSize: '1.5rem', fontWeight: 800 }}>AuraCycle</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(147,73,60,0.1)', color: 'var(--accent-rose)', padding: '2px 8px', borderRadius: '10px' }}>
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '320px' }}>
              Your compassionate digital bio-health companion for period tracking, automated alerts, doctor reports & desi nuskhe remedies.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Shield size={14} style={{ color: 'var(--accent-sage)' }} />
              <span>100% Encrypted & Private Data</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#how-it-works" onClick={e => handleNavClick(e, 'how-it-works')} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 600, transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-rose)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>How It Works</a>
              <a href="#features" onClick={e => handleNavClick(e, 'features')} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 600, transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-rose)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Features</a>
              <a href="#privacy" onClick={e => handleNavClick(e, 'privacy')} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 600, transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-rose)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Privacy Policy</a>
              <Link to="/login" style={{ color: 'var(--accent-rose)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 800 }}>Start Tracking Free →</Link>
            </div>
          </div>

          {/* Column 3: Connect Section with clean clickable icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Connect</h4>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
              {/* Mail Direct Icon Button */}
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=pooja.kv205@gmail.com"
                target="_blank"
                rel="noreferrer"
                title="Send Email"
                style={{ 
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--card-bg)', 
                  border: '1.5px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  color: '#ea4335',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#ea4335';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'rgba(234,67,53,0.1)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--card-bg)';
                }}
              >
                <Mail size={20} />
              </a>

              {/* LinkedIn Direct Icon Button */}
              <a 
                href="https://www.linkedin.com/in/pooja-rajput-65056a30a/"
                target="_blank"
                rel="noreferrer"
                title="LinkedIn Profile"
                style={{ 
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--card-bg)', 
                  border: '1.5px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  color: '#0a66c2',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#0a66c2';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'rgba(10,102,194,0.1)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--card-bg)';
                }}
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>&copy; 2026 AuraCycle. All rights reserved.</span>
          <span>Wellness App • Not intended for clinical diagnostic replace.</span>
        </div>

      </div>
    </footer>
  );
}

