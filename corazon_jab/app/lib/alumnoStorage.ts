// app/lib/alumnoStorage.ts
// Registro de alumnos y su relación con un entrenador (o independiente), usando localStorage.

export type OrigenEntrenador = 'directorio' | 'manual' | 'independiente';

export interface DatosAlumno {
  id: number;
  nombre: string;
  apellido: string;
  apodo?: string;
  email: string;
  fechaNacimiento: string;
  peso: number;
  nivel: string;
  objetivo: string;
  ciudad: string;
  /** Cómo quedó asociado el entrenador al momento del registro */
  origenEntrenador: OrigenEntrenador;
  /** ID del entrenador del directorio público (solo si origenEntrenador === 'directorio') */
  entrenadorId?: string;
  /** Nombre del entrenador cuando se agrega manualmente (no está en el directorio) */
  nombreEntrenadorManual?: string;
  fechaRegistro: string; // ISO date
}

const ALUMNOS_KEY = 'corazon_azteca_alumnos';

const ALUMNOS_DEFAULT: DatosAlumno[] = [];

/** Obtiene todos los alumnos registrados */
export function obtenerAlumnos(): DatosAlumno[] {
  if (typeof window === 'undefined') return ALUMNOS_DEFAULT;
  try {
    const raw = localStorage.getItem(ALUMNOS_KEY);
    if (!raw) return ALUMNOS_DEFAULT;
    return JSON.parse(raw) as DatosAlumno[];
  } catch {
    return ALUMNOS_DEFAULT;
  }
}

function guardarAlumnos(alumnos: DatosAlumno[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALUMNOS_KEY, JSON.stringify(alumnos));
}

/** Registra un nuevo alumno con su relación de entrenador (directorio, manual o independiente) */
export function registrarAlumno(data: Omit<DatosAlumno, 'id' | 'fechaRegistro'>): DatosAlumno {
  const alumnos = obtenerAlumnos();

  const nuevo: DatosAlumno = {
    ...data,
    id: Date.now(),
    fechaRegistro: new Date().toISOString(),
  };

  guardarAlumnos([nuevo, ...alumnos]);
  return nuevo;
}
