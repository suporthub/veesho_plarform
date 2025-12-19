const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Define Contact model
const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Full name is required' }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: { msg: 'Please provide a valid email' },
            notEmpty: { msg: 'Email is required' }
        }
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Phone number is required' }
        }
    },
    whatsapp_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'WhatsApp number is required' }
        }
    },
    company_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    company_register_certificate: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'File path for company registration certificate'
    },
    id_proof: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'File path for government ID proof'
    },
    meeting_link: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    meeting_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('new', 'contacted', 'in_process', 'fail', 'converted'),
        defaultValue: 'new',
        allowNull: false
    }
}, {
    tableName: 'contacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Contact;
