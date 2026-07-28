# Pruebas pgTAP

Esta carpeta contiene las pruebas unitarias/de integración en SQL del esquema
de `supabase-database-schema`, escritas con [pgTAP](https://pgtap.org/).

Estas pruebas verifican ejemplos concretos y estructura de esquema (columnas,
tipos, `CHECK`, `UNIQUE`, `rowsecurity = true`), a diferencia de las pruebas
de propiedades en `supabase/tests/property/`, que verifican comportamiento
universal con datos generados aleatoriamente.

## Convención de nombres de archivo

```
NN_<tabla_o_area>_<aspecto>.sql
```

- `NN`: prefijo numérico de dos dígitos que fija el orden de ejecución
  (`pg_prove` ejecuta los archivos en orden alfabético). Debe coincidir a
  grandes rasgos con el orden de las tareas de implementación en `tasks.md`.
- `<tabla_o_area>`: nombre de la tabla principal que se está probando (en
  snake_case, igual que en las migraciones), o el nombre del área transversal
  (por ejemplo `rls`).
- `<aspecto>`: qué parte del esquema cubre el archivo (`schema`, `rls`,
  `triggers`, etc.).

Ejemplos previstos en tareas futuras:

- `01_accounts_schema.sql` — columnas, tipos y `CHECK` de `accounts`.
- `10_registros_pelea_schema.sql` — `CHECK` de `resultado` y constraint de
  rival en `registros_pelea`.
- `22_rls_smoke.sql` — smoke test único verificando `rowsecurity = true` en
  cada tabla de negocio (Requirement 20.1).

## Cómo se ejecutan

Requieren una instancia local de Supabase (`supabase start`) con la extensión
`pgtap` disponible. Ver `supabase/README.md` (o el `README.md` de este spec)
para el comando exacto de ejecución (`supabase test db` / `pg_prove`).
