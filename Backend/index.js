// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const { connectDB, sequelize } = require('./model/db');
const { Op } = require('sequelize');
const modelos = require('./model/initModels');

const { initRoutes } = require('./routes/initRoutes');
const { verifyMailTransport } = require('./utils/mailer');

const app = express();

// ---------- Config ----------
const PORT = Number(process.env.PORT) || 3001;
const BASE_PATH = process.env.API_BASE || '/api/v1';
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000';
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

const allowedOrigins = [
    FRONT_ORIGIN,
    'http://localhost:3000',
    'https://provider.blocktype.cl',
    'https://editor.swagger.io',
    'null',
].filter(Boolean);
const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'X-Requested-With',
    ],
    credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || origin === 'null')) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Cookie, X-Requested-With'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});
// ---------- Healthcheck ----------
app.get('/', async (_req, res) => {
    try {
        await sequelize.authenticate();
        return res.json({ ok: true, db: 'up' });
    } catch {
        return res.status(500).json({ ok: false, db: 'down' });
    }
});
const uploadsPath = path.join(__dirname, 'uploads');
try {
    fs.mkdirSync(path.join(uploadsPath, 'minutas'), { recursive: true });
} catch (e) {
    console.warn('No se pudo crear carpeta uploads:', e);
}
app.use('/uploads', express.static(uploadsPath));

// ---------- Rutas ----------
initRoutes(app, BASE_PATH); 

// ---------- 404 ----------
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Server Error',
    });
});

// ---------- Boot ----------
(async () => {
    try {
        const ALTER =
            String(process.env.DB_ALTER || '').toLowerCase() === 'true';
        await connectDB({ alter: ALTER });
        const Usuario = modelos.User; 
        const adminEmail = process.env.ADMIN_EMAIL || 'Admin@admin.com';
        const adminRut = process.env.ADMIN_RUT || '111111111';
        const pass = await bcrypt.hash('Clave123', 10);
        let admin = await Usuario.findOne({
            where: { [Op.or]: [{ correo: adminEmail }, { rut: adminRut }] },
        });
        let created = false;
        if (!admin) {
            admin = await Usuario.create({
                nombres: 'Admin',
                apellido_paterno: 'Admin',
                apellido_materno: 'Admin',
                correo: adminEmail,
                rut: adminRut,
                password_hash: pass,
                telefono: '12341234',
                sexo: 'M',
                fecha_nacimiento: '2001-01-01',
            });
            created = true;
        }

        console.log(
            created
                ? `✅ Usuario administrador creado: ${adminEmail}`
                : `ℹ️ Usuario administrador ya existe: ${adminEmail}`
        );

        const AdminModel = modelos.Administrador; 
        const [adminProfile, profCreated] = await AdminModel.findOrCreate({
            where: { user_id: admin.id },
            defaults: {
                user_id: admin.id,
                nivel_acceso: null,
            },
        });
        await verifyMailTransport();

        const server = app.listen(PORT, () => {
            console.log(
                `🚀 API escuchando en http://localhost:${PORT}${BASE_PATH}`
            );
            console.log(`🌐 CORS: ${FRONT_ORIGIN}`);
        });

        module.exports = { app, server };
    } catch (e) {
        console.error('❌ No se pudo iniciar:', e);
        process.exit(1);
    }
})();

if (require.main !== module) {
    module.exports = { app };
}
