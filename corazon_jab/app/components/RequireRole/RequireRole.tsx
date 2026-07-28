// app/components/RequireRole/RequireRole.tsx
// Guarda de ruta: solo deja ver el contenido si hay una sesión activa con el
// rol permitido (y, si es admin, con la cuenta aprobada). Si no hay sesión,
// redirige a /login. Si hay sesión pero con un rol distinto, o es admin
// pendiente de aprobación, redirige a la ruta que le corresponde.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSesion, type Rol } from "../../lib/auth/SessionProvider";
import { rutaDestino } from "../../lib/auth/rutaDestino";
import styles from "./RequireRole.module.css";

interface RequireRoleProps {
  rolPermitido: Rol;
  children: React.ReactNode;
}

function Verificando() {
  return (
    <div className={styles.cargando}>
      <span className={styles.spinner} aria-hidden />
      <p>Verificando sesión…</p>
    </div>
  );
}

export default function RequireRole({ rolPermitido, children }: RequireRoleProps) {
  const router = useRouter();
  const { sesion } = useSesion();

  const debeRedirigirALogin = sesion.estado === "sin_sesion";
  const debeRedirigirADestino =
    sesion.estado === "con_sesion" &&
    (sesion.cuenta.rol !== rolPermitido ||
      (sesion.cuenta.rol === "admin" && sesion.cuenta.estadoCuenta === "pendiente"));

  useEffect(() => {
    if (debeRedirigirALogin) {
      router.replace(`/login?redirigido=${rolPermitido}`);
      return;
    }
    if (sesion.estado === "con_sesion" && debeRedirigirADestino) {
      router.replace(rutaDestino(sesion.cuenta.rol, sesion.cuenta.estadoCuenta));
    }
  }, [debeRedirigirALogin, debeRedirigirADestino, router, rolPermitido, sesion]);

  if (sesion.estado === "cargando" || debeRedirigirALogin || debeRedirigirADestino) {
    return <Verificando />;
  }

  return <>{children}</>;
}
