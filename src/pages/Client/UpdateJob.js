import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import FreelancerHeader from '../../components/FreelancerHeader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Styles/updatejob.css';

const UpdateJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState({
        title: '',
        category: '',
        description: '',
        skills: '',
        budget: '',
        deadline: '',
    });

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
      

    useEffect(() => {
        fetch(`http://localhost:5000/api/jobs?freelancer_id=${localStorage.getItem('id')}`)
            .then(res => res.json())
            .then(data => {
                const selectedJob = data.find(j => j.id === parseInt(id));
                if (selectedJob) {
                    setJob(selectedJob);
                } else {
                    toast.error("Job not found.", { position: "top-center" });
                    navigate('/FreelancerPage');
                }
            })
            .catch(err => {
                console.error("Error fetching job:", err);
                toast.error("Something went wrong!", { position: "top-center" });
            });
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJob(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(job),
            });

            if (res.ok) {
                toast.success('🎉 Job updated successfully!', {
                    position: "top-center",
                    autoClose: 2000,
                    onClose: () => navigate('/ClientPage')
                });
            } else {
                toast.error('Update failed!', { position: "top-center" });
            }
        } catch (err) {
            console.error("Error updating job:", err);
            toast.error("Server error!", { position: "top-center" });
        }
    };

    return (
        <div>
           
            <div className="update-job-container">
                <h2>Edit Job</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-fields">
                        <label>Title</label>
                        <input
                            name="title"
                            value={job.title}
                            onChange={handleChange}
                            className="title-input"
                            required
                        /><br /><br />

                        <label>Category</label>
                        <select
                            name="category"
                            value={job.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select><br /><br />

                        <label>Description</label>
                        <textarea name="description" value={job.description} onChange={handleChange} required /><br /><br />

                        <label>Skills</label>
                        <textarea name="skills" value={job.skills} onChange={handleChange} required /><br /><br />

                        <label>Budget</label>
                        <input
                            name="budget"
                            type="number"
                            value={job.budget}
                            onChange={handleChange}
                            className="budget-input"
                            required
                        /><br /><br />

                        <label>Deadline</label>
                        <input
                            name="deadline"
                            type="date"
                            value={job.deadline}
                            onChange={handleChange}
                            className="deadline-input"
                            required
                        /><br /><br />

                        <div className="button-group">
                            <button type="submit" className="post-button">Save Changes</button>
                            <button type="button" className="cancel-button" onClick={() => navigate('/ClientPage')}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default UpdateJob;
