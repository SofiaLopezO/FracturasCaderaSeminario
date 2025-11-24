const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./user.routes');
const pacienteRoutes = require('./paciente.routes');
const funcionarioRoutes = require('./funcionario.routes');
const tecnologoRoutes = require('./tecnologo.routes');
const investigadorRoutes = require('./investigador.routes');
const administradorRoutes = require('./administrador.routes');
const examenRoutes = require('./examen.routes');
const muestraRoutes = require('./muestra.routes');
const resultadoRoutes = require('./resultado.routes');
const indicadorRoutes = require('./indicador.routes');
const alertaRoutes = require('./alerta.routes');
const episodioIndicadorRoutes = require('./episodio_indicador.routes');
const minutaRoutes = require('./minuta.routes');
const registroRoutes = require('./registro.routes');
const adminUser = require('./admin.users');
const perfilRoutes = require('./perfil');
const episodioRoutes = require('./episodio.routes');
const cirugiaRoutes = require('./cirugia.routes');
const suspensionRoutes = require('./suspension.routes');
const parametroRoutes = require('./parametro.routes');
const controlClinicoRoutes = require('./contro_clinico.routes');
const publicRoutes = require('./public.routes');
const tipoExamenRoutes = require('./tipo_examen.routes');
const tipoMuestraRoutes = require('./tipo_muestra.routes');
const uploadsRoutes = require('./uploads.routes');

function initRoutes(app, basePath = '/api') {
    const api = express.Router();

    api.use('/auth', authRoutes);

    api.use('/users', userRoutes);
    api.use('/pacientes', pacienteRoutes);
    api.use('/funcionarios', funcionarioRoutes);
    api.use('/tecnologos', tecnologoRoutes);
    api.use('/investigadores', investigadorRoutes);
    api.use('/administradores', administradorRoutes);
    api.use('/examenes', examenRoutes);
    api.use('/muestras', muestraRoutes);
    api.use('/resultados', resultadoRoutes);
    api.use('/indicadores', indicadorRoutes);
    api.use('/alertas', alertaRoutes);
    api.use('/episodio-indicadores', episodioIndicadorRoutes);
    api.use('/minutas', minutaRoutes);
    api.use('/registros', registroRoutes);
    api.use('/adminUser', adminUser);
    api.use('/perfil', perfilRoutes);
    api.use('/public', publicRoutes);

    api.use('/episodios', episodioRoutes); 
    api.use('/cirugias', cirugiaRoutes); 
    api.use('/suspensiones', suspensionRoutes);
    api.use('/parametros', parametroRoutes); 
    api.use('/controles', controlClinicoRoutes); 
    api.use('/tipos-examen', tipoExamenRoutes);
    api.use('/tipos-muestra', tipoMuestraRoutes); 
    api.use('/uploads', uploadsRoutes); 

    app.use(basePath, api);

    app.use((req, res) => {
        res.status(404).json({
            error: 'Ruta no encontrada',
            path: req.originalUrl,
        });
    });
}

module.exports = { initRoutes };
