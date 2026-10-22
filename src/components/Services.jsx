import React, { useState } from 'react';

const Services = () => {
  const [activeTab, setActiveTab] = useState('requester');

  return (
    <section className="services-section" id="services">
      <div className="section-header">
        <span className="badge">SERVICES & PLATFORM CAPABILITIES</span>
        <h2>Tailored Solutions For Everyone</h2>
        <p>Select your role to explore how Tech Flow streamlines your IT workflow.</p>
        
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${activeTab === 'requester' ? 'active' : ''}`}
            onClick={() => setActiveTab('requester')}
          >
            For Requesters
          </button>
          <button 
            className={`toggle-btn ${activeTab === 'technician' ? 'active' : ''}`}
            onClick={() => setActiveTab('technician')}
          >
            For Technicians
          </button>
        </div>
      </div>

      <div className="service-content">
        {activeTab === 'requester' ? (
          <div className="service-pane">
            <div className="service-text">
              <h3>Hassle-Free Issue Submission & Tracking</h3>
              <p>Get quick support for your devices and enterprise applications without dealing with confusing tech jargon or lengthy waiting lines.</p>
              <ul className="check-list">
                <li><strong>Create Your Free Online Portal:</strong> Access your dashboard to submit and track open tickets anytime.</li>
                <li><strong>Drag & Drop Ticket Creation:</strong> Attach screenshots, error logs, and issue descriptors effortlessly.</li>
                <li><strong>Simple and Easy to Use Chat Board:</strong> Accept tech help, exchange live messages, and mark issues solved.</li>
              </ul>
              <a href="/register" className="btn btn-primary">Register as Requester</a>
            </div>
            <div className="service-preview">
               <div className="preview-header">Requester View (Ticket #4092)</div>
               <div className="chat-bubble tech-bubble">Hello! I saw your ticket regarding the local gateway loss. Do you accept my help?</div>
               <div className="chat-bubble req-bubble">Yes, accepted! I uploaded the router log screenshot.</div>
            </div>
          </div>
        ) : (
          <div className="service-pane">
            <div className="service-text">
              <h3>Expand Your IT Reach & Handle Queue Efficiently</h3>
              <p>Connect with verified requests from small businesses and users seeking immediate IT expertise.</p>
              <ul className="check-list">
                <li><strong>Personalized Technician Dashboard:</strong> Monitor open requests, track resolution logs, and manage state updates.</li>
                <li><strong>Filter Requests by Device & Apps:</strong> Pick issues suited to your network, hardware, or software expertise.</li>
                <li><strong>Direct Client Communication:</strong> Use the simple chat board to guide requesters and request confirmation.</li>
              </ul>
              <a href="/register" className="btn btn-primary">Join as Technician</a>
            </div>
            <div className="service-preview">
               <div className="preview-header">Tech Control Console (Queue Active)</div>
               <div className="filter-chips">
                 <span>Network Hardware</span>
                 <span>macOS / iOS</span>
                 <span>Database</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;