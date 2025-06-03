import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SignIn.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // To handle redirection

    const handleSignIn = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post('https://freelancer-platform-jmkm.onrender.com/signin', { email, password });
        
        // Store user data
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('id', response.data.id);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('profilePic', response.data.profilePic);

        // Store admin token separately
        if (response.data.token) {
            localStorage.setItem('adminToken', response.data.token);
        }

        // Redirect based on role
        switch(response.data.role) {
            case 'Freelancer':
                navigate('/FreelancerPage');
                break;
            case 'Client':
                navigate('/ClientPage');
                break;
            case 'Admin':
                navigate('/AdminPage');
                break;
            default:
                navigate('/');
        }
    } catch (error) {
        setError(error.response?.data?.message || 'Login failed');
    }
};

    return (
        <div>
            <div className="intro-container">
                <p className="intro-text">Unlock your projects and dive in.</p>
            </div>
            <div className="sign-in-container">
            <h2 style={{  fontFamily: 'Roboto, sans-serif', fontSize: '1.8rem', fontWeight: 400, color: '#565656', textAlign: 'center' }}>
                 Sign in to Worklux
                </h2><br></br>
                <form onSubmit={handleSignIn}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    /><br></br>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    /><br></br>
                    <button type="submit">SIGN IN</button><br></br>
                </form>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}<br></br>
                <p>Don't have an account? <Link to="/signup">Create a new one</Link>.</p>
            </div>
        </div>
    );
};

export default SignIn;
