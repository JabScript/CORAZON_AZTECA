// app/lib/supabase/client.ts
// Cliente de Supabase para uso en Client Components ("use client").
// Usa la anon key pública; toda regla de acceso a datos se aplica vía RLS
// en Postgres (ver .kiro/specs/supabase-database-schema/design.md), no aquí.

import { createBrowserClient } from "@supabase/ssr";
import { leerConfiguracionSupabase } from "./config";

export function crearClienteSupabaseNavegador() {
  const { url, anonKey } = leerConfiguracionSupabase();

  return createBrowserClient(url, anonKey);
}
