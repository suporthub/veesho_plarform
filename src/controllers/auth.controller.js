const Admin = require('../models/admin.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const { generateOTP, storeOTP, verifyOTP, send2FAEmail } = require('../services/email.service');

/**
 * Generate JWT token
 */
const generateToken = (admin) => {
    return jwt.sign(
        {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

/**
 * LOGIN - Authenticate admin and return JWT token
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find admin by email
        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!admin.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact super admin.'
            });
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if 2FA is enabled
        if (admin.two_fa_enabled) {
            // Send OTP for email-based 2FA
            if (admin.two_fa_method === 'email') {
                const otp = generateOTP();
                storeOTP(admin.email, otp);
                await send2FAEmail(admin.email, otp);
            }

            // Generate temporary token for 2FA verification (5 minutes)
            const tempToken = jwt.sign(
                { id: admin.id, temp: true },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );

            return res.status(200).json({
                success: true,
                requires_2fa: true,
                two_fa_method: admin.two_fa_method,
                temp_token: tempToken,
                message: admin.two_fa_method === 'email'
                    ? 'Verification code sent to your email'
                    : 'Enter code from your authenticator app'
            });
        }

        // No 2FA - Generate full token
        const token = generateToken(admin);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                admin: admin.toJSON(),
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * REGISTER - Create new admin (super_admin only)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, email, password, role } = req.body;

        // Create admin
        const admin = await Admin.create({
            username,
            email,
            password,
            role: role || 'read'
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: admin.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET PROFILE - Get current admin profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: req.admin.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE PROFILE - Update current admin profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;
        const updateData = {};

        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) updateData.password = password;

        await req.admin.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: req.admin.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET ALL ADMINS - Get all admin users (super_admin only)
 * GET /api/auth/admins
 */
const getAllAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.findAll({
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            message: 'Admins retrieved successfully',
            count: admins.length,
            data: admins.map(admin => admin.toJSON())
        });
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE ADMIN - Update admin user (super_admin only)
 * PUT /api/auth/admin/:id
 */
const updateAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByPk(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: `Admin with ID ${id} not found`
            });
        }

        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, email, password, role, is_active } = req.body;
        const updateData = {};

        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (password !== undefined) updateData.password = password;
        if (role !== undefined) updateData.role = role;
        if (is_active !== undefined) updateData.is_active = is_active;

        await admin.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            data: admin.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE ADMIN - Delete admin user (super_admin only)
 * DELETE /api/auth/admin/:id
 */
const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByPk(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: `Admin with ID ${id} not found`
            });
        }

        // Prevent deleting yourself
        if (admin.id === req.admin.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        await admin.destroy();

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully',
            data: { id: parseInt(id) }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * LOGIN VERIFY - Verify 2FA code and complete login
 * POST /api/auth/login-verify
 */
const loginVerify = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { temp_token, code } = req.body;

        // Verify temp token
        let decoded;
        try {
            decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
            if (!decoded.temp) throw new Error('Invalid token');
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        // Get admin
        const admin = await Admin.findByPk(decoded.id);
        if (!admin || !admin.is_active || !admin.two_fa_enabled) {
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }

        let isValid = false;
        const backupCodes = admin.two_fa_backup_codes || [];
        const backupCodeIndex = backupCodes.indexOf(code.toUpperCase());

        if (backupCodeIndex !== -1) {
            backupCodes.splice(backupCodeIndex, 1);
            admin.two_fa_backup_codes = backupCodes;
            await admin.save();
            isValid = true;
        } else if (admin.two_fa_method === 'email') {
            const verification = verifyOTP(admin.email, code);
            if (!verification.valid) {
                return res.status(400).json({ success: false, message: verification.message });
            }
            isValid = true;
        } else if (admin.two_fa_method === 'totp') {
            isValid = speakeasy.totp.verify({
                secret: admin.two_fa_secret,
                encoding: 'base32',
                token: code,
                window: 2
            });
            if (!isValid) {
                return res.status(400).json({ success: false, message: 'Invalid verification code' });
            }
        }

        const token = generateToken(admin);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { admin: admin.toJSON(), token, expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * LOGOUT - Logout current admin
 */
const logout = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    loginVerify,
    logout,
    register,
    getProfile,
    updateProfile,
    getAllAdmins,
    updateAdmin,
    deleteAdmin
};
