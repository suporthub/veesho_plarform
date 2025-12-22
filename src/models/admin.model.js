const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

// Define Admin model
const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Username already exists'
        },
        validate: {
            notEmpty: { msg: 'Username is required' },
            len: {
                args: [3, 100],
                msg: 'Username must be between 3 and 100 characters'
            }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
            msg: 'Email already exists'
        },
        validate: {
            isEmail: { msg: 'Please provide a valid email' },
            notEmpty: { msg: 'Email is required' }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Password is required' },
            len: {
                args: [6, 255],
                msg: 'Password must be at least 6 characters'
            }
        }
    },
    role: {
        type: DataTypes.ENUM('read', 'write', 'super_admin'),
        defaultValue: 'read',
        allowNull: false,
        validate: {
            isIn: {
                args: [['read', 'write', 'super_admin']],
                msg: 'Role must be read, write, or super_admin'
            }
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    two_fa_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    two_fa_method: {
        type: DataTypes.ENUM('email', 'totp'),
        allowNull: true
    },
    two_fa_secret: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    two_fa_backup_codes: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('two_fa_backup_codes');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('two_fa_backup_codes', JSON.stringify(value));
        }
    }
}, {
    tableName: 'admins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        // Hash password before creating
        beforeCreate: async (admin) => {
            if (admin.password) {
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash(admin.password, salt);
            }
        },
        // Hash password before updating if it was changed
        beforeUpdate: async (admin) => {
            if (admin.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash(admin.password, salt);
            }
        }
    }
});

// Instance method to compare password
Admin.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Don't return password and 2FA secrets in JSON responses
Admin.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    delete values.two_fa_secret;
    delete values.two_fa_backup_codes;
    return values;
};

module.exports = Admin;
