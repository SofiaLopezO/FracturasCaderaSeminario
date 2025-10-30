// controller/perfil.controller.js
const models = require('../model/initModels');

// Normaliza y mapea a tu convenio del frontend
const ROLE_MAP = {
  'PACIENTE': 'PACIENTE',
  'FUNCIONARIO': 'FUNCIONARIO',
  'TECNOLOGO': 'TECNOLOGO',
  'INVESTIGADOR': 'INVESTIGADOR',
  'ADMIN': 'ADMIN',
};

exports.me = async (req, res) => {
  try {
    // Ajusta según lo que ponga tu middleware auth en req.user
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const user = await models.User.findByPk(userId, {
      attributes: ['id', 'rut', 'nombres', 'apellido_paterno', 'apellido_materno', 'correo'],
      include: [{
        model: models.ProfessionalProfile,
        as: 'professional_profile',
        attributes: ['cargo', 'hospital']
      }]
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Construye roles
    const roles = [];
    const cargo = String(user?.professional_profile?.cargo || '').trim().toUpperCase();
    if (ROLE_MAP[cargo]) roles.push(ROLE_MAP[cargo]);

    res.json({ me: user, roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
};
