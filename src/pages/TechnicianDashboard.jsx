import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';
import '../App.css';

const TechnicianDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'active'
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 5;

  useEffect(() => {
    fetchTickets();
  }, [user, activeTab, deviceFilter, dateFilter, page, navigate]); 
  // Note: We exclude searchTerm from the useEffect and handle it with a delay or manual search to prevent API spamming on every keystroke. 
  // For this build, we will trigger search when the user clicks a "Search" button or presses Enter.

  const fetchTickets = async () => {
    if (!user) return navigate('/login');
    setLoading(true);

    let query = supabase.from('tickets').select('*');

    // 1. Tab Filtering
    if (activeTab === 'queue') {
      query = query.eq('status', 'open');
    } else {
      query = query.eq('technician_id', user.id).in('status', ['in_progress', 'resolved']);
    }

    // 2. Custom Filters
    if (deviceFilter !== 'all') {
      query = query.eq('device_type', deviceFilter);
    }
    if (dateFilter) {
      query = query.gte('created_at', `${dateFilter}T00:00:00`).lte('created_at', `${dateFilter}T23:59:59`);
    }
    if (searchTerm.trim()) {
      // Search by issue name
      query = query.ilike('issue_name', `%${searchTerm.trim()}%`);
    }

    // 3. Pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error } = await query;

    if (!error && data) {
      setTickets(data);
      setHasMore(data.length === pageSize);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0); // Reset to page 1 on new search
    fetchTickets();
  };

  const handleAcceptTicket = async (ticketId) => {
    const { error } = await supabase
      .from('tickets')
      .update({ technician_id: user.id, status: 'in_progress' })
      .eq('id', ticketId);

    if (error) alert("Error accepting ticket: " + error.message);
    else {
      alert("Ticket accepted! Going to chat...");
      navigate(`/chat/${ticketId}`);
    }
  };

  const handleCancelHelp = async (ticketId) => {
    if (!window.confirm("Are you sure you want to cancel helping with this ticket? It will return to the open queue.")) return;

    const { error } = await supabase
      .from('tickets')
      .update({ technician_id: null, status: 'open' })
      .eq('id', ticketId);

    if (error) alert("Error canceling help: " + error.message);
    else fetchTickets(); // Refresh list
  };

  const initial = profile?.full_name 
    ? profile.full_name.charAt(0).toUpperCase() 
    : (user?.email ? user.email.charAt(0).toUpperCase() : 'T');

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo-container" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src={logo} alt="Tech Flow Logo" className="logo-img" />
          <span className="logo-text">TECH <span className="text-teal">FLOW</span></span>
        </div>
        <div className="nav-actions">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/profile" className="avatar-btn" title="Profile Settings">{initial}</Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="toggle-container" style={{marginTop: 0}}>
            <button className={`toggle-btn ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => { setActiveTab('queue'); setPage(0); }}>
              Open Ticket Queue
            </button>
            <button className={`toggle-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => { setActiveTab('active'); setPage(0); }}>
              My Active Tickets
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="filter-bar">
          <form onSubmit={handleSearch} className="search-form-group">
            <input 
              type="text" 
              placeholder="Search issues..." 
              className="form-input search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-outline btn-sm">Search</button>
          </form>

          <div className="filter-group">
            <label>Device:</label>
            <select className="form-select" value={deviceFilter} onChange={(e) => { setDeviceFilter(e.target.value); setPage(0); }}>
              <option value="all">All Devices</option>
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Phone">Phone</option>
              <option value="Printer">Printer</option>
              <option value="Software">Software / App</option>
              <option value="Other">Other</option>
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

          {(deviceFilter !== 'all' || dateFilter || searchTerm) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setDeviceFilter('all'); setDateFilter(''); setSearchTerm(''); setPage(0); }}>
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <h3>{activeTab === 'queue' ? 'Queue is Empty' : 'No Active Tickets'}</h3>
            <p>{activeTab === 'queue' ? 'There are no open tickets matching your search.' : 'You have no active tickets.'}</p>
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
                  </div>
                  
                  <div className="ticket-meta">
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    
                    <div className="ticket-actions">
                      {activeTab === 'queue' ? (
                        <button onClick={() => handleAcceptTicket(ticket.id)} className="btn btn-primary btn-sm">
                          Accept Ticket
                        </button>
                      ) : (
                        <>
                          <Link to={`/chat/${ticket.id}`} className="btn btn-primary btn-sm">
                            Open Chat
                          </Link>
                          {ticket.status === 'in_progress' && (
                            <button onClick={() => handleCancelHelp(ticket.id)} className="btn btn-danger btn-sm" style={{marginLeft: '10px'}}>
                              Cancel Help
                            </button>
                          )}
                        </>
                      )}
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

export default TechnicianDashboard;