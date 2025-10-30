// controller/register.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Permite inyectar dependencias en tests
let dbModels = require('../model/initModels');
let mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // STARTTLS
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// === Utils ===
const normEmail = (s) => (s || '').trim().toLowerCase();
const strongPwd = (s) => s?.length >= 8 && /[A-Z]/.test(s) && /\d/.test(s);
const isValidSexo = (s) => ['M', 'F', 'O'].includes(String(s || '').toUpperCase());
const isValidISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

// Evaluada en runtime (útil para tests/entornos distintos)
function REQUIRE_VERIFY() {
  return String(process.env.EMAIL_VERIFICATION_REQUIRED ?? 'true').toLowerCase() !== 'false';
}

// --- Validación de RUT chileno ---
function isValidRut(rutRaw) {
  if (!rutRaw) return false;
  const rut = rutRaw.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(rut)) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);

  let suma = 0, multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvEsperado;
}

// --- Edad exacta (años y meses) ---
function calcEdadYM(isoDate) {
  if (!isoDate) return { anios: null, meses: null };
  const dob = new Date(isoDate + 'T00:00:00');
  if (Number.isNaN(dob.getTime())) return { anios: null, meses: null };

  const today = new Date();
  let anios = today.getFullYear() - dob.getFullYear();
  let meses = today.getMonth() - dob.getMonth();
  const dia = today.getDate() - dob.getDate();

  if (dia < 0) meses -= 1; // aún no cumple el mes
  if (meses < 0) { anios -= 1; meses += 12; }
  if (anios < 0) return { anios: null, meses: null };
  return { anios, meses };
}

async function sendVerifyMail(to, nombre, verifyUrl) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  return mailer.sendMail({
    from,
    to,
    subject: 'Verifica tu correo — Portal Fractura de Cadera',
    html: `
      <h2>Hola ${nombre},</h2>
      <p>Confirma tu correo para activar tu cuenta.</p>
      <p><a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">Verificar correo</a></p>
      <p>Este enlace expira en 24 horas.</p>
    `,
  });
}

function genToken(len = 24) {
  return crypto.randomBytes(len).toString('hex');
}

const VERIFY_TTL_HOURS = 24;

// --------- Registro de Paciente (con verificación de correo) ----------
async function registerPaciente(req, res) {
  try {
    let {
      nombres,
      apellido_paterno,
      apellido_materno,
      correo,
      rut,
      password,
      sexo,               // 'M' | 'F' | 'O'
      fecha_nacimiento,   // 'YYYY-MM-DD'
    } = req.body || {};

    correo = normEmail(correo);
    const sexoNorm = String(sexo || '').toUpperCase();

    // Validaciones
    if (!nombres || !apellido_paterno || !apellido_materno || !correo || !password || !sexoNorm || !fecha_nacimiento || !rut) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (!isValidRut(rut)) {
      return res.status(400).json({ error: 'RUT inválido' });
    }
    if (!isValidSexo(sexoNorm)) {
      return res.status(400).json({ error: "sexo inválido. Valores permitidos: 'M', 'F', 'O'" });
    }
    if (!isValidISODate(fecha_nacimiento)) {
      return res.status(400).json({ error: "fecha_nacimiento inválida. Formato requerido: 'YYYY-MM-DD'" });
    }
    if (!strongPwd(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener ≥8, 1 mayúscula y 1 número' });
    }

    // Duplicados
    const rutNorm = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    const dupCorreo = await dbModels.User.findOne({ where: { correo } });
    if (dupCorreo) return res.status(409).json({ error: 'El correo ya está registrado' });
    const dupRut = await dbModels.User.findOne({ where: { rut: rutNorm } });
    if (dupRut) return res.status(409).json({ error: 'El RUT ya está registrado' });

    // Crear usuario (según bandera)
    const password_hash = await bcrypt.hash(password, 10);

    let email_verified = true;
    let email_verify_token = null;
    let email_verify_expires = null;

    if (REQUIRE_VERIFY()) {
      email_verified = false;
      email_verify_token = genToken(24);
      email_verify_expires = new Date(Date.now() + VERIFY_TTL_HOURS * 60 * 60 * 1000);
    }

    const user = await dbModels.User.create({
      rut: rutNorm,
      nombres: String(nombres).trim(),
      apellido_paterno: String(apellido_paterno).trim(),
      apellido_materno: String(apellido_materno).trim(),
      correo,
      password_hash,
      sexo: sexoNorm,
      fecha_nacimiento,
      email_verified,
      email_verify_token,
      email_verify_expires,
    });

    // Calcular edad y crear perfil Paciente
    const { anios, meses } = calcEdadYM(fecha_nacimiento);
    await dbModels.Paciente.create({
      user_id: user.id,
      edad_anios: anios,
      edad_meses: meses,
    });

    // Enviar correo de verificación SOLO si está activado
    if (REQUIRE_VERIFY()) {
      const nombre = [user.nombres, user.apellido_paterno, user.apellido_materno]
        .filter(Boolean).join(' ').trim();
      const verifyUrl = `${process.env.FRONT_ORIGIN || 'http://localhost:3000'}/verify?token=${user.email_verify_token}`;
      try {
        await sendVerifyMail(user.correo, nombre, verifyUrl);
      } catch (mailErr) {
        console.error('Error enviando mail de verificación:', mailErr);
      }
    }

    return res.status(201).json({
      message: REQUIRE_VERIFY()
        ? 'Cuenta creada. Revisa tu correo para verificarla.'
        : 'Cuenta creada. Ya puedes iniciar sesión.',
    });

  } catch (err) {
    if (err?.name === 'SequelizeUniqueConstraintError' || err?.parent?.code === '23505') {
      const path = err?.errors?.[0]?.path || '';
      if (path.includes('correo')) return res.status(409).json({ error: 'El correo ya está registrado' });
      if (path.includes('rut')) return res.status(409).json({ error: 'El RUT ya está registrado' });
      return res.status(409).json({ error: 'Valor duplicado' });
    }
    console.error('registerPaciente error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

// --------- Verificación de correo (GET /auth/verify?token=...) ----------
async function verifyEmail(req, res) {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) return res.status(400).json({ error: 'Token faltante' });

    const user = await dbModels.User.findOne({ where: { email_verify_token: token } });
    if (!user) return res.status(400).json({ error: 'Token inválido' });
    if (!user.email_verify_expires || user.email_verify_expires < new Date()) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    await user.update({
      email_verified: true,
      email_verify_token: null,
      email_verify_expires: null,
    });

    return res.json({ message: 'Correo verificado. Ya puedes iniciar sesión.' });
  } catch (e) {
    console.error('verifyEmail error', e);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = { registerPaciente, verifyEmail };

// === SOLO TESTS: inyección de dependencias ===
module.exports.__setModelsForTest = function setModels(m) { dbModels = m; };
module.exports.__setMailerForTest = function setMailer(t) { mailer = t; };
