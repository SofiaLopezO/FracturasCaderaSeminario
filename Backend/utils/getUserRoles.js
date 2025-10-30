// utils/getUserRoles.js

module.exports = async function getUserRoles(models, userId) {
  const roles = new Set();

  const pick = (...names) => names.map(n => models[n]).find(Boolean) || null;

  const findByUser = async (Model) => {
    if (!Model) return null;
    try {

      const attrs = Model.rawAttributes || {};
      if ('user_id' in attrs) return await Model.findOne({ where: { user_id: userId } });
      if ('userId'  in attrs) return await Model.findOne({ where: { userId:  userId } });

      const pk = Array.isArray(Model.primaryKeyAttributes) ? Model.primaryKeyAttributes[0] : null;
      if (pk === 'user_id' || pk === 'userId') return await Model.findByPk(userId);

      return await Model.findOne({ where: { user_id: userId } });
    } catch {
      return null;
    }
  };

  const mapCargoToRole = (cargo) => {
    const k = String(cargo || '').trim().toUpperCase();
    if (!k) return null;
    if (k in ({ PACIENTE:1,FUNCIONARIO:1,TECNOLOGO:1,INVESTIGADOR:1,ADMIN:1 })) return k;
    if (k.includes('FUNCIONARIO'))  return 'FUNCIONARIO';
    if (k.includes('TECNOLOG'))     return 'TECNOLOGO';
    if (k.includes('INVESTIG'))     return 'INVESTIGADOR';
    if (k.includes('PACIENTE'))     return 'PACIENTE';
    if (k.includes('ADMIN'))        return 'ADMIN';
    return null;
  };


  const M_Admin         = pick('Administrador','Admin','administrator');
  const M_Funcionario   = pick('Funcionario');
  const M_Tecnologo     = pick('Tecnologo','Technologist');
  const M_Investigador  = pick('Investigador','Researcher');
  const M_Paciente      = pick('Paciente','Patient');


  const M_ProfProfile   = pick('ProfessionalProfile','professional_profile','professionalProfile');


  const [admin, func, tec, inv, pac, prof] = await Promise.all([
    findByUser(M_Admin),
    findByUser(M_Funcionario),
    findByUser(M_Tecnologo),
    findByUser(M_Investigador),
    findByUser(M_Paciente),
    (async () => {
      if (!M_ProfProfile) return null;

      const attrs = M_ProfProfile.rawAttributes || {};
      const where = 'user_id' in attrs ? { user_id: userId } :
                    'userId'  in attrs ? { userId:  userId } : { user_id: userId };
      try {
        return await M_ProfProfile.findOne({ where, attributes: ['cargo','activo','hospital'] });
      } catch {
        return null;
      }
    })(),
  ]);


  if (admin) roles.add('ADMIN');
  if (func)  roles.add('FUNCIONARIO');
  if (tec)   roles.add('TECNOLOGO');
  if (inv)   roles.add('INVESTIGADOR');
  if (pac)   roles.add('PACIENTE');


  const cargo = prof?.cargo ?? prof?.dataValues?.cargo;
  const fromCargo = mapCargoToRole(cargo);
  if (fromCargo) roles.add(fromCargo);

  return Array.from(roles);
};
