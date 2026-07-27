-- ============================================================================
-- CORAZÓN AZTECA — Esquema de base de datos (Supabase / PostgreSQL)
-- ============================================================================
-- Roles del sistema: admin, entrenador, usuario (alumno)
--
-- Diseño:
--   1. `usuarios`      -> tabla identidad (1 fila por cuenta, ligada a auth.users)
--   2. `entrenadores`  -> extensión de `usuarios` para rol 'entrenador'
--   3. `alumnos`       -> extensión de `usuarios` para rol 'usuario', con
--                         relación al entrenador y su registro deportivo/médico
--   4. `sesiones_entrenamiento` -> bitácora de sesiones de entrenamiento
--
-- Parte 2 (complementarias, alineadas a secciones ya existentes en la app:
-- Progreso, detalle de alumno, directorio, blog): evaluaciones_habilidades,
-- objetivos_alumno, peleas, articulos_blog.
--
-- Notas de seguridad:
--   - Las contraseñas NO se guardan en esta base (a diferencia del prototipo
--     actual en localStorage). La autenticación la maneja Supabase Auth
--     (`auth.users`); `usuarios.id` reutiliza ese mismo UUID.
--   - Se habilita Row Level Security (RLS) en todas las tablas con políticas
--     que reflejan las reglas de negocio pedidas:
--       * admin puede eliminar perfiles de alumnos y entrenadores
--       * el usuario (alumno) puede modificar su propio entrenador asignado
--       * el entrenador puede registrar peso/lesión/campeón/nivel de SUS alumnos
-- ============================================================================

-- ----------------------------------------------------------------------------
-- EXTENSIONES
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- TIPOS ENUM
-- ----------------------------------------------------------------------------
create type rol_usuario as enum ('admin', 'entrenador', 'usuario');
create type nivel_boxeo as enum ('Principiante', 'Intermedio', 'Avanzado');
create type origen_entrenador as enum ('directorio', 'manual', 'independiente');
create type estado_publicacion as enum ('pendiente', 'aprobado', 'rechazado');
create type tipo_publicacion as enum ('articulo', 'logro');
create type resultado_pelea as enum ('victoria', 'derrota', 'empate');

-- ----------------------------------------------------------------------------
-- FUNCIÓN AUXILIAR: timestamp de actualización automático
-- ----------------------------------------------------------------------------
create or replace function set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. USUARIOS  (tabla identidad, 1:1 con auth.users)
-- ============================================================================
create table usuarios (
  id             uuid primary key references auth.users(id) on delete cascade,
  nombre         text not null,
  apellido       text,
  email          text not null unique,
  rol            rol_usuario not null default 'usuario',
  foto_url       text,
  activo         boolean not null default true,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index idx_usuarios_rol on usuarios (rol);

create trigger trg_usuarios_actualizado
  before update on usuarios
  for each row execute function set_actualizado_en();

-- ============================================================================
-- 2. ENTRENADORES  (extensión de usuarios, rol = 'entrenador')
-- ============================================================================
create table entrenadores (
  id               uuid primary key references usuarios(id) on delete cascade,
  especialidad     text not null,
  anos_trayectoria smallint not null default 0 check (anos_trayectoria >= 0),
  bio              text,
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now()
);

create trigger trg_entrenadores_actualizado
  before update on entrenadores
  for each row execute function set_actualizado_en();

-- Logros del entrenador (lista 1-a-muchos, antes era un text[] en el prototipo)
create table entrenador_logros (
  id            uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references entrenadores(id) on delete cascade,
  descripcion   text not null,
  orden         smallint not null default 0
);

create index idx_entrenador_logros_entrenador on entrenador_logros (entrenador_id);

-- Redes sociales del entrenador
create table entrenador_redes_sociales (
  id            uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references entrenadores(id) on delete cascade,
  nombre_red    text not null,       -- Instagram, Facebook, TikTok, WhatsApp...
  usuario_red   text not null,
  url           text not null
);

create index idx_entrenador_redes_entrenador on entrenador_redes_sociales (entrenador_id);

-- Galería de fotos del entrenador
create table entrenador_galeria (
  id            uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references entrenadores(id) on delete cascade,
  url           text not null,       -- referencia a Supabase Storage, no base64
  texto_alt     text,
  creado_en     timestamptz not null default now()
);

create index idx_entrenador_galeria_entrenador on entrenador_galeria (entrenador_id);

-- ============================================================================
-- 3. ALUMNOS  (extensión de usuarios, rol = 'usuario')
-- ============================================================================
create table alumnos (
  id                       uuid primary key references usuarios(id) on delete cascade,

  -- Datos personales / deportivos generales
  apodo                    text,
  fecha_nacimiento         date,
  peso_kg                  numeric(5,2) check (peso_kg > 0),
  estatura_cm              numeric(5,2) check (estatura_cm > 0),
  categoria_peso           text,        -- Ligero, Pluma, Welter, Mosca, etc.
  nacionalidad             text,
  ciudad                   text,
  gimnasio                 text,
  objetivo                 text,
  nivel                    nivel_boxeo not null default 'Principiante',

  -- Relación con entrenador (el usuario puede modificarla)
  origen_entrenador        origen_entrenador not null default 'independiente',
  entrenador_id            uuid references entrenadores(id) on delete set null,
  nombre_entrenador_manual text,

  -- Registro médico / deportivo que lleva el entrenador
  lesionado                boolean not null default false,
  tipo_lesion              text,
  fecha_lesion             date,
  alta_medica              boolean not null default true,
  observaciones_medicas    text,

  es_campeon               boolean not null default false,
  federacion               text,
  titulo_desde             date,

  plan_actual              text,
  adherencia_plan_pct      numeric(5,2) check (adherencia_plan_pct between 0 and 100),

  -- Récord de peleas (resumen)
  peleas_total             int not null default 0 check (peleas_total >= 0),
  victorias                int not null default 0 check (victorias >= 0),
  empates                  int not null default 0 check (empates >= 0),
  derrotas                 int not null default 0 check (derrotas >= 0),
  victorias_ko             int not null default 0 check (victorias_ko >= 0),

  creado_en                timestamptz not null default now(),
  actualizado_en           timestamptz not null default now(),

  -- El origen del entrenador determina qué otras columnas deben estar llenas
  constraint chk_origen_entrenador_consistente check (
    (origen_entrenador = 'directorio' and entrenador_id is not null and nombre_entrenador_manual is null)
    or (origen_entrenador = 'manual' and nombre_entrenador_manual is not null and entrenador_id is null)
    or (origen_entrenador = 'independiente' and entrenador_id is null and nombre_entrenador_manual is null)
  ),
  -- Solo debe existir fecha/tipo de lesión cuando el alumno está lesionado
  constraint chk_lesion_consistente check (
    lesionado = true or (tipo_lesion is null and fecha_lesion is null)
  ),
  -- Solo debe existir federación/fecha de título cuando es campeón
  constraint chk_campeon_consistente check (
    es_campeon = true or (federacion is null and titulo_desde is null)
  )
);

create index idx_alumnos_entrenador on alumnos (entrenador_id);
create index idx_alumnos_nivel on alumnos (nivel);

create trigger trg_alumnos_actualizado
  before update on alumnos
  for each row execute function set_actualizado_en();

-- ----------------------------------------------------------------------------
-- Protección por columna: qué puede editar cada rol en `alumnos`
--   - El propio alumno: sus datos personales y la elección de entrenador.
--   - El entrenador asignado: peso, nivel, lesión, campeón, plan y récord
--     (justo lo que pediste: "su registro cuenta de peso, si tienen una
--     lesión o no, si son campeones, su nivel de boxeo").
--   - admin: sin restricciones (bypass).
-- ----------------------------------------------------------------------------
create or replace function proteger_columnas_alumno()
returns trigger
language plpgsql
security definer
as $$
declare
  rol_actual rol_usuario;
begin
  select rol into rol_actual from usuarios where id = auth.uid();

  if rol_actual = 'admin' then
    return new;
  end if;

  if rol_actual = 'usuario' and auth.uid() = old.id then
    -- El alumno no puede tocar los campos que administra el entrenador
    new.nivel                 := old.nivel;
    new.lesionado             := old.lesionado;
    new.tipo_lesion           := old.tipo_lesion;
    new.fecha_lesion          := old.fecha_lesion;
    new.alta_medica           := old.alta_medica;
    new.observaciones_medicas := old.observaciones_medicas;
    new.es_campeon            := old.es_campeon;
    new.federacion            := old.federacion;
    new.titulo_desde          := old.titulo_desde;
    new.plan_actual           := old.plan_actual;
    new.adherencia_plan_pct   := old.adherencia_plan_pct;
    new.peleas_total          := old.peleas_total;
    new.victorias             := old.victorias;
    new.empates               := old.empates;
    new.derrotas              := old.derrotas;
    new.victorias_ko          := old.victorias_ko;
    return new;
  end if;

  if rol_actual = 'entrenador'
     and exists (select 1 from entrenadores e where e.id = auth.uid() and e.id = old.entrenador_id) then
    -- El entrenador no puede cambiar los datos personales ni reasignarse a sí mismo
    new.apodo                    := old.apodo;
    new.fecha_nacimiento         := old.fecha_nacimiento;
    new.nacionalidad             := old.nacionalidad;
    new.ciudad                   := old.ciudad;
    new.objetivo                 := old.objetivo;
    new.origen_entrenador        := old.origen_entrenador;
    new.entrenador_id            := old.entrenador_id;
    new.nombre_entrenador_manual := old.nombre_entrenador_manual;
    return new;
  end if;

  -- Cualquier otro caso: no se permite la modificación
  raise exception 'No tienes permiso para modificar este registro de alumno';
end;
$$;

create trigger trg_proteger_columnas_alumno
  before update on alumnos
  for each row execute function proteger_columnas_alumno();

-- ============================================================================
-- 4. SESIONES DE ENTRENAMIENTO
-- ============================================================================
create table sesiones_entrenamiento (
  id                     uuid primary key default gen_random_uuid(),
  alumno_id              uuid not null references alumnos(id) on delete cascade,
  entrenador_id          uuid references entrenadores(id) on delete set null,

  fecha                  date not null default current_date,
  tipo_sesion            text not null,   -- Saco, Sparring, Técnica, Preparación Física...
  duracion_minutos       smallint not null check (duracion_minutos > 0),
  intensidad             smallint check (intensidad between 1 and 10),
  frecuencia_cardiaca_bpm smallint check (frecuencia_cardiaca_bpm > 0),
  calificacion           smallint check (calificacion between 1 and 5),
  notas                  text,

  creado_en              timestamptz not null default now()
);

create index idx_sesiones_alumno on sesiones_entrenamiento (alumno_id);
create index idx_sesiones_entrenador on sesiones_entrenamiento (entrenador_id);
create index idx_sesiones_fecha on sesiones_entrenamiento (fecha);

-- ============================================================================
-- PARTE 2 — TABLAS COMPLEMENTARIAS
-- (cubren secciones ya presentes en la app: Progreso > Evaluaciones/Objetivos,
-- detalle de alumno > Historial, y el Blog de artículos/logros)
-- ============================================================================

-- Evaluación de habilidades (radar: velocidad, potencia, resistencia, etc.)
create table evaluaciones_habilidades (
  id             uuid primary key default gen_random_uuid(),
  alumno_id      uuid not null references alumnos(id) on delete cascade,
  entrenador_id  uuid references entrenadores(id) on delete set null,
  fecha          date not null default current_date,
  velocidad      smallint check (velocidad between 0 and 100),
  potencia       smallint check (potencia between 0 and 100),
  resistencia    smallint check (resistencia between 0 and 100),
  tecnica        smallint check (tecnica between 0 and 100),
  defensa        smallint check (defensa between 0 and 100),
  ring_iq        smallint check (ring_iq between 0 and 100),
  creado_en      timestamptz not null default now()
);

create index idx_evaluaciones_alumno on evaluaciones_habilidades (alumno_id);

-- Objetivos/metas del alumno (carrera, físico, etc.)
create table objetivos_alumno (
  id             uuid primary key default gen_random_uuid(),
  alumno_id      uuid not null references alumnos(id) on delete cascade,
  descripcion    text not null,
  tipo           text not null,          -- carrera, fisico...
  progreso_pct   numeric(5,2) not null default 0 check (progreso_pct between 0 and 100),
  fecha_limite   date,
  completado     boolean not null default false,
  creado_en      timestamptz not null default now()
);

create index idx_objetivos_alumno on objetivos_alumno (alumno_id);

-- Peleas (historial y próximas)
create table peleas (
  id             uuid primary key default gen_random_uuid(),
  alumno_id      uuid not null references alumnos(id) on delete cascade,
  contrincante_id uuid references alumnos(id) on delete set null,
  fecha          date not null,
  evento         text,
  lugar          text,
  categoria_peso text,
  es_proxima     boolean not null default false,
  resultado      resultado_pelea,       -- null mientras es_proxima = true
  metodo         text,                  -- KO, decisión, etc.
  creado_en      timestamptz not null default now(),

  constraint chk_pelea_resultado check (
    (es_proxima = true and resultado is null) or (es_proxima = false)
  )
);

create index idx_peleas_alumno on peleas (alumno_id);
create index idx_peleas_fecha on peleas (fecha);

-- Blog / logros con flujo de aprobación (admin aprueba o rechaza)
create table articulos_blog (
  id             uuid primary key default gen_random_uuid(),
  tipo           tipo_publicacion not null default 'articulo',
  titulo         text not null,
  extracto       text,
  contenido      text not null,
  categoria      text,
  icono          text,
  imagen_url     text,
  autor_id       uuid not null references usuarios(id) on delete cascade,
  estado         estado_publicacion not null default 'pendiente',
  motivo_rechazo text,
  creado_en      timestamptz not null default now(),
  revisado_en    timestamptz
);

create index idx_articulos_autor on articulos_blog (autor_id);
create index idx_articulos_estado on articulos_blog (estado);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table usuarios enable row level security;
alter table entrenadores enable row level security;
alter table entrenador_logros enable row level security;
alter table entrenador_redes_sociales enable row level security;
alter table entrenador_galeria enable row level security;
alter table alumnos enable row level security;
alter table sesiones_entrenamiento enable row level security;
alter table evaluaciones_habilidades enable row level security;
alter table objetivos_alumno enable row level security;
alter table peleas enable row level security;
alter table articulos_blog enable row level security;

-- Función auxiliar para políticas: rol de la cuenta autenticada
create or replace function rol_actual()
returns rol_usuario
language sql
stable
security definer
as $$
  select rol from usuarios where id = auth.uid();
$$;

create or replace function es_admin()
returns boolean
language sql
stable
security definer
as $$
  select rol_actual() = 'admin';
$$;

-- ---------------------------------------------------------------- usuarios --
create policy "usuarios_select_propio_o_admin"
  on usuarios for select
  using (auth.uid() = id or es_admin());

create policy "usuarios_insert_propio"
  on usuarios for insert
  with check (auth.uid() = id);

create policy "usuarios_update_propio_o_admin"
  on usuarios for update
  using (auth.uid() = id or es_admin());

-- Requisito: el admin puede borrar perfiles de alumnos y entrenadores
create policy "usuarios_delete_admin"
  on usuarios for delete
  using (es_admin());

-- ------------------------------------------------------------- entrenadores --
-- Directorio público: cualquiera (incluso visitantes anónimos) puede verlo
create policy "entrenadores_select_publico"
  on entrenadores for select
  using (true);

create policy "entrenadores_insert_propio"
  on entrenadores for insert
  with check (auth.uid() = id);

create policy "entrenadores_update_propio_o_admin"
  on entrenadores for update
  using (auth.uid() = id or es_admin());

create policy "entrenadores_delete_admin"
  on entrenadores for delete
  using (es_admin());

-- Sub-tablas del entrenador: mismas reglas, verificando dueño del entrenador_id
create policy "entrenador_logros_select_publico"
  on entrenador_logros for select using (true);
create policy "entrenador_logros_mod_propio_o_admin"
  on entrenador_logros for all
  using (entrenador_id = auth.uid() or es_admin())
  with check (entrenador_id = auth.uid() or es_admin());

create policy "entrenador_redes_select_publico"
  on entrenador_redes_sociales for select using (true);
create policy "entrenador_redes_mod_propio_o_admin"
  on entrenador_redes_sociales for all
  using (entrenador_id = auth.uid() or es_admin())
  with check (entrenador_id = auth.uid() or es_admin());

create policy "entrenador_galeria_select_publico"
  on entrenador_galeria for select using (true);
create policy "entrenador_galeria_mod_propio_o_admin"
  on entrenador_galeria for all
  using (entrenador_id = auth.uid() or es_admin())
  with check (entrenador_id = auth.uid() or es_admin());

-- ------------------------------------------------------------------ alumnos --
-- Datos médicos/deportivos: visibles solo para el propio alumno, su
-- entrenador asignado, y el admin (no son públicos).
create policy "alumnos_select_propio_entrenador_o_admin"
  on alumnos for select
  using (
    auth.uid() = id
    or entrenador_id = auth.uid()
    or es_admin()
  );

create policy "alumnos_insert_propio"
  on alumnos for insert
  with check (auth.uid() = id);

-- El UPDATE se permite a nivel de fila para el propio alumno, su entrenador
-- asignado o el admin; qué columnas puede tocar cada uno lo aplica el
-- trigger `proteger_columnas_alumno` definido arriba.
create policy "alumnos_update_propio_entrenador_o_admin"
  on alumnos for update
  using (
    auth.uid() = id
    or entrenador_id = auth.uid()
    or es_admin()
  );

-- Requisito: el admin puede borrar perfiles de alumnos
create policy "alumnos_delete_admin"
  on alumnos for delete
  using (es_admin());

-- ------------------------------------------------- sesiones_entrenamiento --
create policy "sesiones_select_alumno_entrenador_o_admin"
  on sesiones_entrenamiento for select
  using (
    alumno_id = auth.uid()
    or entrenador_id = auth.uid()
    or es_admin()
  );

-- Las sesiones las registra el entrenador (o el admin); el alumno solo consulta
create policy "sesiones_insert_entrenador_o_admin"
  on sesiones_entrenamiento for insert
  with check (
    entrenador_id = auth.uid()
    or es_admin()
  );

create policy "sesiones_update_entrenador_o_admin"
  on sesiones_entrenamiento for update
  using (entrenador_id = auth.uid() or es_admin());

create policy "sesiones_delete_entrenador_o_admin"
  on sesiones_entrenamiento for delete
  using (entrenador_id = auth.uid() or es_admin());

-- ------------------------------------------------- tablas complementarias --
create policy "evaluaciones_select_alumno_entrenador_o_admin"
  on evaluaciones_habilidades for select
  using (alumno_id = auth.uid() or entrenador_id = auth.uid() or es_admin());
create policy "evaluaciones_mod_entrenador_o_admin"
  on evaluaciones_habilidades for all
  using (entrenador_id = auth.uid() or es_admin())
  with check (entrenador_id = auth.uid() or es_admin());

create policy "objetivos_select_propio_entrenador_o_admin"
  on objetivos_alumno for select
  using (
    alumno_id = auth.uid()
    or es_admin()
    or exists (select 1 from alumnos a where a.id = objetivos_alumno.alumno_id and a.entrenador_id = auth.uid())
  );
create policy "objetivos_mod_propio_entrenador_o_admin"
  on objetivos_alumno for all
  using (
    alumno_id = auth.uid()
    or es_admin()
    or exists (select 1 from alumnos a where a.id = objetivos_alumno.alumno_id and a.entrenador_id = auth.uid())
  )
  with check (
    alumno_id = auth.uid()
    or es_admin()
    or exists (select 1 from alumnos a where a.id = objetivos_alumno.alumno_id and a.entrenador_id = auth.uid())
  );

create policy "peleas_select_propio_entrenador_o_admin"
  on peleas for select
  using (
    alumno_id = auth.uid()
    or es_admin()
    or exists (select 1 from alumnos a where a.id = peleas.alumno_id and a.entrenador_id = auth.uid())
  );
create policy "peleas_mod_propio_entrenador_o_admin"
  on peleas for all
  using (
    alumno_id = auth.uid()
    or es_admin()
    or exists (select 1 from alumnos a where a.id = peleas.alumno_id and a.entrenador_id = auth.uid())
  )
  with check (
    alumno_id = auth.uid()
    or es_admin()
    or exists (select 1 from alumnos a where a.id = peleas.alumno_id and a.entrenador_id = auth.uid())
  );

-- Blog: público solo ve artículos aprobados; el autor ve/edita los suyos; admin todo
create policy "articulos_select_aprobados_o_propios_o_admin"
  on articulos_blog for select
  using (estado = 'aprobado' or autor_id = auth.uid() or es_admin());
create policy "articulos_insert_propio"
  on articulos_blog for insert
  with check (autor_id = auth.uid());
create policy "articulos_update_autor_o_admin"
  on articulos_blog for update
  using (autor_id = auth.uid() or es_admin());
create policy "articulos_delete_autor_o_admin"
  on articulos_blog for delete
  using (autor_id = auth.uid() or es_admin());

-- ============================================================================
-- TRIGGER: crear automáticamente la fila en `usuarios` al registrarse
-- (lee el rol y nombre desde los metadatos enviados por supabase.auth.signUp)
-- ============================================================================
create or replace function manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into usuarios (id, nombre, apellido, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    new.raw_user_meta_data->>'apellido',
    new.email,
    coalesce((new.raw_user_meta_data->>'rol')::rol_usuario, 'usuario')
  );
  return new;
end;
$$;

create trigger trg_nuevo_usuario
  after insert on auth.users
  for each row execute function manejar_nuevo_usuario();
