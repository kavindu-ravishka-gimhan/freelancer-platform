import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import FreelancerHeader from '../../components/FreelancerHeader';
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

const FreelancerPage = () => {
    const [role, setRole] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const roleFromStorage = localStorage.getItem('role');
        const idFromStorage = localStorage.getItem('id');
        setRole(roleFromStorage);
        if (roleFromStorage === 'Freelancer' && idFromStorage) {
            fetchJobs(idFromStorage);
        }
    }, []);

    const fetchJobs = async (freelancerId) => {
        try {
            const response = await fetch(`http://freelancer-platform-jmkm.onrender.com/api/jobs?freelancer_id=${freelancerId}`);
            const data = await response.json();
            setJobs(data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`http://freelancer-platform-jmkm.onrender.com/api/jobs/${selectedJobId}`, {
                method: 'DELETE',
            });
            setJobs(jobs.filter(job => job.id !== selectedJobId));
            setShowModal(false);
        } catch (err) {
            console.error('Error deleting job:', err);
        }
    };

    const handleEdit = (jobId) => {
        navigate(`/update-job/${jobId}`);
    };

    const handleSeeApplicants = (jobId) => {
    }};
