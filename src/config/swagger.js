const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Contact Management API',
            version: '1.0.0',
            description: 'Production-ready API for managing contacts with file uploads and JWT authentication',
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token from login response'
                }
            },
            schemas: {
                Admin: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Auto-generated ID' },
                        username: { type: 'string', description: 'Admin username' },
                        email: { type: 'string', format: 'email', description: 'Admin email' },
                        role: {
                            type: 'string',
                            enum: ['read', 'write', 'super_admin'],
                            description: 'Admin role'
                        },
                        is_active: { type: 'boolean', description: 'Account status' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Contact: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Auto-generated ID' },
                        full_name: { type: 'string', description: 'Full name of contact' },
                        email: { type: 'string', format: 'email', description: 'Email address' },
                        phone_number: { type: 'string', description: 'Phone number' },
                        whatsapp_number: { type: 'string', description: 'WhatsApp number' },
                        company_name: { type: 'string', description: 'Company name' },
                        company_register_certificate: { type: 'string', description: 'File path' },
                        company_register_certificate_url: { type: 'string', description: 'Accessible URL' },
                        id_proof: { type: 'string', description: 'File path' },
                        id_proof_url: { type: 'string', description: 'Accessible URL' },
                        meeting_link: { type: 'string', description: 'Meeting URL' },
                        meeting_time: { type: 'string', format: 'date-time', description: 'Meeting datetime' },
                        notes: { type: 'string', description: 'Additional notes' },
                        status: {
                            type: 'string',
                            enum: ['new', 'contacted', 'in_process', 'fail', 'converted'],
                            description: 'Contact status'
                        },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                ContactInput: {
                    type: 'object',
                    required: ['full_name', 'email', 'phone_number', 'whatsapp_number'],
                    properties: {
                        full_name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone_number: { type: 'string' },
                        whatsapp_number: { type: 'string' },
                        company_name: { type: 'string' },
                        meeting_link: { type: 'string' },
                        meeting_time: { type: 'string', format: 'date-time' },
                        notes: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: ['new', 'contacted', 'in_process', 'fail', 'converted']
                        },
                        company_register_certificate: { type: 'string', format: 'binary' },
                        id_proof: { type: 'string', format: 'binary' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'object' } }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
