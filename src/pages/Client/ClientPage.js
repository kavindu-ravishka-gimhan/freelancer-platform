import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import './Styles/myjobs.css';

const JobCard = ({ job, onEdit, onDelete, onSeeApplicants }) => {
    return (
        <div className="job-card" key={job.id}>
            <h2>{job.title}</h2>
            <p><strong>Category:</strong> {job.category}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Skills:</strong> {Array.isArray(job.skills) ? job.skills.join(', ') : job.skills}</p>
            <p><strong>Budget:</strong> ${job.budget}</p>
            <p><strong>Deadline:</strong> {job.deadline}</p>
            <p><strong>Project ID:</strong> {job.id}</p>
            <div className="job-actions">
                <button onClick={() => onEdit(job.id)}>Edit</button>
                <button onClick={() => onDelete(job.id)}>Delete</button>
                <button onClick={() => onSeeApplicants(job.id)}>See Applicants</button>
            </div>
        </div>
    );
};

const ClientPage = () => {
    const [role, setRole] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const roleFromStorage = localStorage.getItem('role');
        const idFromStorage = localStorage.getItem('id');
        setRole(roleFromStorage);
        if (roleFromStorage === 'Client' && idFromStorage) { // Changed from 'Freelancer' to 'Client'
            fetchJobs(idFromStorage);
        }
    }, []);

   const fetchJobs = async (freelancerId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/jobsClient?freelancer_id=${freelancerId}`);
        const data = await response.json();
        setJobs(data);
    } catch (err) {
        console.error('Error fetching jobs:', err);
    }
};

    const handleDelete = async () => {
    try {
        const response = await fetch(`http://localhost:5000/api/jobs/${selectedJobId}`, {
            method: 'DELETE',
        });

        // Check if response is successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete job');
        }

        // Update state correctly
        setJobs(prevJobs => prevJobs.filter(job => job.id !== selectedJobId));
        setShowModal(false);
    } catch (err) {
        console.error('Error deleting job:', err);
        alert(err.message); // Show error to user
    }
};
    const handleEdit = (jobId) => {
        navigate(`/update-job/${jobId}`);
    };

    const handleSeeApplicants = (jobId) => {
        navigate(`/see-applicants/${jobId}`);
    };

    const openModal = (jobId) => {
        setSelectedJobId(jobId);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    if (role !== 'Client') { // Changed from 'Freelancer' to 'Client'
        return <h1>You are not authorized to view this page</h1>;
    }

    return (
        <div className="dashboard-container">
            <h2 className="dashboardtitle">Manage Your Posted Jobs</h2>
            <div className="job-management">
                <div className="job-list">
                    {jobs.length === 0 ? (
                        <p>No jobs found for this freelancer.</p>
                    ) : (
                        jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onEdit={handleEdit}
                                onDelete={() => openModal(job.id)}
                                onSeeApplicants={handleSeeApplicants}
                            />
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Are you sure you want to delete this job?</h3>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                            <button className="confirm-btn" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientPage;