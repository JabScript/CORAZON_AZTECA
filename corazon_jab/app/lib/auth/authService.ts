import { crearClienteSupabaseNavegador } from "../supabase/client";
import type { Rol } from "./SessionProvider";

export interface DatosRegistro {
  email: string;
  password: string;
  nombre: string;
  rol: Rol;
}

export async function registrarCuenta(datos: DatosRegistro) {
  const supabase = crearClienteSupabaseNavegador();
  return supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: { data: { nombre: datos.nombre, rol: datos.rol } },
  });
}

export async function iniciarSesion(email: string, password: string) {
  const supabase = crearClienteSupabaseNavegador();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function solicitarRecuperacion(email: string) {
  const supabase = crearClienteSupabaseNavegador();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function actualizarContrasena(nuevaPassword: string) {
  const supabase = crearClienteSupabaseNavegador();
  return supabase.auth.updateUser({ password: nuevaPassword });
}
