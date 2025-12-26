const axios = require('axios');

const EXTERNAL_API_BASE = 'https://veeshov1.veeshoplatform.com';
const ADMIN_SECRET = 'admin@livefxhub@123';

/**
 * GET Demo Users with pagination
 * GET /api/demo-users?page=1&limit=25
 */
const getDemoUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 25 } = req.query;

        console.log('========== DEMO USERS REQUEST ==========');
        console.log('Page:', page, 'Limit:', limit);
        console.log('=========================================');

        const response = await axios.get(
            `${EXTERNAL_API_BASE}/api/admin-secret/demo-users`,
            {
                params: {
                    page,
                    limit
                },
                headers: {
                    'x-admin-secret': ADMIN_SECRET
                }
            }
        );

        console.log('========== DEMO USERS RESPONSE ==========');
        console.log('Total Items:', response.data.pagination?.total_items);
        console.log('==========================================');

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Demo users error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to fetch demo users'
        });
    }
};

/**
 * PUT Update Demo User
 * PUT /api/demo-users/:id
 */
const updateDemoUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('========== UPDATE DEMO USER REQUEST ==========');
        console.log('User ID:', id);
        console.log('Update Data:', JSON.stringify(updateData, null, 2));
        console.log('================================================');

        const response = await axios.put(
            `${EXTERNAL_API_BASE}/api/admin-secret/demo-users/${id}`,
            updateData,
            {
                headers: {
                    'x-admin-secret': ADMIN_SECRET,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('========== UPDATE DEMO USER RESPONSE ==========');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('=================================================');

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Update demo user error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to update demo user',
            error: error.response?.data
        });
    }
};

/**
 * GET Closed Orders for a Demo User
 * GET /api/demo-users/:id/closed-orders?page=1&limit=20
 */
const getClosedOrders = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const response = await axios.get(
            `${EXTERNAL_API_BASE}/api/admin-secret/demo-users/${id}/closed-orders`,
            {
                params: { page, limit },
                headers: {
                    'x-admin-secret': ADMIN_SECRET
                }
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Closed orders error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to fetch closed orders'
        });
    }
};

module.exports = {
    getDemoUsers,
    updateDemoUser,
    getClosedOrders
};
