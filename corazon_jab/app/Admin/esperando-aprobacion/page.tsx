// app/Admin/esperando-aprobacion/page.tsx
// Pantalla_Espera_Aprobacion: se muestra a un administrador autenticado
// cuya Cuenta_Supabase tiene estado_cuenta = 'pendiente'.
"use client";

import { useRouter } from "next/navigation";
import { useSesion } from "../../lib/auth/SessionProvider";
import styles from "./EsperandoAprobacion.module.css";

export default function EsperandoAprobacionPage() {
  const router = useRouter();
  const { cerrarSesion } = useSesion();

  const handleLogout = async () => {
    await cerrarSesion();
    router.push("/login");
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={styles.icon}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
        <h1 className={styles.title}>Solicitud en revisión</h1>
        <p className={styles.text}>
          Tu cuenta de administrador está pendiente de aprobación. Un administrador
          ya aprobado debe autorizar tu acceso antes de que puedas usar el panel de Admin.
          Vuelve a intentarlo más tarde o contacta al equipo.
        </p>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
