import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import InsightsPage from './pages/InsightsPage';
import WellnessPage from './pages/WellnessPage';
import ChatbotPage from './pages/ChatbotPage';

import Footer from './components/Footer';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <ToastProvider>
            <AppShell>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
                <Route path="/wellness" element={<ProtectedRoute><WellnessPage /></ProtectedRoute>} />
                <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
              </Routes>
            </AppShell>
          </ToastProvider>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

// Shell with Navigation + Footer for app pages
function AppShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', flexGrow: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

const footerStyle = {
  backgroundColor: 'var(--bg-secondary)',
  width: '100%',
  marginTop: 'auto',
  borderTop: '1px solid var(--card-border)',
};
const footerContainerStyle = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '24px 20px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
};
