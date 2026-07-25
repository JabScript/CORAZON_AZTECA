'use client';

import Link from 'next/link';
import styles from './Admin.module.css';

export default function AdminPanel() {
  return (
    <main className={styles.pagina}>
      <h1>Panel de Administración</h1>
      <p className={styles.subtitulo}>
        Gestión general de la plataforma Corazón Azteca.
      </p>

      <div className={styles.grid}>
        <Link href="/Admin/Directorio" className={styles.card}>
          <span className={styles.cardIcono}>📋</span>
          <h2>Directorio de Usuarios</h2>
          <p>Ver y gestionar todos los boxeadores registrados en la plataforma.</p>
        </Link>
      </div>
    </main>
  );
}
