import React from 'react';

const About = () => {
  return (
    <section className="about-section" id="about">
      <div className="section-header">
        <span className="badge">ABOUT TECH FLOW</span>
        <h2>How We Simplify IT Support</h2>
      </div>

      <div className="about-cards">
        <div className="about-card">
          <h3>Decentralizing & Modernizing IT Support</h3>
          <p>Tech Flow was designed to overcome traditional IT support bottlenecks. Whether you are an individual encountering hardware issues or an enterprise managing hundreds of software endpoints, Tech Flow bridges the gap between problem owners and skilled IT professionals.</p>
          <p>By replacing complex, slow helpdesk tickets with a real-time exchange platform and simple chat interface, we reduce downtime and improve resolution accuracy.</p>
        </div>
        <div className="about-card">
          <h3>A Single Stop Store for IT Solutions</h3>
          <p>You don't have to troubleshoot alone. Tech Flow creates a unified environment where requesters can submit categorized technical issues and qualified technicians can review, accept, and resolve requests.</p>
          <p>Our core mission is to make technical expertise accessible, transparent, and structured for businesses and professionals worldwide.</p>
        </div>
      </div>

      <div className="pillars-grid">
        <div className="pillar">
          <h4>Fast Ticket Lifecycle</h4>
          <p>Categorized logging for hardware and application issues ensures your request reaches the right specialist immediately.</p>
        </div>
        <div className="pillar">
          <h4>Simple & Easy Chat</h4>
          <p>Communicate directly with your technician using an intuitive chat board equipped with attachments and real-time state updates.</p>
        </div>
        <div className="pillar">
          <h4>Verified Professionals</h4>
          <p>Technicians undergo platform checks to guarantee high technical quality, accountability, and secure troubleshooting.</p>
        </div>
      </div>

      <div className="timeline-section">
        <h3>How Tech Flow Simplifies Support</h3>
        <div className="timeline-grid">
          <div className="timeline-step">
            <div className="step-number">1</div>
            <h4>Submit Issue</h4>
            <p>Define device type, application, and issue description in seconds.</p>
          </div>
          <div className="timeline-step">
            <div className="step-number">2</div>
            <h4>Match Technician</h4>
            <p>Qualified technicians review open queue requests and offer help.</p>
          </div>
          <div className="timeline-step">
            <div className="step-number">3</div>
            <h4>Direct Chat Board</h4>
            <p>Use our simple chat board to share details, files, and accept help.</p>
          </div>
          <div className="timeline-step">
            <div className="step-number">4</div>
            <h4>Resolve & Review</h4>
            <p>Mark issue solved once verified and leave technician feedback.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;