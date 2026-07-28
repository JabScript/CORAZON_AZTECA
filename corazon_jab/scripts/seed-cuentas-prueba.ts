// scripts/seed-cuentas-prueba.ts
// Script_Siembra: recrea las 15 cuentas de prueba (5 admin, 5 entrenador,
// 5 alumno) como usuarios reales de Supabase Auth usando `service_role`,
// dejando que el trigger `handle_new_user()` pueble `accounts`.
//
// Uso:
//   npm run seed
//
// Requiere en `.env.local` (o en el entorno):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (Settings → API → service_role, NUNCA la anon key)

import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local. Abortando siembra."
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Rol = "admin" | "entrenador" | "usuario";

interface CuentaSemilla {
  email: string;
  password: string;
  nombre: string;
  rol: Rol;
}

// Mismas 15 cuentas que antes vivían hardcodeadas en authStorage.ts.
const CUENTAS_SEED: CuentaSemilla[] = [
  { email: "admin1@corazonazteca.com", password: "Admin123!", nombre: "Laura Nieto", rol: "admin" },
  { email: "admin2@corazonazteca.com", password: "Admin123!", nombre: "Héctor Salazar", rol: "admin" },
  { email: "admin3@corazonazteca.com", password: "Admin123!", nombre: "Paola Jiménez", rol: "admin" },
  { email: "admin4@corazonazteca.com", password: "Admin123!", nombre: "Rubén Castillo", rol: "admin" },
  { email: "admin5@corazonazteca.com", password: "Admin123!", nombre: "Ana Rentería", rol: "admin" },

  { email: "rodrigo.cazares@corazonazteca.com", password: "Coach123!", nombre: "Rodrigo Cazares", rol: "entrenador" },
  { email: "diana.resendiz@corazonazteca.com", password: "Coach123!", nombre: "Diana Reséndiz", rol: "entrenador" },
  { email: "marco.villalobos@corazonazteca.com", password: "Coach123!", nombre: "Marco Villalobos", rol: "entrenador" },
  { email: "valentina.ortiz@corazonazteca.com", password: "Coach123!", nombre: "Valentina Ortiz", rol: "entrenador" },
  { email: "hugo.fernandez@corazonazteca.com", password: "Coach123!", nombre: "Hugo Fernández", rol: "entrenador" },

  { email: "iker.dominguez@corazonazteca.com", password: "Boxer123!", nombre: "Iker Domínguez", rol: "usuario" },
  { email: "mariana.solis@corazonazteca.com", password: "Boxer123!", nombre: "Mariana Solís", rol: "usuario" },
  { email: "bruno.estrada@corazonazteca.com", password: "Boxer123!", nombre: "Bruno Estrada", rol: "usuario" },
  { email: "camila.vega@corazonazteca.com", password: "Boxer123!", nombre: "Camila Vega", rol: "usuario" },
  { email: "santiago.rua@corazonazteca.com", password: "Boxer123!", nombre: "Santiago Rúa", rol: "usuario" },
];

// Datos representativos mínimos, equivalentes a los antes hardcodeados en
// alumnoStorage.ts / entrenadorStorage.ts, para poblar perfiles_deportivos
// y perfiles_publicos_entrenador tras crear cada cuenta.
const PERFIL_ALUMNO_DEFAULT = {
  apellido: "",
  fecha_nacimiento: "2000-01-01",
  peso_kg: 65,
  nivel: "Amateur",
  objetivo: "Competir amateur",
  ciudad: "Ciudad de México",
  origen_entrenador: "independiente" as const,
};

const PERFIL_ENTRENADOR_DEFAULT = {
  especialidad: "Boxeo",
  anos_trayectoria: 5,
  biografia: "Entrenador de boxeo en Corazón Azteca.",
};

async function crearUsuario(cuenta: CuentaSemilla): Promise<{ id: string; creada: boolean } | null> {
  const { data, error } = await admin.auth.admin.createUser({
    email: cuenta.email,
    password: cuenta.password,
    email_confirm: true,
    user_metadata: { nombre: cuenta.nombre, rol: cuenta.rol },
  });

  if (error) {
    const mensaje = error.message.toLowerCase();
    const yaExiste =
      mensaje.includes("already registered") ||
      mensaje.includes("already been registered") ||
      mensaje.includes("user_already_exists") ||
      mensaje.includes("duplicate");

    if (yaExiste) {
      console.log(`  ↷ ${cuenta.email} ya existe, omitiendo creación.`);
      // Busca el id existente para poder crear su perfil si aún no lo tiene.
      const { data: lista } = await admin.auth.admin.listUsers();
      const existente = lista?.users.find((u) => u.email === cuenta.email);
      return existente ? { id: existente.id, creada: false } : null;
    }

    console.error(`  ✕ Error creando ${cuenta.email}:`, error.message);
    return null;
  }

  console.log(`  ✓ Creada ${cuenta.email} (${cuenta.rol})`);
  return { id: data.user.id, creada: true };
}

async function asegurarPerfil(cuentaId: string, rol: Rol) {
  if (rol === "usuario") {
    const { data: existente } = await admin
      .from("perfiles_deportivos")
      .select("id")
      .eq("cuenta_id", cuentaId)
      .maybeSingle();
    if (existente) return;

    const { error } = await admin
      .from("perfiles_deportivos")
      .insert({ cuenta_id: cuentaId, ...PERFIL_ALUMNO_DEFAULT });
    if (error) console.error(`    ✕ Error creando perfiles_deportivos:`, error.message);
  } else if (rol === "entrenador") {
    const { data: existente } = await admin
      .from("perfiles_publicos_entrenador")
      .select("id")
      .eq("cuenta_id", cuentaId)
      .maybeSingle();
    if (existente) return;

    const { error } = await admin
      .from("perfiles_publicos_entrenador")
      .insert({ cuenta_id: cuentaId, ...PERFIL_ENTRENADOR_DEFAULT });
    if (error) console.error(`    ✕ Error creando perfiles_publicos_entrenador:`, error.message);
  }
}

async function aprobarPrimerAdmin() {
  const primerAdmin = CUENTAS_SEED.find((c) => c.rol === "admin");
  if (!primerAdmin) return;

  const { data: cuenta } = await admin
    .from("accounts")
    .select("id, estado_cuenta")
    .eq("rol", "admin")
    .order("creado_en", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!cuenta) {
    console.warn("  ⚠ No se encontró ninguna cuenta admin para aprobar automáticamente.");
    return;
  }
  if (cuenta.estado_cuenta === "aprobado") {
    console.log(`  ↷ La primera cuenta admin ya está aprobada.`);
    return;
  }

  const { error } = await admin
    .from("accounts")
    .update({ estado_cuenta: "aprobado", aprobado_por: cuenta.id, aprobado_en: new Date().toISOString() })
    .eq("id", cuenta.id);

  if (error) {
    console.error("  ✕ Error aprobando la primera cuenta admin:", error.message);
  } else {
    console.log("  ✓ Primera cuenta admin aprobada automáticamente (bootstrap).");
  }
}

async function main() {
  console.log(`Sembrando ${CUENTAS_SEED.length} cuentas de prueba contra ${SUPABASE_URL}...\n`);

  for (const cuenta of CUENTAS_SEED) {
    const resultado = await crearUsuario(cuenta);
    if (resultado) {
      await asegurarPerfil(resultado.id, cuenta.rol);
    }
  }

  console.log("\nAprobando la primera cuenta admin (bootstrap)...");
  await aprobarPrimerAdmin();

  console.log("\nSiembra completada.");
}

main().catch((err) => {
  console.error("Error inesperado durante la siembra:", err);
  process.exit(1);
});
