// app/lib/blogStorage.ts
// Sistema simple de artículos de blog con flujo de aprobación, usando localStorage.

import { obtenerSesion } from "./sesionStorage";

export type EstadoArticulo = "pendiente" | "aprobado" | "rechazado";

export interface ArticuloBlog {
  id: number;
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: string;
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
    return JSON.parse(raw) as ArticuloBlog[];
  } catch {
    return ARTICULOS_DEFAULT;
  }
}

/** Guarda la lista completa de artículos */
function guardarArticulos(articulos: ArticuloBlog[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BLOG_KEY, JSON.stringify(articulos));
}

/** Solo los artículos aprobados, para mostrar en el blog público */
export function obtenerArticulosAprobados(): ArticuloBlog[] {
  return obtenerArticulos().filter((a) => a.estado === "aprobado");
}

/** Solo los artículos pendientes de revisión, para el panel de admin */
export function obtenerArticulosPendientes(): ArticuloBlog[] {
  return obtenerArticulos().filter((a) => a.estado === "pendiente");
}

/** Artículos enviados por el usuario/entrenador actualmente en sesión */
export function obtenerMisArticulos(): ArticuloBlog[] {
  const sesion = obtenerSesion();
  return obtenerArticulos().filter((a) => a.autorId === sesion.usuarioId);
}

/** Crea y envía un nuevo artículo a revisión */
export function enviarArticulo(data: {
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: string;
}): ArticuloBlog {
  const sesion = obtenerSesion();
  const articulos = obtenerArticulos();

  const nuevo: ArticuloBlog = {
    id: Date.now(),
    titulo: data.titulo,
    extracto: data.extracto,
    contenido: data.contenido,
    categoria: data.categoria,
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
