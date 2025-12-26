const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { getGroupsDropdown, getGroupConfig, updateSymbol, addSymbol, copyGroup } = require('../controllers/groups.controller');

/**
 * @swagger
 * /api/groups/dropdown:
 *   get:
 *     summary: Get all group names for dropdown
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Groups list retrieved successfully
 */
router.get('/dropdown', authenticateToken, getGroupsDropdown);

/**
 * @swagger
 * /api/groups/{groupName}:
 *   get:
 *     summary: Get group configuration by name
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group configuration retrieved successfully
 */
router.get('/:groupName', authenticateToken, getGroupConfig);

/**
 * @swagger
 * /api/groups/{groupName}/{symbol}:
 *   put:
 *     summary: Update symbol configuration
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Symbol updated successfully
 */
router.put('/:groupName/:symbol', authenticateToken, updateSymbol);

// POST add new symbol
router.post('/', authenticateToken, addSymbol);

// POST copy group
router.post('/copy', authenticateToken, copyGroup);

module.exports = router;
