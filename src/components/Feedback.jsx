import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../App.css';

const Feedback = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      // Fetch reviews and join with profiles to get the requester's name
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:requester_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReviews(data);
      }
      setLoading(false);
    };

    fetchReviews();
  }, []);

  return (
    <section className="feedback-section" id="feedback">
      <div className="section-header">
        <span className="badge">USER & TECH EXPERIENCES</span>
        <h2>Community Feedback</h2>
        <p>See what requesters and technicians are saying about Tech Flow.</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading feedback...</p>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="speech-icon">💬</div>
          <h3>No Reviews Yet</h3>
          <p>Our community feedback hub is currently empty. Be among the first requesters or technicians to share your journey on Tech Flow!</p>
          <Link to="/register" className="btn btn-primary">Join to leave a review</Link>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.profiles?.full_name ? review.profiles.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4>{review.profiles?.full_name || 'Anonymous User'}</h4>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="review-rating">
                  {Array(review.rating).fill('⭐').join('')}
                </div>
              </div>
              <p className="review-comment">"{review.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Feedback;