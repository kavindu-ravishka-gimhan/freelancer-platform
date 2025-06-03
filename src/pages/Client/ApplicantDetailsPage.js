import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Styles/ApplicantDetailsPage.css';

const ApplicantDetailsPage = () => {
    const { clientId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const jobId = queryParams.get('jobId');

    const [freelancerDetails, setFreelancerDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showHireSuccess, setShowHireSuccess] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`http://freelancer-platform-jmkm.onrender.com/api/freelancer-details/${clientId}`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setFreelancerDetails(data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await fetch(`http://freelancer-platform-jmkm.onrender.com/api/freelancer-reviews/${clientId}`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setReviews(data);
            } catch (err) {
                console.error("Review fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
        fetchReviews();
    }, [clientId]);

    const handleHire = async (clientId) => {
    const freelancerId = localStorage.getItem('id');
    if (!freelancerId) return alert('Freelancer ID not found');

    try {
        const res = await fetch('http://freelancer-platform-jmkm.onrender.com/api/hire-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, clientId, freelancerId }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        setShowHireSuccess(true);
    } catch (err) {
        console.error('Error hiring client:', err);
    }
};

    const renderRatingStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <span 
                key={index} 
                className={`profile-rating-star ${index < rating ? 'filled' : ''}`}
            >
                ★
            </span>
        ));
    };

    if (loading) return <div className="profile-loading">Loading...</div>;
    if (error) return <div className="profile-error">Error: {error}</div>;
    if (!freelancerDetails) return <div className="profile-not-found">No details found for this freelancer.</div>;

const SuccessModal = () => (
    <div className="hire-success-modal-overlay">
        <div className="hire-success-modal">
            <div className="success-icon-container">
                <div className="success-checkmark">✓</div>
            </div>
            <h3 className="success-modal-title">Hired Successfully!</h3>
            <p className="success-modal-text">
                You've successfully hired this freelancer.
                <br />
                Check your ongoing projects to manage the collaboration.
            </p>
            <button 
                className="success-modal-close-btn"
                onClick={() => setShowHireSuccess(false)}
            >
                Continue
            </button>
        </div>
    </div>
);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-main-title">
                     {freelancerDetails.first_name}'s Profile
                </h1> 
                <div class="profile-hire-btn-container">   
                <button class="profile-hire-btn" 
                    
                    onClick={() => handleHire(clientId)}
                >
                    Hire Now
                </button>
                </div>   
            </div>

            <div className="profile-content-wrapper">
                <div className="profile-main-section">
                    <div className="profile-about-card">
                        <h2 className="profile-section-title">About Me</h2>
                        <p className="profile-bio-text">{freelancerDetails.short_bio}</p>
                        
                        <div className="profile-skills-container">
                            {freelancerDetails.skills.split(',').map((skill, index) => (
                                <span key={index} className="profile-skill-tag">{skill.trim()}</span>
                            ))}
                        </div>
                    </div>

                    <div className="profile-education-card">
                        <h2 className="profile-section-title">Education</h2>
                        <div className="education-details">
                            <p className="education-degree">{freelancerDetails.degree}</p>
                            <p className="education-university">{freelancerDetails.university}</p>
                            <p className="education-year">Graduated: {freelancerDetails.graduation_year}</p>
                        </div>
                    </div>
                </div>

                <div className="profile-reviews-section">
                    <h2 className="profile-section-title">Client Reviews </h2>
                    
                    {reviews.length > 0 ? (
                        <div className="reviews-grid">
                            {reviews.map((review, index) => (
                                <div key={index} className="review-card">
                                    <div className="review-client-info">
                                        <div className="client-avatar-placeholder">
                                            {review.first_name.charAt(0)}{review.last_name.charAt(0)}
                                        </div>
                                        <div className="client-name-wrapper">
                                            <p className="client-name">{review.first_name} {review.last_name}</p>
                                            <p className="review-date">March 2024</p>
                                        </div>
                                    </div>
                                    <div className="review-rating-wrapper">
                                        {renderRatingStars(review.rating)}
                                        <span className="rating-number">{review.rating}</span>
                                    </div>
                                    <p className="review-content">{review.feedback}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-reviews-placeholder">
                            <p>No reviews available yet</p>
                        </div>
                    )}
                </div>
            </div>
            {showHireSuccess && <SuccessModal />}
        </div>
    );
};

export default ApplicantDetailsPage;
