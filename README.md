# Contact Management Backend API

Production-ready Node.js + Express + MySQL backend with file uploads and Swagger documentation.

## 🚀 Features

- **Full CRUD API** for contact management
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
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE contact_db;
   ```

5. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

Access Swagger UI at: **http://localhost:3000/api-docs**

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contacts` | Create new contact |
| GET | `/api/contacts` | Get all contacts |
| GET | `/api/contacts/:id` | Get contact by ID |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |

### File Upload Rules

- **Allowed types**: jpg, jpeg, png, pdf
- **Max size**: 15MB per file
- **Fields**:
  - `company_register_certificate` → stored in `/uploads/company_certificates/`
  - `id_proof` → stored in `/uploads/id_proofs/`

### Status Values

`new` | `contacted` | `in_process` | `fail` | `converted`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js           # Database configuration
│   │   └── swagger.js      # Swagger configuration
│   ├── controllers/
│   │   └── contact.controller.js
│   ├── routes/
│   │   └── contact.routes.js
│   ├── models/
│   │   └── contact.model.js
│   ├── middlewares/
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   ├── uploads/
│   │   ├── company_certificates/
│   │   └── id_proofs/
│   ├── app.js
│   └── server.js
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

## 🔒 Security Notes

- Update CORS settings for production
- Use environment-specific `.env` files
- Consider adding authentication for production use
