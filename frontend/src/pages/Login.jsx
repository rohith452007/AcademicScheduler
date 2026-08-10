import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const data = await authService.login({ username, password });
            if (data.token) {
                localStorage.setItem('token', data.token); // Store token
                localStorage.setItem('userRole', data.user.role); // Store role

                // Redirect based on role
                if (data.user.role === 'admin') {
                    navigate('/manage');
                } else if (data.user.role === 'faculty') {
                    navigate('/faculty-manage');
                } else if (data.user.role === 'student') {
                    navigate('/student-manage');
                } else {
                    navigate('/student-manage'); // Default fallback
                }
            } else {
                setError('Login failed: No token received');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed. Check console/backend connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2><center>Timetable Portal</center></h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username or Email:</label>
                    <input
                        type="text"
                        placeholder="Enter username or email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={loading}>
                    {loading && (
                        <>
                            <style>
                                {`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                                `}
                            </style>
                            <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" />
                                <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </>
                    )}
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <div style={{ marginTop: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.9em', color: '#0056b3' }}>Forgot Password?</Link>
                    <span style={{ color: '#ccc' }}>|</span>
                    <Link to="/register-institute" style={{ fontSize: '0.9em', color: '#0056b3' }}>Register Institute</Link>
                </div>
            </form>
        </div>
    );
}

export default Login;
