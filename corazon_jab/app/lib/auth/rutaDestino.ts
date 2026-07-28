import type { Rol } from "./SessionProvider";

export type EstadoCuenta = "pendiente" | "aprobado";

/**
 * Función pura y determinista: dado un rol y estado de aprobación,
 * calcula a qué ruta debe dirigirse la sesión. Reutilizada por login,
 * registro, redirección desde /login con sesión activa, y RequireRole.
 */
export function rutaDestino(rol: Rol, estadoCuenta: EstadoCuenta): string {
  if (rol === "admin") {
    return estadoCuenta === "aprobado" ? "/Admin" : "/Admin/esperando-aprobacion";
  }
  if (rol === "entrenador") return "/Entrenador";
  return "/Usuario";
}
