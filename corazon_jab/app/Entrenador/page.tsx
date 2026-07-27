// app/entrenador/page.tsx
"use client";

import styles from "./Dashboard.module.css";

import Image from "next/image";
import Link from "next/link";
import { obtenerSesion } from "../lib/sesionStorage";

export default function EntrenadorDashboard() {
  const sesion = obtenerSesion();

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
          <div><span className={styles.label}>Nombre:</span> Ricardo Mendoza</div>
          <div><span className={styles.label}>Especialidad:</span> Boxeo Profesional, Sparring</div>
          <div><span className={styles.label}>Experiencia:</span> 12 años</div>
          <div><span className={styles.label}>Certificaciones:</span> WBC Trainer Level 2</div>
          <div><span className={styles.label}>Gimnasio principal:</span> Triple Boxing CDMX</div>
          <div><span className={styles.label}>Contacto:</span> coach.mendoza@corazonazteca.com</div>
        </div>
      </div>
    </div>
  );
}
