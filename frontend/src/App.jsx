import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import About from './pages/About';
import Template from './pages/Template';
import Write from './pages/Write';
import SavedPoems from './pages/SavedPoems';
import Login from './pages/Login';
import Register from './pages/Register';

import './styles/paper-effects.css';
import './styles/animations.css';
import './App.css';
import './index.css';

// ── Protected Route ────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// ── Public Route (redirect to /write if already logged in) ────
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (token) return <Navigate to="/write" replace />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"          element={<Home />} />
        <Route path="/templates" element={<Template />} />
        <Route path="/about"     element={<About />} />

        {/* Auth routes — redirect to /write if already logged in */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes — redirect to /login if not logged in */}
        <Route path="/write" element={
          <ProtectedRoute><Write /></ProtectedRoute>
        } />
        <Route path="/saved" element={
          <ProtectedRoute><SavedPoems /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;