import React from 'react';

const Modal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        {type === 'terms' && (
          <>
            <h2>Terms of Service</h2>
            <p>Welcome to Tech Flow. By accessing or using our platform, you agree to comply with and be bound by the following Terms of Service.</p>
            <ol>
              <li><strong>User Accounts:</strong> Requesters and Technicians are responsible for maintaining the confidentiality of their credentials and account security.</li>
              <li><strong>Issue Submissions & Services:</strong> Requesters must accurately describe their technical issues. Technicians agree to deliver support in a professional and secure manner.</li>
              <li><strong>Communication Guidelines:</strong> All troubleshooting exchanges must be conducted respectfully through our chat board interface.</li>
            </ol>
          </>
        )}

        {type === 'privacy' && (
          <>
            <h2>Privacy Policy</h2>
            <p>Tech Flow values your privacy and is committed to protecting your technical data and credentials.</p>
            <ol>
              <li><strong>Data Collection:</strong> We collect essential diagnostic details, ticket records, and chat history strictly for the purpose of issue resolution.</li>
              <li><strong>Information Protection:</strong> All data shared between Requesters and Technicians is encrypted in transit and stored securely.</li>
              <li><strong>Third-Party Sharing:</strong> Tech Flow does not sell or rent personal information to third parties.</li>
            </ol>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;