import { describe, expect, it } from "vitest";
import { credencialesParaRol } from "./auth";

// Prueba de humo (no requiere Supabase local): confirma que el helper lee
// las credenciales de cada rol desde variables de entorno y falla con un
// mensaje claro cuando faltan, en lugar de usar valores hardcodeados.
describe("credencialesParaRol", () => {
  it("lanza un error explicativo si la variable de entorno no está definida", () => {
    delete process.env.TEST_USER_ADMIN_EMAIL;
    delete process.env.TEST_USER_ADMIN_PASSWORD;

    expect(() => credencialesParaRol("admin")).toThrowError(/TEST_USER_ADMIN_EMAIL/);
  });

  it("lee email y password desde variables de entorno para el rol dado", () => {
    process.env.TEST_USER_ENTRENADOR_EMAIL = "entrenador@example.test";
    process.env.TEST_USER_ENTRENADOR_PASSWORD = "clave-segura";

    expect(credencialesParaRol("entrenador")).toEqual({
      email: "entrenador@example.test",
      password: "clave-segura",
    });
  });
});
