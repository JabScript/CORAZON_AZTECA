'use client';

import styles from '../placeholder.module.css';

export default function Entrenamientos() {
  return (
    <main className={styles.pagina}>
      <span className={styles.icono}>🥊</span>
      <h1>Entrenamientos</h1>
      <p className={styles.descripcion}>
        Consulta tus entrenamientos programados, registra sesiones completadas y revisa las rutinas asignadas por tu entrenador.
      </p>
      <span className={styles.badge}>Próximamente</span>
    </main>
  );
}
