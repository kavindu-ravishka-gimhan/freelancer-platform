import { useState } from 'react';
//import FreelancerHeader from '../../components/FreelancerHeader';
import './Styles/CreateNewJobs.css';

const CreateNewJobs = () => {
    const [jobDetails, setJobDetails] = useState({
        title: '',
        category: '',
        description: '',
        skills: '',
        budget: '',
        deadline: ''
    });
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const freelancer_id = localStorage.getItem('id'); // Get freelancer ID
    
        const jobData = { ...jobDetails, freelancer_id };
    
        try {
            const response = await fetch('http://localhost:5000/post-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });
    
            const result = await response.json();
            if (response.ok) {
                setSuccessMessage('Job posted successfully!');
                setTimeout(() => {
                    setSuccessMessage('');  // Hide message after 5 seconds
                }, 5000);
                handleCancel(); // Reset form
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error posting job:', error);
            alert('Failed to post job. Please try again later.');
        }
    };
    
    const handleCancel = () => {
        setJobDetails({
            title: '',
            category: '',
            description: '',
            skills: '',
            budget: '',
            deadline: ''
        });
    };

    const categories = [
        'Software Development',
        'Web Development & Design',
        'Data & AI',
        'Cybersecurity',
        'IT Infrastructure & Networking',
        'Database Management',
        'Software Testing & QA',
        'IT Support & Services',
        'Project & Product Management',
        'Emerging Technologies',
        'Design',
        'Marketing',
        'Writing',
        'Data Entry',
        'Customer Support'
      ];
      

    return (
        <>
            
            <div className="intro-container">
                <h2 className="intro-text">Describe your project, set a budget, and find the perfect freelancer for the job!</h2>
            </div>
            <div className="page-container">
                <div className="create-job-container">
                    <form onSubmit={handleSubmit}>
                        <label>
                            Title<br />
                            <input
                                type="text"
                                name="title"
                                value={jobDetails.title}
                                onChange={handleChange}
                                required
                                className="small-input"
                            />
                        </label>

                        <label>
                            Category<br /><br />
                            <select
                                name="category"
                                value={jobDetails.category}
                                onChange={handleChange}
                                required
                                className="small-input"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Job description<br /><br />
                            <textarea
                                name="description"
                                value={jobDetails.description}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Skill required<br /><br />
                            <textarea
                                name="skills"
                                value={jobDetails.skills}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Budget<br />
                            <input
                                type="number"
                                name="budget"
                                value={jobDetails.budget}
                                onChange={handleChange}
                                required
                                className="small-input"
                            />
                        </label>

                        <label>
                            Deadline<br />
                            <input
                                type="date"
                                name="deadline"
                                value={jobDetails.deadline}
                                onChange={handleChange}
                                required
                                className="small-input"
                            /><br />
                        </label>

                        <div className="button-group">
                            <button type="submit" className="post-button">
                                Post Job
                            </button>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {successMessage && (
                    <div className="success-message">
                        <p>{successMessage}</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default CreateNewJobs;
