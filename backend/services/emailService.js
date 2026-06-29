const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@timetableportal.com';

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,      // 587 uses STARTTLS
    requireTLS: true,
    family: 4,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});
    console.log('Email Service: SMTP Transporter configured.');
} else {
    console.log('Email Service: SMTP credentials missing. Reset codes will be logged to console.');
}

/**
 * Sends a password reset OTP email via SMTP.
 * @param {string} toEmail - Recipient email address
 * @param {string} username - Recipient's username
 * @param {string} code - 6-digit OTP code
 * @param {string} instituteName - Name of the institute (for branding)
 */
exports.sendResetCodeEmail = async (toEmail, username, code, instituteName = 'Timetable Portal') => {
    const mailOptions = {
        from: `"${instituteName}" <${SMTP_FROM}>`,
        to: toEmail,
        subject: `Password Reset Code - ${instituteName}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border-radius: 16px 16px 0 0; padding: 32px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                        🎓 ${instituteName}
                    </h1>
                    <p style="color: #bfdbfe; margin: 6px 0 0; font-size: 13px;">Timetable Management Portal</p>
                </div>

                <!-- Body -->
                <div style="background-color: #ffffff; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; padding: 36px 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 20px;">Password Reset Request</h2>
                    <p style="color: #475569; font-size: 15px; margin: 0 0 8px;">Hello <strong>${username}</strong>,</p>
                    <p style="color: #475569; font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
                        We received a request to reset your password. Use the verification code below — it's valid for <strong>15 minutes</strong>.
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px dashed #2563eb; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 28px;">
                        <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px;">Your Verification Code</p>
                        <span style="font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #1e3a8a; font-family: monospace;">
                            ${code}
                        </span>
                    </div>

                    <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">
                        ⚠️ If you did not request a password reset, you can safely ignore this email. Your account remains secure.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 18px 30px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        This email was sent by <strong>${instituteName}</strong> Timetable Portal.<br/>
                        Do not reply to this email.
                    </p>
                </div>
            </div>
        `
    };

    if (transporter) {
        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Password reset code sent to: ${toEmail}`);
            return { sent: true };
        } catch (error) {
            console.error('Error sending email via SMTP:', error.message);
        }
    }

    // Console fallback when SMTP not configured
    console.log('\n========================================================================');
    console.log('✉️  [LOCAL EMAIL LOG] PASSWORD RESET CODE');
    console.log(`To: ${toEmail}`);
    console.log(`Institute: ${instituteName}`);
    console.log(`Username: ${username}`);
    console.log(`Reset Code: ${code}`);
    console.log('========================================================================\n');
    return { sent: true, loggedToConsole: true };
};
