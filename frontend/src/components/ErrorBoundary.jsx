import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          gap: '16px',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--accent-rose)' }}>
            wifi_off
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', margin: 0 }}>
            Oops! Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.6, margin: 0 }}>
            Make sure the <strong>backend server</strong> is running on port 5000:
          </p>
          <code style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '0.88rem',
            color: 'var(--accent-sage)',
            fontFamily: 'monospace',
          }}>
            cd backend &amp;&amp; npm run dev
          </code>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '12px 24px',
              background: 'var(--accent-rose)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
