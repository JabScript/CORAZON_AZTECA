import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Las pruebas de propiedades hacen múltiples round-trips de red contra
    // Supabase local (auth + consultas), por lo que se les da más tiempo
    // que al valor por defecto de vitest.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    include: ["**/*.test.ts"]
  }
});
