'use client';

import styles from '../placeholder.module.css';

export default function MiProgreso() {
  return (
    <main className={styles.pagina}>
      <span className={styles.icono}>📈</span>
      <h1>Mi Progreso</h1>
      <p className={styles.descripcion}>
        Visualiza tu progreso con gráficas de rendimiento, peso, resistencia y fuerza. Compara tu evolución semana a semana.
      </p>
      <span className={styles.badge}>Próximamente</span>
    </main>
  );
}
