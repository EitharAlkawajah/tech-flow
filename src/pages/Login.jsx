import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { supabase } from '../supabaseClient'; 
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        setError("Could not find user profile.");
        setLoading(false);
        return;
      }

      if (profileData.role === 'requester') {
        navigate('/dashboard/requester');
      } else if (profileData.role === 'technician') {
        navigate('/dashboard/technician');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <Link to="/" className="close-auth-btn" title="Close">×</Link>
        <div className="logo-container" style={{justifyContent: 'center', marginBottom: '30px'}}>
          <img src={logo} alt="Tech Flow" className="logo-img" />
          <span className="logo-text text-navy">TECH <span className="text-teal">FLOW</span></span>
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to manage your tickets.</p>
        
        {error && <p className="auth-error-box">{error}</p>}

        <form onSubmit={handleLogin} className="auth-form" noValidate>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if(emailError) setEmailError('');
              }} 
              required 
              placeholder="you@example.com" 
              className={emailError ? 'input-error' : ''}
            />
            {emailError && <span className="error-text">{emailError}</span>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="text-teal">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;