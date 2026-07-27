/**
 * Helper de autenticación reutilizable para las pruebas de propiedades.
 *
 * Todas las pruebas de propiedades deben autenticar contra Supabase usando
 * `signInWithPassword` con credenciales de usuarios de prueba sembrados
 * (ver tarea 25 del plan de implementación), nunca con la `service_role key`.
 * Esto garantiza que las políticas RLS se evalúan exactamente igual que en
 * producción, en vez de omitirse como ocurre con la service_role key.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Roles del sistema, alineados con el CHECK de `accounts.rol` en el esquema. */
export type RolPrueba = "admin" | "entrenador" | "usuario";

interface CredencialesUsuarioPrueba {
  email: string;
  password: string;
}

function leerVariableEntorno(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno "${nombre}". Copia supabase/tests/property/.env.example a .env y complétala.`
    );
  }
  return valor;
}

/**
 * Lee la URL y la anon key del proyecto Supabase desde variables de entorno.
 * Nunca lee ni expone la service_role key: las pruebas de propiedades no
 * deben tener acceso a ella salvo el caso documentado de creación de
 * usuarios de prueba (Property 1), que se maneja aparte en el script de seed.
 */
function leerConfiguracionSupabase() {
  return {
    url: leerVariableEntorno("SUPABASE_URL"),
    anonKey: leerVariableEntorno("SUPABASE_ANON_KEY"),
  };
}

/**
 * Devuelve las credenciales del usuario de prueba sembrado para un rol dado,
 * leídas desde variables de entorno (nunca hardcodeadas en el código).
 */
export function credencialesParaRol(rol: RolPrueba): CredencialesUsuarioPrueba {
  const prefijo = `TEST_USER_${rol.toUpperCase()}`;
  return {
    email: leerVariableEntorno(`${prefijo}_EMAIL`),
    password: leerVariableEntorno(`${prefijo}_PASSWORD`),
  };
}

/**
 * Crea un cliente de Supabase sin sesión (equivalente a un visitante
 * anónimo), útil para ejercitar las propiedades de visibilidad pública
 * (Property 14) y de denegación de acceso anónimo (Property 35).
 */
export function crearClienteAnonimo(): SupabaseClient {
  const { url, anonKey } = leerConfiguracionSupabase();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Crea un cliente de Supabase autenticado como el usuario de prueba
 * sembrado para el rol indicado, usando `signInWithPassword` contra la
 * anon key (nunca la service_role key) para que las políticas RLS se
 * evalúen igual que en producción.
 */
export async function iniciarSesionComoRol(rol: RolPrueba): Promise<SupabaseClient> {
  const cliente = crearClienteAnonimo();
  const { email, password } = credencialesParaRol(rol);

  const { error } = await cliente.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      `No se pudo iniciar sesión como usuario de prueba de rol "${rol}" (${email}): ${error.message}`
    );
  }

  return cliente;
}

/** Cierra la sesión de un cliente autenticado creado con `iniciarSesionComoRol`. */
export async function cerrarSesion(cliente: SupabaseClient): Promise<void> {
  await cliente.auth.signOut();
}
