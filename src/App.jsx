import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Feedback from './components/Feedback';
import Footer from './components/Footer';
import Modal from './components/Modal';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import RequesterDashboard from './pages/RequesterDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import SubmitTicket from './pages/SubmitTicket';
import EditTicket from './pages/EditTicket'; 
import ChatBoard from './pages/ChatBoard'; // <-- Crucial Import for the Chat
import Profile from './pages/Profile';

import './App.css';

const LandingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const openModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <>
      <Navbar openModal={openModal} />
      <Hero />
      <About />
      <Services />
      <Feedback />
      <Footer openModal={openModal} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Requester Routes */}
            <Route path="/dashboard/requester" element={<RequesterDashboard />} />
            <Route path="/submit-ticket" element={<SubmitTicket />} />
            <Route path="/edit-ticket/:id" element={<EditTicket />} />

            {/* Technician Routes */}
            <Route path="/dashboard/technician" element={<TechnicianDashboard />} />

            {/* Shared Auth Routes */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Chat Board Route */}
            <Route path="/chat/:id" element={<ChatBoard />} /> 
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;