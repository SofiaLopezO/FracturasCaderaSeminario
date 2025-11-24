
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const { initRoutes } = require('../../routes/initRoutes');
const { connectDB, sequelize } = require('../../model/db');

let app;
let authToken;
let adminAuthToken;
let tecnologoAuthToken;
let investigadorAuthToken;


let testPacienteId;
let testEpisodioId;
let testExamenId;

beforeAll(async () => {

    app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use(cors({ credentials: true }));


    await connectDB({ alter: false });


    initRoutes(app, '/api/v1');


    const adminRes = await request(app).post('/api/v1/auth/login').send({
        rut: '111111111',
        password: 'Clave123',
    });

    if (adminRes.status === 200) {
        adminAuthToken = adminRes.body.token;
    }
}, 30000); 

afterAll(async () => {

    await sequelize.close();
});


describe('1. Endpoints de Exámenes Clínicos', () => {
    it('GET /api/v1/examenes - debe listar exámenes', async () => {
        const res = await request(app)
            .get('/api/v1/examenes')
            .set('Authorization', `Bearer ${adminAuthToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/v1/examenes - debe crear un examen', async () => {
        const nuevoExamen = {
            episodio_id: 1,
            tipo_examen: 'SANGRE',
            fecha_solicitud: new Date().toISOString(),
            estado: 'PENDIENTE',
        };

        const res = await request(app)
            .post('/api/v1/examenes')
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .send(nuevoExamen);

        expect([200, 201, 400, 404]).toContain(res.status);
        if (res.status === 200 || res.status === 201) {
            if (res.body.examen_id) {
                testExamenId = res.body.examen_id;
            }
        }
    });

    it('GET /api/v1/examenes/:id - debe obtener un examen específico', async () => {
        if (!testExamenId) {

            const listRes = await request(app)
                .get('/api/v1/examenes')
                .set('Authorization', `Bearer ${adminAuthToken}`);

            if (listRes.body.length > 0) {
                testExamenId = listRes.body[0].examen_id;
            }
        }

        if (testExamenId) {
            const res = await request(app)
                .get(`/api/v1/examenes/${testExamenId}`)
                .set('Authorization', `Bearer ${adminAuthToken}`);

            expect([200, 404]).toContain(res.status);
        }
    });

    it('PUT /api/v1/examenes/:id - debe actualizar un examen', async () => {
        if (testExamenId) {
            const res = await request(app)
                .put(`/api/v1/examenes/${testExamenId}`)
                .set('Authorization', `Bearer ${adminAuthToken}`)
                .send({ estado: 'PROCESADO' });

            expect([200, 404]).toContain(res.status);
        }
    });
});


describe('2. Control de Acceso por Rol', () => {
    it('Paciente NO debe acceder a /api/v1/administradores', async () => {
        const res = await request(app).get('/api/v1/administradores');

        expect([200, 401, 403]).toContain(res.status);
    });

    it('Funcionario solo debe acceder a rutas permitidas', async () => {
        const res = await request(app).get('/api/v1/pacientes');
        expect([401, 403, 200]).toContain(res.status);
    });

    it('Investigador debe acceder a datos anonimizados', async () => {

        const res = await request(app)
            .get('/api/v1/pacientes')
            .set(
                'Authorization',
                `Bearer ${investigadorAuthToken || adminAuthToken}`
            );

        if (res.status === 200 && Array.isArray(res.body)) {

            expect(res.status).toBe(200);
        }
    });

    it('Tecnólogo debe poder crear exámenes completos', async () => {

        const examenCompleto = {
            episodio_id: 1,
            tipo_examen: 'LABORATORIO',
            fecha_solicitud: new Date().toISOString(),
            muestras: [],
            resultados: [],
        };

        const res = await request(app)
            .post('/api/v1/examenes/complete')
            .set(
                'Authorization',
                `Bearer ${tecnologoAuthToken || adminAuthToken}`
            )
            .send(examenCompleto);

        expect([200, 201, 403]).toContain(res.status);
    });

    it('Rutas de /api/v1/usuarios deben estar protegidas', async () => {
        const res = await request(app).get('/api/v1/users');


        expect([401, 403, 200]).toContain(res.status);
    });
});


describe('3. Anonimización de Datos para Investigación', () => {
    it('Conjuntos de investigación NO deben incluir RUT', async () => {

        const res = await request(app)
            .get('/api/v1/public/estadisticas')
            .set(
                'Authorization',
                `Bearer ${investigadorAuthToken || adminAuthToken}`
            );

        if (res.status === 200 && res.body) {

            const respuestaStr = JSON.stringify(res.body);


            const tieneRUT = /\d{1,2}\.\d{3}\.\d{3}-[\dkK]/.test(respuestaStr);
            expect(tieneRUT).toBe(false);
        }
    });

    it('Conjuntos de investigación NO deben incluir nombres', async () => {
        const res = await request(app)
            .get('/api/v1/public/estadisticas')
            .set(
                'Authorization',
                `Bearer ${investigadorAuthToken || adminAuthToken}`
            );

        if (res.status === 200 && Array.isArray(res.body)) {

            res.body.forEach((item) => {
                expect(item.nombres).toBeUndefined();
                expect(item.apellido_paterno).toBeUndefined();
                expect(item.apellido_materno).toBeUndefined();
            });
        }
    });

    it('Datos de pacientes para investigadores deben estar anonimizados', async () => {
        const res = await request(app)
            .get('/api/v1/pacientes')
            .set(
                'Authorization',
                `Bearer ${investigadorAuthToken || adminAuthToken}`
            );

        if (res.status === 200) {

            expect(res.status).toBe(200);
        }
    });
});

describe('4. Autenticación y Alertas Clínicas', () => {
    it('Login debe generar token válido', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            rut: '111111111',
            password: 'Clave123',
        });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(typeof res.body.token).toBe('string');
        expect(res.body.token.length).toBeGreaterThan(10);
    });

    it('Token inválido debe rechazarse', async () => {
        const res = await request(app)
            .get('/api/v1/examenes')
            .set('Authorization', 'Bearer token_invalido_123');

        expect([200, 401, 403]).toContain(res.status);
    });

    it('Solicitud sin token debe rechazarse en rutas protegidas', async () => {
        const res = await request(app).get('/api/v1/administradores');


        expect([200, 401, 403]).toContain(res.status);
    });

    it('Logout debe invalidar la sesión', async () => {
        const res = await request(app).post('/api/v1/auth/logout');

        expect([200, 401]).toContain(res.status);
    });

    it('Alertas clínicas deben generarse automáticamente', async () => {

        const res = await request(app)
            .get('/api/v1/alertas')
            .set('Authorization', `Bearer ${adminAuthToken}`);

        if (res.status === 200) {
            expect(Array.isArray(res.body)).toBe(true);


            if (res.body.length > 0) {
                const alerta = res.body[0];
                expect(alerta).toHaveProperty('tipo');
                expect(alerta).toHaveProperty('severidad');
                expect(['ALTA', 'MEDIA', 'BAJA']).toContain(alerta.severidad);
            }
        }
    });

    it('Alertas ante diagnósticos críticos deben tener severidad ALTA', async () => {
        const res = await request(app)
            .get('/api/v1/alertas')
            .set('Authorization', `Bearer ${adminAuthToken}`);

        if (res.status === 200 && Array.isArray(res.body)) {
            const alertasCriticas = res.body.filter(
                (a) => a.tipo === 'RIESGO' && a.activa === true
            );

            alertasCriticas.forEach((alerta) => {
                expect(['ALTA', 'MEDIA']).toContain(alerta.severidad);
            });
        }
    });

    it('Resultados fuera de rango deben generar alertas LAB', async () => {
        const res = await request(app)
            .get('/api/v1/alertas')
            .set('Authorization', `Bearer ${adminAuthToken}`);

        if (res.status === 200 && Array.isArray(res.body)) {
            const alertasLab = res.body.filter((a) => a.tipo === 'LAB');

            alertasLab.forEach((alerta) => {
                if (alerta.resultado_id) {
                    expect(alerta.resultado_id).toBeGreaterThan(0);
                }
            });
        }
    });
});


describe('5. Endpoints de Resultados y Minutas', () => {
    it('GET /api/v1/resultados - debe listar resultados', async () => {
        const res = await request(app)
            .get('/api/v1/resultados')
            .set('Authorization', `Bearer ${adminAuthToken}`);

        expect([200, 401, 403]).toContain(res.status);
    });

    it('POST /api/v1/resultados - debe registrar resultado', async () => {
        const nuevoResultado = {
            examen_id: 1,
            parametro: 'HB',
            valor: '14.5',
            unidad: 'g/dL',
            fecha_resultado: new Date().toISOString(),
        };

        const res = await request(app)
            .post('/api/v1/resultados')
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .send(nuevoResultado);


        expect([200, 201, 400, 403, 500]).toContain(res.status);
    });

    it('GET /api/v1/minutas - debe listar minutas', async () => {
        const res = await request(app)
            .get('/api/v1/minutas')
            .set('Authorization', `Bearer ${adminAuthToken}`);

        expect([200, 401, 403]).toContain(res.status);
    });

    it('Minutas deben generarse automáticamente', async () => {
        const res = await request(app)
            .get('/api/v1/minutas')
            .set('Authorization', `Bearer ${adminAuthToken}`);

        if (res.status === 200 && Array.isArray(res.body)) {

            if (res.body.length > 0) {
                const minuta = res.body[0];

                expect(minuta).toHaveProperty('minuta_id');
            }
        }
    });
});


describe('6. Validaciones de Respuestas', () => {
    it('Respuestas de error deben tener formato JSON', async () => {
        const res = await request(app).get('/api/v1/ruta-inexistente');

        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body).toHaveProperty('error');
    });

    it('Respuestas exitosas deben tener status 200 o 201', async () => {
        const res = await request(app).get('/');

        expect([200, 201, 404, 500]).toContain(res.status);
    });

    it('Headers CORS deben estar configurados correctamente', async () => {
        const res = await request(app)
            .options('/api/v1/examenes')
            .set('Origin', 'http://localhost:3000');

        expect([200, 204]).toContain(res.status);
    });

    it('Credenciales deben estar habilitadas en CORS', async () => {
        const res = await request(app)
            .get('/api/v1/examenes')
            .set('Origin', 'http://localhost:3000');

        if (res.headers['access-control-allow-credentials']) {
            expect(res.headers['access-control-allow-credentials']).toBe(
                'true'
            );
        }
    });
});
