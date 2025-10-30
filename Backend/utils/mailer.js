// utils/mailer.js
const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Llama en el arranque. Si SMTP_HOST=ethereal, genera una cuenta
 * temporal y configura el transporter automáticamente.
 */
async function verifyMailTransport() {
  const host = (process.env.SMTP_HOST || '').trim().toLowerCase();

  if (host === 'ethereal') {
    console.log('📮 Mailer: usando ETHEREAL (solo pruebas)');
    const testAcc = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: testAcc.smtp.host,      // p.ej. smtp.ethereal.email
      port: testAcc.smtp.port,      // 587 o 465
      secure: testAcc.smtp.secure,  // true si 465
      auth: {
        user: testAcc.user,
        pass: testAcc.pass,
      },
    });

    console.log('📧 Ethereal user:', testAcc.user);
    console.log('🔑 Ethereal pass:', testAcc.pass);
  } else {

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  await transporter.verify();
  console.log('SMTP listo para enviar');
}

function getFrom() {
  return process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';
}

async function sendWelcomeMail(to, nombre) {
  if (!transporter) throw new Error('Mailer no inicializado. Llama a verifyMailTransport() en el arranque.');
  const info = await transporter.sendMail({
    from: getFrom(),
    to,
    subject: 'Bienvenido/a al Portal de Fractura de Cadera',
    html: `
      <h2>Hola ${nombre},</h2>
      <p>Tu cuenta fue creada con éxito.</p>
      <p>Ya puedes iniciar sesión con tu correo y contraseña.</p>
      <p>— Equipo del Portal</p>
    `,
  });

  const host = (process.env.SMTP_HOST || '').trim().toLowerCase();
  if (host === 'ethereal') {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('🔎 Vista previa del correo:', url);
  }
  return info;
}

async function sendVerificationMail(to, nombre, verifyUrl) {
  if (!transporter) throw new Error('Mailer no inicializado. Llama a verifyMailTransport() en el arranque.');
  const info = await transporter.sendMail({
    from: getFrom(),
    to,
    subject: 'Verifica tu correo',
    html: `
      <h2>Hola ${nombre},</h2>
      <p>Para activar tu cuenta, por favor verifica tu correo:</p>
      <p><a href="${verifyUrl}" target="_blank" rel="noopener">Verificar correo</a></p>
      <p>Si no registraste esta cuenta, ignora este mensaje.</p>
    `,
  });

  const host = (process.env.SMTP_HOST || '').trim().toLowerCase();
  if (host === 'ethereal') {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('🔎 Vista previa del correo:', url);
  }
  return info;
}

module.exports = { verifyMailTransport, sendWelcomeMail, sendVerificationMail };
