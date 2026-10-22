import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import logo from '../assets/logo.png';
import '../App.css';

const ChatBoard = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [techName, setTechName] = useState('Unknown Technician');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(''); 
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  // WebRTC State
  const [isSharing, setIsSharing] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  // 1. Fetch initial data ONCE
  useEffect(() => {
    fetchTicketAndMessages();
  }, [id]);

  // 2. Setup Subscriptions ONCE (No dependencies that change)
  useEffect(() => {
    if (!user) return;

    // WebRTC Signaling
    channelRef.current = supabase.channel(`webrtc-${id}`);
    channelRef.current
      .on('broadcast', { event: 'webrtc-offer' }, async ({ payload }) => {
        // If I am the tech, receive the offer
        const { data: currentTicket } = await supabase.from('tickets').select('requester_id').eq('id', id).single();
        if (currentTicket && currentTicket.requester_id !== user.id) {
          await handleReceiveOffer(payload.offer);
        }
      })
      .on('broadcast', { event: 'webrtc-answer' }, async ({ payload }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      })
      .on('broadcast', { event: 'webrtc-ice' }, async ({ payload }) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {
            console.error("Error adding ICE candidate", e);
          }
        }
      })
      .subscribe();

    // Chat Messages Realtime
    const messageSub = supabase
      .channel(`room:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `ticket_id=eq.${id}` }, (payload) => {
        setMessages((prev) => {
          // Prevent duplicate messages in the UI
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSub);
      supabase.removeChannel(channelRef.current);
      if (peerConnectionRef.current) peerConnectionRef.current.close();
    };
  }, [id, user]); // Only depends on ID and User

  // 3. Auto scroll and mark read when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) markMessagesAsRead();
  }, [messages]);

  // 4. Bind remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const fetchTicketAndMessages = async () => {
    const { data: ticketData, error: ticketError } = await supabase.from('tickets').select('*').eq('id', id).single();
    if (ticketError || !ticketData) {
      alert("Could not load this ticket.");
      return navigate(-1);
    }
    setTicket(ticketData);

    if (ticketData.technician_id) {
      const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', ticketData.technician_id).single();
      if (profileData) setTechName(profileData.full_name);
    }

    const { data: msgData } = await supabase.from('messages').select('*').eq('ticket_id', id).order('created_at', { ascending: true });
    if (msgData) setMessages(msgData);
    setLoading(false);
  };

  const markMessagesAsRead = async () => {
    if (!user) return;
    const unread = messages.some(m => m.sender_id !== user.id && !m.is_read);
    if (unread) {
      await supabase.from('messages')
        .update({ is_read: true })
        .eq('ticket_id', id)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    let fileUrl = null;
    let msgType = 'text';

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('ticket-attachments').upload(fileName, file);
      if (!uploadError) {
        const { data } = supabase.storage.from('ticket-attachments').getPublicUrl(fileName);
        fileUrl = data.publicUrl;
        msgType = 'image';
      }
    }

    const textToSend = fileUrl ? fileUrl : newMessage;
    
    // We don't need to manually update state here, the Realtime subscription will catch it instantly!
    await supabase.from('messages').insert([{ ticket_id: id, sender_id: user.id, message_text: textToSend, type: msgType }]);
    
    setNewMessage('');
    setFile(null);
  };

  const handleAcceptHelp = async () => {
    await supabase.from('tickets').update({ requester_accepted: true }).eq('id', id);
    setTicket({ ...ticket, requester_accepted: true });
  };

  const handleDeclineHelp = async () => {
    if (!window.confirm("Are you sure? The technician will be removed.")) return;
    await supabase.from('tickets').update({ technician_id: null, status: 'open', requester_accepted: false }).eq('id', id);
    alert("Ticket returned to the open queue.");
    navigate('/dashboard/requester');
  };

  const openReviewModal = (action) => {
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    await supabase.from('reviews').insert([{ ticket_id: id, technician_id: ticket.technician_id, requester_id: user.id, rating: rating, comment: comment, review_type: reviewAction === 'solved' ? 'good' : 'bad' }]);

    if (reviewAction === 'solved') {
      await supabase.from('tickets').update({ status: 'resolved' }).eq('id', id);
      alert("Thank you! Ticket marked as resolved.");
      navigate('/dashboard/requester');
    } else {
      await supabase.from('tickets').update({ status: 'open', technician_id: null, requester_accepted: false }).eq('id', id);
      alert("Ticket returned to the queue for a new technician.");
      navigate('/dashboard/requester');
    }
  };

  // --- WEBRTC LOGIC ---
  const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      localStreamRef.current = stream;
      setIsSharing(true);

      await supabase.from('messages').insert([{ ticket_id: id, sender_id: user.id, message_text: "🖥️ Requester has started sharing their screen.", type: 'system' }]);

      const pc = new RTCPeerConnection(servers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channelRef.current.send({ type: 'broadcast', event: 'webrtc-ice', payload: { candidate: event.candidate } });
        }
      };

      // If the user stops sharing via the browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      channelRef.current.send({ type: 'broadcast', event: 'webrtc-offer', payload: { offer } });

    } catch (err) {
      console.error("Error sharing screen: ", err);
      setIsSharing(false);
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsSharing(false);
    supabase.from('messages').insert([{ ticket_id: id, sender_id: user.id, message_text: "🔒 Requester has stopped sharing their screen.", type: 'system' }]);
  };

  const handleReceiveOffer = async (offer) => {
    const pc = new RTCPeerConnection(servers);
    peerConnectionRef.current = pc;

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current.send({ type: 'broadcast', event: 'webrtc-ice', payload: { candidate: event.candidate } });
      }
    };

    // Handle disconnection (e.g., requester closed tab)
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setRemoteStream(null);
        alert("The remote screen connection was lost.");
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    channelRef.current.send({ type: 'broadcast', event: 'webrtc-answer', payload: { answer } });
  };

  if (loading) return <div className="auth-container"><p>Loading chat...</p></div>;
  if (!ticket) return null;

  const isRequester = ticket.requester_id === user.id;

  return (
    <div className="chat-page">
      <nav className="navbar">
        <div className="logo-container" onClick={() => navigate(-1)} style={{cursor: 'pointer'}}>
          <img src={logo} alt="Tech Flow Logo" className="logo-img" />
          <span className="logo-text">TECH <span className="text-teal">FLOW</span></span>
        </div>
        <div className="nav-actions">
          <span style={{color: 'var(--text-light)', fontWeight: 600, marginRight: '15px'}}>
            Ticket: {ticket.issue_name}
          </span>
          <button onClick={() => navigate(isRequester ? '/dashboard/requester' : '/dashboard/technician')} className="close-auth-btn" style={{position: 'relative', top: 0, right: 0, fontSize: '35px'}}>×</button>
        </div>
      </nav>

      <div className="chat-container">
        <div className="chat-header">
          <div>
            <h3>{ticket.issue_name}</h3>
            <p>{ticket.device_type} • Status: {ticket.status.replace('_', ' ')}</p>
          </div>
          {isRequester && ticket.status === 'in_progress' && (
            <button onClick={isSharing ? stopScreenShare : startScreenShare} className={`btn btn-sm ${isSharing ? 'btn-danger' : 'btn-primary'}`}>
              {isSharing ? '🔒 Stop Sharing' : '🖥️ Share Screen'}
            </button>
          )}
        </div>

        {/* REMOTE SCREEN VIEW (For Technician) */}
        {!isRequester && remoteStream && (
          <div className="remote-screen-container">
            <div className="remote-screen-header">
              <span>🖥️ Live Requester Screen</span>
            </div>
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          </div>
        )}

        <div className="chat-messages">
          {isRequester && ticket.status === 'in_progress' && !ticket.requester_accepted && (
            <div className="system-message-card">
              <p>The technician <strong>{techName}</strong> has taken your ticket regarding <strong>{ticket.issue_name}</strong>.</p>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button onClick={handleAcceptHelp} className="btn btn-primary btn-sm">Accept Help</button>
                <button onClick={handleDeclineHelp} className="btn btn-outline btn-sm">Decline</button>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === user.id;
            if (msg.type === 'system') return <div key={msg.id} className="system-msg">{msg.message_text}</div>;
            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                <div className="chat-bubble-text">
                  {msg.type === 'image' ? <img src={msg.message_text} alt="attachment" className="chat-image" /> : msg.message_text}
                </div>
                <div className="chat-meta-info">
                  <span className="chat-time">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  {isMine && <span className={`ticks ${msg.is_read ? 'read' : 'sent'}`}>{msg.is_read ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {ticket.status !== 'resolved' ? (
          <div className="chat-input-area">
            <form onSubmit={handleSendMessage} className="chat-form">
              <label htmlFor="chat-file" className="chat-attach-btn">📎</label>
              <input id="chat-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{display: 'none'}} />
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="chat-input" />
              <button type="submit" className="btn btn-primary chat-send-btn">Send</button>
            </form>
            {file && <span className="file-name-display" style={{textAlign: 'left', padding: '5px 10px'}}>Selected: {file.name}</span>}

            {isRequester && ticket.requester_accepted && (
              <div className="requester-actions">
                <button onClick={() => openReviewModal('solved')} className="btn btn-primary btn-sm" style={{backgroundColor: '#10b981'}}>✅ Issue Solved</button>
                <button onClick={() => openReviewModal('new_tech')} className="btn btn-danger btn-sm">❌ I want another technician</button>
              </div>
            )}
          </div>
        ) : (
          <div className="chat-resolved-banner">This ticket has been marked as resolved.</div>
        )}
      </div>

      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Leave a Review</h2>
            <div className="input-group">
              <label>Rating (1-5)</label>
              <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Comment</label>
              <textarea rows="3" className="form-textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the service?"></textarea>
            </div>
            <button onClick={submitReview} className="btn btn-primary w-100" style={{marginTop: '20px'}}>Submit Review</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBoard;