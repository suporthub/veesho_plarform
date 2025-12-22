const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

/**
 * Authenticate JWT token
 * Verifies token from Authorization header and attaches admin to request
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get admin from database
        const admin = await Admin.findByPk(decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Admin not found.'
            });
        }

        if (!admin.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        // Attach admin to request
        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication failed.',
            error: error.message
        });
    }
};

/**
 * Role-based authorization middleware
 * Checks if authenticated admin has required role(s)
 * 
 * Role hierarchy: super_admin > write > read
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Role hierarchy
        const roleHierarchy = {
            'read': 1,
            'write': 2,
            'super_admin': 3
        };

        const userRoleLevel = roleHierarchy[req.admin.role];
        const requiredRoleLevel = Math.min(...allowedRoles.map(role => roleHierarchy[role]));

        // Check if user's role level meets or exceeds the required level
        if (userRoleLevel >= requiredRoleLevel) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.admin.role}`
        });
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
