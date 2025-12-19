const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { uploadContactFiles } = require('../middlewares/upload.middleware');
const {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact
} = require('../controllers/contact.controller');

// Validation rules for creating a contact
const createValidation = [
    body('full_name')
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: 255 }).withMessage('Full name must be less than 255 characters'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('phone_number')
        .notEmpty().withMessage('Phone number is required')
        .isLength({ max: 20 }).withMessage('Phone number must be less than 20 characters'),
    body('whatsapp_number')
        .notEmpty().withMessage('WhatsApp number is required')
        .isLength({ max: 20 }).withMessage('WhatsApp number must be less than 20 characters'),
    body('status')
        .optional()
        .isIn(['new', 'contacted', 'in_process', 'fail', 'converted'])
        .withMessage('Status must be one of: new, contacted, in_process, fail, converted'),
    body('meeting_time')
        .optional()
        .isISO8601().withMessage('Meeting time must be a valid date-time')
];

// Validation rules for updating a contact (all fields optional)
const updateValidation = [
    body('full_name')
        .optional()
        .isLength({ max: 255 }).withMessage('Full name must be less than 255 characters'),
    body('email')
        .optional()
        .isEmail().withMessage('Please provide a valid email'),
    body('phone_number')
        .optional()
        .isLength({ max: 20 }).withMessage('Phone number must be less than 20 characters'),
    body('whatsapp_number')
        .optional()
        .isLength({ max: 20 }).withMessage('WhatsApp number must be less than 20 characters'),
    body('status')
        .optional()
        .isIn(['new', 'contacted', 'in_process', 'fail', 'converted'])
        .withMessage('Status must be one of: new, contacted, in_process, fail, converted'),
    body('meeting_time')
        .optional()
        .isISO8601().withMessage('Meeting time must be a valid date-time')
];

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact management API
 */

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - phone_number
 *               - whatsapp_number
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Full name of the contact
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               phone_number:
 *                 type: string
 *                 description: Phone number
 *               whatsapp_number:
 *                 type: string
 *                 description: WhatsApp number
 *               company_name:
 *                 type: string
 *                 description: Company name
 *               meeting_link:
 *                 type: string
 *                 description: Meeting URL
 *               meeting_time:
 *                 type: string
 *                 format: date-time
 *                 description: Meeting date and time
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               status:
 *                 type: string
 *                 enum: [new, contacted, in_process, fail, converted]
 *                 default: new
 *                 description: Contact status
 *               company_register_certificate:
 *                 type: string
 *                 format: binary
 *                 description: Company registration certificate (jpg, jpeg, png, pdf - max 15MB)
 *               id_proof:
 *                 type: string
 *                 format: binary
 *                 description: Government ID proof (jpg, jpeg, png, pdf - max 15MB)
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', uploadContactFiles, createValidation, createContact);

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: List of all contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 */
router.get('/', getAllContacts);

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Get a contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getContactById);

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Update a contact
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *               whatsapp_number:
 *                 type: string
 *               company_name:
 *                 type: string
 *               meeting_link:
 *                 type: string
 *               meeting_time:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [new, contacted, in_process, fail, converted]
 *               company_register_certificate:
 *                 type: string
 *                 format: binary
 *                 description: New company registration certificate (replaces existing)
 *               id_proof:
 *                 type: string
 *                 format: binary
 *                 description: New ID proof (replaces existing)
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', uploadContactFiles, updateValidation, updateContact);

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       404:
 *         description: Contact not found
 */
router.delete('/:id', deleteContact);

module.exports = router;
