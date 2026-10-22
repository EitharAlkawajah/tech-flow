import React from 'react';

const Hero = () => {
  return (
    <header className="hero" id="home">
      <div className="hero-content">
        <span className="badge">IT TICKETING EXCHANGE PLATFORM</span>
        <h1>Connecting IT Problems to Seamless Solutions.</h1>
        <p>Tech Flow empowers requesters and technicians from small businesses to enterprise environments to solve device and application issues efficiently.</p>
        
        <div className="hero-buttons">
          <a href="/register" className="btn btn-primary">Get Started</a>
          <a href="#about" className="btn btn-outline">Learn More</a>
        </div>

        <div className="feature-strip">
          <span>✓ Simple & Easy To Use Chat Board</span>
          <span>✓ Verified Technician Network</span>
          <span>✓ Streamlined Support Workflow</span>
        </div>
      </div>
    </header>
  );
};

export default Hero;