export function TecnologoDashboard() {
    const { detalles: seleccionado, clearSelection } = useTecnologo();

    if (!seleccionado) {
        return (
            <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                        No hay paciente seleccionado
                    </h2>
                </div>
            </div>
        );
    }

    const general = (seleccionado as DetallesPaciente).general;
    const rutFmt = general?.rut
        ? String(general.rut).replace(
              /^(\d{1,2})(\d{3})(\d{3})([0-9kK])$/,
              '$1.$2.$3-$4'
          )
        : '—';

    const edadDescripcion =
        general?.edad != null
            ? `${general.edad} años${
                  general?.edad_meses ? ` ${general.edad_meses} meses` : ''
              }`
            : '—';

    const pacienteId =
        (general as any)?.user_id ??
        (general as any)?.paciente_id ??
        (general as any)?.id ??
        (seleccionado as any)?.user_id ??
        (seleccionado as any)?.id ??
        0;

    return (
        <div className='min-h-screen bg-gray-50 p-6'>
            {/* Header + ficha básica */}
            <div className='flex justify-between mb-6'>
                <div>
                    <h1 className='text-3xl font-bold text-slate-900'>
                        Vista general del paciente
                    </h1>
                    <p className='text-slate-600 mt-2'>Resumen básico</p>
                </div>
                <button
                    onClick={clearSelection}
                    className='px-4 py-2 bg-white text-blue-600 rounded-xl border-2 hover:bg-blue-700 hover:text-white transition-colors flex items-center space-x-2'
                >
                    <UserSearch size={24} />
                    <span>Seleccionar paciente</span>
                </button>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='flex items-start gap-4 p-6'>
                    <div className='p-3 bg-blue-100 rounded-full'>
                        <User className='w-8 h-8 text-blue-600' />
                    </div>
                    <div className='space-y-2'>
                        <h2 className='text-2xl font-semibold text-gray-900'>
                            {general?.nombre ?? 'Paciente'}
                        </h2>
                        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm'>
                            <div className='text-gray-800'>
                                <span className='font-medium'>RUT: </span>
                                {rutFmt}
                            </div>
                            <div className='w-px h-4 bg-gray-300' />
                            <div className='text-gray-800'>
                                <span className='font-medium'>
                                    Fecha de nacimiento:{' '}
                                </span>
                                {formatDate(general?.fecha_nacimiento)}
                            </div>
                            <div className='w-px h-4 bg-gray-300' />
                            <div className='text-gray-800'>
                                <span className='font-medium'>Edad: </span>
                                {edadDescripcion}
                            </div>
                            <div className='w-px h-4 bg-gray-300' />
                            <div className='text-gray-800'>
                                <span className='font-medium'>Sexo: </span>
                                {general?.sexo ?? '—'}
                            </div>
                            <div className='w-px h-4 bg-gray-300' />
                            {/* Tipo de sangre: editable una sola vez si está vacío */}
                            <div className='flex items-center gap-2'>
                                <span className='font-medium'>
                                    Tipo de sangre:
                                </span>
                                <BloodTypeSetter
                                    pacienteId={pacienteId}
                                    initialValue={general?.tipo_sangre ?? null}
                                    onSaved={(nuevo) => {
                                        if (general)
                                            (general as any).tipo_sangre =
                                                nuevo;
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel de exámenes */}
            <LabExamsPanel />
        </div>
    );
}
