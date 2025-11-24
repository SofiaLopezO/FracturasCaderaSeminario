const express = require('express');
const router = express.Router();
const c = require('../controller/investigador.controller');
const analytics = require('../controller/investigador.analytics.controller');

router.get('/analytics/completo', analytics.getAnalyticsCompleto);
router.get('/analytics/muestras-completas', analytics.getMuestrasConResultados);
router.get('/analytics/tipos-examen', analytics.getTiposExamen);
router.get('/analytics/promedios-parametros', analytics.getPromediosParametros);
router.get('/analytics/contador-categorias', analytics.getContadorCategorias);
router.get(
    '/analytics/distribucion-fractura-sexo',
    analytics.getDistribucionFracturaSexo
);
router.get(
    '/analytics/riesgo-refractura-comorbilidades',
    analytics.getRiesgoRefracturaComorbilidades
);
router.get(
    '/analytics/riesgo-refractura-habitos',
    analytics.getRiesgoRefracturaHabitos
);

router.get('/', c.list);
router.get('/:user_id', c.getOne);
router.post('/', c.create);
router.put('/:user_id', c.update);
router.delete('/:user_id', c.remove);

module.exports = router;
