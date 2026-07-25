'use client';

import styles from '../placeholder.module.css';

export default function Mensajeria() {
  return (
    <main className={styles.pagina}>
      <span className={styles.icono}>💬</span>
      <h1>Mensajería</h1>
      <p className={styles.descripcion}>
        Comunícate con tu entrenador, compañeros de gimnasio y recibe notificaciones sobre tus eventos y peleas.
      </p>
      <span className={styles.badge}>Próximamente</span>
    </main>
  );
}
