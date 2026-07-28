/**
 * Script de siembra (seed) para desarrollo y pruebas — tarea 25 del plan.
 *
 * Crea los usuarios de prueba (uno por rol, más un segundo admin) usando el
 * SDK admin de Supabase (`service_role`), SOLO para la creación de usuarios
 * de Auth vía `supabase.auth.admin.createUser()`. El trigger `handle_new_user()`
 * ya existente en la base de datos lee `raw_user_meta_data->>'rol'` y crea
 * automáticamente la fila correspondiente en `accounts` con el
 * `estado_cuenta` correcto (`pendiente` para admin, `aprobado` para el resto).
 *
 * IMPORTANTE: la `service_role key` bypassa Row Level Security y NUNCA debe
 * usarse en código de cliente ni en las pruebas de propiedades (que deben
 * autenticar con `signInWithPassword` + anon key, ver `helpers/auth.ts`).
 * Este script es la única excepción documentada, y solo se ejecuta de forma
 * manual/administrativa (`npm run seed`), nunca como parte de la suite de
 * pruebas automatizada.
 *
 * Uso:
 *   cd supabase/tests/property
 *   cp .env.example .env   # completar con SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *                          # y las credenciales TEST_USER_*
 *   npm run seed
 *
 * El script es tolerante a re-ejecuciones: si un usuario ya existe (email
 * duplicado), continúa con el resto en vez de abortar.
 */
import "dotenv/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Roles del sistema, alineados con el CHECK de `accounts.rol` en el esquema. */
type RolSemilla = "admin" | "entrenador" | "usuario";

interface UsuarioSemilla {
  /** Etiqueta descriptiva para el resumen final (no se persiste en BD). */
  etiqueta: string;
  rol: RolSemilla;
  email: string;
  password: string;
  nombre: string;
}

interface UsuarioCreado extends UsuarioSemilla {
  id: string;
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
 * Crea el cliente admin de Supabase usando la `service_role key`. Este es el
 * único lugar del proyecto de pruebas donde se lee esa variable: nunca se
 * expone a las pruebas de propiedades ni a los helpers de autenticación.
 */
function crearClienteAdmin(): SupabaseClient {
  const url = leerVariableEntorno("SUPABASE_URL");
  const serviceRoleKey = leerVariableEntorno("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Crea (o reutiliza, si ya existe) un usuario de Auth con el rol indicado.
 * El trigger `handle_new_user()` crea automáticamente la fila en `accounts`
 * a partir de `user_metadata.rol`.
 */
async function crearUsuarioSemilla(
  admin: SupabaseClient,
  semilla: UsuarioSemilla
): Promise<UsuarioCreado> {
  const { data, error } = await admin.auth.admin.createUser({
    email: semilla.email,
    password: semilla.password,
    email_confirm: true,
    user_metadata: { rol: semilla.rol, nombre: semilla.nombre },
  });

  if (!error && data.user) {
    console.log(`  [creado] ${semilla.etiqueta} — ${semilla.email} (${data.user.id})`);
    return { ...semilla, id: data.user.id };
  }

  // Tolerar re-ejecuciones: si el usuario ya existe, buscarlo por email en
  // vez de abortar todo el seed.
  const yaExiste =
    error?.message?.toLowerCase().includes("already") ||
    error?.message?.toLowerCase().includes("registered") ||
    error?.status === 422;

  if (!yaExiste) {
    throw new Error(
      `No se pudo crear el usuario de prueba "${semilla.etiqueta}" (${semilla.email}): ${error?.message}`
    );
  }

  console.log(`  [existente] ${semilla.etiqueta} — ${semilla.email}, buscando id...`);
  const existente = await buscarUsuarioPorEmail(admin, semilla.email);
  if (!existente) {
    throw new Error(
      `El usuario "${semilla.email}" reportó estar duplicado pero no se encontró vía listUsers().`
    );
  }
  return { ...semilla, id: existente.id };
}

/** Busca un usuario de Auth ya existente por email (paginando listUsers). */
async function buscarUsuarioPorEmail(
  admin: SupabaseClient,
  email: string
): Promise<{ id: string } | null> {
  const perPage = 200;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`No se pudo listar usuarios existentes: ${error.message}`);
    }
    const encontrado = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (encontrado) {
      return { id: encontrado.id };
    }
    if (data.users.length < perPage) {
      break;
    }
  }
  return null;
}

/**
 * Aprueba una Cuenta admin directamente vía el cliente admin (bypass de RLS
 * intencional: este es un script administrativo de seed, no una prueba de
 * política). Actualiza `estado_cuenta`, `aprobado_por` y `aprobado_en` como
 * lo haría la función `aprobar_cuenta_admin`.
 */
async function aprobarCuentaAdmin(admin: SupabaseClient, cuentaId: string): Promise<void> {
  const { error } = await admin
    .from("accounts")
    .update({
      estado_cuenta: "aprobado",
      aprobado_por: cuentaId,
      aprobado_en: new Date().toISOString(),
    })
    .eq("id", cuentaId);

  if (error) {
    throw new Error(`No se pudo aprobar la Cuenta admin "${cuentaId}": ${error.message}`);
  }
}

/** Inserta una fila si no existe ya una con la misma condición de unicidad. */
async function upsertSiNoExiste(
  admin: SupabaseClient,
  tabla: string,
  filtro: Record<string, string>,
  valores: Record<string, unknown>
): Promise<void> {
  let consulta = admin.from(tabla).select("id").limit(1);
  for (const [columna, valor] of Object.entries(filtro)) {
    consulta = consulta.eq(columna, valor);
  }
  const { data: existentes, error: errorSelect } = await consulta;
  if (errorSelect) {
    throw new Error(`No se pudo verificar existencia en "${tabla}": ${errorSelect.message}`);
  }
  if (existentes && existentes.length > 0) {
    console.log(`  [omitido] ${tabla} ya tiene una fila para ${JSON.stringify(filtro)}`);
    return;
  }

  const { error: errorInsert } = await admin.from(tabla).insert(valores);
  if (errorInsert) {
    throw new Error(`No se pudo insertar en "${tabla}": ${errorInsert.message}`);
  }
  console.log(`  [creado] fila en ${tabla} para ${JSON.stringify(filtro)}`);
}

async function main(): Promise<void> {
  const admin = crearClienteAdmin();

  console.log("Sembrando usuarios de prueba (Auth + accounts vía trigger)...");

  const semillas: UsuarioSemilla[] = [
    {
      etiqueta: "entrenador",
      rol: "entrenador",
      email: leerVariableEntorno("TEST_USER_ENTRENADOR_EMAIL"),
      password: leerVariableEntorno("TEST_USER_ENTRENADOR_PASSWORD"),
      nombre: "Entrenador de Prueba",
    },
    {
      etiqueta: "usuario",
      rol: "usuario",
      email: leerVariableEntorno("TEST_USER_USUARIO_EMAIL"),
      password: leerVariableEntorno("TEST_USER_USUARIO_PASSWORD"),
      nombre: "Alumno de Prueba",
    },
    {
      etiqueta: "admin aprobado",
      rol: "admin",
      email: leerVariableEntorno("TEST_USER_ADMIN_EMAIL"),
      password: leerVariableEntorno("TEST_USER_ADMIN_PASSWORD"),
      nombre: "Admin Aprobado de Prueba",
    },
    {
      etiqueta: "admin pendiente",
      rol: "admin",
      email: leerVariableEntorno("TEST_USER_ADMIN_PENDIENTE_EMAIL"),
      password: leerVariableEntorno("TEST_USER_ADMIN_PENDIENTE_PASSWORD"),
      nombre: "Admin Pendiente de Prueba",
    },
  ];

  const creados: UsuarioCreado[] = [];
  for (const semilla of semillas) {
    creados.push(await crearUsuarioSemilla(admin, semilla));
  }

  const entrenador = creados.find((u) => u.etiqueta === "entrenador")!;
  const usuario = creados.find((u) => u.etiqueta === "usuario")!;
  const adminAprobado = creados.find((u) => u.etiqueta === "admin aprobado")!;
  const adminPendiente = creados.find((u) => u.etiqueta === "admin pendiente")!;

  // El trigger handle_new_user() deja todo admin en estado 'pendiente'. Para
  // tener también un admin APROBADO (requerido por Requirements 2.2, 2.4),
  // se aprueba aquí directamente vía el cliente admin (bypass intencional de
  // RLS: script administrativo de seed, no una prueba de política).
  console.log("Aprobando la Cuenta del admin aprobado...");
  await aprobarCuentaAdmin(admin, adminAprobado.id);
  // El admin pendiente se deja intencionalmente sin aprobar.

  console.log("Sembrando datos representativos mínimos...");

  // Perfil deportivo para el usuario con rol "usuario" (Req. 3).
  await upsertSiNoExiste(
    admin,
    "perfiles_deportivos",
    { cuenta_id: usuario.id },
    {
      cuenta_id: usuario.id,
      apellido: "Prueba",
      apodo: "El Aprendiz",
      fecha_nacimiento: "2000-01-01",
      peso_kg: 70.5,
      nivel: "Amateur",
      objetivo: "Mejorar técnica de defensa",
      ciudad: "Ciudad de México",
      origen_entrenador: "independiente",
    }
  );

  // Perfil público de entrenador para el usuario con rol "entrenador" (Req. 4).
  await upsertSiNoExiste(
    admin,
    "perfiles_publicos_entrenador",
    { cuenta_id: entrenador.id },
    {
      cuenta_id: entrenador.id,
      especialidad: "Boxeo olímpico",
      anos_trayectoria: 10,
      biografia: "Entrenador de prueba sembrado para pruebas pgTAP/fast-check.",
    }
  );

  // Gimnasio de ejemplo (Req. 9).
  await upsertSiNoExiste(
    admin,
    "gimnasios",
    { nombre: "Gimnasio de Prueba Corazón Azteca" },
    {
      nombre: "Gimnasio de Prueba Corazón Azteca",
      direccion: "Av. de Prueba 123, Ciudad de México",
      latitud: 19.432608,
      longitud: -99.133209,
    }
  );

  // Contenido editorial de ejemplo (Req. 6).
  await upsertSiNoExiste(
    admin,
    "contenido_editorial",
    { clave: "seed-portada-inicio" },
    {
      clave: "seed-portada-inicio",
      imagen_ref: "contenido-editorial/seed-portada-inicio.jpg",
    }
  );

  console.log("\nResumen del seed:");
  for (const u of creados) {
    console.log(`  - ${u.etiqueta}: ${u.email} (rol=${u.rol}, id=${u.id})`);
  }
  console.log(`  - admin aprobado -> estado_cuenta = 'aprobado' (${adminAprobado.email})`);
  console.log(`  - admin pendiente -> estado_cuenta = 'pendiente' (${adminPendiente.email})`);
  console.log("  - perfiles_deportivos: 1 fila para el usuario de prueba");
  console.log("  - perfiles_publicos_entrenador: 1 fila para el entrenador de prueba");
  console.log("  - gimnasios: 1 fila de ejemplo");
  console.log("  - contenido_editorial: 1 fila de ejemplo (clave 'seed-portada-inicio')");
  console.log("\nSeed completado.");
}

main().catch((error) => {
  console.error("\nEl seed falló:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
