import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get('email') || '';
    const navigate = useNavigate();

    const [email, setEmail] = useState(emailParam);
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Email is required.');
            return;
        }

        if (!code || code.trim().length !== 6) {
            setError('Please enter a valid 6-digit verification code.');
            return;
        }

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
            const data = await authService.resetPassword(email, code.trim(), password);
            if (data.success) {
                setMessage('Your password has been successfully reset! Redirecting to login page...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Failed to reset password.');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Verification code is invalid or expired. Please check and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2><center>Reset Password</center></h2>
            <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#666', marginBottom: '20px' }}>
                Please enter your registered email, the 6-digit verification code, and your new password below.
            </p>
            {error && <p className="error">{error}</p>}
            {message && <p className="success" style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{message}</p>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email Address:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="yourname@domain.com"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label>6-Digit Verification Code:</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        disabled={loading}
                        style={{ letterSpacing: '2px', fontWeight: 'bold' }}
                    />
                </div>
                <div>
                    <label>New Password:</label>
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
                    <label>Confirm New Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Repeat new password"
                        disabled={loading}
                    />
                </div>
                <button type="submit" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Resetting...' : 'Update Password'}
                </button>
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <Link to="/login" style={{ fontSize: '0.9em', color: '#0056b3' }}>Back to Login</Link>
                </div>
            </form>
        </div>
    );
}

export default ResetPassword;
