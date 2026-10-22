import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../App.css';

const SubmitTicket = () => {
  const [issueName, setIssueName] = useState('');
  const [deviceType, setDeviceType] = useState('Laptop');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    let attachmentUrl = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, file);

      if (uploadError) {
        alert("Error uploading file: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('ticket-attachments')
        .getPublicUrl(fileName);
      
      attachmentUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('tickets')
      .insert([
        {
          requester_id: user.id,
          issue_name: issueName,
          device_type: deviceType,
          description: description,
          attachments: attachmentUrl ? [attachmentUrl] : [],
          status: 'open'
        }
      ]);

    if (error) {
      alert("Error creating ticket: " + error.message);
    } else {
      alert("Ticket submitted successfully!");
      navigate('/dashboard/requester');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box" style={{maxWidth: '600px'}}>
        <button onClick={() => navigate(-1)} className="close-auth-btn" title="Back">×</button>
        <h2>Submit a Ticket</h2>
        <p className="auth-subtitle">Describe your issue and a technician will help you soon.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Issue Title</label>
            <input type="text" value={issueName} onChange={(e) => setIssueName(e.target.value)} required placeholder="e.g., Wi-Fi not connecting" />
          </div>
          
          <div className="input-group">
            <label>Device Type</label>
            <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)} className="form-select">
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Phone">Phone</option>
              <option value="Printer">Printer</option>
              <option value="Software">Software / App</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group">
            <label>Problem Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Please provide as much detail as possible..." rows="4" className="form-textarea"></textarea>
          </div>

          <div className="input-group">
            <label>Attachment (Screenshot / Image)</label>
            {/* Custom File Upload UI */}
            <label htmlFor="file-upload" className="custom-file-upload">
              <span>📁 Click to upload a screenshot</span>
            </label>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])} 
              style={{display: 'none'}} 
            />
            {file && <span className="file-name-display">Selected: {file.name}</span>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitTicket;