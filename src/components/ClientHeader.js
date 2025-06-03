import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png.png';
import './ClientHeader.css';

const ClientHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [profilePic, setProfilePic] = useState('');

    useEffect(() => {
        const name = localStorage.getItem('username') || 'Client Name';
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
        navigate('/ManageAccountPageClient'); // Updated to navigate to ManageAccountPageClient
        setSidebarOpen(false);
    };

     const goToCompletedProjects = () => {
        navigate('/CompletedProjects'); // Updated to navigate to ManageAccountPageClient
        setSidebarOpen(false);
    };

    /*const goToProfile = () => {
        navigate('/MyProfilePage');
        setSidebarOpen(false);
    };*/

    return (
        <>
            <header className="client-header">
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <nav>
                    <ul className="nav-links">
                        <li>
                            <button
                                onClick={() => navigate('/ClientPage')}
                                className={location.pathname === '/ClientPage' ? 'active' : ''}
                            >
                                My Jobs
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/createNewJobs')}
                                className={location.pathname === '/createNewJobs' ? 'active' : ''}
                            >
                                Create New Job
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/ongoingProjects')}
                                className={location.pathname === '/ongoingProjects' ? 'active' : ''}
                            >
                                Ongoing Projects
                            </button>
                        </li>
                        <li>
                            <div className="profile-circle" onClick={toggleSidebar}>
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="profile-img" />
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
                    />
                    <h3>{userName}</h3>
                </div>
                <button onClick={goToAccount} className="sidebar-link">Manage Your Account</button>
                <button onClick={goToCompletedProjects} className="sidebar-link">Completed Projects</button>
                
                <button onClick={handleLogout} className="sidebar-logout">Log Out</button>
            </div>

            {/* Overlay */}
            {sidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default ClientHeader;
