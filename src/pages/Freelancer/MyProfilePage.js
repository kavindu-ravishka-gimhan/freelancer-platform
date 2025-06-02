import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles/MyProfilePage.css';

const MyProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState('');
  const backendUrl = 'http://localhost:5000';

  useEffect(() => {
    const freelancerId = localStorage.getItem('id');

    const fetchProfileData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/freelancer-details/${freelancerId}`),
          axios.get(`${backendUrl}/api/freelancer-reviews/${freelancerId}`),
        ]);

        setProfileData(profileRes.data);
        setReviews(reviewsRes.data);

        // Handle profile picture from localStorage
        const storedProfilePic = localStorage.getItem('profilePic');
        if (storedProfilePic) {
          const fullUrl = storedProfilePic.startsWith('/uploads')
            ? `${backendUrl}${storedProfilePic}`
            : storedProfilePic;
          setProfilePic(`${fullUrl}?${new Date().getTime()}`); // Cache busting
        }

        // Calculate average rating
        const ratings = reviewsRes.data.map(review => review.rating);
        const average = ratings.length
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : null;
        setAverageRating(average);

      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    };

    if (freelancerId) fetchProfileData();
  }, []);

  const renderRatingStars = (rating) => {
    const rounded = Math.round(rating);
    return [...Array(5)].map((_, index) => (
      <span 
        key={index} 
        className={`profile-rating-star ${index < rounded ? 'filled' : ''}`}
      >
        ★
      </span>
    ));
  };

  if (loading) return <div className="profile-loading">Loading Profile...</div>;
  if (!profileData) return <div className="profile-error">Profile not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-intro-card">
          <div className="profile-avatar">
            {profilePic ? (
              <img 
                src={profilePic} 
                alt="Profile" 
                className="profile-avatar-image" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="avatar-initials">
                {profileData.first_name[0]}
                {profileData.last_name[0]}
              </div>
            )}
            {!profilePic && (
              <div className="avatar-initials">
                {profileData.first_name[0]}
                {profileData.last_name[0]}
              </div>
            )}
          </div>
          <div className="profile-title">
            <div className="profile-name-rating">
              <h1>{profileData.first_name} {profileData.last_name}</h1>
              {averageRating && (
                <div className="profile-rating below-right">
                  {renderRatingStars(averageRating)}
                  <span className="rating-value">{averageRating}</span>
                </div>
              )}
            </div>
            {profileData.short_bio && (
              <p className="elevated-bio">{profileData.short_bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="skills-section">
          <h2 className="section-title with-underline">Expertise</h2>
          <div className="skills-grid">
            {profileData.skills.split(',').map((skill, index) => (
              <div key={index} className="skill-card gradient-hover">
                <h3 className="skill-name">{skill.trim()}</h3>
                <div className="skill-decoration"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="reviews-section">
          <h2 className="section-title with-underline">Client Feedback</h2>
          <div className="reviews-grid">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="review-card slide-in">
                  <div className="review-header">
                    <div className="client-avatar pulse">
                      {review.first_name[0]}{review.last_name[0]}
                    </div>
                    <div className="client-info">
                      <h3>{review.first_name} {review.last_name}</h3>
                      <div className="review-rating">
                        {renderRatingStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="review-content">{review.feedback}</p>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>🌟 Be the first to leave a review! 🌟</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;