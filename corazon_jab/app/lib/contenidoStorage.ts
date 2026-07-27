// app/lib/contenidoStorage.ts
// Permite que un admin reemplace las imágenes de contenido editorial estático
// (Leyendas del boxeo, Historia del boxeo) sin necesidad de un backend.
// Las imágenes se guardan como base64 en localStorage, indexadas por una
// clave estable (slug) que identifica a cada leyenda/era.

const IMAGENES_KEY = "corazon_azteca_imagenes_contenido";

type MapaImagenes = Record<string, string>;

function obtenerMapa(): MapaImagenes {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(IMAGENES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MapaImagenes;
  } catch {
    return {};
  }
}

function guardarMapa(mapa: MapaImagenes): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(IMAGENES_KEY, JSON.stringify(mapa));
}

/** Obtiene la imagen personalizada (base64) para una clave, o null si no hay ninguna guardada */
export function obtenerImagenPersonalizada(clave: string): string | null {
  const mapa = obtenerMapa();
  return mapa[clave] ?? null;
}

/** Guarda/reemplaza la imagen personalizada para una clave */
export function guardarImagenPersonalizada(clave: string, base64: string): void {
  const mapa = obtenerMapa();
  mapa[clave] = base64;
  guardarMapa(mapa);
}

/** Elimina la imagen personalizada de una clave (vuelve a usar la imagen original) */
export function quitarImagenPersonalizada(clave: string): void {
  const mapa = obtenerMapa();
  delete mapa[clave];
  guardarMapa(mapa);
}

/** Convierte un archivo de imagen a base64 data URL */
export function imagenABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(archivo);
  });
}
