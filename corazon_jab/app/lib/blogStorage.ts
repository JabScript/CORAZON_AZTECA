// app/lib/blogStorage.ts
// Almacen_Blog: lee/escribe la tabla `publicaciones` de Supabase,
// identificando al autor por `autor_id` (UUID). Recibe `cuentaId`/`rol` como
// parámetros en vez de leer la sesión internamente (el llamador ya tiene
// acceso a `useSesion()`).

import { crearClienteSupabaseNavegador } from "./supabase/client";

export type EstadoArticulo = "pendiente" | "aprobado" | "rechazado";

/** Tipo de publicación: un artículo normal de blog, o un logro deportivo del alumno */
export type TipoPublicacion = "articulo" | "logro";

export interface ArticuloBlog {
  id: string;
  tipo: TipoPublicacion;
  titulo: string;
  extracto: string;
  contenido: string;
  categoria: string;
  /** Emoji/ícono del logro (solo aplica cuando tipo === "logro") */
  icono?: string;
  /** Ruta del objeto en el bucket `publicaciones`, o undefined si no tiene imagen */
  imagenRef?: string;
  /** URL pública resuelta, lista para renderizar */
  imagen?: string;
  autorId: string;
  autorNombre: string;
  autorRol: "entrenador" | "usuario";
  estado: EstadoArticulo;
  fechaEnvio: string; // ISO date
  motivoRechazo?: string;
}

function resolverUrlImagen(ref: string | null): string | undefined {
  if (!ref) return undefined;
  const supabase = crearClienteSupabaseNavegador();
  return supabase.storage.from("publicaciones").getPublicUrl(ref).data.publicUrl;
}

interface FilaPublicacion {
  id: string;
  tipo: TipoPublicacion;
  titulo: string;
  extracto: string | null;
  contenido: string;
  categoria: string | null;
  icono: string | null;
  imagen_ref: string | null;
  autor_id: string;
  estado_publicacion: EstadoArticulo;
  motivo_rechazo: string | null;
  fecha_envio: string;
  accounts: { nombre: string; rol: string } | { nombre: string; rol: string }[] | null;
}

function mapearFila(fila: FilaPublicacion): ArticuloBlog {
  const cuenta = Array.isArray(fila.accounts) ? fila.accounts[0] : fila.accounts;
  return {
    id: fila.id,
    tipo: fila.tipo,
    titulo: fila.titulo,
    extracto: fila.extracto ?? "",
    contenido: fila.contenido,
    categoria: fila.categoria ?? "",
    icono: fila.icono ?? undefined,
    imagenRef: fila.imagen_ref ?? undefined,
    imagen: resolverUrlImagen(fila.imagen_ref ?? null),
    autorId: fila.autor_id,
    autorNombre: cuenta?.nombre ?? "",
    autorRol: cuenta?.rol === "entrenador" ? "entrenador" : "usuario",
    estado: fila.estado_publicacion,
    fechaEnvio: fila.fecha_envio,
    motivoRechazo: fila.motivo_rechazo ?? undefined,
  };
}

const SELECT_PUBLICACION =
  "id, tipo, titulo, extracto, contenido, categoria, icono, imagen_ref, autor_id, estado_publicacion, motivo_rechazo, fecha_envio, accounts(nombre, rol)";

/** Sube una imagen al bucket `publicaciones` bajo el prefijo del autor y retorna la ruta del objeto */
export async function subirImagenPublicacion(autorId: string, archivo: File): Promise<string> {
  const supabase = crearClienteSupabaseNavegador();
  const extension = archivo.name.split(".").pop() ?? "jpg";
  const ruta = `${autorId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("publicaciones").upload(ruta, archivo, { upsert: true });
  if (error) throw error;
  return ruta;
}

/** Artículos aprobados (tipo "articulo"), para mostrar en el blog público */
export async function obtenerArticulosAprobados(): Promise<ArticuloBlog[]> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("publicaciones")
    .select(SELECT_PUBLICACION)
    .eq("estado_publicacion", "aprobado")
    .eq("tipo", "articulo")
    .order("fecha_envio", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearFila);
}

/** Logros aprobados (tipo "logro"), para mostrar en el blog público */
export async function obtenerLogrosAprobados(): Promise<ArticuloBlog[]> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("publicaciones")
    .select(SELECT_PUBLICACION)
    .eq("estado_publicacion", "aprobado")
    .eq("tipo", "logro")
    .order("fecha_envio", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearFila);
}

/** Publicaciones pendientes de revisión, para el panel de admin */
export async function obtenerArticulosPendientes(): Promise<ArticuloBlog[]> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("publicaciones")
    .select(SELECT_PUBLICACION)
    .eq("estado_publicacion", "pendiente")
    .order("fecha_envio", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearFila);
}

/** Todas las publicaciones (para el panel de admin, filtrable en cliente) */
export async function obtenerTodasLasPublicaciones(): Promise<ArticuloBlog[]> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("publicaciones")
    .select(SELECT_PUBLICACION)
    .order("fecha_envio", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearFila);
}

/** Publicaciones enviadas por la cuenta indicada */
export async function obtenerMisArticulos(cuentaId: string): Promise<ArticuloBlog[]> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("publicaciones")
    .select(SELECT_PUBLICACION)
    .eq("autor_id", cuentaId)
    .order("fecha_envio", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearFila);
}

/** Logros aprobados enviados por la cuenta indicada (para su Historial Deportivo) */
export async function obtenerMisLogrosAprobados(cuentaId: string): Promise<ArticuloBlog[]> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("publicaciones")
    .select(SELECT_PUBLICACION)
    .eq("autor_id", cuentaId)
    .eq("tipo", "logro")
    .eq("estado_publicacion", "aprobado")
    .order("fecha_envio", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapearFila);
}

/** Crea y envía una nueva publicación (artículo o logro) a revisión */
export async function enviarArticulo(
  cuentaId: string,
  data: {
    tipo?: TipoPublicacion;
    titulo: string;
    extracto: string;
    contenido: string;
    categoria: string;
    icono?: string;
    imagenRef?: string;
  }
): Promise<ArticuloBlog> {
  const supabase = crearClienteSupabaseNavegador();
  const { data: fila, error } = await supabase
    .from("publicaciones")
    .insert({
      tipo: data.tipo ?? "articulo",
      titulo: data.titulo,
      extracto: data.extracto,
      contenido: data.contenido,
      categoria: data.categoria,
      icono: data.icono ?? null,
      imagen_ref: data.imagenRef ?? null,
      autor_id: cuentaId,
    })
    .select(SELECT_PUBLICACION)
    .single();
  if (error) throw error;
  return mapearFila(fila);
}

/** Aprueba una publicación pendiente (acción de admin) */
export async function aprobarArticulo(id: string): Promise<void> {
  const supabase = crearClienteSupabaseNavegador();
  const { error } = await supabase
    .from("publicaciones")
    .update({ estado_publicacion: "aprobado", motivo_rechazo: null })
    .eq("id", id);
  if (error) throw error;
}

/** Rechaza una publicación pendiente (acción de admin) */
export async function rechazarArticulo(id: string, motivo?: string): Promise<void> {
  const supabase = crearClienteSupabaseNavegador();
  const { error } = await supabase
    .from("publicaciones")
    .update({ estado_publicacion: "rechazado", motivo_rechazo: motivo ?? null })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Elimina una publicación. La verificación de permiso (autor o admin) la
 * aplican las políticas RLS de `publicaciones`; si el cliente no tiene
 * permiso, Supabase no elimina ninguna fila.
 */
export async function eliminarArticulo(id: string): Promise<boolean> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase.from("publicaciones").delete().eq("id", id).select("id");
  if (error) throw error;
  return (data ?? []).length > 0;
}
