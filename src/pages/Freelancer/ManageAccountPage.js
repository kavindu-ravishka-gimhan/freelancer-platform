import React, { useState, useEffect } from 'react';
import './Styles/ManageAccountPage.css';

const ManageAccountPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [shortBio, setShortBio] = useState('');
    const [skills, setSkills] = useState('');
    const [degree, setDegree] = useState('');
    const [university, setUniversity] = useState('');
    const [graduationYear, setGraduationYear] = useState('');

    const [activeTab, setActiveTab] = useState('account');

    useEffect(() => {
        const loadLocalStorage = () => {
            setFirstName(localStorage.getItem('first_name') || '');
            setLastName(localStorage.getItem('last_name') || '');
            setProfilePic(localStorage.getItem('profilePic') || '');
            setShortBio(localStorage.getItem('shortBio') || '');
            setSkills(localStorage.getItem('skills') || '');
            setDegree(localStorage.getItem('degree') || '');
            setUniversity(localStorage.getItem('university') || '');
            setGraduationYear(localStorage.getItem('graduationYear') || '');
        };
        loadLocalStorage();
    }, []);

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000);
    };

    const handleAccountUpdate = async () => {
        const userId = localStorage.getItem('id');
        if (!firstName || !lastName || !password) {
            showMessage('Please fill in all required fields for account details.', 'error');
            return;
        }

        try {
            const res = await fetch(`http://freelancer-platform-jmkm.onrender.com/api/update-user-details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, firstName, lastName, password })
            });

            const data = await res.json();
            if (data.success) {
                localStorage.setItem('first_name', firstName);
                localStorage.setItem('last_name', lastName);
                showMessage('Account details updated successfully!', 'success');
            } else {
                showMessage(`Update failed: ${data.message || 'Unknown error'}`, 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('An error occurred while updating account details. Please try again later.', 'error');
        }
    };

    const handleEducationUpdate = async () => {
        const freelancerId = localStorage.getItem('id'); // Get freelancer ID from localStorage
    
        if (!shortBio || !skills || !degree || !university || !graduationYear) {
            showMessage('Please fill in all fields for education and skills.', 'error');
            return;
        }
    
        try {
            const res = await fetch(`http://freelancer-platform-jmkm.onrender.com/api/insert-education-details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ freelancerId, shortBio, skills, degree, university, graduationYear })
            });
    
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('shortBio', shortBio);
                localStorage.setItem('skills', skills);
                localStorage.setItem('degree', degree);
                localStorage.setItem('university', university);
                localStorage.setItem('graduationYear', graduationYear);
                showMessage('Education and skills updated successfully!', 'success');
            } else {
                showMessage(`Failed to update: ${data.message || 'Unknown error'}`, 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('An error occurred while updating education and skills details. Please try again later.', 'error');
        }
    };

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setProfilePic(reader.result);
        reader.readAsDataURL(file);

        try {
            const formData = new FormData();
            formData.append('profilePic', file);
            formData.append('userId', localStorage.getItem('id'));

            const response = await fetch(`http://freelancer-platform-jmkm.onrender.com/api/upload-profile-pic`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                const fullUrl = `http://localhost:5000${data.filePath}`;
                localStorage.setItem('profilePic', fullUrl);
                setProfilePic(`${fullUrl}?t=${Date.now()}`);
                showMessage('Profile picture updated successfully!', 'success');
            } else {
                showMessage('Failed to upload profile picture. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showMessage('Error uploading profile picture. Please check your internet connection and try again.', 'error');
        }
    };

    return (
        <div className="account-container">
            <h2 className="dashboardtitle">Manage Your Account</h2>
            <p className='dashboardpara'>Update Your Account Details Below</p>

            {message && <div className="message-overlay"></div>}
            {message && <div className={`message-box ${messageType}`}>{message}</div>}

            {/* Navigation Tabs */}
            <div className="tab-nav">
                <button onClick={() => setActiveTab('account')} className={activeTab === 'account' ? 'active' : ''}>Account Details</button>
                <button onClick={() => setActiveTab('education')} className={activeTab === 'education' ? 'active' : ''}>Education & Skills</button>
            </div>

            {activeTab === 'account' && (
                <div className={`profile-details ${message ? 'dimmed' : ''}`}>
                    <div className="account-box">
                        <div className="profile-section">
                            <label>Edit Your Profile Picture</label>
                            <img
                                key={profilePic}
                                src={profilePic || "https://via.placeholder.com/100"}
                                alt="Profile"
                                className="profile-preview"
                                onClick={() => document.getElementById('profile-upload').click()}
                                onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
                            />
                            <input
                                type="file"
                                id="profile-upload"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleProfilePicUpload}
                            />
                        </div>

                        <div className="form-group">
                            <label>First Name</label>
                            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div className="update-section">
                            <button className="update-btn" onClick={handleAccountUpdate}>Update Account Details</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'education' && (
                <div className={`education-details ${message ? 'dimmed' : ''}`}>
                    <div className="form-group">
                        <label>Short Bio / About Me</label>
                        <input
                            value={shortBio}
                            onChange={(e) => setShortBio(e.target.value)}
                            placeholder="e.g., 'Full-stack developer with 5+ years of experience in MERN stack.'"
                        />
                    </div>

                    <div className="form-group">
                        <label>Skills</label>
                        <input
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g., JavaScript, Node.js, React, SQL"
                        />
                    </div>

                    <div className="form-group">
                        <label>Degree</label>
                        <input value={degree} onChange={(e) => setDegree(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>University/Institute</label>
                        <input value={university} onChange={(e) => setUniversity(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Year of Graduation</label>
                        <input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
                    </div>

                    <div className="update-section">
                        <button className="update-btn" onClick={handleEducationUpdate}>Update Education & Skills</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAccountPage;
