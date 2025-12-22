require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/db');
const Admin = require('./models/admin.model');

/**
 * Seed script to create initial super admin user
 * Run: node src/seed.js
 */

const seedSuperAdmin = async () => {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Sync Admin model
        await Admin.sync();
        console.log('✅ Admin model synced');

        // Check if super admin already exists
        const existingSuperAdmin = await Admin.findOne({
            where: { role: 'super_admin' }
        });

        if (existingSuperAdmin) {
            console.log('⚠️  Super admin already exists:');
            console.log(`   Username: ${existingSuperAdmin.username}`);
            console.log(`   Email: ${existingSuperAdmin.email}`);
            console.log('\n💡 If you want to create another super admin, use the /api/auth/register endpoint');
            process.exit(0);
        }

        // Create super admin
        const superAdmin = await Admin.create({
            username: 'superadmin',
            email: 'admin@veesho.com',
            password: 'admin123456', // Will be hashed automatically
            role: 'super_admin',
            is_active: true
        });

        console.log('\n🎉 Super Admin created successfully!');
        console.log('━'.repeat(50));
        console.log('📧 Email:', superAdmin.email);
        console.log('👤 Username:', superAdmin.username);
        console.log('🔑 Password:', 'admin123456');
        console.log('👑 Role:', superAdmin.role);
        console.log('━'.repeat(50));
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        console.log('\n🚀 You can now login at: POST /api/auth/login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
        process.exit(1);
    }
};

seedSuperAdmin();
