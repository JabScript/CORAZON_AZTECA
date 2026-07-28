// app/entrenador/page.tsx
"use client";

import styles from "./Dashboard.module.css";

import Image from "next/image";
import Link from "next/link";
import { obtenerSesion } from "../lib/sesionStorage";
import { obtenerPerfil } from "../lib/entrenadorStorage";
import { useAsyncData } from "../lib/async/useAsyncData";
import DashboardSkeleton from "../lib/async/DashboardSkeleton";
import ErrorState from "../lib/async/ErrorState";

export default function EntrenadorDashboard() {
  const sesion = obtenerSesion();

  const {
    status: estadoPerfil,
    data: perfil,
    error: errorPerfil,
    refetch: refetchPerfil,
  } = useAsyncData(() => Promise.resolve(obtenerPerfil()), [sesion.usuarioId]);

  if (estadoPerfil === "loading" || estadoPerfil === "idle") {
    return <DashboardSkeleton count={4} variant="card" />;
  }
  if (estadoPerfil === "error") {
    return (
      <ErrorState
        message={errorPerfil ?? "No se pudo cargar tu información."}
        onRetry={refetchPerfil}
      />
    );
  }
  if (!perfil) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.headerUserRow}>
          <div className={styles.headerAvatar}>
            {sesion.foto ? (
              <Image src={sesion.foto} alt={sesion.nombre} width={64} height={64} className={styles.headerAvatarImg} unoptimized />
            ) : (
              sesion.nombre.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className={styles.title}>Mi Perfil</h1>
            <p className={styles.subtitle}>Panel de entrenador — gestiona tus clases, alumnos y planes.</p>
          </div>
        </div>
        <Link href="/Entrenador/Perfil" className={styles.editBtn}>
          Editar Perfil
        </Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardValue}>24</span>
          <span className={styles.cardLabel}>Alumnos activos</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>12</span>
          <span className={styles.cardLabel}>Clases esta semana</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>3</span>
          <span className={styles.cardLabel}>Gimnasios</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>2</span>
          <span className={styles.cardLabel}>Competencias próximas</span>
        </div>
      </div>

      <div className={styles.info}>
        <h2 className={styles.sectionTitle}>Información del Entrenador</h2>
        <div className={styles.infoGrid}>
          <div><span className={styles.label}>Nombre:</span> {perfil.nombre}</div>
          <div><span className={styles.label}>Especialidad:</span> {perfil.especialidad}</div>
          <div><span className={styles.label}>Experiencia:</span> {perfil.anosTrayectoria} años</div>
          <div><span className={styles.label}>Certificaciones:</span> {perfil.logros[0] ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}
