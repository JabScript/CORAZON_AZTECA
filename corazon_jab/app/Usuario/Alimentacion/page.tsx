'use client';

import styles from '../placeholder.module.css';

export default function Alimentacion() {
  return (
    <main className={styles.pagina}>
      <span className={styles.icono}>🍎</span>
      <h1>Alimentación</h1>
      <p className={styles.descripcion}>
        Planes de alimentación personalizados, seguimiento de macros y recomendaciones nutricionales para alcanzar tu peso objetivo.
      </p>
      <span className={styles.badge}>Próximamente</span>
    </main>
  );
}
