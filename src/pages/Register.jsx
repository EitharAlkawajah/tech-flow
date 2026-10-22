import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { supabase } from '../supabaseClient'; 
import '../App.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('requester');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Validate password: 6+ chars, letters and numbers only (no special marks)
  const validatePassword = (password) => {
    const re = /^[a-zA-Z0-9]{6,}$/;
    return re.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setEmailError('');
    setPasswordError('');
    
    let isValid = true;

    // Check Email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address (e.g., name@example.com).");
      isValid = false;
    }

    // Check Password
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters, using only letters and numbers (no special marks).");
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    // Supabase Auth Sign Up
    // The Database Trigger we set up will automatically create the profile using this metadata!
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If successful, send them to login
    if (authData.user) {
      alert("Registration successful! Please log in.");
      navigate('/login');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <Link to="/" className="close-auth-btn" title="Close">×</Link>
        
        <div className="logo-container" style={{justifyContent: 'center', marginBottom: '30px'}}>
          <img src={logo} alt="Tech Flow" className="logo-img" />
          <span className="logo-text text-navy">TECH <span className="text-teal">FLOW</span></span>
        </div>

        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join Tech Flow today.</p>
        
        {error && <p className="auth-error-box">{error}</p>}

        <form onSubmit={handleRegister} className="auth-form" noValidate>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="John Doe" />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if(emailError) setEmailError(''); // Clear error on typing
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if(passwordError) setPasswordError('');
                }} 
                required 
                placeholder="••••••••"
                className={passwordError ? 'input-error' : ''}
              />
              {/* Eye Icon */}
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
            {passwordError && <span className="error-text">{passwordError}</span>}
          </div>
          
          <div className="input-group">
            <label>I am a:</label>
            <div className="role-selector">
              <label className={role === 'requester' ? 'active-role' : ''}>
                <input type="radio" name="role" value="requester" checked={role === 'requester'} onChange={(e) => setRole(e.target.value)} />
                Requester (Need Help)
              </label>
              <label className={role === 'technician' ? 'active-role' : ''}>
                <input type="radio" name="role" value="technician" checked={role === 'technician'} onChange={(e) => setRole(e.target.value)} />
                Technician (Provide Help)
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login" className="text-teal">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;