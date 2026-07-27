-- ============================================================================
-- Migración: tabla `accounts` (Cuenta) — Requirement 1, 2
-- ============================================================================
-- `accounts` extiende `auth.users` con los atributos de negocio (nombre, rol,
-- foto, estado de aprobación). Las credenciales (contraseña, tokens, etc.)
-- viven exclusivamente en `auth.users`, gestionado por Supabase Auth: esta
-- tabla NO define ninguna columna de contraseña ni credencial (Req. 1.1).
--
-- La fila de `accounts` se crea automáticamente mediante el trigger
-- `on_auth_user_created` sobre `auth.users` (tarea 2.2); esta migración solo
-- define la estructura de la tabla, sus columnas, sus restricciones de
-- dominio (`CHECK`) y habilita Row Level Security. Las políticas RLS
-- concretas se implementan en la tarea 2.5.
-- ============================================================================

create table public.accounts (
  -- ADR-5 (Data Models / ADR-5, pendiente de confirmación de producto):
  -- se usa `ON DELETE CASCADE` desde `auth.users` hacia `accounts`, de modo
  -- que al eliminar un usuario de Supabase Auth se elimina automáticamente
  -- su Cuenta y, en cascada, el historial dependiente de negocio
  -- (perfiles_deportivos, evaluaciones_habilidades, publicaciones, etc.).
  -- El proyecto es greenfield y no existe historial real que proteger
  -- todavía, por lo que se asume esta opción como la más simple. Es
  -- reversible: migrar a un esquema de soft-delete (columna
  -- `eliminada_en timestamptz` + políticas RLS que filtren
  -- `eliminada_en IS NULL`) no requiere rediseñar el resto del esquema.
  id uuid primary key references auth.users (id) on delete cascade,

  nombre text not null check (char_length(nombre) between 1 and 100),

  -- Los dominios/enums se implementan como CHECK sobre text, no como tipo
  -- ENUM de Postgres, para simplificar futuras extensiones de valores sin
  -- necesidad de ALTER TYPE (ver "Convenciones generales" en design.md).
  rol text not null check (rol in ('admin', 'entrenador', 'usuario')),

  -- Ruta de objeto en el bucket de Storage `avatars`; nunca base64 ni bytea.
  foto_ref text,

  estado_cuenta text not null default 'aprobado'
    check (estado_cuenta in ('pendiente', 'aprobado')),

  -- Auditoría de aprobación de administradores (Req. 2.5): nulos hasta que
  -- un admin aprobado ejecute `aprobar_cuenta_admin` (tarea 2.4).
  aprobado_por uuid references public.accounts (id),
  aprobado_en timestamptz,

  creado_en timestamptz not null default now()
);

comment on table public.accounts is
  'Cuenta: extiende auth.users con atributos de negocio (nombre, rol, foto, '
  'estado de aprobación). Sin credenciales propias (Req. 1.1).';

comment on column public.accounts.id is
  'FK 1:1 hacia auth.users.id. ON DELETE CASCADE (ADR-5, pendiente de '
  'confirmación de producto): reversible a soft-delete si el equipo de '
  'producto lo decide.';

alter table public.accounts enable row level security;
