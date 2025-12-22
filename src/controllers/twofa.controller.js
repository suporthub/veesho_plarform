const Admin = require('../models/admin.model');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { generateOTP, storeOTP, verifyOTP, send2FAEmail, sendBackupCodesEmail } = require('../services/email.service');

/**
 * Generate backup codes (3 codes)
 */
const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 3; i++) {
        codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
};

/**
 * GET 2FA STATUS
 * GET /api/auth/2fa/status
 */
const get2FAStatus = async (req, res, next) => {
    try {
        const admin = req.admin;

        res.status(200).json({
            success: true,
            data: {
                enabled: admin.two_fa_enabled,
                method: admin.two_fa_method
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * SETUP 2FA - Step 1: Initialize
 * POST /api/auth/2fa/setup
 */
const setup2FA = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { method } = req.body; // 'email' or 'totp'
        const admin = req.admin;

        if (admin.two_fa_enabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is already enabled. Disable it first to change method.'
            });
        }

        if (method === 'email') {
            // Generate and send OTP
            const otp = generateOTP();
            storeOTP(admin.email, otp);

            const emailResult = await send2FAEmail(admin.email, otp);

            if (!emailResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send email. Please try again.'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Verification code sent to your email',
                data: {
                    method: 'email',
                    email: admin.email
                }
            });
        } else if (method === 'totp') {
            // Generate TOTP secret
            const secret = speakeasy.generateSecret({
                name: `Veesho Platform (${admin.email})`,
                length: 32
            });

            // Generate QR code
            const qrCode = await QRCode.toDataURL(secret.otpauth_url);

            // Temporarily store secret (will be saved on verification)
            req.session = req.session || {};
            req.session.tempTotpSecret = secret.base32;

            return res.status(200).json({
                success: true,
                message: 'Scan the QR code with your authenticator app',
                data: {
                    method: 'totp',
                    secret: secret.base32,
                    qrCode: qrCode,
                    manualEntry: secret.base32
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid method. Use "email" or "totp"'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * ENABLE 2FA - Step 2: Verify and Enable
 * POST /api/auth/2fa/enable
 */
const enable2FA = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { method, code, secret } = req.body;
        const admin = req.admin;

        if (admin.two_fa_enabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is already enabled'
            });
        }

        let isValid = false;

        if (method === 'email') {
            const verification = verifyOTP(admin.email, code);
            isValid = verification.valid;

            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: verification.message
                });
            }
        } else if (method === 'totp') {
            // Use provided secret or session secret
            const totpSecret = secret || (req.session && req.session.tempTotpSecret);

            if (!totpSecret) {
                return res.status(400).json({
                    success: false,
                    message: 'TOTP secret not found. Please restart setup.'
                });
            }

            isValid = speakeasy.totp.verify({
                secret: totpSecret,
                encoding: 'base32',
                token: code,
                window: 2
            });

            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification code'
                });
            }

            // Save the secret
            admin.two_fa_secret = totpSecret;
        }

        // Generate backup codes
        const backupCodes = generateBackupCodes();

        // Enable 2FA
        admin.two_fa_enabled = true;
        admin.two_fa_method = method;
        admin.two_fa_backup_codes = backupCodes;
        await admin.save();

        // Send backup codes via email
        await sendBackupCodesEmail(admin.email, backupCodes);

        // Clear session secret if exists
        if (req.session && req.session.tempTotpSecret) {
            delete req.session.tempTotpSecret;
        }

        res.status(200).json({
            success: true,
            message: '2FA enabled successfully',
            data: {
                backupCodes: backupCodes
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DISABLE 2FA
 * POST /api/auth/2fa/disable
 */
const disable2FA = async (req, res, next) => {
    try {
        const admin = req.admin;

        if (!admin.two_fa_enabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is not enabled'
            });
        }

        // Disable 2FA
        admin.two_fa_enabled = false;
        admin.two_fa_method = null;
        admin.two_fa_secret = null;
        admin.two_fa_backup_codes = null;
        await admin.save();

        res.status(200).json({
            success: true,
            message: '2FA disabled successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * RESEND EMAIL OTP
 * POST /api/auth/2fa/resend
 */
const resend2FAOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Generate and send new OTP
        const otp = generateOTP();
        storeOTP(email, otp);

        const emailResult = await send2FAEmail(email, otp);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'New verification code sent to your email'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    get2FAStatus,
    setup2FA,
    enable2FA,
    disable2FA,
    resend2FAOTP
};
