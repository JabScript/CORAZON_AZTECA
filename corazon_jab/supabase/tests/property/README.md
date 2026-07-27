# Pruebas de propiedades (fast-check)

Proyecto Node/TypeScript independiente (no forma parte del build de Next.js
de `corazon_jab`) con las pruebas de propiedades del spec
`supabase-database-schema`, escritas con [`fast-check`](https://github.com/dubzzz/fast-check)
sobre [`vitest`](https://vitest.dev/).

Cada prueba autentica contra Supabase con `supabase.auth.signInWithPassword`
usando usuarios de prueba sembrados (ver helper `helpers/auth.ts` y el script
de seed de la tarea 25 del plan), nunca con la `service_role key`, para que
las políticas RLS se evalúen igual que en producción.

## Instalación

```bash
cd supabase/tests/property
npm install
cp .env.example .env
# completa .env con la URL/anon key de tu Supabase local y las credenciales
# de los usuarios de prueba sembrados
```

## Ejecutar las pruebas

```bash
npm test
```

## Convenciones

- Cada archivo de prueba de una propiedad numerada se etiqueta en su
  `describe`/`it` como **Feature: supabase-database-schema, Property {n}:
  {texto de la propiedad}**, tal como indica `tasks.md`.
- Las propiedades se configuran con mínimo 100 iteraciones
  (`fc.assert(fc.asyncProperty(...), { numRuns: 100 })`).
- El helper `helpers/auth.ts` es el único punto donde se leen credenciales de
  usuarios de prueba; nunca se hardcodean emails/contraseñas en los archivos
  de prueba.
