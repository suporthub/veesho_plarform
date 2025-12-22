const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const {
    login,
    loginVerify,
    logout,
    register,
    getProfile,
    updateProfile,
    getAllAdmins,
    updateAdmin,
    deleteAdmin
} = require('../controllers/auth.controller');

const {
    get2FAStatus,
    setup2FA,
    enable2FA,
    disable2FA,
    resend2FAOTP
} = require('../controllers/twofa.controller');

// Validation rules
const loginValidation = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const registerValidation = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['read', 'write', 'super_admin']).withMessage('Role must be read, write, or super_admin')
];

const updateProfileValidation = [
    body('username')
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters'),
    body('email')
        .optional()
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const updateAdminValidation = [
    body('username')
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters'),
    body('email')
        .optional()
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['read', 'write', 'super_admin']).withMessage('Role must be read, write, or super_admin'),
    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean')
];

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Admin authentication and management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticateToken, logout);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create new admin (super_admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [read, write, super_admin]
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       403:
 *         description: Forbidden
 */
router.post('/register', authenticateToken, authorizeRoles('super_admin'), registerValidation, register);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update current admin profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);

/**
 * @swagger
 * /api/auth/admins:
 *   get:
 *     summary: Get all admins (super_admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admins retrieved successfully
 */
router.get('/admins', authenticateToken, authorizeRoles('super_admin'), getAllAdmins);

/**
 * @swagger
 * /api/auth/admin/{id}:
 *   put:
 *     summary: Update admin (super_admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [read, write, super_admin]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Admin updated successfully
 */
router.put('/admin/:id', authenticateToken, authorizeRoles('super_admin'), updateAdminValidation, updateAdmin);

/**
 * @swagger
 * /api/auth/admin/{id}:
 *   delete:
 *     summary: Delete admin (super_admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 */
router.delete('/admin/:id', authenticateToken, authorizeRoles('super_admin'), deleteAdmin);

// 2FA Login Verify
router.post('/login-verify', [
    body('temp_token').notEmpty(),
    body('code').notEmpty()
], loginVerify);

// 2FA Routes
router.get('/2fa/status', authenticateToken, get2FAStatus);
router.post('/2fa/setup', authenticateToken, [
    body('method').isIn(['email', 'totp'])
], setup2FA);
router.post('/2fa/enable', authenticateToken, [
    body('method').isIn(['email', 'totp']),
    body('code').notEmpty()
], enable2FA);
router.post('/2fa/disable', authenticateToken, disable2FA);
router.post('/2fa/resend', [
    body('email').isEmail()
], resend2FAOTP);

module.exports = router;
