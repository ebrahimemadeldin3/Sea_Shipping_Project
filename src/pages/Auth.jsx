import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { login, registerUser } from '../lib/auth-service';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e, forceRole = null) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // In a real app we wouldn't use forceRole, but for the demo "Sign In as Company Admin" button:
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // If they clicked the company button, we inject the demo company credentials instead of reading the form.
    const loginEmail = forceRole === 'company' ? 'admin@navora.demo' : email;
    const loginPassword = forceRole === 'company' ? 'Admin123!' : password;

    try {
      // Simulate small network delay
      await new Promise(r => setTimeout(r, 600));
      const user = login(loginEmail, loginPassword);
      onLoginSuccess(user);
      navigate(user.role === 'company' ? '/company' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    
    try {
      await new Promise(r => setTimeout(r, 600));
      const newUser = registerUser({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        companyName: formData.get('companyName'),
        country: formData.get('country'),
        password: formData.get('password'),
      });
      
      // Auto-login after register
      const user = login(newUser.email, newUser.password);
      onLoginSuccess(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--color-background)' }}>
      {/* Left Branding Panel */}
      <div style={{ flex: 1, backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', flexDirection: 'column', padding: '4rem', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(25, 167, 206, 0.1), transparent 50%)' }}></div>
        <div style={{ position: 'relative', zIndex: 10 }} className="animate-stagger-1">
          <div style={{ marginBottom: '2rem' }}>
            <Logo size={48} className="auth-logo" />
          </div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'white', lineHeight: 1.1 }}>Moving Cargo.<br/>Connecting Worlds.</h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.8, maxWidth: '450px', lineHeight: 1.6 }}>
            Manage international shipments simply and securely. Access your premium dashboard to track, create, and oversee your global cargo operations.
          </p>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card animate-fade-right" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
          
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
              {isLogin ? 'Welcome back' : 'Create an Account'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{isLogin ? 'Sign in to manage your shipments.' : 'Join Navora to start shipping globally.'}</p>
          </div>

          {isLogin ? (
            <form onSubmit={(e) => handleLogin(e)} className="animate-stagger-1">
              {error && <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}
              
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" name="email" className="input-field" placeholder="Enter your email" required disabled={loading} />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" name="password" className="input-field" placeholder="••••••••" required disabled={loading} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--color-secondary)' }} /> Remember Me
                </label>
                <a href="#" style={{ color: 'var(--color-secondary)', fontWeight: 600, transition: 'color 0.2s' }}>Forgot Password?</a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <button type="button" onClick={(e) => handleLogin(e, 'company')} className="btn btn-outline w-full" disabled={loading}>
                  Sign In as Demo Company Admin
                </button>
              </div>
              
              <div className="text-center" style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Don't have an account? </span>
                <button type="button" onClick={() => { setIsLogin(false); setError(''); }} style={{ color: 'var(--color-secondary)', fontWeight: 700, transition: 'color 0.2s' }}>Create Account</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="animate-stagger-1">
              {error && <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}
              
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" name="fullName" className="input-field" placeholder="John Doe" required disabled={loading} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" name="email" className="input-field" placeholder="john@example.com" required disabled={loading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input type="tel" name="phone" className="input-field" placeholder="+1 234 567 890" required disabled={loading} />
                </div>
                <div className="input-group">
                  <label className="input-label">Country</label>
                  <select className="input-field" name="country" required defaultValue="" disabled={loading}>
                    <option value="" disabled>Select</option>
                    <option value="EG">Egypt</option>
                    <option value="IT">Italy</option>
                    <option value="US">USA</option>
                    <option value="CN">China</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Company Name (Optional)</label>
                <input type="text" name="companyName" className="input-field" placeholder="Doe Logistics" disabled={loading} />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" name="password" className="input-field" placeholder="••••••••" required disabled={loading} minLength={6} />
              </div>
              
              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              
              <div className="text-center" style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Already have an account? </span>
                <button type="button" onClick={() => { setIsLogin(true); setError(''); }} style={{ color: 'var(--color-secondary)', fontWeight: 700, transition: 'color 0.2s' }}>Sign In</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
