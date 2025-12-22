const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Store OTP with expiration (5 minutes)
const storeOTP = (email, otp) => {
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(email, { otp, expiry });
};

// Verify OTP
const verifyOTP = (email, otp) => {
    const stored = otpStore.get(email);

    if (!stored) {
        return { valid: false, message: 'No OTP found. Please request a new one.' };
    }

    if (Date.now() > stored.expiry) {
        otpStore.delete(email);
        return { valid: false, message: 'OTP expired. Please request a new one.' };
    }

    if (stored.otp !== otp) {
        return { valid: false, message: 'Invalid OTP code.' };
    }

    otpStore.delete(email);
    return { valid: true };
};

// Send 2FA email
const send2FAEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Veesho Platform <noreply@veesho.com>',
            to: email,
            subject: 'Your 2FA Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Veesho Platform - 2FA Verification</h2>
                    <p>Your verification code is:</p>
                    <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #6366f1; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
                    </div>
                    <p>This code will expire in <strong>5 minutes</strong>.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="color: #6b7280; font-size: 12px;">Veesho Platform - Admin Panel</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send backup codes email
const sendBackupCodesEmail = async (email, codes) => {
    try {
        const transporter = createTransporter();

        const codesList = codes.map((code, index) =>
            `<li style="margin: 5px 0;">${index + 1}. <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${code}</code></li>`
        ).join('');

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Veesho Platform <noreply@veesho.com>',
            to: email,
            subject: 'Your 2FA Backup Codes',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Veesho Platform - Backup Codes</h2>
                    <p>Your 2FA backup codes are:</p>
                    <ul style="list-style: none; padding: 0;">
                        ${codesList}
                    </ul>
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
                        <strong>Important:</strong> Store these codes securely. Each code can be used once to access your account if you lose access to your 2FA method.
                    </div>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="color: #6b7280; font-size: 12px;">Veesho Platform - Admin Panel</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    send2FAEmail,
    sendBackupCodesEmail
};
