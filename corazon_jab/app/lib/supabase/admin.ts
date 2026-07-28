// app/lib/supabase/admin.ts
// Cliente de Supabase con la `service_role` key: bypassa RLS por completo.
// SOLO importar desde Route Handlers o scripts server-side (nunca desde
// Client Components ni desde código compartido con el navegador).

import { createClient } from "@supabase/supabase-js";

export function crearClienteSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas para crear el cliente admin de Supabase."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
