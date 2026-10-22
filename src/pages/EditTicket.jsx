import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import '../App.css';

const EditTicket = () => {
  const { id } = useParams(); // Get ticket ID from URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issueName, setIssueName] = useState('');
  const [deviceType, setDeviceType] = useState('Laptop');
  const [description, setDescription] = useState('');
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        alert("Ticket not found.");
        navigate('/dashboard/requester');
        return;
      }

      // Security check: Make sure the user editing is the owner
      if (data.requester_id !== user.id) {
        alert("You do not have permission to edit this ticket.");
        navigate('/dashboard/requester');
        return;
      }

      setIssueName(data.issue_name);
      setDeviceType(data.device_type);
      setDescription(data.description);
      if (data.attachments && data.attachments.length > 0) {
        setExistingAttachment(data.attachments[0]);
      }
      setLoading(false);
    };
    fetchTicket();
  }, [id, user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    let attachmentUrl = existingAttachment;

    // Upload new file if selected
    if (newFile) {
      const fileExt = newFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, newFile);

      if (uploadError) {
        alert("Error uploading new file: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('ticket-attachments')
        .getPublicUrl(fileName);
      
      attachmentUrl = publicUrlData.publicUrl;
    }

    // Update the ticket
    const { error } = await supabase
      .from('tickets')
      .update({
        issue_name: issueName,
        device_type: deviceType,
        description: description,
        attachments: attachmentUrl ? [attachmentUrl] : []
      })
      .eq('id', id);

    if (error) {
      alert("Error updating ticket: " + error.message);
    } else {
      alert("Ticket updated successfully!");
      navigate('/dashboard/requester');
    }
    setLoading(false);
  };

  if (loading) return <div className="auth-container"><p>Loading...</p></div>;

  return (
    <div className="auth-container">
      <div className="auth-box" style={{maxWidth: '600px'}}>
        <button onClick={() => navigate(-1)} className="close-auth-btn" title="Back">×</button>
        <h2>Edit Ticket</h2>
        <p className="auth-subtitle">Update the details of your support request.</p>

        <form onSubmit={handleUpdate} className="auth-form">
          <div className="input-group">
            <label>Issue Title</label>
            <input type="text" value={issueName} onChange={(e) => setIssueName(e.target.value)} required />
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
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className="form-textarea"></textarea>
          </div>

          <div className="input-group">
            <label>Update Attachment (Optional)</label>
            {existingAttachment && !newFile && (
              <a href={existingAttachment} target="_blank" rel="noreferrer" className="attachment-link" style={{color: 'var(--teal-dark)', marginBottom: '10px', display: 'inline-block'}}>
                📎 View Current Attachment
              </a>
            )}
            
            <label htmlFor="file-upload" className="custom-file-upload">
              <span>📁 Choose a new file (overwrites old)</span>
            </label>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              onChange={(e) => setNewFile(e.target.files[0])} 
              style={{display: 'none'}} 
            />
            {newFile && <span className="file-name-display">Selected: {newFile.name}</span>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTicket;