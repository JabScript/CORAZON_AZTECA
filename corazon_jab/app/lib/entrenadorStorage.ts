// app/lib/entrenadorStorage.ts

export interface RedSocial {
  nombre: string;
  usuario: string;
  url: string;
}

export interface FotoGaleria {
  id: string;
  src: string; // base64 data URL
  alt: string;
}

export interface PerfilEntrenador {
  id: string;
  nombre: string;
  especialidad: string;
  anosTrayectoria: number;
  foto: string; // base64 data URL o path
  bio: string;
  logros: string[];
  redes: RedSocial[];
  galeria: FotoGaleria[];
}

const STORAGE_KEY = 'corazon_azteca_perfil_entrenador';
const ENTRENADORES_KEY = 'corazon_azteca_entrenadores';

const PERFIL_DEFAULT: PerfilEntrenador = {
  id: 'entrenador-1',
  nombre: 'Rodrigo Cazares',
  especialidad: 'Boxeo olímpico',
  anosTrayectoria: 12,
  foto: '',
  bio: 'Ex-seleccionado nacional juvenil. Formo boxeadores desde cero apoyándome en fundamentos: postura, distancia y disciplina antes que fuerza.',
  logros: [
    'Medalla de bronce, Nacionales Juveniles 2014',
    '3 alumnos clasificados a Guantes de Oro',
    'Certificación Federación Mexicana de Boxeo',
    'Formador de 40+ boxeadores amateur',
  ],
  redes: [
    { nombre: 'Instagram', usuario: '@rodrigo.box', url: 'https://instagram.com/rodrigo.box' },
    { nombre: 'Facebook', usuario: 'Rodrigo Cazares Boxeo', url: 'https://facebook.com/rodrigocazaresboxeo' },
    { nombre: 'TikTok', usuario: '@rcazares_box', url: 'https://tiktok.com/@rcazares_box' },
    { nombre: 'WhatsApp', usuario: 'Contacto directo', url: 'https://wa.me/525500000000' },
  ],
  galeria: [],
};

/**
 * Entrenadores de prueba (máx. 5) que alimentan el directorio público
 * (`/entrenadores`) y el selector de entrenador en el registro de alumnos,
 * mientras no exista un backend real. Sus datos coinciden con las cuentas
 * de prueba en `app/lib/authStorage.ts`.
 */
const ENTRENADORES_PRUEBA: PerfilEntrenador[] = [
  PERFIL_DEFAULT,
  {
    id: 'entrenador-2',
    nombre: 'Diana Reséndiz',
    especialidad: 'Boxeo femenino y defensa personal',
    anosTrayectoria: 9,
    foto: '',
    bio: 'Ex-campeona nacional amateur. Especialista en técnica defensiva y formación de boxeadoras desde nivel principiante hasta competitivo.',
    logros: [
      'Campeona Nacional Amateur 2018',
      '2 alumnas medallistas en Guantes de Oro',
      'Certificación en defensa personal femenina',
      'Formadora de 25+ boxeadoras amateur',
    ],
    redes: [
      { nombre: 'Instagram', usuario: '@diana.boxfem', url: 'https://instagram.com/diana.boxfem' },
      { nombre: 'WhatsApp', usuario: 'Contacto directo', url: 'https://wa.me/525500000001' },
    ],
    galeria: [],
  },
  {
    id: 'entrenador-3',
    nombre: 'Marco Villalobos',
    especialidad: 'Boxeo profesional y preparación física',
    anosTrayectoria: 15,
    foto: '',
    bio: 'Ex-boxeador profesional con 20 peleas en su carrera. Ahora dedicado a la preparación física y técnica de boxeadores rumbo al profesionalismo.',
    logros: [
      'Ex-boxeador profesional (20 peleas, 14 victorias)',
      'Entrenador principal en 3 campamentos de título',
      'Certificación CONADE en preparación física',
    ],
    redes: [
      { nombre: 'Instagram', usuario: '@marco.villalobos.box', url: 'https://instagram.com/marco.villalobos.box' },
      { nombre: 'Facebook', usuario: 'Marco Villalobos Boxeo', url: 'https://facebook.com/marcovillalobosboxeo' },
    ],
    galeria: [],
  },
  {
    id: 'entrenador-4',
    nombre: 'Valentina Ortiz',
    especialidad: 'Boxeo amateur juvenil',
    anosTrayectoria: 6,
    foto: '',
    bio: 'Formadora de nuevas generaciones. Enfocada en boxeadores juveniles, disciplina, fundamentos técnicos y desarrollo deportivo integral.',
    logros: [
      '5 alumnos clasificados a torneos estatales juveniles',
      'Certificación en boxeo formativo juvenil',
    ],
    redes: [
      { nombre: 'TikTok', usuario: '@vale.boxjuvenil', url: 'https://tiktok.com/@vale.boxjuvenil' },
      { nombre: 'WhatsApp', usuario: 'Contacto directo', url: 'https://wa.me/525500000002' },
    ],
    galeria: [],
  },
  {
    id: 'entrenador-5',
    nombre: 'Hugo Fernández',
    especialidad: 'Sparring y estrategia de combate',
    anosTrayectoria: 11,
    foto: '',
    bio: 'Especialista en sparring y análisis táctico de contrincantes. Trabaja de la mano con boxeadores en fase de campamento previo a competencia.',
    logros: [
      'Preparador táctico en 8 peleas de campeonato regional',
      'Certificación Federación Mexicana de Boxeo',
    ],
    redes: [
      { nombre: 'Instagram', usuario: '@hugo.sparring', url: 'https://instagram.com/hugo.sparring' },
    ],
    galeria: [],
  },
];

/** Obtiene el perfil del entrenador desde localStorage */
export function obtenerPerfil(): PerfilEntrenador {
  if (typeof window === 'undefined') return PERFIL_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PERFIL_DEFAULT;
    return JSON.parse(raw) as PerfilEntrenador;
  } catch {
    return PERFIL_DEFAULT;
  }
}

/** Guarda el perfil del entrenador en localStorage */
export function guardarPerfil(perfil: PerfilEntrenador): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
  // También actualiza el listado público de entrenadores
  actualizarListaPublica(perfil);
}

/** Convierte un archivo a base64 data URL */
export function archivoABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(archivo);
  });
}

/** Obtiene la lista pública de entrenadores (para visitantes) */
export function obtenerEntrenadoresPublicos(): PerfilEntrenador[] {
  if (typeof window === 'undefined') return ENTRENADORES_PRUEBA;
  try {
    const raw = localStorage.getItem(ENTRENADORES_KEY);
    if (!raw) return ENTRENADORES_PRUEBA;
    return JSON.parse(raw) as PerfilEntrenador[];
  } catch {
    return ENTRENADORES_PRUEBA;
  }
}

/** Obtiene un entrenador por su ID */
export function obtenerEntrenadorPorId(id: string): PerfilEntrenador | null {
  const lista = obtenerEntrenadoresPublicos();
  return lista.find((e) => e.id === id) ?? null;
}

/** Actualiza la lista pública cuando un entrenador guarda su perfil */
function actualizarListaPublica(perfil: PerfilEntrenador): void {
  const lista = obtenerEntrenadoresPublicos();
  const idx = lista.findIndex((e) => e.id === perfil.id);
  if (idx >= 0) {
    lista[idx] = perfil;
  } else {
    lista.push(perfil);
  }
  localStorage.setItem(ENTRENADORES_KEY, JSON.stringify(lista));
}

/** Elimina el perfil público de un entrenador (acción de admin) */
export function eliminarEntrenador(id: string): void {
  if (typeof window === 'undefined') return;
  const lista = obtenerEntrenadoresPublicos().filter((e) => e.id !== id);
  localStorage.setItem(ENTRENADORES_KEY, JSON.stringify(lista));
}
