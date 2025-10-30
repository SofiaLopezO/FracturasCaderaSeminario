// Roles de aplicación
export type AppRole = 'funcionario' | 'paciente' | 'investigador' | 'tecnologo';

// Rol de sistema
export type SystemRole = 'admin';

// Unión
export type UserRole = AppRole | SystemRole;

export interface User {
  id: string;
  nombre: string;
  role: UserRole;
  token?: string;
}
