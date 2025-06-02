import React, { useState } from 'react';
import axios from 'axios';
import '../styles/signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        country: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Freelancer',
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match!');
            setSuccessMessage('');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/signup', formData);
            setSuccessMessage(response.data.message);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error registering user');
            setSuccessMessage('');
        }
    };

    return (
        <div className="signup-container">
            <h2 style={{ marginBottom: '20px', fontWeight: 400, fontFamily: 'Roboto, sans-serif',color: '#565656' }}>Create Your Worklux Account</h2>

            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="name-fields">
                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                </div>

                <div className="country-fields">
                    <select name="country" value={formData.country} onChange={handleChange} required>
                        <option value="">Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="LK">Sri Lanka</option>
                        {/* Add more countries */}
                    </select>
                </div>

                <div className="email-fields">
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="password-fields">
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                </div>

                <div className="password-fields">
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                </div>

                <div className="role-selection">
                    <span>Choose your role</span>
                    <label>
                        <input type="radio" name="role" value="Freelancer" checked={formData.role === 'Freelancer'} onChange={handleChange} />
                        Freelancer
                    </label>
                    <label>
                        <input type="radio" name="role" value="Client" checked={formData.role === 'Client'} onChange={handleChange} />
                        Client
                    </label>
                </div>

                <button type="submit" className="signup-button">SIGN UP</button>
            </form>

            <p>Already have a Worklux Account? <a href="/signin">Sign in</a></p>
        </div>
    );
};

export default Signup;
