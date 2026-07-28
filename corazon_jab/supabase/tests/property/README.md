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

## Sembrar usuarios y datos de prueba

Antes de ejecutar las pruebas de propiedades por primera vez (o después de
resetear la base de datos), hay que sembrar los usuarios de prueba y algunos
datos mínimos con el script de la tarea 25:

```bash
npm run seed
```

Este script usa `@supabase/supabase-js` con la **`service_role key`** (leída
de `SUPABASE_SERVICE_ROLE_KEY` en `.env`) exclusivamente para crear los
usuarios de Auth vía `supabase.auth.admin.createUser()`. El trigger
`handle_new_user()` ya existente en la base de datos crea automáticamente la
fila correspondiente en `accounts`. El script crea:

- Un usuario con rol `entrenador` (`TEST_USER_ENTRENADOR_*`).
- Un usuario con rol `usuario` (`TEST_USER_USUARIO_*`).
- Un usuario con rol `admin` que queda **aprobado** (`TEST_USER_ADMIN_*`).
- Un segundo usuario con rol `admin` que queda **pendiente** de aprobación
  (`TEST_USER_ADMIN_PENDIENTE_*`), tal como lo deja el trigger por defecto.
- Datos representativos mínimos en `perfiles_deportivos`,
  `perfiles_publicos_entrenador`, `gimnasios` y `contenido_editorial`.

El script tolera re-ejecuciones: si un usuario ya existe, lo reutiliza en
vez de fallar.

> **Nunca** compartas ni commitees tu `.env` ni la `service_role key`: esa
> key bypassa Row Level Security por completo. Consulta
> `supabase/README.md` para saber cómo obtenerla del dashboard de Supabase.

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
