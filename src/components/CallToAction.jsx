import React from 'react';

const CallToAction = () => {
  return (
    <section className="cta-container" id="signup">
      <div className="cta-box">
        <div className="cta-img">
          <div className="placeholder-img cta-graphic"></div>
        </div>
        <div className="cta-content">
          <h2>Single stop ticketing<br/>store for all.</h2>
          <p>You don't have to do it alone. Tech Flow empowers requesters and technicians from small businesses to large enterprises to seamlessly connect and share their knowledge.</p>
          <a href="#signup" className="btn btn-white">Create account</a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;