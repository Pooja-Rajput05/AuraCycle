import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Sparkles, HeartPulse, HelpCircle, Layers, Shield } from 'lucide-react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const { pathname } = useLocation();
  const [mounted, setMounted] = useState(false);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  useEffect(() => {
    // Read user name from localStorage (set at login/register)
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        setProfileName(user.name || '');
      }
    } catch {}
  }, [pathname]);

  const isLandingNav = pathname === '/';
  const initials = profileName
    ? profileName.trim().charAt(0).toUpperCase()
    : 'A';

  const appNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tracker', path: '/calendar', icon: Calendar },
    { name: 'Insights', path: '/insights', icon: Sparkles },
    { name: 'Wellness', path: '/wellness', icon: HeartPulse },
  ];

  const landingNavItems = [
    { name: 'How It Works', href: '#how-it-works', icon: HelpCircle },
    { name: 'Features', href: '#features', icon: Layers },
    { name: 'Privacy', href: '#privacy', icon: Shield },
  ];

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Fetch profile details for the dropdown menu
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profile`)
      .then(res => res.json())
      .then(setProfileData)
      .catch(console.error);
  }, [pathname]);

  const [avatarImage, setAvatarImage] = useState(() => {
    return localStorage.getItem('user_avatar') || null;
  });

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatarImage(base64String);
      localStorage.setItem('user_avatar', base64String);
    };
    reader.readAsDataURL(file);
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');

  const handleSaveName = async () => {
    if (!editNameInput.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editNameInput.trim(),
          averageCycleLength: profileData?.averageCycleLength || 28,
          periodLength: profileData?.periodLength || 5,
        }),
      });
      if (res.ok) {
        setProfileName(editNameInput.trim());
        const stored = localStorage.getItem('user');
        if (stored) {
          const userObj = JSON.parse(stored);
          userObj.name = editNameInput.trim();
          localStorage.setItem('user', JSON.stringify(userObj));
        }
        setIsEditingName(false);
      }
    } catch (err) {
      console.error('Failed to update name:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          AuraCycle
        </Link>

        <nav className={styles.nav}>
          {isLandingNav
            ? landingNavItems.map(({ name, href, icon: Icon }) => (
                <a key={href} href={href} className={styles.landingLink}>
                  <Icon size={15} style={{ color: 'var(--accent-rose)' }} />
                  <span>{name}</span>
                </a>
              ))
            : appNavItems.map(({ name, path, icon: Icon }) => {
                const isActive = pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  >
                    <Icon size={15} />
                    <span>{name}</span>
                  </Link>
                );
              })}
        </nav>

        <div className={styles.actions} style={{ position: 'relative' }}>
          {!localStorage.getItem('token') ? (
            <Link to="/login" className={styles.getStartedBtn}>
              Log In / Register
            </Link>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Profile Avatar Trigger Button */}
              <div 
                className={styles.profileAvatar} 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: 'pointer', border: showProfileMenu ? '2px solid var(--accent-rose)' : '1px solid var(--card-border)', overflow: 'hidden' }}
                title="View Profile Details"
              >
                {avatarImage ? (
                  <img src={avatarImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span className={styles.initials}>{initials}</span>
                )}
              </div>

              {/* Clean Minimalist Profile Details Dropdown Card */}
              {showProfileMenu && (
                <div 
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '250px',
                    background: 'var(--bg-primary)',
                    borderRadius: '16px',
                    border: '1px solid var(--card-border)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    padding: '16px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Centered User Profile Header with Image Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
                    <div 
                      onClick={() => document.getElementById('avatar-upload-input').click()}
                      style={{ 
                        width: '52px', 
                        height: '52px', 
                        borderRadius: '50%', 
                        background: 'rgba(147, 73, 60, 0.1)', 
                        color: 'var(--accent-rose)',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        border: '1.5px solid var(--accent-rose)',
                        lineHeight: 1,
                        textAlign: 'center',
                        marginBottom: '2px',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      title="Click to Upload Profile Photo"
                    >
                      {avatarImage ? (
                        <img src={avatarImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        initials
                      )}
                      <div 
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.45)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = 1}
                        onMouseOut={e => e.currentTarget.style.opacity = 0}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>photo_camera</span>
                      </div>
                    </div>

                    <input 
                      id="avatar-upload-input" 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={handleAvatarUpload}
                    />

                    <button 
                      onClick={() => document.getElementById('avatar-upload-input').click()}
                      style={{
                        background: 'rgba(147, 73, 60, 0.08)',
                        color: 'var(--accent-rose)',
                        border: '1px solid rgba(147, 73, 60, 0.2)',
                        borderRadius: '12px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                      <span>Upload Photo</span>
                    </button>
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      {isEditingName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <input 
                            type="text" 
                            value={editNameInput} 
                            onChange={(e) => setEditNameInput(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--accent-rose)',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              outline: 'none'
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveName}
                            style={{
                              background: 'var(--accent-rose)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '4px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                            {profileName || 'AuraCycle User'}
                          </strong>
                          <button
                            onClick={() => {
                              setEditNameInput(profileName);
                              setIsEditingName(true);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', padding: '2px', display: 'flex', alignItems: 'center' }}
                            title="Edit Name"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                          </button>
                        </div>
                      )}
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-sage)', fontWeight: 700, display: 'block', marginTop: '2px' }}>● Logged in</span>
                    </div>
                  </div>

                  {/* Cycle Statistics Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Average Cycle:</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{profileData?.averageCycleLength || 28} Days</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Period Duration:</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{profileData?.periodLength || 5} Days</strong>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--card-border)',
                      padding: '8px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '6px',
                      marginTop: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-rose)';
                      e.currentTarget.style.color = 'var(--accent-rose)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'var(--card-border)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


