import React, { useEffect, useState, useCallback } from 'react';
//import ClientHeader from '../../components/FreelancerHeader';
import axios from 'axios';
import './Styles/FreelancerPage.css';

const categories = [
  'Software Development', 'Web Development & Design', 'Data & AI',
  'Cybersecurity', 'IT Infrastructure & Networking', 'Database Management',
  'Software Testing & QA', 'IT Support & Services', 'Project & Product Management',
  'Emerging Technologies', 'Design', 'Marketing', 'Writing', 'Data Entry', 'Customer Support'
];

const JobCard = ({ job, onApply, hasApplied }) => (
  <div className="job-card" key={job.id}>
    <h2>{job.title}</h2>
    <p><strong>Category:</strong> {job.category}</p>
    <p><strong>Description:</strong> {job.description}</p>
    <p><strong>Skills:</strong> {Array.isArray(job.skills) ? job.skills.join(', ') : job.skills}</p>
    <p><strong>Budget:</strong> ${job.budget}</p>
    <p><strong>Deadline:</strong> {job.deadline}</p>
    <p><strong>Project ID:</strong> {job.id}</p>
    <div className="job-actions center">
      <button 
        className={`apply-btn ${hasApplied ? 'applied' : ''}`} 
        onClick={() => onApply(job)}
        disabled={hasApplied}
      >
        {hasApplied ? 'Already Applied' : 'Apply'}
      </button>
    </div>
  </div>
);

const ConfirmationModal = ({ job, onClose, onConfirm, alreadyApplied }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      {alreadyApplied ? (
        <>
          <h3>You've already applied for <span style={{ color: "#007bff" }}>{job.title}</span></h3>
          <div className="modal-buttons">
            <button className="ok-btn" onClick={onClose}>OK</button>
          </div>
        </>
      ) : (
        <>
          <h3>Do you want to apply for <span style={{ color: "#007bff" }}>{job.title}</span>?</h3>
          <div className="modal-buttons">
            <button className="yes-btn" onClick={() => onConfirm(job)}>Yes</button>
            <button className="no-btn" onClick={onClose}>No</button>
          </div>
        </>
      )}
    </div>
  </div>
);

const FreelancerPage = () => {
  const [role, setRole] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const clientId = localStorage.getItem('id');

  const fetchJobs = useCallback(() => {
    axios.get('http://localhost:5000/api/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error('Error fetching jobs:', err));
  }, []);

  const fetchAppliedJobs = useCallback(() => {
    if (!clientId) return;
    axios.get(`http://localhost:5000/applied-jobs/${clientId}`)
      .then(res => setAppliedJobs(res.data.map(job => job.job_id)))
      .catch(err => console.error('Error fetching applied jobs:', err));
  }, [clientId]);

  useEffect(() => {
    setRole(localStorage.getItem('role'));
    fetchJobs();
    fetchAppliedJobs();
  }, [fetchJobs, fetchAppliedJobs]);

  const handleApply = (job) => {
    if (appliedJobs.includes(job.id)) {
      setAlreadyApplied(true);
    }
    setSelectedJob(job);
  };

  const handleConfirmApply = (job) => {
    axios.post('http://localhost:5000/api/apply', {
      client_id: clientId,
      job_id: job.id,
    })
    .then(() => {
      alert(`✅ Your application for "${job.title}" has been submitted successfully!`);
      setAppliedJobs([...appliedJobs, job.id]);
      setSelectedJob(null);
    })
    .catch((err) => {
      if (err.response && err.response.data.alreadyApplied) {
        setAlreadyApplied(true);
      } else {
        console.error('Error applying to job:', err);
        alert('Something went wrong. Please try again.');
      }
    });
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setAlreadyApplied(false);
  };

  const handleFilter = () => {
    axios.get('http://localhost:5000/api/jobs', {
      params: {
        category: selectedCategory,
        budget: selectedBudget,
        time: selectedTime
      }
    })
    .then(res => setJobs(res.data))
    .catch(err => console.error('Error applying filters:', err));
  };

  if (role !== 'Freelancer') return <h1>You are not authorized to view this page</h1>;

  return (
    <div>
      
      <div className="dashboard-container">
        <h2 className="dashboardtitle">Explore Opportunities & Start Your Next Project</h2>

        <div className="filter-buttons">
          <select className="filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
          </select>
          <select className="filter-select" value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)}>
            <option value="">Select Budget</option>
            <option value="100">Up to $100</option>
            <option value="500">Up to $500</option>
            <option value="1000">Up to $1000</option>
            <option value="5000">Up to $5000</option>
          </select>
          <select className="filter-select" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
            <option value="">Select Time</option>
            <option value="1">1 Week</option>
            <option value="2">2 Weeks</option>
            <option value="4">1 Month</option>
          </select>
          <button className="search-btn" onClick={handleFilter}>Search</button>
        </div>

        <div className="job-list">
          {jobs.length === 0 ? (
            <p>No jobs available.</p>
          ) : (
            jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onApply={handleApply}
                hasApplied={appliedJobs.includes(job.id)}
              />
            ))
          )}
        </div>
      </div>

      {selectedJob && (
        <ConfirmationModal
          job={selectedJob}
          onClose={handleCloseModal}
          onConfirm={handleConfirmApply}
          alreadyApplied={alreadyApplied}
        />
      )}
    </div>
  );
};

export default FreelancerPage;
