const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
    path.join(__dirname, '../uploads/company_certificates'),
    path.join(__dirname, '../uploads/id_proofs')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath;

        if (file.fieldname === 'company_register_certificate') {
            uploadPath = path.join(__dirname, '../uploads/company_certificates');
        } else if (file.fieldname === 'id_proof') {
            uploadPath = path.join(__dirname, '../uploads/id_proofs');
        } else {
            uploadPath = path.join(__dirname, '../uploads');
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter - only allow specific types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only .jpg, .jpeg, .png, and .pdf files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB max file size
    },
    fileFilter: fileFilter
});

// Export upload middleware for contact files
const uploadContactFiles = upload.fields([
    { name: 'company_register_certificate', maxCount: 1 },
    { name: 'id_proof', maxCount: 1 }
]);

module.exports = { uploadContactFiles, upload };
