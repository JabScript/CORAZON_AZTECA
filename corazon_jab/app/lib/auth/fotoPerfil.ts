import { crearClienteSupabaseNavegador } from "../supabase/client";

export async function subirFotoPerfil(cuentaId: string, archivo: File): Promise<string> {
  const supabase = crearClienteSupabaseNavegador();
  const extension = archivo.name.split(".").pop() ?? "jpg";
  const ruta = `${cuentaId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("avatars").upload(ruta, archivo, {
    upsert: true,
  });
  if (error) throw error;

  await supabase.from("accounts").update({ foto_ref: ruta }).eq("id", cuentaId);
  return ruta;
}

/** Dado un foto_ref (o null), retorna la URL pública a renderizar, o null si no hay foto. */
export function resolverUrlFoto(fotoRef: string | null): string | null {
  if (!fotoRef) return null;
  const supabase = crearClienteSupabaseNavegador();
  return supabase.storage.from("avatars").getPublicUrl(fotoRef).data.publicUrl;
}
