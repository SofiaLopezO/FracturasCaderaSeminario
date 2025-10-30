// components/Funcionario/modals/MinutaModal.ts
import type { DetallesPaciente } from '@/types/interfaces';

export type MinutaBlocks = {
    motivo?: string;
    diagnosticoLibre?: string; // si quieres sobreescribir el dx que trae el paciente
    tratamiento?: string;
};

export type AutorMinuta = {
    nombre: string;
    cargo?: string; // "Kinesiólogo", "Médico", "Funcionario", etc.
    rut?: string; // opcional
    unidad?: string; // opcional (servicio/equipo)
};

type AutoTableFn = (doc: any, options: any) => void;

function safeDate(d?: string | null) {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('es-CL');
}

function lastDefined<T>(arr: T[]): T | undefined {
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return arr[i];
    return undefined;
}

function sortByDateAsc<
    T extends {
        fecha_recepcion?: string | null;
        fecha?: string | null;
        fecha_toma?: string | null;
    }
>(arr: T[]) {
    return [...arr].sort((a, b) => {
        const ta = new Date(
            a?.fecha_recepcion ?? a?.fecha ?? a?.fecha_toma ?? ''
        ).getTime();
        const tb = new Date(
            b?.fecha_recepcion ?? b?.fecha ?? b?.fecha_toma ?? ''
        ).getTime();
        return (isNaN(ta) ? 0 : ta) - (isNaN(tb) ? 0 : tb);
    });
}

export async function generarMinutaPDF(
    p: DetallesPaciente,
    autor: AutorMinuta,
    blocks: MinutaBlocks = {},
    opts?: { maxExamenes?: number; download?: boolean; returnBlob?: boolean } // default 5
) {
    if (!p?.general) {
        alert('No hay datos del paciente para generar la minuta.');
        return;
    }

    const maxExamenes = opts?.maxExamenes ?? 5;

    // Cargas dinámicas (evita SSR issues)
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = (await import('jspdf-autotable')) as {
        default: AutoTableFn;
    };

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = 595;
    const pageH = 842;
    const margin = 48;
    let y = margin;

    // ============ EXTRACCIÓN DE DATOS ============
    const g = p.general;

    // Paciente
    const nombre = g?.nombre ?? '—';
    const rut = g?.rut ?? '—';
    const fnac = safeDate(g?.fecha_nacimiento);
    const edadDesc =
        g?.edad != null
            ? `${g.edad} años${g?.edad_meses ? ` ${g.edad_meses} meses` : ''}`
            : '—';
    const sexo = g?.sexo ?? '—';
    const tipoSangre = g?.tipo_sangre ?? '—';
    const antropometria = {
        altura: g?.altura != null ? `${Math.round(Number(g.altura))} cm` : '—',
        peso: g?.peso != null ? `${g.peso} kg` : '—',
        imc: g?.IMC != null ? `${Number(g.IMC).toFixed(1)}` : '—',
    };

    // Diagnóstico activo / último (o libre)
    const dxActual =
        blocks.diagnosticoLibre?.trim() ||
        (g?.dx_actual?.cie10
            ? `${g.dx_actual.cie10}${
                  g.dx_actual?.tipo_fractura
                      ? ` (${g.dx_actual.tipo_fractura})`
                      : ''
              }`
            : '—');

    // Indicadores (nivel, suma + detalle robusto)
    const indRaw: any = (p as any).indicadores ?? {};
    const indicadoresNivel = indRaw?.nivel ?? '—';
    const indicadoresSuma = indRaw?.suma ?? '—';

    // Puede venir como array 'detalle', array 'indicadores' o como objeto plano
    let indicadoresDetalle: Array<{ nombre: string; valor: string }> = [];

    if (Array.isArray(indRaw?.detalle)) {
        indicadoresDetalle = indRaw.detalle.map((d: any) => ({
            nombre: String(d?.nombre ?? d?.key ?? '—'),
            valor: String(d?.valor ?? d?.score ?? d?.suma ?? '—'),
        }));
    } else if (Array.isArray(indRaw?.indicadores)) {
        indicadoresDetalle = indRaw.indicadores.map((d: any) => ({
            nombre: String(d?.nombre ?? d?.key ?? '—'),
            valor: String(d?.valor ?? d?.score ?? '—'),
        }));
    } else if (indRaw && typeof indRaw === 'object') {
        indicadoresDetalle = Object.entries(indRaw as Record<string, unknown>)
            .filter(
                ([k]) =>
                    !['nivel', 'suma', 'detalle', 'indicadores'].includes(k)
            )
            .map(([k, v]) => ({ nombre: k, valor: String(v) }));
    }

    // Laboratorio (últimas muestras)
    const muestras: any[] =
        p?.laboratorio?.solicitudes?.[0]?.muestras &&
        Array.isArray(p.laboratorio.solicitudes[0].muestras)
            ? (p.laboratorio.solicitudes[0].muestras as any[])
            : [];

    const muestrasOrdenadas = sortByDateAsc(
        muestras.map((m) => ({
            ...m,
            fecha_recepcion:
                m?.fecha_recepcion ?? m?.fecha ?? m?.fecha_toma ?? null,
        }))
    );
    const ultimasMuestras = muestrasOrdenadas.slice(-maxExamenes);

    // Series para últimos valores clave
    type Valor = {
        fecha: string;
        valor: number | undefined;
        unidad?: string | undefined;
    };
    const series: Record<string, Valor[]> = {
        HB: [],
        GLUCOSA: [],
        COLESTEROL_TOTAL: [],
        TRIGLICERIDOS: [],
    };

    muestrasOrdenadas.forEach((m) => {
        const f = m?.fecha_recepcion ?? '';
        (m?.resultados ?? []).forEach((r: any) => {
            const key = r?.parametro as keyof typeof series;
            if (series[key]) {
                const n = r?.valor != null ? Number(r.valor) : undefined;
                series[key].push({
                    fecha: f,
                    valor: isNaN(Number(n)) ? undefined : n,
                    unidad: r?.unidad,
                });
            }
        });
    });

    const ultimoValor = (arr: Valor[]) =>
        arr.length
            ? {
                  valor: lastDefined(arr.map((x) => x.valor)),
                  unidad: lastDefined(arr.map((x) => x.unidad)),
                  fecha: lastDefined(arr.map((x) => x.fecha)),
              }
            : { valor: undefined, unidad: undefined, fecha: undefined };

    const ultimos = {
        HB: ultimoValor(series.HB),
        GLUCOSA: ultimoValor(series.GLUCOSA),
        COLESTEROL_TOTAL: ultimoValor(series.COLESTEROL_TOTAL),
        TRIGLICERIDOS: ultimoValor(series.TRIGLICERIDOS),
    };

    // ===================== PDF =====================
    // Metadatos
    doc.setProperties({
        title: 'Minuta clínica',
        subject: 'Resumen clínico de paciente',
        author: autor?.nombre || 'Portal',
    });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Minuta clínica', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
        `Emitido: ${new Date().toLocaleString('es-CL')}`,
        pageW - margin,
        y,
        { align: 'right' }
    );
    y += 16;

    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 18;

    // Resumen identificación
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Resumen de identificación', margin, y);
    y += 12;

    const resumenBody = [
        ['Nombre paciente', nombre],
        ['RUT paciente', rut],
        ['Nacimiento / Edad', `${fnac} / ${edadDesc}`],
        ['Sexo / Grupo sanguíneo', `${sexo} / ${tipoSangre}`],
        [
            'Profesional',
            [
                autor?.nombre ?? '—',
                [autor?.cargo, autor?.rut, autor?.unidad]
                    .filter(Boolean)
                    .join(' • '),
            ]
                .filter(Boolean)
                .join(' — '),
        ],
    ];

    (autoTable as AutoTableFn)(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [30, 64, 175], textColor: 255 },
        head: [['Campo', 'Contenido']],
        body: resumenBody,
        alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    y = (doc as any).lastAutoTable.finalY + 16;

    // Antropometría
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Antropometría', margin, y);
    y += 12;

    (autoTable as AutoTableFn)(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        head: [['Altura', 'Peso', 'IMC']],
        body: [[antropometria.altura, antropometria.peso, antropometria.imc]],
    });
    y = (doc as any).lastAutoTable.finalY + 16;

    // Diagnóstico
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Diagnóstico activo/último', margin, y);
    y += 12;

    (autoTable as AutoTableFn)(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        head: [['Diagnóstico']],
        body: [[dxActual || '—']],
    });
    y = (doc as any).lastAutoTable.finalY + 16;

    // Indicadores clínicos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Indicadores clínicos', margin, y);
    y += 12;

    (autoTable as AutoTableFn)(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [234, 88, 12], textColor: 255 },
        head: [['Nivel', 'Puntaje']],
        body: [[String(indicadoresNivel), String(indicadoresSuma)]],
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    if (indicadoresDetalle.length) {
        (autoTable as AutoTableFn)(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
            headStyles: { fillColor: [234, 88, 12], textColor: 255 },
            head: [['Indicador', 'Valor']],
            body: indicadoresDetalle.map((d) => [
                d.nombre || '—',
                d.valor || '—',
            ]),
            alternateRowStyles: { fillColor: [250, 245, 241] },
        });
        y = (doc as any).lastAutoTable.finalY + 16;
    } else {
        y += 8;
    }

    // Últimos valores clave de laboratorio
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Últimos valores de laboratorio (clave)', margin, y);
    y += 12;

    (autoTable as AutoTableFn)(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        head: [['Parámetro', 'Valor', 'Unidad', 'Fecha']],
        body: [
            [
                'Hemoglobina',
                ultimos.HB.valor ?? '—',
                ultimos.HB.unidad ?? 'g/dL',
                safeDate(ultimos.HB.fecha),
            ],
            [
                'Glucosa',
                ultimos.GLUCOSA.valor ?? '—',
                ultimos.GLUCOSA.unidad ?? 'mg/dL',
                safeDate(ultimos.GLUCOSA.fecha),
            ],
            [
                'Colesterol Total',
                ultimos.COLESTEROL_TOTAL.valor ?? '—',
                ultimos.COLESTEROL_TOTAL.unidad ?? 'mg/dL',
                safeDate(ultimos.COLESTEROL_TOTAL.fecha),
            ],
            [
                'Triglicéridos',
                ultimos.TRIGLICERIDOS.valor ?? '—',
                ultimos.TRIGLICERIDOS.unidad ?? 'mg/dL',
                safeDate(ultimos.TRIGLICERIDOS.fecha),
            ],
        ],
        alternateRowStyles: { fillColor: [239, 246, 255] },
    });
    y = (doc as any).lastAutoTable.finalY + 16;

    // Exámenes recientes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(
        `Exámenes recientes (últimos ${Math.min(
            maxExamenes,
            muestrasOrdenadas.length
        )})`,
        margin,
        y
    );
    y += 12;

    (autoTable as AutoTableFn)(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [30, 64, 175], textColor: 255 },
        head: [['Fecha recepción', 'Tipo muestra', 'N° resultados']],
        body: ultimasMuestras
            .slice() // copia
            .reverse()
            .map((m) => [
                safeDate(m?.fecha_recepcion),
                String(m?.tipo_muestra ?? '—'),
                String((m?.resultados ?? []).length),
            ]),
        alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    y = (doc as any).lastAutoTable.finalY + 16;

    // Bloques libres (si fueron provistos)
    const writeBlock = (titulo: string, contenido?: string) => {
        const clean = (contenido ?? '').trim();
        if (!clean) return;
        if (y > pageH - margin - 100) {
            doc.addPage();
            y = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(titulo, margin, y);
        y += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(clean, pageW - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 14 + 12;
    };

    writeBlock('Motivo de consulta', blocks.motivo);
    writeBlock('Tratamiento', blocks.tratamiento);

    // Pie
    if (y > pageH - 64) {
        doc.addPage();
        y = margin;
    }
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
        `Documento generado por ${autor?.nombre ?? '—'}${
            autor?.cargo ? ` (${autor.cargo})` : ''
        }.`,
        margin,
        pageH - margin
    );

    // Archivo final
    const nombreArchivo = `minuta_${(nombre || 'paciente')
        .toLowerCase()
        .replace(/\s+/g, '_')}.pdf`;

    // Obtener blob/arraybuffer desde jsPDF
    // 'blob' output es soportado por jsPDF
    const blob =
        (doc as any).output && typeof (doc as any).output === 'function'
            ? (doc as any).output('blob')
            : undefined;

    // Si opts.download no es explicitamente false, forzamos descarga local
    if (opts?.download !== false) {
        try {
            doc.save(nombreArchivo);
        } catch (e) {
            // fallback: crear enlace
            try {
                if (blob) {
                    const url = URL.createObjectURL(blob as Blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = nombreArchivo;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                }
            } catch (err) {
                console.warn(
                    'No se pudo forzar descarga automática del PDF',
                    err
                );
            }
        }
    }

    // Si piden el blob de vuelta (para subir), retornarlo
    if (opts?.returnBlob === true || opts?.download === false) {
        return blob as Blob | undefined;
    }

    return;
}
