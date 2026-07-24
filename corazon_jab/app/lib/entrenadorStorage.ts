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
  if (typeof window === 'undefined') return [PERFIL_DEFAULT];
  try {
    const raw = localStorage.getItem(ENTRENADORES_KEY);
    if (!raw) return [PERFIL_DEFAULT];
    return JSON.parse(raw) as PerfilEntrenador[];
  } catch {
    return [PERFIL_DEFAULT];
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
