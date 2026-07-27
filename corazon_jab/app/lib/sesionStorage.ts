// app/lib/sesionStorage.ts
// Sistema simple de sesión y roles usando localStorage

export type Rol = 'admin' | 'entrenador' | 'usuario';

export interface Sesion {
  usuarioId: number;
  nombre: string;
  rol: Rol;
  /** Foto de perfil (base64 data URL), opcional */
  foto?: string;
}

export interface PeleaProxima {
  id: number;
  usuarioId: number; // el usuario logueado
  contrincanteId: number; // el oponente
  fecha: string; // ISO date
  evento: string;
  lugar: string;
}

const SESION_KEY = 'corazon_azteca_sesion';
const PELEAS_PROXIMAS_KEY = 'corazon_azteca_peleas_proximas';

// Sesión de respaldo únicamente para renderizado en servidor (SSR) antes de
// hidratar. Nunca se usa como sesión real: `haySesion()` es la fuente de
// verdad sobre si alguien inició sesión de verdad.
const SESION_VACIA: Sesion = {
  usuarioId: 0,
  nombre: '',
  rol: 'usuario',
};

// Peleas próximas de ejemplo
const PELEAS_DEFAULT: PeleaProxima[] = [
  {
    id: 1,
    usuarioId: 1,
    contrincanteId: 3,
    fecha: '2026-08-15',
    evento: 'Guantes de Oro 2026',
    lugar: 'Auditorio Municipal',
  },
];

/** Verifica si hay una sesión real guardada (usuario logueado) */
export function haySesion(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SESION_KEY) !== null;
}

/** Obtiene la sesión actual. Si no hay ninguna, devuelve una sesión vacía (sin loguear). */
export function obtenerSesion(): Sesion {
  if (typeof window === 'undefined') return SESION_VACIA;
  try {
    const raw = localStorage.getItem(SESION_KEY);
    if (!raw) return SESION_VACIA;
    return JSON.parse(raw) as Sesion;
  } catch {
    return SESION_VACIA;
  }
}

/** Guarda/cambia la sesión (usado al iniciar sesión) */
export function guardarSesion(sesion: Sesion): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
}

/** Cierra la sesión actual */
export function cerrarSesion(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESION_KEY);
}

/** Verifica si el usuario actual es admin */
export function esAdmin(): boolean {
  return obtenerSesion().rol === 'admin';
}

/** Obtiene las peleas próximas del usuario actual */
export function obtenerPeleasProximas(): PeleaProxima[] {
  if (typeof window === 'undefined') return PELEAS_DEFAULT;
  try {
    const raw = localStorage.getItem(PELEAS_PROXIMAS_KEY);
    if (!raw) return PELEAS_DEFAULT;
    return JSON.parse(raw) as PeleaProxima[];
  } catch {
    return PELEAS_DEFAULT;
  }
}

/** Guarda peleas próximas */
export function guardarPeleasProximas(peleas: PeleaProxima[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PELEAS_PROXIMAS_KEY, JSON.stringify(peleas));
}

/**
 * Obtiene los IDs de contrincantes que el usuario puede ver.
 * Retorna null si es admin (ve todo), o un array de IDs permitidos.
 */
export function obtenerContricantesVisibles(): number[] | null {
  const sesion = obtenerSesion();
  if (sesion.rol === 'admin') return null; // null = acceso total

  const peleas = obtenerPeleasProximas();
  const hoy = new Date();
  
  // Solo peleas futuras del usuario actual
  const peleasFuturas = peleas.filter(
    (p) => p.usuarioId === sesion.usuarioId && new Date(p.fecha) >= hoy
  );

  return peleasFuturas.map((p) => p.contrincanteId);
}
