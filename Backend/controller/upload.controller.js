const path = require('path');
const fs = require('fs');

async function uploadMinuta(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió archivo' });
        }

        const filename = req.file.filename;
        const ruta_pdf = `/uploads/minutas/${filename}`;

        return res.json({ ruta_pdf });
    } catch (error) {
        console.error('Error al subir minuta:', error);
        return res
            .status(500)
            .json({ error: 'Error al subir minuta', details: String(error) });
    }
}

module.exports = { uploadMinuta };
