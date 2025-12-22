# Contact Management Backend API

Production-ready Node.js + Express + MySQL backend with file uploads, JWT authentication, and Swagger documentation.

## 🚀 Features

- **Full CRUD API** for contact management
- **JWT Authentication** with role-based access control
- **Admin Management** with 3 roles: read, write, super_admin
- **File uploads** with Multer (company certificates & ID proofs)
- **Swagger UI** documentation at `/api-docs`
- **Sequelize ORM** with MySQL
- **Input validation** using express-validator
- **Centralized error handling**
- **CORS enabled**

## 📋 Prerequisites

- Node.js (latest LTS)
- MySQL Server
- npm or yarn

## 🛠️ Installation

1. **Clone/Navigate to the project**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Edit `.env` file with your MySQL credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=contact_db
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=24h
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE contact_db;
   ```

5. **Create super admin**
   ```bash
   node src/seed.js
   ```
   
   Default credentials:
   - Email: `admin@veesho.com`
   - Password: `admin123456`
   - **⚠️ Change this password after first login!**

6. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

Access Swagger UI at: **http://localhost:3000/api-docs**

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Admin login |
| POST | `/api/auth/register` | Super Admin | Create new admin |
| GET | `/api/auth/profile` | Authenticated | Get current admin profile |
| PUT | `/api/auth/profile` | Authenticated | Update profile |
| GET | `/api/auth/admins` | Super Admin | Get all admins |
| PUT | `/api/auth/admin/:id` | Super Admin | Update admin |
| DELETE | `/api/auth/admin/:id` | Super Admin | Delete admin |

### Contact Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/contacts` | **Public** | Create new contact (no auth) |
| GET | `/api/contacts` | Read+ | Get all contacts |
| GET | `/api/contacts/:id` | Read+ | Get contact by ID |
| PUT | `/api/contacts/:id` | Write+ | Update contact |
| DELETE | `/api/contacts/:id` | Super Admin | Delete contact |

### Role Permissions

| Role | Permissions |
|------|-------------|
| **read** | View contacts only |
| **write** | View, create, update contacts |
| **super_admin** | Full access including delete + admin management |

### File Upload Rules

- **Allowed types**: jpg, jpeg, png, pdf
- **Max size**: 15MB per file
- **Fields**:
  - `company_register_certificate` → stored in `/uploads/company_certificates/`
  - `id_proof` → stored in `/uploads/id_proofs/`

### Contact Status Values

`new` | `contacted` | `in_process` | `fail` | `converted`

## 🔐 Authentication Usage

### 1. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@veesho.com",
  "password": "admin123456"
}
```

**Response includes JWT token:**
```json
{
  "success": true,
  "data": {
    "admin": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### 2. Use Token in Requests

Add the token to the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

**Example:**
```bash
GET /api/contacts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── swagger.js         # Swagger configuration
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── contact.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── contact.routes.js
│   ├── models/
│   │   ├── admin.model.js
│   │   └── contact.model.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   ├── uploads/
│   │   ├── company_certificates/
│   │   └── id_proofs/
│   ├── app.js
│   ├── server.js
│   └── seed.js
├── .env
├── package.json
└── README.md
```

## 📝 Example API Response

```json
{
  "success": true,
  "message": "Contacts retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "whatsapp_number": "+1234567890",
      "company_name": "ABC Corp",
      "company_register_certificate_url": "http://localhost:3000/uploads/company_certificates/file.pdf",
      "id_proof_url": "http://localhost:3000/uploads/id_proofs/id.jpg",
      "status": "new",
      "created_at": "2025-12-19T10:00:00.000Z"
    }
  ]
}
```

## 🔒 Security Features

✅ **Password Security**
- Bcrypt hashing (salt rounds: 10)
- Passwords never returned in responses

✅ **JWT Authentication**
- Token-based authentication
- 24-hour expiration
- Bearer token format

✅ **Role-Based Access Control**
- 3-tier permission system
- Route-level authorization
- Middleware protection

✅ **Duplicate Prevention**
- Email and phone uniqueness for contacts
- Username and email uniqueness for admins

## 🔧 Production Deployment

Before deploying to production:

1. ✅ Change the default super admin password
2. ✅ Generate a strong random JWT_SECRET
3. ✅ Update CORS settings for your domain
4. ✅ Use environment-specific `.env` files
5. ✅ Enable HTTPS
6. ✅ Set secure database credentials
7. ✅ Configure proper logging

## 📞 Support

For issues or questions, refer to the Swagger documentation at `/api-docs`
