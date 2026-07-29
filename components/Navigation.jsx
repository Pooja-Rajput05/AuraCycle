'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Heart, Sparkles, Sun, Moon } from 'lucide-react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Wellness', path: '/wellness', icon: Heart },
    { name: 'Insights', path: '/insights', icon: Sparkles },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>
            <div className={styles.innerDot} />
          </div>
          <span className={styles.appName}>AuraCycle</span>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon className={styles.icon} size={16} />
                <span className={styles.label}>{item.name}</span>
                {isActive && <div className={styles.activeDot} />}
              </Link>
            );
          })}

          {/* Soothing Theme Toggle Switch */}
          {mounted && (
            <button 
              onClick={toggleTheme} 
              className={styles.themeToggle} 
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
