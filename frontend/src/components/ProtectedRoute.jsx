import React from 'react';
import { Navigate } from 'react-router-dom';

// Wraps protected routes — redirects to /login if no token
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
