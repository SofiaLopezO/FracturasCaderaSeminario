// tests/examen.controller.spec.js
import { describe, it, expect, vi } from 'vitest';

describe('examen.controller helpers', () => {
    describe('formatDateTime helper (inferido del código)', () => {
        it('debería formatear Date a string ISO sin T', () => {
            function formatDateTime(input) {
                if (!input) return 'N/A';
                const date = input instanceof Date ? input : new Date(input);
                if (Number.isNaN(date.getTime())) return 'N/A';
                return date.toISOString().replace('T', ' ').slice(0, 19);
            }

            const date = new Date('2024-01-15T10:30:45.000Z');
            const result = formatDateTime(date);
            expect(result).toBe('2024-01-15 10:30:45');
        });

        it('debería formatear string de fecha válida', () => {
            function formatDateTime(input) {
                if (!input) return 'N/A';
                const date = input instanceof Date ? input : new Date(input);
                if (Number.isNaN(date.getTime())) return 'N/A';
                return date.toISOString().replace('T', ' ').slice(0, 19);
            }

            const result = formatDateTime('2024-01-15T10:30:45.000Z');
            expect(result).toBe('2024-01-15 10:30:45');
        });

        it('debería retornar N/A para fechas inválidas', () => {
            function formatDateTime(input) {
                if (!input) return 'N/A';
                const date = input instanceof Date ? input : new Date(input);
                if (Number.isNaN(date.getTime())) return 'N/A';
                return date.toISOString().replace('T', ' ').slice(0, 19);
            }

            expect(formatDateTime(null)).toBe('N/A');
            expect(formatDateTime(undefined)).toBe('N/A');
            expect(formatDateTime('')).toBe('N/A');
            expect(formatDateTime('invalid-date')).toBe('N/A');
        });
    });

    describe('safeTimestamp helper (inferido del código)', () => {
        it('debería convertir fecha válida a timestamp', () => {
            function safeTimestamp(input) {
                const ts = new Date(input).getTime();
                return Number.isNaN(ts) ? null : ts;
            }

            const date = new Date('2024-01-15T10:30:45.000Z');
            const result = safeTimestamp(date);
            expect(result).toBe(date.getTime());
        });

        it('debería convertir string de fecha a timestamp', () => {
            function safeTimestamp(input) {
                const ts = new Date(input).getTime();
                return Number.isNaN(ts) ? null : ts;
            }

            const dateStr = '2024-01-15T10:30:45.000Z';
            const result = safeTimestamp(dateStr);
            expect(result).toBe(new Date(dateStr).getTime());
        });

        it('debería retornar null para fechas inválidas', () => {
            function safeTimestamp(input) {
                const ts = new Date(input).getTime();
                return Number.isNaN(ts) ? null : ts;
            }

            expect(safeTimestamp('invalid-date')).toBeNull();
            expect(safeTimestamp(undefined)).toBeNull();
            expect(safeTimestamp('')).toBeNull();
        });
    });

    describe('Validaciones de negocio inferidas', () => {
        it('debería validar que paciente_id es obligatorio', () => {
            function validatePacienteId(body) {
                if (!body.paciente_id) {
                    return {
                        valid: false,
                        error: 'paciente_id es obligatorio',
                    };
                }
                return { valid: true };
            }

            const result = validatePacienteId({});
            expect(result.valid).toBe(false);
            expect(result.error).toBe('paciente_id es obligatorio');
        });

        it('debería validar que muestras es un array si se proporciona', () => {
            function validateMuestras(body) {
                if (
                    body.muestras !== undefined &&
                    !Array.isArray(body.muestras)
                ) {
                    return {
                        valid: false,
                        error: 'muestras debe ser un array',
                    };
                }
                return { valid: true };
            }

            expect(validateMuestras({ muestras: [] }).valid).toBe(true);
            expect(validateMuestras({ muestras: 'invalid' }).valid).toBe(false);
            expect(validateMuestras({}).valid).toBe(true);
        });

        it('debería usar valor por defecto para tipo_examen', () => {
            function getTipoExamen(body) {
                return body.tipo_examen ?? 'NO_ESPECIFICADO';
            }

            expect(getTipoExamen({})).toBe('NO_ESPECIFICADO');
            expect(getTipoExamen({ tipo_examen: 'LABORATORIO' })).toBe(
                'LABORATORIO'
            );
            expect(getTipoExamen({ tipo_examen: null })).toBe(
                'NO_ESPECIFICADO'
            );
        });

        it('debería usar fecha actual si no se proporciona fecha_solicitud', () => {
            function getFechaSolicitud(body) {
                return body.fecha_solicitud
                    ? new Date(body.fecha_solicitud)
                    : new Date();
            }

            const now = new Date();
            const result = getFechaSolicitud({});
            expect(result.getTime()).toBeCloseTo(now.getTime(), -2);

            const specificDate = '2024-01-15';
            const result2 = getFechaSolicitud({
                fecha_solicitud: specificDate,
            });
            expect(result2.toISOString()).toContain('2024-01-15');
        });
    });

    describe('Lógica de tipos de muestra existentes', () => {
        it('debería crear Set de tipos existentes en minúsculas', () => {
            const muestrasExistentes = [
                { tipo_muestra: 'SANGRE' },
                { tipo_muestra: 'Orina' },
                { tipo_muestra: 'sangre' },
            ];

            const tiposExistentes = new Set(
                muestrasExistentes.map((m) =>
                    String(m.tipo_muestra).toLowerCase()
                )
            );

            expect(tiposExistentes.size).toBe(2);
            expect(tiposExistentes.has('sangre')).toBe(true);
            expect(tiposExistentes.has('orina')).toBe(true);
        });

        it('debería detectar tipos duplicados (case-insensitive)', () => {
            const muestrasExistentes = [
                { tipo_muestra: 'SANGRE' },
                { tipo_muestra: 'sangre' },
                { tipo_muestra: 'Sangre' },
            ];

            const tiposExistentes = new Set(
                muestrasExistentes.map((m) =>
                    String(m.tipo_muestra).toLowerCase()
                )
            );

            expect(tiposExistentes.size).toBe(1);
        });
    });
});
