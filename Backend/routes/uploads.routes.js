const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { uploadMinuta } = require('../controller/upload.controller');

const router = express.Router();

// Directorio destino: <project-root>/uploads/minutas
const uploadDir = path.resolve(__dirname, '..', 'uploads', 'minutas');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // Nombre único: timestamp + original name (sanitizado)
        const safe = (file.originalname || 'file')
            .toString()
            .replace(/[^a-zA-Z0-9._-]/g, '_');
        const name = `${Date.now()}-${safe}`;
        cb(null, name);
    },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// POST /uploads/minutas -> recibe form-data con campo 'file'
router.post('/minutas', auth(), upload.single('file'), uploadMinuta);

module.exports = router;
