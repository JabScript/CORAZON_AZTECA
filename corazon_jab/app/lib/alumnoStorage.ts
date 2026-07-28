// app/lib/alumnoStorage.ts
// Almacen_Alumno: lee/escribe `perfiles_deportivos` en Supabase usando
// `cuentaId` (UUID de la Sesion_Activa) en lugar de un `usuarioId` numérico.

import { crearClienteSupabaseNavegador } from "./supabase/client";

export type OrigenEntrenador = "directorio" | "manual" | "independiente";

export interface DatosAlumno {
  id: string;
  cuentaId: string;
  apellido: string;
  apodo?: string;
  fechaNacimiento: string;
  peso: number;
  nivel: string;
  objetivo: string;
  ciudad: string;
  origenEntrenador: OrigenEntrenador;
  entrenadorId?: string;
  nombreEntrenadorManual?: string;
}

interface FilaPerfilDeportivo {
  id: string;
  cuenta_id: string;
  apellido: string | null;
  apodo: string | null;
  fecha_nacimiento: string | null;
  peso_kg: number | string | null;
  nivel: string | null;
  objetivo: string | null;
  ciudad: string | null;
  origen_entrenador: OrigenEntrenador | null;
  entrenador_directorio_id: string | null;
  entrenador_manual_nombre: string | null;
}

function mapearFila(fila: FilaPerfilDeportivo): DatosAlumno {
  return {
    id: fila.id,
    cuentaId: fila.cuenta_id,
    apellido: fila.apellido ?? "",
    apodo: fila.apodo ?? undefined,
    fechaNacimiento: fila.fecha_nacimiento ?? "",
    peso: fila.peso_kg != null ? Number(fila.peso_kg) : 0,
    nivel: fila.nivel ?? "Principiante",
    objetivo: fila.objetivo ?? "",
    ciudad: fila.ciudad ?? "",
    origenEntrenador: fila.origen_entrenador ?? "independiente",
    entrenadorId: fila.entrenador_directorio_id ?? undefined,
    nombreEntrenadorManual: fila.entrenador_manual_nombre ?? undefined,
  };
}

/**
 * Anula explícitamente los campos de entrenador que no correspondan al
 * `origenEntrenador` indicado, para respetar el `CHECK` compuesto de
 * `perfiles_deportivos` (Property 6 del diseño).
 */
function limpiarCamposEntrenador(datos: {
  origenEntrenador: OrigenEntrenador;
  entrenadorId?: string;
  nombreEntrenadorManual?: string;
}) {
  return {
    origen_entrenador: datos.origenEntrenador,
    entrenador_directorio_id: datos.origenEntrenador === "directorio" ? datos.entrenadorId ?? null : null,
    entrenador_manual_nombre: datos.origenEntrenador === "manual" ? datos.nombreEntrenadorManual ?? null : null,
  };
}

/** Obtiene el registro deportivo de un alumno a partir del cuentaId de su sesión */
export async function obtenerAlumnoPorCuentaId(cuentaId: string): Promise<DatosAlumno | null> {
  const supabase = crearClienteSupabaseNavegador();
  const { data, error } = await supabase
    .from("perfiles_deportivos")
    .select("*")
    .eq("cuenta_id", cuentaId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapearFila(data) : null;
}

/**
 * Actualiza la relación de entrenador de un alumno (cambiar de entrenador,
 * elegir uno nuevo del directorio, agregar uno manual, o quedar independiente).
 * Crea el registro si el alumno todavía no tenía uno.
 */
export async function actualizarEntrenadorAlumno(
  cuentaId: string,
  data: {
    origenEntrenador: OrigenEntrenador;
    entrenadorId?: string;
    nombreEntrenadorManual?: string;
  }
): Promise<void> {
  const supabase = crearClienteSupabaseNavegador();
  const campos = limpiarCamposEntrenador(data);

  const { data: existente, error: errorBusqueda } = await supabase
    .from("perfiles_deportivos")
    .select("id")
    .eq("cuenta_id", cuentaId)
    .maybeSingle();
  if (errorBusqueda) throw errorBusqueda;

  if (existente) {
    const { error } = await supabase.from("perfiles_deportivos").update(campos).eq("cuenta_id", cuentaId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("perfiles_deportivos").insert({
      cuenta_id: cuentaId,
      apellido: "",
      fecha_nacimiento: null,
      peso_kg: 0.1,
      nivel: "Principiante",
      objetivo: "Acondicionamiento físico",
      ciudad: null,
      ...campos,
    });
    if (error) throw error;
  }
}

/** Elimina el registro deportivo de un alumno, por cuentaId */
export async function eliminarAlumnoPorCuentaId(cuentaId: string): Promise<void> {
  const supabase = crearClienteSupabaseNavegador();
  const { error } = await supabase.from("perfiles_deportivos").delete().eq("cuenta_id", cuentaId);
  if (error) throw error;
}

/**
 * Actualiza los datos generales de perfil de un alumno (apodo, peso, nivel,
 * objetivo, ciudad, fecha de nacimiento). Si el alumno no tiene un registro
 * previo, crea uno nuevo (upsert por `cuenta_id`).
 */
export async function actualizarPerfilAlumno(
  cuentaId: string,
  data: Partial<Pick<DatosAlumno, "apodo" | "fechaNacimiento" | "peso" | "nivel" | "objetivo" | "ciudad" | "apellido">>
): Promise<DatosAlumno> {
  const supabase = crearClienteSupabaseNavegador();

  const campos: Record<string, unknown> = {};
  if (data.apellido !== undefined) campos.apellido = data.apellido;
  if (data.apodo !== undefined) campos.apodo = data.apodo || null;
  if (data.fechaNacimiento !== undefined) campos.fecha_nacimiento = data.fechaNacimiento || null;
  if (data.peso !== undefined) campos.peso_kg = data.peso;
  if (data.nivel !== undefined) campos.nivel = data.nivel;
  if (data.objetivo !== undefined) campos.objetivo = data.objetivo || null;
  if (data.ciudad !== undefined) campos.ciudad = data.ciudad || null;

  const { data: existente, error: errorBusqueda } = await supabase
    .from("perfiles_deportivos")
    .select("id")
    .eq("cuenta_id", cuentaId)
    .maybeSingle();
  if (errorBusqueda) throw errorBusqueda;

  if (existente) {
    const { data: fila, error } = await supabase
      .from("perfiles_deportivos")
      .update(campos)
      .eq("cuenta_id", cuentaId)
      .select()
      .single();
    if (error) throw error;
    return mapearFila(fila);
  }

  // No hay registro previo: crea uno nuevo con valores por defecto para el
  // resto de campos requeridos (incluyendo origen_entrenador='independiente').
  const { data: fila, error } = await supabase
    .from("perfiles_deportivos")
    .insert({
      cuenta_id: cuentaId,
      apellido: data.apellido ?? "",
      fecha_nacimiento: data.fechaNacimiento || null,
      peso_kg: data.peso ?? 0.1,
      nivel: data.nivel ?? "Principiante",
      objetivo: data.objetivo ?? "Acondicionamiento físico",
      ciudad: data.ciudad || null,
      origen_entrenador: "independiente",
      ...campos,
    })
    .select()
    .single();

  if (error) throw error;
  return mapearFila(fila);
}
