# Supabase — `corazon_jab`

Esquema de base de datos, migraciones y pruebas de Supabase para
`corazon_jab`, implementado según el spec
[`supabase-database-schema`](../.kiro/specs/supabase-database-schema/design.md).

## Estructura

```
supabase/
  schema.sql              # Esquema previo de referencia (pre-spec)
  migrations/              # Migraciones SQL versionadas y numeradas
  tests/
    pgtap/                 # Pruebas unitarias/de integración en SQL (pgTAP)
    property/              # Pruebas de propiedades (fast-check + vitest)
```

## Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) (requerido por Supabase CLI
  para levantar los servicios locales).
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started):

  ```bash
  npm install -g supabase
  # o, sin instalación global:
  npx supabase --version
  ```

## Levantar Supabase local

Desde la raíz de `corazon_jab`:

```bash
supabase start
```

Esto expone la API local (por defecto en `http://127.0.0.1:54321`), el
Studio, y una base Postgres local. El comando imprime la `anon key` y la
`service_role key` del proyecto local, necesarias para las pruebas.

Para detener los servicios:

```bash
supabase stop
```

## Aplicar migraciones

Las migraciones viven en `supabase/migrations/` con nombres numerados estilo
timestamp (`YYYYMMDDHHMMSS_descripcion.sql`), aplicadas en orden ascendente.

```bash
# Aplica todas las migraciones pendientes contra la instancia local
supabase migration up

# Alternativa: reinicia la base local desde cero aplicando todas las migraciones
supabase db reset
```

## Ejecutar las pruebas pgTAP

Con Supabase local corriendo y las migraciones aplicadas:

```bash
supabase test db
```

Este comando ejecuta todos los archivos `.sql` de `supabase/tests/pgtap/`
usando `pgTAP` dentro de la base de datos local. Ver
`supabase/tests/pgtap/README.md` para la convención de nombres de archivo.

## Ejecutar las pruebas de propiedades (`fast-check`)

Con Supabase local corriendo, migraciones aplicadas y usuarios de prueba
sembrados (script de seed de la tarea 25 del plan):

```bash
cd supabase/tests/property
npm install
cp .env.example .env   # completar con URL/anon key locales y credenciales de prueba
npm test
```

Ver `supabase/tests/property/README.md` para más detalle sobre convenciones
de las pruebas de propiedades.

## Orden recomendado al trabajar en una tarea nueva

1. `supabase start` (si no está corriendo).
2. Escribir/actualizar la migración correspondiente en `supabase/migrations/`.
3. `supabase db reset` (o `supabase migration up`) para aplicarla.
4. Ejecutar `supabase test db` para las pruebas pgTAP de esa tarea.
5. Ejecutar `npm test` en `supabase/tests/property/` para las pruebas de
   propiedades de esa tarea.
