'use client';

import styles from '../placeholder.module.css';

export default function ModoCampamento() {
  return (
    <main className={styles.pagina}>
      <span className={styles.icono}>⚡</span>
      <h1>Modo Campamento</h1>
      <p className={styles.descripcion}>
        Activa el modo campamento cuando te prepares para una pelea. Rutinas intensivas, dieta estricta y enfoque total en tu objetivo.
      </p>
      <span className={styles.badge}>Próximamente</span>
    </main>
  );
}
