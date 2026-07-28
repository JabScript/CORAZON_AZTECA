-- ============================================================================
-- Migración inicial: extensiones requeridas por el esquema
-- ============================================================================
-- `pgcrypto` provee gen_random_uuid(), usada como default de las columnas
-- `id uuid primary key` en todas las tablas de negocio de este spec.
-- `uuid-ossp` se habilita también por compatibilidad, en caso de que alguna
-- migración futura prefiera uuid_generate_v4() en lugar de gen_random_uuid().
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
