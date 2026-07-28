"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { crearClienteSupabaseNavegador } from "../supabase/client";

export type Rol = "admin" | "entrenador" | "usuario";

export interface CuentaSesion {
  id: string; // UUID = accounts.id = auth.users.id
  nombre: string;
  rol: Rol;
  estadoCuenta: "pendiente" | "aprobado";
  fotoRef: string | null;
}

export type EstadoSesion =
  | { estado: "cargando" }
  | { estado: "sin_sesion" }
  | { estado: "con_sesion"; cuenta: CuentaSesion };

interface SesionContextValue {
  sesion: EstadoSesion;
  cerrarSesion: () => Promise<void>;
}

const SesionContext = createContext<SesionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<EstadoSesion>({ estado: "cargando" });
  const supabase = useRef(crearClienteSupabaseNavegador()).current;
  const cerrarSesionPendiente = useRef(false);
  const montado = useRef(false);

  async function resolverCuenta(userId: string): Promise<CuentaSesion | null> {
    const { data } = await supabase
      .from("accounts")
      .select("id, nombre, rol, estado_cuenta, foto_ref")
      .eq("id", userId)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      nombre: data.nombre,
      rol: data.rol,
      estadoCuenta: data.estado_cuenta,
      fotoRef: data.foto_ref,
    };
  }

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return;
      if (!data.session) {
        setSesion({ estado: "sin_sesion" });
      } else {
        const cuenta = await resolverCuenta(data.session.user.id);
        setSesion(cuenta ? { estado: "con_sesion", cuenta } : { estado: "sin_sesion" });
      }
      montado.current = true;
      if (cerrarSesionPendiente.current) {
        cerrarSesionPendiente.current = false;
        void supabase.auth.signOut();
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evento, session) => {
      if (!activo) return;
      if (!session) {
        setSesion({ estado: "sin_sesion" });
        return;
      }
      const cuenta = await resolverCuenta(session.user.id);
      setSesion(cuenta ? { estado: "con_sesion", cuenta } : { estado: "sin_sesion" });
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function cerrarSesion() {
    if (!montado.current) {
      cerrarSesionPendiente.current = true;
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <SesionContext.Provider value={{ sesion, cerrarSesion }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion(): SesionContextValue {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error("useSesion debe usarse dentro de <SessionProvider>");
  return ctx;
}
