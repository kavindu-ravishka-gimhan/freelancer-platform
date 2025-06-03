import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png.png';
import './FreelancerHeader.css';

const FreelancerHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [profilePic, setProfilePic] = useState('');

    useEffect(() => {
        const name = localStorage.getItem('username') || 'User Name';
        setUserName(name);

        const storedProfilePic = localStorage.getItem('profilePic');
        if (storedProfilePic) {
            const backendUrl = 'freelancer-platform-jmkm.onrender.com';
            const fullUrl = storedProfilePic.startsWith('/uploads')
                ? `${backendUrl}${storedProfilePic}`
                : storedProfilePic;

            setProfilePic(fullUrl);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('id');
        localStorage.removeItem('username');
        localStorage.removeItem('profilePic');
        navigate('/', { replace: true });
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const goToAccount = () => {
        navigate('/ManageAccountPage');
        setSidebarOpen(false);
    };

    const goToProfile = () => {
        navigate('/MyProfilePage'); // Make sure this route exists in your router
        setSidebarOpen(false);
    };

     const goToAddPayment = () => {
        navigate('/AddPaymentDetails'); // Make sure this route exists in your router
        setSidebarOpen(false);
    };
    const goToCompletedProjectsFreelancer =()=>{
        navigate('/CompletedProjectsFreelancer');
        setSidebarOpen(false);
    }

    const handleProfilePicUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('profilePic', file);
            formData.append('userId', localStorage.getItem('id'));

            const backendUrl = 'http://localhost:5000';
            const response = await fetch(`${backendUrl}/api/upload-profile-pic`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.success) {
                const imageUrl = `${backendUrl}${data.filePath}?${new Date().getTime()}`;
                setProfilePic(imageUrl);
                localStorage.setItem('profilePic', imageUrl);
                setSidebarOpen(false);
                setTimeout(() => setSidebarOpen(true), 100);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message}`);
        }
    };

    

    return (
        <>
            <header className="freelancer-header">
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <nav>
                    <ul className="nav-links">
                        <li>
                            <button
                                onClick={() => navigate('/FreelancerPage')}
                                className={location.pathname === '/FreelancerPage' ? 'active' : ''}
                            >
                                Find Work
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/ongoingProjectClient')}
                                className={location.pathname === '/ongoingProjectClient' ? 'active' : ''}
                            >
                                Ongoing Projects
                            </button>
                        </li>
                        <li>
                            <div className="profile-circle" onClick={toggleSidebar}>
                                {profilePic ? (
                                    <img src={profilePic} alt="Add" className="profile-img" />
                                ) : (
                                    '👤'
                                )}
                            </div>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-profile">
                    <img
                        src={profilePic || "https://via.placeholder.com/100"}
                        alt="Profile"
                        className="profile-pic"
                        onClick={() => document.getElementById('profile-pic-input').click()}
                    />
                    <input
                        type="file"
                        id="profile-pic-input"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                    />
                    <h3>{userName}</h3>
                </div>
                <button onClick={goToProfile} className="sidebar-link">My Profile</button>
                <button onClick={goToAccount} className="sidebar-link">Manage Your Account</button>
                
                <button onClick={goToAddPayment} className="sidebar-link">Add Payment Details</button>
                 <button onClick={goToCompletedProjectsFreelancer} className="sidebar-link">Completed Projects</button>
         

                
                <button onClick={handleLogout} className="sidebar-logout">Log Out</button>
            </div>

            {/* Overlay */}
            {sidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default FreelancerHeader;
