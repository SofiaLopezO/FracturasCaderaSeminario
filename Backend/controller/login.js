// controller/login.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let dbModels = require('../model/initModels');

const DUMMY_HASH = '$2a$10$Q7wS3m8w7C9g7JcM9z8J6eT8c0pQp8tWZ0w9JwLrG3Eo9vI1mYw6i';

function REQUIRE_VERIFY() {
  return String(process.env.EMAIL_VERIFICATION_REQUIRED ?? 'true').toLowerCase() !== 'false';
}

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

const normRut = (r) => String(r || '').replace(/\./g, '').replace(/-/g, '').toUpperCase();
const nombreCompleto = (u) => [u.nombres, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' ').trim();

async function getUserRoles(user) {
  const roles = new Set();
  const pick = (...names) => names.map((n) => dbModels[n]).find(Boolean);
  const hasAttr = (M, a) => Boolean(M?.rawAttributes && M.rawAttributes[a]);
  const safeFind = async (M, where) => {
    if (!M) return null;
    try { return await M.findOne({ where }); } catch { return null; }
  };
  const normalizedRut = normRut(user?.rut);
  const userId = user?.id;
  const whereFor = (M) => {
    if (!M) return null;
    if (hasAttr(M, 'rut') && normalizedRut) return { rut: normalizedRut };
    if (hasAttr(M, 'user_id') && userId != null) return { user_id: userId };
    if (hasAttr(M, 'userId') && userId != null) return { userId };
    return null;
  };

  const Admin = pick('Administrador', 'Administradores', 'admin', 'Admin');
  if (Admin) {
    const where = whereFor(Admin);
    const row = where ? await safeFind(Admin, where) : null;
    if (row) roles.add('ADMIN');
  }

  const Func = pick('Funcionario', 'Funcionarios', 'funcionario', 'ProfessionalProfile', 'professional_profile', 'PerfilProfesional');
  if (Func) {
    const where = whereFor(Func);
    const row = where ? await safeFind(Func, where) : null;
    if (row) roles.add('FUNCIONARIO');
    const cargo = String(row?.cargo ?? '').toUpperCase();
    if (cargo.includes('FUNCIONARIO')) roles.add('FUNCIONARIO');
    if (cargo.includes('TECNOLOG')) roles.add('TECNOLOGO');
    if (cargo.includes('INVESTIG')) roles.add('INVESTIGADOR');
    if (cargo.includes('MEDIC')) roles.add('MEDICO');
  }

  const Tec = pick('Tecnologo', 'Tecnologos', 'tec', 'Tech');
  if (Tec) {
    const where = whereFor(Tec);
    const row = where ? await safeFind(Tec, where) : null;
    if (row) roles.add('TECNOLOGO');
  }

  const Inv = pick('Investigador', 'Investigadores');
  if (Inv) {
    const where = whereFor(Inv);
    const row = where ? await safeFind(Inv, where) : null;
    if (row) roles.add('INVESTIGADOR');
  }

  const Pac = pick('Paciente', 'Pacientes', 'paciente');
  if (Pac) {
    const where = whereFor(Pac);
    const row = where ? await safeFind(Pac, where) : null;
    if (row) roles.add('PACIENTE');
  }

  return Array.from(roles);
}

exports.login = async (req, res) => {
  try {
    let { rut, password } = req.body || {};
    rut = normRut(rut);
    password = String(password || '').trim();

    if (!rut || !password) return res.status(400).json({ error: 'rut y password son obligatorios' });

    const user = await dbModels.User.findOne({ where: { rut } });
    if (!user) return res.status(404).json({ error: 'Usuario no registrado' });

    if (REQUIRE_VERIFY() && user.email_verified === false) {
      return res.status(403).json({ error: 'Debes verificar tu correo antes de iniciar sesión' });
    }

    const ok = await bcrypt.compare(password, user.password_hash || DUMMY_HASH);
    if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const roles = await getUserRoles(user);

    const token = jwt.sign(
      { rut: user.rut, roles },
      process.env.JWT_SECRET || 'dev_secret_change_me',
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    console.log('[login] roles calculados para', user.rut, roles);
    res.cookie('auth', token, cookieOpts);

    return res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        rut: user.rut,
        nombre: nombreCompleto(user),
        correo: user.correo,
        roles,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Error en login:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.logout = async (_req, res) => {
  res.clearCookie('auth', { ...cookieOpts, maxAge: 0 });
  return res.json({ ok: true });
};

exports.me = async (req, res) => {
  return res.json({ me: req.user });
};

exports.__setModelsForTest = function (newModels) {
  dbModels = newModels;
};
