// app/lib/peleasProximasStorage.ts
// Almacen_Peleas_Proximas: lee la tabla `peleas_proximas` de Supabase
// (perfil_deportivo_id, contrincante_cuenta_id, fecha, evento, lugar),
// resolviendo además los datos públicos del contrincante y su historial de
// peleas para la vista de "Buscar Contrincante". El resto de la restricción
// de visibilidad (RLS) la aplica Supabase, no este módulo.

import { crearClienteSupabaseNavegador } from "./supabase/client";

export interface ContrincanteInfo {
  cuentaId: string;
  nombre: string;
  fotoRef: string | null;
  perfilDeportivoId: string | null;
}

export type ResultadoPelea = "victoria" | "derrota" | "empate";

export interface RegistroPelea {
  id: string;
  fecha: string;
  lugar: string;
  rivalTexto: string | null;
  rivalCuentaId: string | null;
  resultado: ResultadoPelea;
  metodo: string | null;
  categoriaPeso: string;
  pesoKg: number;
  rounds: number | null;
}

export interface PeleaProximaConContrincante {
  id: string;
  fecha: string;
  evento: string;
  lugar: string;
  contrincante: ContrincanteInfo;
  historialContrincante: RegistroPelea[];
}

interface FilaRegistroPelea {
  id: string;
  fecha: string;
  lugar: string;
  rival_texto: string | null;
  rival_cuenta_id: string | null;
  resultado: ResultadoPelea;
  metodo: string | null;
  categoria_peso: string;
  peso_kg: number | string;
  rounds: number | null;
}

function mapearRegistroPelea(fila: FilaRegistroPelea): RegistroPelea {
  return {
    id: fila.id,
    fecha: fila.fecha,
    lugar: fila.lugar,
    rivalTexto: fila.rival_texto ?? null,
    rivalCuentaId: fila.rival_cuenta_id ?? null,
    resultado: fila.resultado,
    metodo: fila.metodo ?? null,
    categoriaPeso: fila.categoria_peso,
    pesoKg: Number(fila.peso_kg),
    rounds: fila.rounds ?? null,
  };
}

/**
 * Peleas próximas futuras del alumno indicado (por su `perfil_deportivo_id`),
 * con la información pública del contrincante y su historial de peleas ya
 * resueltos, lista para mostrar en `Usuario/Contrincante`.
 */
export async function obtenerPeleasProximasDeAlumno(
  perfilDeportivoId: string
): Promise<PeleaProximaConContrincante[]> {
  const supabase = crearClienteSupabaseNavegador();
  const hoyIso = new Date().toISOString().slice(0, 10);

  const { data: peleas, error } = await supabase
    .from("peleas_proximas")
    .select("id, fecha, evento, lugar, contrincante_cuenta_id")
    .eq("perfil_deportivo_id", perfilDeportivoId)
    .gte("fecha", hoyIso)
    .order("fecha", { ascending: true });

  if (error) throw error;
  if (!peleas || peleas.length === 0) return [];

  const resultados: PeleaProximaConContrincante[] = [];

  for (const pelea of peleas) {
    const { data: cuenta } = await supabase
      .from("accounts")
      .select("id, nombre, foto_ref")
      .eq("id", pelea.contrincante_cuenta_id)
      .maybeSingle();

    const { data: perfilContrincante } = await supabase
      .from("perfiles_deportivos")
      .select("id")
      .eq("cuenta_id", pelea.contrincante_cuenta_id)
      .maybeSingle();

    let historial: RegistroPelea[] = [];
    if (perfilContrincante) {
      const { data: registros } = await supabase
        .from("registros_pelea")
        .select("*")
        .eq("perfil_deportivo_id", perfilContrincante.id)
        .order("fecha", { ascending: false });
      historial = (registros ?? []).map(mapearRegistroPelea);
    }

    resultados.push({
      id: pelea.id,
      fecha: pelea.fecha,
      evento: pelea.evento,
      lugar: pelea.lugar,
      contrincante: {
        cuentaId: pelea.contrincante_cuenta_id,
        nombre: cuenta?.nombre ?? "Contrincante",
        fotoRef: cuenta?.foto_ref ?? null,
        perfilDeportivoId: perfilContrincante?.id ?? null,
      },
      historialContrincante: historial,
    });
  }

  return resultados;
}
