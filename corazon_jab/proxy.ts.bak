import { type NextRequest } from "next/server";
import { actualizarSesionSupabase } from "./app/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await actualizarSesionSupabase(request);
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto archivos estáticos y de imagen,
     * para no gastar una llamada de refresco de sesión en cada asset.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
