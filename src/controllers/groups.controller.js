const axios = require('axios');

const EXTERNAL_API_BASE = 'https://veeshov1.veeshoplatform.com';
const ADMIN_SECRET = 'admin@livefxhub@123';

/**
 * GET Groups Dropdown
 * GET /api/groups/dropdown
 */
const getGroupsDropdown = async (req, res, next) => {
    try {
        const response = await axios.get(`${EXTERNAL_API_BASE}/api/admin-secret/groups/dropdown`, {
            headers: {
                'x-admin-secret': ADMIN_SECRET
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Groups dropdown error:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to fetch groups'
        });
    }
};

/**
 * GET Group Configuration
 * GET /api/groups/:groupName
 */
const getGroupConfig = async (req, res, next) => {
    try {
        const { groupName } = req.params;

        const response = await axios.get(`${EXTERNAL_API_BASE}/api/admin-secret/groups/${encodeURIComponent(groupName)}`, {
            headers: {
                'x-admin-secret': ADMIN_SECRET
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Group config error:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to fetch group configuration'
        });
    }
};

/**
 * PUT Update Symbol Configuration
 * PUT /api/groups/:groupName/:symbol
 */
const updateSymbol = async (req, res, next) => {
    try {
        const { groupName, symbol } = req.params;
        const updateData = req.body;

        // Always include name and symbol in request
        updateData.name = groupName;
        updateData.symbol = symbol;

        const url = `${EXTERNAL_API_BASE}/api/admin-secret/groups/${encodeURIComponent(groupName)}/${encodeURIComponent(symbol)}`;

        console.log('========== SYMBOL UPDATE REQUEST ==========');
        console.log('URL:', url);
        console.log('Headers:', { 'x-admin-secret': ADMIN_SECRET, 'Content-Type': 'application/json' });
        console.log('Request Body:', JSON.stringify(updateData, null, 2));
        console.log('============================================');

        const response = await axios.put(url, updateData, {
            headers: {
                'x-admin-secret': ADMIN_SECRET,
                'Content-Type': 'application/json'
            }
        });

        console.log('========== SYMBOL UPDATE RESPONSE ==========');
        console.log('Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        console.log('=============================================');

        res.status(200).json(response.data);
    } catch (error) {
        console.error('========== SYMBOL UPDATE ERROR ==========');
        console.error('Error Message:', error.message);
        console.error('Error Response Status:', error.response?.status);
        console.error('Error Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('==========================================');

        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to update symbol',
            error: error.response?.data
        });
    }
};

/**
 * POST Add New Symbol
 * POST /api/groups
 */
const addSymbol = async (req, res, next) => {
    try {
        const symbolData = req.body;

        console.log('========== ADD SYMBOL REQUEST ==========');
        console.log('Request Body:', JSON.stringify(symbolData, null, 2));
        console.log('=========================================');

        const response = await axios.post(
            `${EXTERNAL_API_BASE}/api/admin-secret/groups`,
            symbolData,
            {
                headers: {
                    'x-admin-secret': ADMIN_SECRET,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('========== ADD SYMBOL RESPONSE ==========');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('==========================================');

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Add symbol error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to add symbol',
            error: error.response?.data
        });
    }
};

/**
 * POST Copy Group
 * POST /api/groups/copy
 */
const copyGroup = async (req, res, next) => {
    try {
        const { sourceGroupName, targetGroupName } = req.body;

        console.log('========== COPY GROUP REQUEST ==========');
        console.log('Source:', sourceGroupName, 'Target:', targetGroupName);
        console.log('=========================================');

        const response = await axios.post(
            `${EXTERNAL_API_BASE}/api/admin-secret/groups/copy`,
            { sourceGroupName, targetGroupName },
            {
                headers: {
                    'x-admin-secret': ADMIN_SECRET,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('========== COPY GROUP RESPONSE ==========');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('==========================================');

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Copy group error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to copy group',
            error: error.response?.data
        });
    }
};

module.exports = {
    getGroupsDropdown,
    getGroupConfig,
    updateSymbol,
    addSymbol,
    copyGroup
};
