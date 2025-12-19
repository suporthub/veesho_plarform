const multer = require('multer');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Handle Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 15MB.',
                error: err.code
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field.',
                error: err.code
            });
        }
        return res.status(400).json({
            success: false,
            message: 'File upload error.',
            error: err.message
        });
    }

    // Handle file type validation error
    if (err.message && err.message.includes('Only .jpg')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: messages
        });
    }

    // Handle Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry error',
            errors: err.errors.map(e => e.message)
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};

module.exports = { errorHandler, notFoundHandler };
