// app/lib/supabase/server.ts
// Cliente de Supabase para uso en Server Components, Server Actions y Route
// Handlers. Lee/escribe la sesión desde las cookies de la petición actual.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { leerConfiguracionSupabase } from "./config";

export async function crearClienteSupabaseServidor() {
  const cookieStore = await cookies();
  const { url, anonKey } = leerConfiguracionSupabase();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // set() puede fallar si se llama desde un Server Component sin
          // una respuesta mutable (ej. durante el render). El middleware
          // (middleware.ts) se encarga de refrescar la sesión en ese caso.
        }
      },
    },
  });
}
