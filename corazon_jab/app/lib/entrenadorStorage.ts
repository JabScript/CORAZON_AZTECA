// app/lib/entrenadorStorage.ts
// Almacen_Entrenador: lee/escribe `perfiles_publicos_entrenador` y sus
// tablas hijas (`logros_entrenador`, `redes_sociales_entrenador`,
// `galeria_entrenador`) en Supabase, identificando al entrenador por
// `cuentaId` (UUID), y sube imágenes reales a Supabase Storage en vez de
// guardarlas como base64.

import { crearClienteSupabaseNavegador } from "./supabase/client";

export interface RedSocial {
  nombre: string;
  usuario: string;
  url: string;
}

export interface FotoGaleria {
  id: string;
  /** Ruta del objeto en el bucket `entrenador-galeria` */
  imagenRef: string;
  /** URL pública resuelta, lista para renderizar */
  src: string;
  alt: string;
}

export interface PerfilEntrenador {
  /** id de `perfiles_publicos_entrenador` */
  id: string;
  cuentaId: string;
  nombre: string;
  especialidad: string;
  anosTrayectoria: number;
  /** Ruta del objeto en el bucket `avatars`, o null si no tiene foto */
  fotoRef: string | null;
  /** URL pública resuelta, o cadena vacía si no tiene foto */
  foto: string;
  bio: string;
  logros: string[];
  redes: RedSocial[];
  galeria: FotoGaleria[];
}

function resolverUrlPublica(bucket: string, ref: string | null): string {
  if (!ref) return "";
  const supabase = crearClienteSupabaseNavegador();
  return supabase.storage.from(bucket).getPublicUrl(ref).data.publicUrl;
}

interface FilaPerfilPublicoEntrenador {
  id: string;
  cuenta_id: string;
  especialidad: string | null;
  anos_trayectoria: number | null;
  foto_ref: string | null;
  biografia: string | null;
  accounts: { nombre: string; foto_ref: string | null } | { nombre: string; foto_ref: string | null }[] | null;
}

async function mapearFilaEntrenador(fila: FilaPerfilPublicoEntrenador): Promise<PerfilEntrenador> {
  const cuenta = Array.isArray(fila.accounts) ? fila.accounts[0] : fila.accounts;
  const supabase = crearClienteSupabaseNavegador();

  const [{ data: logros }, { data: redes }, { data: galeria }] = await Promise.all([
    supabase.from("logros_entrenador").select("descripcion").eq("perfil_entrenador_id", fila.id),
    supabase
      .from("redes_sociales_entrenador")
      .select("red, usuario, url")
      .eq("perfil_entrenador_id", fila.id),
    supabase
      .from("galeria_entrenador")
      .select("id, imagen_ref, texto_alternativo")
      .eq("perfil_entrenador_id", fila.id),
  ]);

  return {
    id: fila.id,
    cuentaId: fila.cuenta_id,
    nombre: cuenta?.nombre ?? "",
    especialidad: fila.especialidad ?? "",
    anosTrayectoria: fila.anos_trayectoria ?? 0,
    fotoRef: fila.foto_ref ?? cuenta?.foto_ref ?? null,
    foto: resolverUrlPublica("avatars", fila.foto_ref ?? cuenta?.foto_ref ?? null),
    bio: fila.biografia ?? "",
    logros: (logros ?? []).map((l) => l.descripcion),
    redes: (redes ?? []).map((r) => ({ nombre: r.red, usuario: r.usuario, url: r.url })),
    galeria: (galeria ?? []).map((g) => ({
      id: g.id,
      imagenRef: g.imagen_ref,
      src: resolverUrlPublica("entrenador-galeria", g.imagen_ref),
      alt: g.texto_alternativo ?? "",
    })),
  };
}

const SELECT_PERFIL_ENTRENADOR =
  "id, cuenta_id, especialidad, anos_trayectoria, foto_ref, biografia, accounts(nombre, foto_ref)";

/** Obtiene el perfil de un entrenador a partir del cuentaId de su sesión */
export async function obtenerPerfilPorCuentaId(cuentaId: string): Promise<PerfilEntrenador | null> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("perfiles_publicos_entrenador")
    .select(SELECT_PERFIL_ENTRENADOR)
    .eq("cuenta_id", cuentaId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapearFilaEntrenador(data) : null;
}

/** Obtiene la lista pública de entrenadores (para visitantes) */
export async function obtenerEntrenadoresPublicos(): Promise<PerfilEntrenador[]> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase.from("perfiles_publicos_entrenador").select(SELECT_PERFIL_ENTRENADOR);
  if (error) throw error;
  return Promise.all((data ?? []).map(mapearFilaEntrenador));
}

/** Obtiene un entrenador por el id de su `perfiles_publicos_entrenador` */
export async function obtenerEntrenadorPorId(id: string): Promise<PerfilEntrenador | null> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("perfiles_publicos_entrenador")
    .select(SELECT_PERFIL_ENTRENADOR)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapearFilaEntrenador(data) : null;
}

/**
 * Guarda los campos básicos del perfil (especialidad, años de trayectoria,
 * biografía) y sincroniza atómicamente logros, redes sociales y galería vía
 * la RPC `sincronizar_perfil_entrenador`. Crea el registro si el entrenador
 * todavía no tenía uno.
 */
export async function guardarPerfil(perfil: {
  cuentaId: string;
  especialidad: string;
  anosTrayectoria: number;
  bio: string;
  logros: string[];
  redes: RedSocial[];
  galeria: FotoGaleria[];
}): Promise<void> {
  const supabase = crearClienteSupabaseNavegador();

  const { data: existente, error: errorBusqueda } = await supabase
    .from("perfiles_publicos_entrenador")
    .select("id")
    .eq("cuenta_id", perfil.cuentaId)
    .maybeSingle();
  if (errorBusqueda) throw errorBusqueda;

  let perfilId = existente?.id as string | undefined;

  const camposBasicos = {
    especialidad: perfil.especialidad,
    anos_trayectoria: perfil.anosTrayectoria,
    biografia: perfil.bio,
  };

  if (perfilId) {
    const { error } = await supabase
      .from("perfiles_publicos_entrenador")
      .update(camposBasicos)
      .eq("id", perfilId);
    if (error) throw error;
  } else {
    const { data: nueva, error } = await supabase
      .from("perfiles_publicos_entrenador")
      .insert({ cuenta_id: perfil.cuentaId, ...camposBasicos })
      .select("id")
      .single();
    if (error) throw error;
    perfilId = nueva.id;
  }

  const { error: errorSync } = await supabase.rpc("sincronizar_perfil_entrenador", {
    p_perfil_id: perfilId,
    p_logros: perfil.logros,
    p_redes: perfil.redes.map((r) => ({ nombre: r.nombre, usuario: r.usuario, url: r.url })),
    p_galeria: perfil.galeria.map((g) => ({ imagenRef: g.imagenRef, alt: g.alt })),
  });
  if (errorSync) throw errorSync;
}

/** Sube la foto de perfil del entrenador al bucket `avatars` y actualiza `foto_ref` */
export async function subirFotoPerfilEntrenador(cuentaId: string, archivo: File): Promise<string> {
  const supabase = crearClienteSupabaseNavegador();
  const extension = archivo.name.split(".").pop() ?? "jpg";
  const ruta = `${cuentaId}/${crypto.randomUUID()}.${extension}`;

  const { error: errorUpload } = await supabase.storage.from("avatars").upload(ruta, archivo, { upsert: true });
  if (errorUpload) throw errorUpload;

  const { error: errorUpdate } = await supabase.from("accounts").update({ foto_ref: ruta }).eq("id", cuentaId);
  if (errorUpdate) throw errorUpdate;

  return ruta;
}

/** Sube una foto de galería al bucket `entrenador-galeria` bajo el prefijo del perfil */
export async function subirFotoGaleria(perfilEntrenadorId: string, archivo: File): Promise<FotoGaleria> {
  const supabase = crearClienteSupabaseNavegador();
  const extension = archivo.name.split(".").pop() ?? "jpg";
  const ruta = `${perfilEntrenadorId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("entrenador-galeria").upload(ruta, archivo, { upsert: true });
  if (error) throw error;

  return {
    id: ruta,
    imagenRef: ruta,
    src: resolverUrlPublica("entrenador-galeria", ruta),
    alt: archivo.name,
  };
}
