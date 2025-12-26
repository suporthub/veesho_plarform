const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { getDemoUsers, updateDemoUser, getClosedOrders } = require('../controllers/demo-users.controller');

/**
 * @swagger
 * /api/demo-users:
 *   get:
 *     summary: Get demo users with pagination
 *     tags: [Demo Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *     responses:
 *       200:
 *         description: Demo users retrieved successfully
 */
router.get('/', authenticateToken, getDemoUsers);

// PUT update demo user
router.put('/:id', authenticateToken, updateDemoUser);

// GET closed orders for a demo user
router.get('/:id/closed-orders', authenticateToken, getClosedOrders);

module.exports = router;
