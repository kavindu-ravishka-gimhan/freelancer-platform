import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Styles/OngoingProject.css';

const OngoingProjectClient = () => {
    const [projects, setProjects] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [loadingStates, setLoadingStates] = useState({});

    useEffect(() => {
        const clientId = localStorage.getItem('id');
        if (!clientId) return;

        const fetchProjects = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/client/ongoing-projects`, {
                    params: { client_id: clientId }
                });
                setProjects(res.data);
            } catch (err) {
                console.error('Fetch error:', err);
                alert('Failed to load projects');
            }
        };
        fetchProjects();
    }, []);

    const handleFileChange = (e, projectId) => {
        setSelectedFiles(prev => ({
            ...prev,
            [projectId]: e.target.files[0]
        }));
    };

    const handleUpload = async (projectId) => {
        const file = selectedFiles[projectId];
        if (!file) return alert('Please select a file first');

        setLoadingStates(prev => ({ ...prev, [projectId]: true }));

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `http://localhost:5000/api/submit-work/${projectId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            setProjects(prevProjects =>
                prevProjects.map(project =>
                    project.ongoing_id === projectId
                        ? { ...project, submitted_work: response.data.filename, status: 'completed' }
                        : project
                )
            );

            alert('Work submitted successfully!');
        } catch (err) {
            console.error('Upload error:', err);
            alert(err.response?.data?.message || 'File upload failed');
        } finally {
            setLoadingStates(prev => ({ ...prev, [projectId]: false }));
        }
    };

    const calculateDaysLeft = (deadline) => {
        const now = new Date();
        const end = new Date(deadline);
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Overdue';
        if (diff === 0) return 'Due Today';
        return `${diff} day${diff !== 1 ? 's' : ''} left`;
    };

    return (
        <div className="cproj-container">
            <h2 className="cproj-intro-text">Manage Your Active Projects</h2>
            <div className="cproj-wrapper">
                {projects.length === 0 ? (
                    <p className="cproj-no-projects">No projects currently in progress.</p>
                ) : (
                    projects.map(project => (
                        <div className="cproj-card" key={project.ongoing_id}>
                            <div className="cproj-header">
                                <span className="cproj-title">Project Title : {project.title}</span>
                                <span className="cproj-id">Project ID : {String(project.job_id)}</span>
                            </div>
                            <div className="cproj-details">
                                <div className="cproj-label">Client Name : {project.freelancer_name}</div>
                                <div className={`cproj-label2 ${calculateDaysLeft(project.deadline) === 'Overdue' ? 'cproj-deadline-overdue' : ''}`}>
                                    Deadline: {calculateDaysLeft(project.deadline)}
                                </div>
                                <div className="cproj-status">
                                    <label className="cproj-status-label">Actions :</label>
                                    {project.submitted_work ? (
                                        <span className="cproj-status-text cproj-completed">Work submitted</span>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                id={`file-input-${project.ongoing_id}`}
                                                className="cproj-file-input"
                                                onChange={(e) => handleFileChange(e, project.ongoing_id)}
                                            />
                                            <label htmlFor={`file-input-${project.ongoing_id}`} className="cproj-action-btn">
                                                Choose File
                                            </label>
                                            {selectedFiles[project.ongoing_id] && (
                                                <button
                                                    className="cproj-action-btn"
                                                    onClick={() => handleUpload(project.ongoing_id)}
                                                    disabled={loadingStates[project.ongoing_id]}
                                                >
                                                    {loadingStates[project.ongoing_id] ? 'Uploading...' : 'Submit Work'}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OngoingProjectClient;
