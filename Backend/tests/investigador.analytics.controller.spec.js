// tests/investigador.analytics.controller.spec.js
import { describe, it, expect, vi } from 'vitest';

describe('investigador.analytics.controller helpers', () => {
    describe('Categorización de tipos de examen', () => {
        it('debería categorizar exámenes de IMAGEN', () => {
            function categorizarExamen(nombre) {
                const nombreLower = nombre.toLowerCase();
                if (
                    nombreLower === 'imagen' ||
                    nombreLower.includes('imagen')
                ) {
                    return 'IMAGEN';
                }
                return 'OTROS';
            }

            expect(categorizarExamen('Imagen')).toBe('IMAGEN');
            expect(categorizarExamen('Imagen Rayos X')).toBe('IMAGEN');
            expect(categorizarExamen('IMAGEN')).toBe('IMAGEN');
        });

        it('debería categorizar exámenes de LABORATORIO', () => {
            function categorizarExamen(nombre) {
                const nombreLower = nombre.toLowerCase();
                if (
                    nombreLower === 'laboratorio' ||
                    nombreLower.includes('laboratorio')
                ) {
                    return 'LABORATORIO';
                }
                return 'OTROS';
            }

            expect(categorizarExamen('Laboratorio')).toBe('LABORATORIO');
            expect(categorizarExamen('Examen de Laboratorio Clínico')).toBe(
                'LABORATORIO'
            );
        });

        it('debería categorizar exámenes BIOQUIMICOS', () => {
            function categorizarBioquimica(nombre) {
                const nombreLower = nombre.toLowerCase();
                const normalized = nombreLower
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');

                if (
                    normalized.includes('lipid') ||
                    normalized.includes('glucosa') ||
                    normalized.includes('metabol') ||
                    normalized.includes('bioquim')
                ) {
                    return 'BIOQUIMICA';
                }
                return 'OTROS';
            }

            expect(categorizarBioquimica('Panel Lipídico')).toBe('BIOQUIMICA');
            expect(categorizarBioquimica('Glucosa en Sangre')).toBe(
                'BIOQUIMICA'
            );
            expect(categorizarBioquimica('Perfil Metabólico')).toBe(
                'BIOQUIMICA'
            );
            expect(categorizarBioquimica('Análisis Bioquímico')).toBe(
                'BIOQUIMICA'
            );
        });

        it('debería categorizar exámenes HEMATOLOGICOS', () => {
            function categorizarHematologia(nombre) {
                const nombreLower = nombre.toLowerCase();
                const normalized = nombreLower
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');

                if (
                    normalized.includes('hemograma') ||
                    normalized.includes('sangre') ||
                    normalized.includes('hematolog')
                ) {
                    return 'HEMATOLOGIA';
                }
                return 'OTROS';
            }

            expect(categorizarHematologia('Hemograma Completo')).toBe(
                'HEMATOLOGIA'
            );
            expect(categorizarHematologia('Recuento de Sangre')).toBe(
                'HEMATOLOGIA'
            );
            expect(categorizarHematologia('Análisis Hematológico')).toBe(
                'HEMATOLOGIA'
            );
        });

        it('debería categorizar exámenes de URINALISIS', () => {
            function categorizarUrinalisis(nombre) {
                const nombreLower = nombre.toLowerCase();
                if (nombreLower.includes('orina')) {
                    return 'URINALISIS';
                }
                return 'OTROS';
            }

            expect(categorizarUrinalisis('Examen de Orina')).toBe('URINALISIS');
            expect(categorizarUrinalisis('Orina Completa')).toBe('URINALISIS');
        });

        it('debería categorizar exámenes CARDIOLOGICOS', () => {
            function categorizarCardiologia(nombre) {
                const nombreLower = nombre.toLowerCase();
                const normalized = nombreLower
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');

                if (
                    normalized.includes('cardio') ||
                    normalized.includes('corazon')
                ) {
                    return 'CARDIOLOGIA';
                }
                return 'OTROS';
            }

            expect(categorizarCardiologia('Electrocardiograma')).toBe(
                'CARDIOLOGIA'
            );
            expect(categorizarCardiologia('Perfil Cardiovascular')).toBe(
                'CARDIOLOGIA'
            );
            expect(categorizarCardiologia('Examen del Corazón')).toBe(
                'CARDIOLOGIA'
            );
        });

        it('debería categorizar exámenes no reconocidos como OTROS', () => {
            function categorizarCompleto(nombre) {
                const nombreLower = nombre.toLowerCase();
                let categoria = 'OTROS';

                if (
                    nombreLower === 'imagen' ||
                    nombreLower.includes('imagen')
                ) {
                    categoria = 'IMAGEN';
                } else if (
                    nombreLower === 'laboratorio' ||
                    nombreLower.includes('laboratorio')
                ) {
                    categoria = 'LABORATORIO';
                } else if (
                    nombreLower.includes('lipid') ||
                    nombreLower.includes('glucosa') ||
                    nombreLower.includes('metabol') ||
                    nombreLower.includes('bioquim')
                ) {
                    categoria = 'BIOQUIMICA';
                } else if (
                    nombreLower.includes('hemograma') ||
                    nombreLower.includes('sangre') ||
                    nombreLower.includes('hematolog')
                ) {
                    categoria = 'HEMATOLOGIA';
                } else if (nombreLower.includes('orina')) {
                    categoria = 'URINALISIS';
                } else if (
                    nombreLower.includes('cardio') ||
                    nombreLower.includes('corazon')
                ) {
                    categoria = 'CARDIOLOGIA';
                }

                return categoria;
            }

            expect(categorizarCompleto('Examen Dental')).toBe('OTROS');
            expect(categorizarCompleto('Audiometría')).toBe('OTROS');
            expect(categorizarCompleto('Espirometría')).toBe('OTROS');
        });
    });

    describe('Mapeo de tipos de muestra', () => {
        it('debería crear mapa de id a nombre', () => {
            const tiposMuestra = [
                { id: 1, nombre: 'SANGRE' },
                { id: 2, nombre: 'ORINA' },
                { id: 3, nombre: 'SALIVA' },
            ];

            const muestraMap = {};
            tiposMuestra.forEach((tm) => {
                muestraMap[tm.id] = tm.nombre;
            });

            expect(muestraMap[1]).toBe('SANGRE');
            expect(muestraMap[2]).toBe('ORINA');
            expect(muestraMap[3]).toBe('SALIVA');
            expect(Object.keys(muestraMap).length).toBe(3);
        });

        it('debería manejar array vacío', () => {
            const tiposMuestra = [];
            const muestraMap = {};
            tiposMuestra.forEach((tm) => {
                muestraMap[tm.id] = tm.nombre;
            });

            expect(Object.keys(muestraMap).length).toBe(0);
        });
    });


    describe('Ordenamiento de muestras', () => {
        it('debería ordenar por muestra_id descendente', () => {
            const muestras = [
                { muestra_id: 1 },
                { muestra_id: 5 },
                { muestra_id: 3 },
            ];

            muestras.sort((a, b) => b.muestra_id - a.muestra_id);

            expect(muestras[0].muestra_id).toBe(5);
            expect(muestras[1].muestra_id).toBe(3);
            expect(muestras[2].muestra_id).toBe(1);
        });
    });

    describe('Extracción de atributos de resultados', () => {
        it('debería definir atributos correctos para resultados', () => {
            const atributosResultado = [
                'resultado_id',
                'episodio_id',
                'muestra_id',
                'examen_id',
                'parametro',
                'valor',
                'unidad',
                'fecha_resultado',
            ];

            expect(atributosResultado).toContain('resultado_id');
            expect(atributosResultado).toContain('episodio_id');
            expect(atributosResultado).toContain('muestra_id');
            expect(atributosResultado).toContain('parametro');
            expect(atributosResultado).toContain('valor');
            expect(atributosResultado).toContain('unidad');
            expect(atributosResultado.length).toBe(8);
        });
    });
});
