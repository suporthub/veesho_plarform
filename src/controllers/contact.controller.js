const Contact = require('../models/contact.model');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Generate full URL for uploaded files
 */
const getFileUrl = (req, filePath) => {
    if (!filePath) return null;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

/**
 * Delete file from storage
 */
const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
    }
};

/**
 * Get relative path for storage
 */
const getRelativePath = (file) => {
    if (!file) return null;
    // Get path relative to src folder
    const srcIndex = file.path.indexOf('uploads');
    return file.path.substring(srcIndex);
};

/**
 * CREATE - Create a new contact
 * POST /api/contacts
 */
const createContact = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check for duplicate email
        const existingEmail = await Contact.findOne({
            where: { email: req.body.email }
        });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: 'Already registered with this email address'
            });
        }

        // Check for duplicate phone number
        const existingPhone = await Contact.findOne({
            where: { phone_number: req.body.phone_number }
        });
        if (existingPhone) {
            return res.status(409).json({
                success: false,
                message: 'Already registered with this phone number'
            });
        }

        // Extract file paths
        const companyCertPath = req.files?.company_register_certificate?.[0]
            ? getRelativePath(req.files.company_register_certificate[0])
            : null;
        const idProofPath = req.files?.id_proof?.[0]
            ? getRelativePath(req.files.id_proof[0])
            : null;

        // Create contact record
        const contactData = {
            full_name: req.body.full_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            whatsapp_number: req.body.whatsapp_number,
            company_name: req.body.company_name || null,
            company_register_certificate: companyCertPath,
            id_proof: idProofPath,
            meeting_link: req.body.meeting_link || null,
            meeting_time: req.body.meeting_time || null,
            notes: req.body.notes || null,
            status: req.body.status || 'new'
        };

        const contact = await Contact.create(contactData);

        // Prepare response with file URLs
        const response = contact.toJSON();
        response.company_register_certificate_url = getFileUrl(req, contact.company_register_certificate);
        response.id_proof_url = getFileUrl(req, contact.id_proof);

        res.status(201).json({
            success: true,
            message: 'Contact created successfully',
            data: response
        });
    } catch (error) {
        next(error);
    }
};

/**
 * READ ALL - Get all contacts
 * GET /api/contacts
 */
const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.findAll({
            order: [['created_at', 'DESC']]
        });

        // Add file URLs to each contact
        const contactsWithUrls = contacts.map(contact => {
            const data = contact.toJSON();
            data.company_register_certificate_url = getFileUrl(req, contact.company_register_certificate);
            data.id_proof_url = getFileUrl(req, contact.id_proof);
            return data;
        });

        res.status(200).json({
            success: true,
            message: 'Contacts retrieved successfully',
            count: contactsWithUrls.length,
            data: contactsWithUrls
        });
    } catch (error) {
        next(error);
    }
};

/**
 * READ ONE - Get a single contact by ID
 * GET /api/contacts/:id
 */
const getContactById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${id} not found`
            });
        }

        // Add file URLs
        const response = contact.toJSON();
        response.company_register_certificate_url = getFileUrl(req, contact.company_register_certificate);
        response.id_proof_url = getFileUrl(req, contact.id_proof);

        res.status(200).json({
            success: true,
            message: 'Contact retrieved successfully',
            data: response
        });
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE - Update a contact
 * PUT /api/contacts/:id
 */
const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${id} not found`
            });
        }

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check for duplicate email (exclude current contact)
        if (req.body.email && req.body.email !== contact.email) {
            const existingEmail = await Contact.findOne({
                where: {
                    email: req.body.email,
                    id: { [Op.ne]: id }
                }
            });
            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'Already registered with this email address'
                });
            }
        }

        // Check for duplicate phone number (exclude current contact)
        if (req.body.phone_number && req.body.phone_number !== contact.phone_number) {
            const existingPhone = await Contact.findOne({
                where: {
                    phone_number: req.body.phone_number,
                    id: { [Op.ne]: id }
                }
            });
            if (existingPhone) {
                return res.status(409).json({
                    success: false,
                    message: 'Already registered with this phone number'
                });
            }
        }

        // Handle file updates
        let companyCertPath = contact.company_register_certificate;
        let idProofPath = contact.id_proof;

        // If new company certificate uploaded
        if (req.files?.company_register_certificate?.[0]) {
            // Delete old file
            deleteFile(contact.company_register_certificate);
            companyCertPath = getRelativePath(req.files.company_register_certificate[0]);
        }

        // If new ID proof uploaded
        if (req.files?.id_proof?.[0]) {
            // Delete old file
            deleteFile(contact.id_proof);
            idProofPath = getRelativePath(req.files.id_proof[0]);
        }

        // Update contact
        const updateData = {
            full_name: req.body.full_name || contact.full_name,
            email: req.body.email || contact.email,
            phone_number: req.body.phone_number || contact.phone_number,
            whatsapp_number: req.body.whatsapp_number || contact.whatsapp_number,
            company_name: req.body.company_name !== undefined ? req.body.company_name : contact.company_name,
            company_register_certificate: companyCertPath,
            id_proof: idProofPath,
            meeting_link: req.body.meeting_link !== undefined ? req.body.meeting_link : contact.meeting_link,
            meeting_time: req.body.meeting_time !== undefined ? req.body.meeting_time : contact.meeting_time,
            notes: req.body.notes !== undefined ? req.body.notes : contact.notes,
            status: req.body.status || contact.status
        };

        await contact.update(updateData);

        // Prepare response with file URLs
        const response = contact.toJSON();
        response.company_register_certificate_url = getFileUrl(req, contact.company_register_certificate);
        response.id_proof_url = getFileUrl(req, contact.id_proof);

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: response
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE - Delete a contact
 * DELETE /api/contacts/:id
 */
const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${id} not found`
            });
        }

        // Delete associated files
        deleteFile(contact.company_register_certificate);
        deleteFile(contact.id_proof);

        // Delete contact record
        await contact.destroy();

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully',
            data: { id: parseInt(id) }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact
};
