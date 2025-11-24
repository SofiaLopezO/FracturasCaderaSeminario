'use client';

import { useMemo, useState } from 'react';
import { useAdminUsers } from '../../contexts/AdminUsersContext';
import { Check, Loader2, Plus, UserPlus, AlertTriangle } from 'lucide-react';
import { normEmail, strongPwd, isValidRutCl, cleanRut } from '../../utils/rut';
import { useRut } from 'react-rut-formatter';

type CargoForm = 'TECNOLOGO' | 'INVESTIGADOR' | 'FUNCIONARIO' | 'ADMINISTRADOR';
type Status = { type: 'ok' | 'err' | ''; msg: string };

function fmtDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function CreateUserCard() {
  const { createUser, addRole, fetchUsers, loading } = useAdminUsers();

  const { rut, updateRut, isValid } = useRut();

  const {
    rut: rutProf,
    updateRut: updateRutProf,
    isValid: isValidProf,
  } = useRut();

  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | 'O' | ''>('');
  const [fechaNac, setFechaNac] = useState('');
  const [password, setPassword] = useState('');

  const [cargo, setCargo] = useState<CargoForm>('TECNOLOGO');
  const [especialidad, setEspecialidad] = useState('');
  const [hospital, setHospital] = useState('');
  const [departamento, setDepartamento] = useState('');

  const [status, setStatus] = useState<Status>({ type: '', msg: '' });

  const PWD_PREFIX = process.env.NEXT_PUBLIC_DEFAULT_PWD_PREFIX ?? 'ABCD';

  const { maxBirthStr, minBirthStr } = useMemo(() => {
    const today = new Date();
    const max = fmtDateLocal(today);
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const min = fmtDateLocal(minDate);
    return { maxBirthStr: max, minBirthStr: min };
  }, []);

  const birthDateStatus = useMemo(() => {
    if (!fechaNac) return { valid: true, msg: '' };
    if (fechaNac > maxBirthStr) return { valid: false, msg: 'La fecha no puede ser futura.' };
    if (fechaNac < minBirthStr) return { valid: false, msg: 'La edad no puede superar los 120 años.' };
    return { valid: true, msg: '' };
  }, [fechaNac, maxBirthStr, minBirthStr]);

  const requiereRP = !(cargo === 'FUNCIONARIO' || cargo === 'ADMINISTRADOR');
  const okProf = requiereRP ? isValidRutCl(cleanRut(rutProf.formatted)) : true;

  const puedeCrear = useMemo(() => {
    const okBase =
      isValid &&
      nombres.trim().length >= 2 &&
      apellidoPaterno.trim().length >= 2 &&
      apellidoMaterno.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(normEmail(correo)) &&
      strongPwd(password) &&
      birthDateStatus.valid;

    return okBase && okProf;
  }, [
    isValid,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    correo,
    password,
    birthDateStatus.valid,
    okProf,
  ]);

  function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputRut = e.target.value;
    updateRut(inputRut);
    const cleaned = cleanRut(inputRut);
    if (isValidRutCl(cleaned)) {
      const cuerpo = cleaned.slice(0, -1);
      const last4 = cuerpo.slice(-4).padStart(4, '0');
      setPassword(`${PWD_PREFIX}${last4}`);
    } else {
      setPassword('');
    }
  }

  function handleRutProfChange(e: React.ChangeEvent<HTMLInputElement>) {
    updateRutProf(e.target.value);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (fechaNac) {
      if (fechaNac > maxBirthStr) {
        setStatus({ type: 'err', msg: 'Fecha de nacimiento futura no permitida.' });
        return;
      }
      if (fechaNac < minBirthStr) {
        setStatus({ type: 'err', msg: 'Edad máxima permitida: 120 años.' });
        return;
      }
    }
    if (requiereRP && !isValidRutCl(cleanRut(rutProf.formatted))) {
      setStatus({ type: 'err', msg: 'RUT profesional inválido.' });
      return;
    }
    if (!puedeCrear) return;

    setStatus({ type: '', msg: '' });

    try {
      const isAdminNew = cargo === 'ADMINISTRADOR';
      const rutStr = cleanRut(rut.formatted);
      const rutProfStr = requiereRP ? cleanRut(rutProf.formatted) : null;

      const payload = isAdminNew
        ? {
            user: {
              rut: rutStr,
              nombres,
              apellido_paterno: apellidoPaterno,
              apellido_materno: apellidoMaterno,
              correo,
              password,
              telefono,
              sexo,
              fecha_nacimiento: fechaNac || undefined,
            },
            role: 'ADMIN' as const,
          }
        : {
            user: {
              rut: rutStr,
              nombres,
              apellido_paterno: apellidoPaterno,
              apellido_materno: apellidoMaterno,
              correo,
              password,
              telefono,
              sexo,
              fecha_nacimiento: fechaNac || undefined,
            },
            profile: {
              cargo,
              rut_profesional: rutProfStr,
              especialidad: especialidad || null,
              hospital: hospital || null,
              departamento: departamento || null,
            },
          };

      const resp = await createUser(payload);
      const newId: number | undefined = (resp as any)?.user?.id ?? (resp as any)?.id;
      if (isAdminNew && newId) await addRole(newId, 'ADMIN');
      await fetchUsers();

      setStatus({
        type: 'ok',
        msg: `Usuario "${nombres} ${apellidoPaterno}" creado correctamente.${isAdminNew ? ' (Rol ADMIN asignado)' : ''} Contraseña temporal: ${password}`,
      });

      updateRut('');
      updateRutProf('');
      setNombres('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setCorreo('');
      setTelefono('');
      setSexo('');
      setFechaNac('');
      setPassword('');
      setCargo('TECNOLOGO');
      setEspecialidad('');
      setHospital('');
      setDepartamento('');
    } catch (err: any) {
      setStatus({ type: 'err', msg: err?.message || 'No se pudo crear el usuario' });
    }
  }

  return (
    <section className="create-user-card bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <h2 className="font-semibold">Crear nuevo usuario</h2>
        </div>
      </div>

      {/* Alertas */}
      {status.type === 'ok' && (
        <div className="mx-5 mt-4 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 px-4 py-2">
          {status.msg}
        </div>
      )}
      {status.type === 'err' && (
        <div className="mx-5 mt-4 rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-2">
          {status.msg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identidad */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-neutral-800">Datos de identidad</h3>
        </div>

        <input
          className="fc-input"
          placeholder="RUT nacional (12.345.678-9)"
          value={rut.formatted}
          onChange={handleRutChange}
          maxLength={12}
          required
        />
        <input
          className="fc-input"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          className="fc-input"
          placeholder="Nombres"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
        />
        <input
          className="fc-input"
          placeholder="Apellido paterno"
          value={apellidoPaterno}
          onChange={(e) => setApellidoPaterno(e.target.value)}
        />

        <input
          className="fc-input"
          placeholder="Apellido materno"
          value={apellidoMaterno}
          onChange={(e) => setApellidoMaterno(e.target.value)}
        />

        <div className="flex gap-3">
          <select
            className="fc-input"
            value={sexo}
            onChange={(e) => setSexo(e.target.value as any)}
          >
            <option value="">Sexo</option>
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="O">Otro</option>
          </select>

          <div className="flex-1">
            <input
              className="fc-input w-full"
              type="date"
              value={fechaNac}
              onChange={(e) => setFechaNac(e.target.value)}
              min={minBirthStr}
              max={maxBirthStr}
              placeholder="Fecha de nacimiento"
            />
            {!birthDateStatus.valid && (
              <div className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{birthDateStatus.msg}</span>
              </div>
            )}
          </div>
        </div>

        <input
          className="fc-input"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <input className="fc-input" placeholder="Contraseña" value={password} disabled />

        {/* Profesional */}
        <div className="col-span-1 md:col-span-2 mt-2">
          <h3 className="text-sm font-semibold text-neutral-800">Perfil profesional</h3>
        </div>

        <select
          className="fc-input"
          value={cargo}
          onChange={(e) => setCargo(e.target.value as CargoForm)}
        >
          <option value="TECNOLOGO">Tecnólogo(a) Médico</option>
          <option value="INVESTIGADOR">Investigador(a)</option>
          <option value="FUNCIONARIO">Funcionario(a)</option>
          <option value="ADMINISTRADOR">Administrador(a)</option>
        </select>

        <input
          className="fc-input"
          placeholder="RUT del profesional (12.345.678-9)"
          value={rutProf.formatted}
          onChange={handleRutProfChange}
          maxLength={12}
        />

        <input
          className="fc-input"
          placeholder="Especialidad (opcional)"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
        />
        <input
          className="fc-input"
          placeholder="Hospital (opcional)"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
        />
        <input
          className="fc-input"
          placeholder="Departamento (opcional)"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
        />

        <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={!puedeCrear || loading}
            className="fc-btn-primary inline-flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear usuario
          </button>
          {puedeCrear && !loading && <Check className="h-5 w-5 text-emerald-600" />}
        </div>
      </form>
    </section>
  );
}

export default CreateUserCard;
