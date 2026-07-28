// app/lib/supabase/proxy.ts
// Refresca el token de sesión de Supabase en cada petición, para que las
// cookies de auth no expiren silenciosamente entre Server Components.
// Invocado desde proxy.ts (antes middleware.ts) en la raíz del proyecto.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function actualizarSesionSupabase(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: no quitar esta llamada. Refresca el token si expiró y
  // sincroniza la cookie de sesión en la respuesta.
  await supabase.auth.getUser();

  return response;
}
