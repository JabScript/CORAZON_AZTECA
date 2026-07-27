// app/lib/blogStorage.ts
// Sistema simple de artículos de blog con flujo de aprobación, usando localStorage.

import { obtenerSesion } from "./sesionStorage";

export type EstadoArticulo = "pendiente" | "aprobado" | "rechazado";

/** Tipo de publicación: un artículo normal de blog, o un logro deportivo del alumno */
export type TipoPublicacion = "articulo" | "logro";

export interface ArticuloBlog {
  id: number;
  tipo: TipoPublicacion;
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: string;
  /** Emoji/ícono del logro (solo aplica cuando tipo === "logro") */
  icono?: string;
  autorId: number;
  autorNombre: string;
  autorRol: "entrenador" | "usuario";
  estado: EstadoArticulo;
  fechaEnvio: string; // ISO date
  motivoRechazo?: string;
}

const BLOG_KEY = "corazon_azteca_blog_articulos";

const ARTICULOS_DEFAULT: ArticuloBlog[] = [];

/** Obtiene todos los artículos (todos los estados) */
export function obtenerArticulos(): ArticuloBlog[] {
  if (typeof window === "undefined") return ARTICULOS_DEFAULT;
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    if (!raw) return ARTICULOS_DEFAULT;
    const parsed = JSON.parse(raw) as ArticuloBlog[];
    // Normaliza registros antiguos guardados antes de agregar el campo "tipo"
    return parsed.map((a) => ({ ...a, tipo: a.tipo ?? "articulo" }));
  } catch {
    return ARTICULOS_DEFAULT;
  }
}

/** Guarda la lista completa de artículos */
function guardarArticulos(articulos: ArticuloBlog[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BLOG_KEY, JSON.stringify(articulos));
}

/** Solo los artículos aprobados (tipo "articulo"), para mostrar en el blog público */
export function obtenerArticulosAprobados(): ArticuloBlog[] {
  return obtenerArticulos().filter((a) => a.estado === "aprobado" && a.tipo === "articulo");
}

/** Solo los logros aprobados (tipo "logro"), para mostrar en el blog público */
export function obtenerLogrosAprobados(): ArticuloBlog[] {
  return obtenerArticulos().filter((a) => a.estado === "aprobado" && a.tipo === "logro");
}

/** Solo las publicaciones pendientes de revisión, para el panel de admin */
export function obtenerArticulosPendientes(): ArticuloBlog[] {
  return obtenerArticulos().filter((a) => a.estado === "pendiente");
}

/** Publicaciones enviadas por el usuario/entrenador actualmente en sesión */
export function obtenerMisArticulos(): ArticuloBlog[] {
  const sesion = obtenerSesion();
  return obtenerArticulos().filter((a) => a.autorId === sesion.usuarioId);
}

/** Solo los logros aprobados enviados por el usuario/entrenador actual (para su Historial Deportivo) */
export function obtenerMisLogrosAprobados(): ArticuloBlog[] {
  const sesion = obtenerSesion();
  return obtenerArticulos().filter(
    (a) => a.autorId === sesion.usuarioId && a.tipo === "logro" && a.estado === "aprobado"
  );
}

/** Crea y envía una nueva publicación (artículo o logro) a revisión */
export function enviarArticulo(data: {
  tipo?: TipoPublicacion;
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: string;
  icono?: string;
}): ArticuloBlog {
  const sesion = obtenerSesion();
  const articulos = obtenerArticulos();

  const nuevo: ArticuloBlog = {
    id: Date.now(),
    tipo: data.tipo ?? "articulo",
    titulo: data.titulo,
    extracto: data.extracto,
    contenido: data.contenido,
    categoria: data.categoria,
    icono: data.icono,
    autorId: sesion.usuarioId,
    autorNombre: sesion.nombre,
    autorRol: sesion.rol === "entrenador" ? "entrenador" : "usuario",
    estado: "pendiente",
    fechaEnvio: new Date().toISOString(),
  };

  guardarArticulos([nuevo, ...articulos]);
  return nuevo;
}

/** Aprueba un artículo pendiente (acción de admin) */
export function aprobarArticulo(id: number): void {
  const articulos = obtenerArticulos().map((a) =>
    a.id === id ? { ...a, estado: "aprobado" as EstadoArticulo, motivoRechazo: undefined } : a
  );
  guardarArticulos(articulos);
}

/** Rechaza un artículo pendiente (acción de admin) */
export function rechazarArticulo(id: number, motivo?: string): void {
  const articulos = obtenerArticulos().map((a) =>
    a.id === id ? { ...a, estado: "rechazado" as EstadoArticulo, motivoRechazo: motivo } : a
  );
  guardarArticulos(articulos);
}

/**
 * Elimina una publicación (artículo o logro), solo si quien llama es su
 * autor o un admin. Devuelve true si se eliminó, false si no tenía permiso.
 */
export function eliminarArticulo(id: number): boolean {
  const sesion = obtenerSesion();
  const articulos = obtenerArticulos();
  const articulo = articulos.find((a) => a.id === id);

  if (!articulo) return false;

  const esAutor = articulo.autorId === sesion.usuarioId;
  const esAdmin = sesion.rol === "admin";

  if (!esAutor && !esAdmin) return false;

  guardarArticulos(articulos.filter((a) => a.id !== id));
  return true;
}
