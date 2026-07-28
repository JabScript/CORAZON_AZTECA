-- 00000000000002_sincronizar_perfil_entrenador.sql
-- RPC que sincroniza de forma atómica las colecciones hijas de un perfil
-- público de entrenador (logros, redes sociales, galería) dentro de una
-- única transacción SQL: si cualquier paso falla, Postgres revierte todo.
--
-- No introduce tablas nuevas; `perfiles_publicos_entrenador`,
-- `logros_entrenador`, `redes_sociales_entrenador` y `galeria_entrenador`
-- ya existen en la base remota (spec supabase-database-schema).
--
-- SECURITY INVOKER: se ejecuta con los permisos de quien invoca la RPC, por
-- lo que las políticas RLS de las tres tablas hijas siguen aplicando
-- (solo el dueño del perfil o un admin aprobado puede sincronizar).

create or replace function public.sincronizar_perfil_entrenador(
  p_perfil_id uuid,
  p_logros text[],
  p_redes jsonb,
  p_galeria jsonb
) returns void
language plpgsql
security invoker
as $$
begin
  delete from public.logros_entrenador where perfil_entrenador_id = p_perfil_id;
  if p_logros is not null and array_length(p_logros, 1) > 0 then
    insert into public.logros_entrenador (perfil_entrenador_id, descripcion)
      select p_perfil_id, unnest(p_logros);
  end if;

  delete from public.redes_sociales_entrenador where perfil_entrenador_id = p_perfil_id;
  if p_redes is not null and jsonb_array_length(p_redes) > 0 then
    insert into public.redes_sociales_entrenador (perfil_entrenador_id, red, usuario, url)
      select p_perfil_id, r->>'nombre', r->>'usuario', r->>'url'
      from jsonb_array_elements(p_redes) as r;
  end if;

  delete from public.galeria_entrenador where perfil_entrenador_id = p_perfil_id;
  if p_galeria is not null and jsonb_array_length(p_galeria) > 0 then
    insert into public.galeria_entrenador (perfil_entrenador_id, imagen_ref, texto_alternativo)
      select p_perfil_id, g->>'imagenRef', coalesce(g->>'alt', '')
      from jsonb_array_elements(p_galeria) as g;
  end if;
end;
$$;
