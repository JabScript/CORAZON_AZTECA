// app/api/admin/cuentas/[id]/route.ts
// Endpoint_Eliminacion_Cuenta: elimina una Cuenta_Supabase (y su usuario de
// `auth.users`) usando `service_role`. Verifica primero, con la sesión del
// solicitante (clave pública, no service_role), que quien invoca es un
// admin aprobado. La `service_role` key nunca se expone al navegador: solo
// se usa aquí, en un Route Handler server-side.

import { NextResponse } from "next/server";
import { crearClienteSupabaseServidor } from "../../../../lib/supabase/server";
import { crearClienteSupabaseAdmin } from "../../../../lib/supabase/admin";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await crearClienteSupabaseServidor();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: cuenta } = await supabase
    .from("accounts")
    .select("rol, estado_cuenta")
    .eq("id", userData.user.id)
    .single();

  if (!cuenta || cuenta.rol !== "admin" || cuenta.estado_cuenta !== "aprobado") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const admin = crearClienteSupabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
