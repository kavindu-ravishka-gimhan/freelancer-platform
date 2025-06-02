import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Styles/OngoingProjects.css';
import { useNavigate } from 'react-router-dom';

const OngoingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const freelancer_id = localStorage.getItem('id');
  const navigate = useNavigate();

  useEffect(() => {
    if (!freelancer_id) {
      setError("Freelancer ID is not available in local storage.");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`http://localhost:5000/api/freelancer/ongoing-projects?freelancer_id=${freelancer_id}`)
      .then(response => {
        setProjects(response.data);
        setError(null);
      })
      .catch(error => {
        setError(`Failed to load projects: ${error.response?.data?.message || error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [freelancer_id]);

  const handleAcceptDeliveryClick = (project) => {
    setSelectedProject({
      ...project,
      freelancer_id: freelancer_id,
      Budget: project.budget,
    });
  };

  const handleMakePayment = () => {
    navigate('/MakePayment', {
      state: { project: selectedProject }
    });
  };

  const handleAddReview = () => {
    setShowReview(true);
  };

  const handleSubmitReview = () => {
  const reviewData = {
    freelancer_id: selectedProject.freelancer_id,
    client_id: selectedProject.client_id,
    job_id: selectedProject.job_id,
    rating: rating,
    feedback: review,
  };
  console.log('Submitting review data:', reviewData);  // Log the data

  axios.post('http://localhost:5000/api/submit-review', reviewData)
    .then(() => {
      setProjects(prev =>
        prev.map(p =>
          p.id === selectedProject.id ? { ...p, status: 'Completed' } : p
        )
      );
      setShowReview(false);
      navigate('/MakePayment', {
        state: { project: selectedProject }
      });
      setSelectedProject(null);
      setRating(0);
      setReview('');
    })
    .catch(error => {
      console.error('Review submission failed:', error);
      alert("Failed to submit review. Please try again.");
    });
};

  const handleCancel = () => {
    setSelectedProject(null);
    setShowReview(false);
    setRating(0);
    setReview('');
  };

  return (
    <div className="projectscontainer">
      <h2 className="introtex">
        Track your active projects and confirm completion once the work is delivered.
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Freelancer ID: {freelancer_id}</p>
        </div>
      ) : projects.length === 0 ? (
        <p>No ongoing projects for Freelancer ID: {freelancer_id}</p>
      ) : (
        projects.map((project) => (
          <div key={project.id} className="project-wrapper">
            <div className="project-header">
              <div className="project-title">Project Title: {project.title || "No Title Found"}</div>
              <div className="project-id">Project ID: {project.job_id}</div>
            </div>

            <div className={`project-card ${project.status.toLowerCase() === 'completed' ? 'status-completed' : 'status-in-progress'}`}>
              <div className="project-details">
                <div className="status">
                  <span className='stlable'>Status :</span>
                  <span className="status-circle"></span>
                  <span className={`status-text ${project.status.toLowerCase() === 'completed' ? 'status-completed' : 'status-in-progress'}`}>
                    {project.status}
                  </span>
                </div>

                <div className="uploaded-work">
                  Uploaded Work {
                    project.submitted_work ? (
                      <a
                        href={`http://localhost:5000/uploads/${project.submitted_work}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        Download
                      </a>
                    ) : 'No work submitted yet.'
                  }
                </div>

                <div className="actions-inline">
                  <label className="action-label">Actions :</label>
                  <button
                    className="action-button"
                    onClick={() => handleAcceptDeliveryClick(project)}
                  >
                    {project.status === 'Completed' ? 'Make Payment' : 'Accept Delivery'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {selectedProject && (
  <div className="confirmation-overlay">
    <div className="confirmation-box">
      <p>Are you sure you want to mark <strong>{selectedProject.title}</strong> as completed?</p>
      <div className="button-group">
        <button className="conbutton" onClick={handleAddReview}>Add Review</button>
        <button className="conbutton" onClick={handleMakePayment}>Make Payment</button>
        <button className="cancbutton" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  </div>
)}

      {showReview && (
  <div className="confirmation-overlay">
    <div className="confirmation-box">
      <h3>Rate and Review</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="review-input"
              placeholder="Write your feedback here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            /> <div className="button-group">
        <button className="conbutton" onClick={handleSubmitReview}>Submit & Pay</button>
        <button className="cancbutton" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default OngoingProjects;
