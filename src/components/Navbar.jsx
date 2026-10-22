import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';

const Navbar = ({ openModal }) => {
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const initial = profile?.full_name 
    ? profile.full_name.charAt(0).toUpperCase() 
    : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <nav className="navbar">
      <Link to="/" className="logo-container">
        <img src={logo} alt="Tech Flow Logo" className="logo-img" />
        <span className="logo-text">TECH <span className="text-teal">FLOW</span></span>
      </Link>

      <button className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
        <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
        <a href="#services" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
        <a href="#feedback" onClick={() => setIsMobileMenuOpen(false)}>Community Feedback</a>
        
        <div className="mobile-nav-actions">
          {user ? (
             <>
               <Link to={profile?.role === 'technician' ? "/dashboard/technician" : "/dashboard/requester"} className="btn btn-outline" onClick={() => setIsMobileMenuOpen(false)}>My Dashboard</Link>
               <Link to="/profile" className="btn btn-outline" onClick={() => setIsMobileMenuOpen(false)}>Profile Settings</Link>
               <button onClick={handleLogout} className="btn btn-danger w-100">Logout</button>
             </>
          ) : (
             <>
               <button onClick={() => { openModal('terms'); setIsMobileMenuOpen(false); }} className="btn btn-outline">Terms</button>
               <Link to="/register" className="btn btn-primary">Get Started</Link>
             </>
          )}
        </div>
      </div>

      <div className="nav-actions desktop-actions">
        {user ? (
          <div className="user-menu-container">
            <button className="avatar-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {initial}
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to={profile?.role === 'technician' ? "/dashboard/technician" : "/dashboard/requester"} onClick={() => setIsDropdownOpen(false)}>
                  My Dashboard
                </Link>
                <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>Profile Settings</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => openModal('terms')} className="btn btn-outline">Terms</button>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;