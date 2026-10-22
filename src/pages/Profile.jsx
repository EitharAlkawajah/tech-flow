import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';
import '../App.css';

const Profile = () => {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPortfolioUrl(profile.portfolio_url || '');
    }
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let cvUrl = profile?.cv_url || null;

    if (profile?.role === 'technician' && cvFile) {
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `${user.id}-cv-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('technician-docs').upload(fileName, cvFile);
      if (uploadError) {
        alert("Error uploading CV: " + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('technician-docs').getPublicUrl(fileName);
      cvUrl = publicUrlData.publicUrl;
    }

    const updateData = { full_name: fullName };
    if (profile?.role === 'technician') {
      updateData.portfolio_url = portfolioUrl;
      if (cvUrl) updateData.cv_url = cvUrl;
    }

    const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);

    if (error) alert("Error updating profile: " + error.message);
    else alert("Profile updated successfully!");
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmDelete) return;
    setLoading(true);
    const { error } = await supabase.rpc('delete_user');
    if (error) alert("Error deleting account: " + error.message);
    else {
      alert("Account deleted successfully.");
      await supabase.auth.signOut();
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo-container" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src={logo} alt="Tech Flow Logo" className="logo-img" />
          <span className="logo-text">TECH <span className="text-teal">FLOW</span></span>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate(-1)} className="btn btn-outline">Back</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="profile-card">
          <h2>Profile Settings</h2>
          <p>Manage your account details.</p>
          
          <div className="profile-info-badge">
            <strong>Role:</strong> {profile?.role === 'technician' ? 'Technician' : 'Requester'}
          </div>

          <form onSubmit={handleUpdate} className="auth-form" style={{marginTop: '20px'}}>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            
            <div className="input-group">
              <label>Email (Cannot be changed)</label>
              <input type="email" value={user?.email || ''} disabled style={{backgroundColor: '#f1f5f9', color: '#94a3b8'}} />
            </div>

            {profile?.role === 'technician' && (
              <>
                <div className="input-group">
                  <label>Portfolio Link</label>
                  <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://github.com/yourusername" />
                </div>

                <div className="input-group">
                  <label>Upload CV (PDF)</label>
                  <label htmlFor="cv-upload" className="custom-file-upload">
                    <span>📄 Click to upload your CV</span>
                  </label>
                  <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files[0])} style={{display: 'none'}} />
                  {cvFile && <span className="file-name-display">Selected: {cvFile.name}</span>}
                  {profile?.cv_url && !cvFile && (
                    <a href={profile.cv_url} target="_blank" rel="noreferrer" className="attachment-link" style={{color: 'var(--teal-dark)'}}>
                      📎 View Current CV
                    </a>
                  )}
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* NEW LOGOUT BUTTON */}
          <div style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
            <button onClick={handleLogout} className="btn btn-outline w-100" style={{ borderColor: 'var(--text-light)', color: 'var(--text-dark)' }}>
              Log Out
            </button>
          </div>

          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDeleteAccount} className="btn btn-danger" disabled={loading}>
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;