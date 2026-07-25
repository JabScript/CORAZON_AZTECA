// app/lib/sesionStorage.ts
// Sistema simple de sesión y roles usando localStorage

export type Rol = 'admin' | 'entrenador' | 'usuario';

export interface Sesion {
  usuarioId: number;
  nombre: string;
  rol: Rol;
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

// Sesión por defecto (simula un admin para desarrollo)
const SESION_DEFAULT: Sesion = {
  usuarioId: 1,
  nombre: 'Iker Domínguez',
  rol: 'admin',
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

/** Obtiene la sesión actual */
export function obtenerSesion(): Sesion {
  if (typeof window === 'undefined') return SESION_DEFAULT;
  try {
    const raw = localStorage.getItem(SESION_KEY);
    if (!raw) return SESION_DEFAULT;
    return JSON.parse(raw) as Sesion;
  } catch {
    return SESION_DEFAULT;
  }
}

/** Guarda/cambia la sesión */
export function guardarSesion(sesion: Sesion): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
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
