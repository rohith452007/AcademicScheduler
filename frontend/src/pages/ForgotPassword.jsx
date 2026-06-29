import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: Code Verification, 3: New Password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Request OTP Code
    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const data = await authService.forgotPassword(email);
            if (data.success) {
                setMessage(data.message || 'A 6-digit verification code has been sent to your email.');
                setStep(2);
            } else {
                setError(data.message || 'Failed to request password reset code.');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to request password reset code. Please check your backend connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP Code
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (code.trim().length !== 6) {
            setError('Please enter a valid 6-digit verification code.');
            setLoading(false);
            return;
        }

        try {
            const data = await authService.verifyCode(email, code.trim());
            if (data.success) {
                setMessage('Verification code matches! Please enter your new password.');
                setStep(3);
            } else {
                setError(data.message || 'Verification code is invalid or has expired.');
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

    // Step 3: Set New Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (password.length < 4) {
            setError('Password must be at least 4 characters long.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

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
                setError('Failed to update password. Code may have expired.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2><center>Password Recovery</center></h2>
            
            {/* Step Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', padding: '0 10px' }}>
                <div style={{ textAlign: 'center', opacity: step === 1 ? 1 : 0.4, fontWeight: step === 1 ? 'bold' : 'normal' }}>
                    <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: '#007bff', color: '#fff', lineHeight: '24px', marginRight: '5px' }}>1</span>
                    Request Code
                </div>
                <div style={{ textAlign: 'center', opacity: step === 2 ? 1 : 0.4, fontWeight: step === 2 ? 'bold' : 'normal' }}>
                    <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: '#007bff', color: '#fff', lineHeight: '24px', marginRight: '5px' }}>2</span>
                    Verify Code
                </div>
                <div style={{ textAlign: 'center', opacity: step === 3 ? 1 : 0.4, fontWeight: step === 3 ? 'bold' : 'normal' }}>
                    <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: '#007bff', color: '#fff', lineHeight: '24px', marginRight: '5px' }}>3</span>
                    New Password
                </div>
            </div>

            {error && <p className="error" style={{ color: 'red', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
            {message && <p className="success" style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}
            
            {/* Step 1: Email Form */}
            {step === 1 && (
                <form onSubmit={handleSendCode}>
                    <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
                        Enter your registered email address to receive a 6-digit verification code.
                    </p>
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
                    <button type="submit" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </button>
                </form>
            )}

            {/* Step 2: Verification Code Form */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode}>
                    <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
                        Please check your email and enter the 6-digit verification code below. If you don't see it, check your spam folder.
                    </p>
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
                            style={{ letterSpacing: '4px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="button" onClick={() => setStep(1)} style={{ flex: 1, backgroundColor: '#6c757d' }} disabled={loading}>
                            Back
                        </button>
                        <button type="submit" style={{ flex: 2 }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 3: New Password Form */}
            {step === 3 && (
                <form onSubmit={handleResetPassword}>
                    <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
                        Enter your new password below.
                    </p>
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
                    <button type="submit" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                </form>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/login" style={{ fontSize: '0.9em', color: '#0056b3' }}>Back to Login</Link>
            </div>
        </div>
    );
}

export default ForgotPassword;
