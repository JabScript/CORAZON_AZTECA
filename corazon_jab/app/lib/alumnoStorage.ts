// app/lib/alumnoStorage.ts
// Registro de alumnos y su relación con un entrenador (o independiente), usando localStorage.

export type OrigenEntrenador = 'directorio' | 'manual' | 'independiente';

export interface DatosAlumno {
  id: number;
  /** usuarioId de la cuenta de sesión (authStorage), para vincular el registro con quien inició sesión */
  usuarioId: number;
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

/** Obtiene el registro deportivo de un alumno a partir del usuarioId de su sesión */
export function obtenerAlumnoPorUsuarioId(usuarioId: number): DatosAlumno | null {
  return obtenerAlumnos().find((a) => a.usuarioId === usuarioId) ?? null;
}

/**
 * Actualiza la relación de entrenador de un alumno (cambiar de entrenador,
 * elegir uno nuevo del directorio, agregar uno manual, o quedar independiente).
 */
export function actualizarEntrenadorAlumno(
  usuarioId: number,
  data: {
    origenEntrenador: OrigenEntrenador;
    entrenadorId?: string;
    nombreEntrenadorManual?: string;
  }
): void {
  const alumnos = obtenerAlumnos();
  const existe = alumnos.some((a) => a.usuarioId === usuarioId);

  if (existe) {
    const actualizados = alumnos.map((a) =>
      a.usuarioId === usuarioId
        ? {
            ...a,
            origenEntrenador: data.origenEntrenador,
            entrenadorId: data.origenEntrenador === 'directorio' ? data.entrenadorId : undefined,
            nombreEntrenadorManual: data.origenEntrenador === 'manual' ? data.nombreEntrenadorManual : undefined,
          }
        : a
    );
    guardarAlumnos(actualizados);
    return;
  }

  // Si el alumno no tiene un registro deportivo previo (ej. cuentas demo),
  // crea uno nuevo con datos básicos y la relación de entrenador indicada.
  const nuevo: DatosAlumno = {
    id: Date.now(),
    usuarioId,
    nombre: '',
    apellido: '',
    email: '',
    fechaNacimiento: '',
    peso: 0,
    nivel: 'Principiante',
    objetivo: 'Acondicionamiento físico',
    ciudad: '',
    origenEntrenador: data.origenEntrenador,
    entrenadorId: data.origenEntrenador === 'directorio' ? data.entrenadorId : undefined,
    nombreEntrenadorManual: data.origenEntrenador === 'manual' ? data.nombreEntrenadorManual : undefined,
    fechaRegistro: new Date().toISOString(),
  };
  guardarAlumnos([nuevo, ...alumnos]);
}

/** Elimina el registro deportivo de un alumno, por usuarioId */
export function eliminarAlumnoPorUsuarioId(usuarioId: number): void {
  guardarAlumnos(obtenerAlumnos().filter((a) => a.usuarioId !== usuarioId));
}

/** Elimina el registro deportivo de un alumno, por su id interno */
export function eliminarAlumnoPorId(id: number): void {
  guardarAlumnos(obtenerAlumnos().filter((a) => a.id !== id));
}

/**
 * Actualiza los datos generales de perfil de un alumno (apodo, peso, nivel,
 * objetivo, ciudad, fecha de nacimiento). Si el alumno no tiene un registro
 * previo (ej. cuentas de demostración), crea uno nuevo con los datos básicos.
 */
export function actualizarPerfilAlumno(
  usuarioId: number,
  data: Partial<Pick<DatosAlumno, 'apodo' | 'fechaNacimiento' | 'peso' | 'nivel' | 'objetivo' | 'ciudad' | 'nombre' | 'apellido' | 'email'>>
): DatosAlumno {
  const alumnos = obtenerAlumnos();
  const existente = alumnos.find((a) => a.usuarioId === usuarioId);

  if (existente) {
    const actualizado = { ...existente, ...data };
    guardarAlumnos(alumnos.map((a) => (a.usuarioId === usuarioId ? actualizado : a)));
    return actualizado;
  }

  const nuevo: DatosAlumno = {
    id: Date.now(),
    usuarioId,
    nombre: data.nombre ?? '',
    apellido: data.apellido ?? '',
    apodo: data.apodo,
    email: data.email ?? '',
    fechaNacimiento: data.fechaNacimiento ?? '',
    peso: data.peso ?? 0,
    nivel: data.nivel ?? 'Principiante',
    objetivo: data.objetivo ?? 'Acondicionamiento físico',
    ciudad: data.ciudad ?? '',
    origenEntrenador: 'independiente',
    fechaRegistro: new Date().toISOString(),
  };
  guardarAlumnos([nuevo, ...alumnos]);
  return nuevo;
}
