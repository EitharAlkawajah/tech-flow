import React from 'react';
import logo from '../assets/logo.png';

const Footer = ({ openModal }) => {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <div className="logo-container text-white">
            <img src={logo} alt="Tech Flow" className="logo-img filter-white" />
            <span className="logo-text">TECH FLOW</span>
          </div>
          <p className="footer-desc">An IT ticketing exchange platform connecting requester problems to qualified technician solutions.</p>
        </div>
        
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#feedback">Community Feedback</a>
        </div>
        
        <div className="footer-socials">
          <h4>Connect With Us</h4>
          <p>Follow our development and updates on official platforms.</p>
          <div className="social-icons">
             <a href="#">LinkedIn</a> | <a href="#">GitHub</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 TECH FLOW. All rights reserved.</p>
        <div className="legal-links">
          <button onClick={() => openModal('terms')}>Terms of Service</button> | 
          <button onClick={() => openModal('privacy')}>Privacy Policy</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;