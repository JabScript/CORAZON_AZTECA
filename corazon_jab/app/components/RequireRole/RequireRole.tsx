// app/components/RequireRole/RequireRole.tsx
// Guarda de ruta: solo deja ver el contenido si hay una sesión activa con el
// rol permitido. Si no hay sesión, redirige a /login. Si hay sesión pero con
// un rol distinto, redirige al panel correspondiente a ese rol.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { haySesion, obtenerSesion, type Rol } from "../../lib/sesionStorage";
import { rutaPanel } from "../../lib/authStorage";
import styles from "./RequireRole.module.css";

interface RequireRoleProps {
  rolPermitido: Rol;
  children: React.ReactNode;
}

export default function RequireRole({ rolPermitido, children }: RequireRoleProps) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    if (!haySesion()) {
      router.replace(`/login?redirigido=${rolPermitido}`);
      return;
    }

    const sesion = obtenerSesion();
    if (sesion.rol !== rolPermitido) {
      router.replace(rutaPanel(sesion.rol));
      return;
    }

    setAutorizado(true);
    setVerificando(false);
  }, [router, rolPermitido]);

  if (verificando || !autorizado) {
    return (
      <div className={styles.cargando}>
        <span className={styles.spinner} aria-hidden />
        <p>Verificando sesión…</p>
      </div>
    );
  }

  return <>{children}</>;
}
