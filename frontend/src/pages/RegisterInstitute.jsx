import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function RegisterInstitute() {
    const [instituteName, setInstituteName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const data = await authService.registerInstitute({
                institute_name: instituteName.trim(),
                username: username.trim(),
                email: email.trim(),
                password
            });

            if (data.success) {
                setMessage(data.message || 'Institute registered successfully! Redirecting to login page...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Username or email may already be in use.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2><center>Register Institute</center></h2>
            {error && <p className="error" style={{ color: 'red', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
            {message && <p className="success" style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Institute Name:</label>
                    <input
                        type="text"
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        required
                        placeholder="e.g. IIT Bombay"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label>Admin Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="e.g. admin_iitb"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label>Admin Email Address:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@iitb.ac.in"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label>Admin Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Min 4 characters"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label>Confirm Admin Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Repeat password"
                        disabled={loading}
                    />
                </div>
                <button type="submit" style={{ width: '100%', marginTop: '15px' }} disabled={loading}>
                    {loading ? 'Registering Institute...' : 'Register Institute'}
                </button>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/login" style={{ fontSize: '0.9em', color: '#0056b3' }}>Already registered? Login</Link>
                </div>
            </form>
        </div>
    );
}

export default RegisterInstitute;
