'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Bell } from 'lucide-react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (pathname === '/') return;
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => setProfileName(data.name || ''))
      .catch(() => {});
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const isLandingNav = pathname === '/';
  const initials = profileName
    ? profileName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AC';

  const appNavItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tracker', path: '/calendar' },
    { name: 'Insights', path: '/insights' },
    { name: 'Wellness', path: '/wellness' },
  ];

  const landingNavItems = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Privacy', href: '#privacy' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          AuraCycle
        </Link>

        <nav className={styles.nav}>
          {isLandingNav
            ? landingNavItems.map((item) => (
                <a key={item.href} href={item.href} className={styles.landingLink}>
                  {item.name}
                </a>
              ))
            : appNavItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
        </nav>

        <div className={styles.actions}>
          {isLandingNav ? (
            <>
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className={styles.themeToggle}
                  aria-label="Theme toggle"
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
              )}
              <Link href="/dashboard" className={styles.loginBtn}>
                Log In
              </Link>
              <Link href="/dashboard" className={styles.getStartedBtn}>
                Get Started
              </Link>
            </>
          ) : (
            <>
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className={styles.themeToggle}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              )}

              <button className={styles.bellBtn} aria-label="Notifications">
                <Bell size={18} />
              </button>

              <Link href="/dashboard" className={styles.profileAvatar} title={profileName || 'Profile'}>
                <span className={styles.initials}>{initials}</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
