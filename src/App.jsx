import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Profile from './pages/Profile';
import { useState, useEffect } from 'react';
import { initializeDemoData } from './lib/seed';
import { getCurrentUser, logout } from './lib/auth-service';

export default function App() {
  const [user, setUser] = useState(null); // { id, role, ... }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize DB if needed
    initializeDemoData();

    // 2. Restore Session
    const loadSession = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser || null);
    };
    loadSession();
    setLoading(false);

    // 3. Listen for cross-tab or manual storage events to update user
    window.addEventListener('storage', loadSession);
    return () => window.removeEventListener('storage', loadSession);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)' }}>
        <div className="skeleton-circle animate-pulse" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Route */}
        <Route 
          path="/auth" 
          element={
            user ? (
              <Navigate to={user.role === 'company' ? "/company" : "/dashboard"} replace />
            ) : (
              <Auth onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
            )
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            !user ? <Navigate to="/auth" replace /> :
            user.role === 'customer' 
              ? <CustomerDashboard user={user} onLogout={handleLogout} /> 
              : <Navigate to="/company" replace />
          } 
        />
        
        <Route 
          path="/company" 
          element={
            !user ? <Navigate to="/auth" replace /> :
            user.role === 'company' 
              ? <CompanyDashboard user={user} onLogout={handleLogout} /> 
              : <Navigate to="/dashboard" replace />
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            !user ? <Navigate to="/auth" replace /> :
            <Profile user={user} onLogout={handleLogout} />
          } 
        />
      </Routes>
    </Router>
  );
}
