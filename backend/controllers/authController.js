const db = require('../config/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not configured.');
}

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username/email and password are required"
        });
    }

    try {
        // Allow login with either username or email
        const [rows] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const user = rows[0];

        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user.user_id,
                username: user.username,
                role: user.role,
                institute_id: user.institute_id
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.user_id,
                username: user.username,
                role: user.role,
                institute_id: user.institute_id
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    try {
        // Only look up users who already exist in the users table
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No account found with this email address."
            });
        }

        const user = rows[0];

        // Fetch the institute name for branded email
        let instituteName = 'Timetable Portal';
        if (user.institute_id) {
            const [instRows] = await db.query(
                'SELECT name FROM institutes WHERE institute_id = ?',
                [user.institute_id]
            );
            if (instRows.length > 0) instituteName = instRows[0].name;
        }

        // Generate a random 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?',
            [code, expires, user.user_id]
        );

        await emailService.sendResetCodeEmail(email, user.username, code, instituteName);

        res.status(200).json({
            success: true,
            message: "A 6-digit verification code has been sent to your email."
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during forgot password request"
        });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
        return res.status(400).json({
            success: false,
            message: "Email, verification code, and new password are required"
        });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > ?',
            [email, token, new Date()]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Verification code is invalid or has expired"
            });
        }

        const user = rows[0];

        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?',
            [password, user.user_id]
        );

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during password reset"
        });
    }
};

exports.verifyCode = async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({
            success: false,
            message: "Email and verification code are required"
        });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > ?',
            [email, token, new Date()]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Verification code is invalid or has expired"
            });
        }

        res.status(200).json({
            success: true,
            message: "Verification code matches"
        });

    } catch (error) {
        console.error("Verify Code Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during code verification"
        });
    }
};

exports.registerInstitute = async (req, res) => {
    const { institute_name, username, email, password } = req.body;

    if (!institute_name || !username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Check if Institute Name exists
        const [instCheck] = await conn.query(
            'SELECT * FROM institutes WHERE name = ?',
            [institute_name]
        );
        if (instCheck.length > 0) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: "Institute name already registered"
            });
        }

        // 2. Check if Username or Email exists
        const [userCheck] = await conn.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (userCheck.length > 0) {
            await conn.rollback();
            const msg = userCheck[0].username === username ? "Username is already taken" : "Email is already registered";
            return res.status(400).json({
                success: false,
                message: msg
            });
        }

        // 3. Create the Institute
        const [instResult] = await conn.query(
            'INSERT INTO institutes (name) VALUES (?)',
            [institute_name]
        );
        const newInstId = instResult.insertId;

        // 4. Create the Admin User
        await conn.query(
            'INSERT INTO users (username, password, role, email, institute_id) VALUES (?, ?, ?, ?, ?)',
            [username, password, 'admin', email, newInstId]
        );

        await conn.commit();
        res.status(201).json({
            success: true,
            message: "Institute and administrator account registered successfully!"
        });

    } catch (error) {
        await conn.rollback();
        console.error("Register Institute Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during institute registration"
        });
    } finally {
        conn.release();
    }
};