// app/lib/authStorage.ts
// Almacén unificado de cuentas (login real) usando localStorage.
// Sembrado con las 15 cuentas de prueba (5 admin, 5 entrenador, 5 alumno) y
// ampliado dinámicamente con cada cuenta creada desde /registro/*.
//
// NOTA: Esto es un prototipo sin backend. Las contraseñas se guardan en
// texto plano en localStorage — NO usar este patrón en producción.

import type { Rol } from "./sesionStorage";

export interface Cuenta {
  email: string;
  password: string;
  usuarioId: number;
  nombre: string;
  rol: Rol;
  /** true si la cuenta está pendiente de aprobación (ej. solicitudes de admin) */
  pendiente?: boolean;
  /** Foto de perfil (base64 data URL), opcional */
  foto?: string;
}

/** Convierte un archivo de imagen a base64 data URL, para foto de perfil */
export function imagenPerfilABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(archivo);
  });
}

const CUENTAS_KEY = "corazon_azteca_cuentas";

// --- Semilla: 5 cuentas de prueba por cada rol ---
const CUENTAS_SEED: Cuenta[] = [
  // Admin
  { email: "admin1@corazonazteca.com", password: "Admin123", usuarioId: 101, nombre: "Laura Nieto", rol: "admin" },
  { email: "admin2@corazonazteca.com", password: "Admin123", usuarioId: 102, nombre: "Héctor Salazar", rol: "admin" },
  { email: "admin3@corazonazteca.com", password: "Admin123", usuarioId: 103, nombre: "Paola Jiménez", rol: "admin" },
  { email: "admin4@corazonazteca.com", password: "Admin123", usuarioId: 104, nombre: "Rubén Castillo", rol: "admin" },
  { email: "admin5@corazonazteca.com", password: "Admin123", usuarioId: 105, nombre: "Ana Rentería", rol: "admin" },
  // Entrenador (coinciden con los perfiles públicos en entrenadorStorage.ts)
  { email: "rodrigo.cazares@corazonazteca.com", password: "Coach123", usuarioId: 201, nombre: "Rodrigo Cazares", rol: "entrenador" },
  { email: "diana.resendiz@corazonazteca.com", password: "Coach123", usuarioId: 202, nombre: "Diana Reséndiz", rol: "entrenador" },
  { email: "marco.villalobos@corazonazteca.com", password: "Coach123", usuarioId: 203, nombre: "Marco Villalobos", rol: "entrenador" },
  { email: "valentina.ortiz@corazonazteca.com", password: "Coach123", usuarioId: 204, nombre: "Valentina Ortiz", rol: "entrenador" },
  { email: "hugo.fernandez@corazonazteca.com", password: "Coach123", usuarioId: 205, nombre: "Hugo Fernández", rol: "entrenador" },
  // Alumno (mismos IDs que ya usan Admin/Directorio y Usuario/Contrincante)
  { email: "iker.dominguez@corazonazteca.com", password: "Boxer123", usuarioId: 1, nombre: "Iker Domínguez", rol: "usuario" },
  { email: "mariana.solis@corazonazteca.com", password: "Boxer123", usuarioId: 2, nombre: "Mariana Solís", rol: "usuario" },
  { email: "bruno.estrada@corazonazteca.com", password: "Boxer123", usuarioId: 3, nombre: "Bruno Estrada", rol: "usuario" },
  { email: "camila.vega@corazonazteca.com", password: "Boxer123", usuarioId: 4, nombre: "Camila Vega", rol: "usuario" },
  { email: "santiago.rua@corazonazteca.com", password: "Boxer123", usuarioId: 5, nombre: "Santiago Rúa", rol: "usuario" },
];

/** Obtiene todas las cuentas (semilla + registradas dinámicamente) */
export function obtenerCuentas(): Cuenta[] {
  if (typeof window === "undefined") return CUENTAS_SEED;
  try {
    const raw = localStorage.getItem(CUENTAS_KEY);
    if (!raw) {
      localStorage.setItem(CUENTAS_KEY, JSON.stringify(CUENTAS_SEED));
      return CUENTAS_SEED;
    }
    return JSON.parse(raw) as Cuenta[];
  } catch {
    return CUENTAS_SEED;
  }
}

function guardarCuentas(cuentas: Cuenta[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUENTAS_KEY, JSON.stringify(cuentas));
}

/** Verifica si un correo ya está registrado (sin importar mayúsculas) */
export function correoExiste(email: string): boolean {
  const normalizado = email.trim().toLowerCase();
  return obtenerCuentas().some((c) => c.email.toLowerCase() === normalizado);
}

/**
 * Registra una nueva cuenta. Genera un usuarioId único.
 * `pendiente: true` para roles que requieren aprobación (ej. admin).
 */
export function registrarCuenta(data: {
  email: string;
  password: string;
  nombre: string;
  rol: Rol;
  pendiente?: boolean;
  foto?: string;
}): Cuenta {
  const cuentas = obtenerCuentas();

  const nueva: Cuenta = {
    email: data.email.trim(),
    password: data.password,
    usuarioId: Date.now(),
    nombre: data.nombre.trim(),
    rol: data.rol,
    pendiente: data.pendiente ?? false,
    foto: data.foto,
  };

  guardarCuentas([...cuentas, nueva]);
  return nueva;
}

/** Actualiza la foto de perfil de una cuenta ya registrada, por usuarioId */
export function actualizarFotoCuenta(usuarioId: number, foto: string): void {
  const cuentas = obtenerCuentas().map((c) =>
    c.usuarioId === usuarioId ? { ...c, foto } : c
  );
  guardarCuentas(cuentas);
}

/** Elimina una cuenta por usuarioId (acción de admin) */
export function eliminarCuenta(usuarioId: number): void {
  guardarCuentas(obtenerCuentas().filter((c) => c.usuarioId !== usuarioId));
}

/** Actualiza el nombre y/o foto de una cuenta ya registrada, por usuarioId */
export function actualizarCuenta(
  usuarioId: number,
  data: { nombre?: string; foto?: string }
): void {
  const cuentas = obtenerCuentas().map((c) =>
    c.usuarioId === usuarioId ? { ...c, ...data } : c
  );
  guardarCuentas(cuentas);
}

/** Autentica por email + password. Devuelve null si no coincide o está pendiente de aprobación. */
export function autenticar(email: string, password: string): Cuenta | null {
  const normalizado = email.trim().toLowerCase();
  const cuenta = obtenerCuentas().find(
    (c) => c.email.toLowerCase() === normalizado && c.password === password
  );
  if (!cuenta) return null;
  if (cuenta.pendiente) return null; // cuentas pendientes no pueden iniciar sesión aún
  return cuenta;
}

/** Devuelve la ruta del panel correspondiente a cada rol */
export function rutaPanel(rol: Rol): string {
  if (rol === "admin") return "/Admin";
  if (rol === "entrenador") return "/Entrenador";
  return "/Usuario";
}
