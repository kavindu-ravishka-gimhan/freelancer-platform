import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Styles/SeeApplicantsPage.css';

const SeeApplicantsPage = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jobTitle, setJobTitle] = useState("");
    const [showHireSuccess, setShowHireSuccess] = useState(false);
    const [hiredClientId, setHiredClientId] = useState(null);
    const [hireError, setHireError] = useState(null); // <-- NEW

    useEffect(() => {
        const fetchJobTitle = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/job-title/${jobId}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setJobTitle(data.title);
            } catch (err) {
                console.error('Job title fetch error:', err);
            }
        };

        const fetchApplicants = async () => {
            try {
                const response = await fetch(`http://localhost:5000/job_applications/${jobId}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setApplicants(data);
                setError(null);
            } catch (err) {
                console.error('Applicants fetch error:', err);
                setError(err.message);
                setApplicants([]);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJobTitle();
            fetchApplicants();
        }
    }, [jobId]);

    const handleHire = async (clientId) => {
        const freelancerId = localStorage.getItem('id');
        setHireError(null); // reset previous error

        if (!freelancerId) {
            alert('Freelancer ID not found');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/hire-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, clientId, freelancerId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to hire client.');
            }

            setHiredClientId(clientId);
            setShowHireSuccess(true);
        } catch (error) {
            console.error('Error hiring client:', error);
            setHireError(error.message); // show error on UI
        }
    };

    if (loading) return <div>Loading applicants...</div>;
    if (error) return <div>Error: {error}</div>;

    // Success Modal
    const SuccessModal = () => (
        <div className="hire-success-modal-overlay">
            <div className="hire-success-modal">
                <div className="success-icon-container">
                    <div className="success-checkmark">✓</div>
                </div>
                <h3 className="success-modal-title">Hired Successfully!</h3>
                <p className="success-modal-text">
                    You've successfully hired this client.
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

    // Error Modal
    const ErrorModal = () => (
        <div className="error-modal-overlay">
            <div className="error-modal">
                
                <p>{hireError}</p>
                <button className="error-close-btn" onClick={() => setHireError(null)}>Close</button>
            </div>
        </div>
    );

    return (
        <div className="applicants-container">
            <div className="title-wrapper">
                <h2 className="dashboardtitle">
                    Applicants for {jobTitle || `#${jobId}`}
                </h2>
            </div>

            {applicants.length === 0 ? (
                <p>No applicants found for this job.</p>
            ) : (
                <div className="applicants-list">
                    {applicants.map((applicant) => (
                        <div key={applicant.client_id} className="applicant-card">
                            <div className="applicant-info">
                                <p><strong>Name:</strong> {applicant.first_name} {applicant.last_name}</p>
                                <p><strong>Email:</strong> {applicant.email}</p>
                                <Link
                                    to={`/ApplicantDetailsPage/${applicant.client_id}?jobId=${jobId}`}
                                    className="see-more-btn"
                                >
                                    See More Details
                                </Link>
                            </div>
                            <div className="button-group">
                                <button 
                                    className="hire-btn" 
                                    onClick={() => handleHire(applicant.client_id)} 
                                    disabled={hiredClientId === applicant.client_id}
                                >
                                    {hiredClientId === applicant.client_id ? 'Hired' : 'Hire'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showHireSuccess && <SuccessModal />}
            {hireError && <ErrorModal />} {/* Display error modal if there's an error */}
        </div>
    );
};

export default SeeApplicantsPage;
