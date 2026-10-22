import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';
import '../App.css';

const RequesterDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth(); 
  const navigate = useNavigate();

  // Filter & Pagination State
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 5; // Number of tickets per page

  useEffect(() => {
    fetchTickets();
  }, [user, statusFilter, dateFilter, page, navigate]);

  const fetchTickets = async () => {
    if (!user) return navigate('/login');
    setLoading(true);

    // Start the query
    let query = supabase
      .from('tickets')
      .select('*')
      .eq('requester_id', user.id);

    // Apply Filters
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (dateFilter) {
      // Filter by date (e.g., 2026-10-22)
      query = query.gte('created_at', `${dateFilter}T00:00:00`).lte('created_at', `${dateFilter}T23:59:59`);
    }

    // Apply Pagination (Range)
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error } = await query;

    if (!error && data) {
      setTickets(data);
      setHasMore(data.length === pageSize); // If we got a full page, there might be more
    }
    setLoading(false);
  };

  const handleDelete = async (ticketId, status) => {
    let confirmMessage = "Are you sure you want to delete this ticket?";
    if (status === 'in_progress') {
      confirmMessage = "Warning: A technician is currently working on this ticket. If you delete it, they will lose access. Are you sure?";
    }
    if (!window.confirm(confirmMessage)) return;

    const { error } = await supabase.from('tickets').delete().eq('id', ticketId);

    if (error) {
      alert("Error deleting ticket: " + error.message);
    } else {
      // Refresh the list on the current page
      fetchTickets();
    }
  };

  const initial = profile?.full_name 
    ? profile.full_name.charAt(0).toUpperCase() 
    : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo-container" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src={logo} alt="Tech Flow Logo" className="logo-img" />
          <span className="logo-text">TECH <span className="text-teal">FLOW</span></span>
        </div>
        <div className="nav-actions">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboard/requester" className="nav-link active">My Tickets</Link>
          <Link to="/profile" className="avatar-btn" title="Profile Settings">{initial}</Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>My Support Tickets</h2>
          <Link to="/submit-ticket" className="btn btn-primary">+ Submit New Ticket</Link>
        </div>

        {/* FILTER BAR */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Status:</label>
            <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date:</label>
            <input 
              type="date" 
              className="form-select" 
              value={dateFilter} 
              onChange={(e) => { setDateFilter(e.target.value); setPage(0); }} 
            />
          </div>
          {(statusFilter !== 'all' || dateFilter) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setStatusFilter('all'); setDateFilter(''); setPage(0); }}>
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading your tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <h3>No tickets found</h3>
            <p>You haven't submitted any support requests matching these filters.</p>
          </div>
        ) : (
          <>
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="tech-ticket-card">
                  <div className="ticket-cutout left"></div>
                  <div className="ticket-cutout right"></div>
                  
                  <div className="ticket-info">
                    <h4>{ticket.issue_name}</h4>
                    <p className="ticket-device">{ticket.device_type}</p>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <a href={ticket.attachments[0]} target="_blank" rel="noreferrer" className="attachment-link">
                        📎 View Attachment
                      </a>
                    )}
                  </div>
                  
                  <div className="ticket-meta">
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="ticket-date">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    
                    <div className="ticket-actions">
                      {ticket.status === 'in_progress' && (
                        <Link to={`/chat/${ticket.id}`} className="btn btn-primary btn-sm" style={{marginRight: '10px'}}>
                          💬 Chat
                        </Link>
                      )}
                      <Link to={`/edit-ticket/${ticket.id}`} className="btn-action edit-btn" title="Edit Ticket">
                        ✎
                      </Link>
                      <button onClick={() => handleDelete(ticket.id, ticket.status)} className="btn-action delete-btn" title="Delete Ticket">
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="pagination-controls">
              <button 
                className="btn btn-outline btn-sm" 
                disabled={page === 0} 
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span className="page-indicator">Page {page + 1}</span>
              <button 
                className="btn btn-outline btn-sm" 
                disabled={!hasMore} 
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
      <Footer openModal={() => {}} />
    </div>
  );
};

export default RequesterDashboard;