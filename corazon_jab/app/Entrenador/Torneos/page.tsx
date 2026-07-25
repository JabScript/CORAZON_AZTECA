'use client';

import styles from './Torneos.module.css';

const TORNEOS = [
  {
    nombre: 'Guantes de Oro Regional',
    fecha: '2026-08-22',
    sede: 'Arena Azteca',
    categorias: ['Mosca', 'Pluma', 'Ligero'],
    inscripcion: '2026-08-05',
  },
  {
    nombre: 'Copa Corazón Azteca',
    fecha: '2026-09-12',
    sede: 'Polideportivo Municipal',
    categorias: ['Todas las categorías'],
    inscripcion: '2026-08-28',
  },
  {
    nombre: 'Nacional Juvenil de Boxeo',
    fecha: '2026-10-03',
    sede: 'Centro de Convenciones',
    categorias: ['Ligero', 'Welter', 'Medio'],
    inscripcion: '2026-09-15',
  },
];

export default function TorneosEntrenador() {
  const ordenados = [...TORNEOS].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  return (
    <main className={styles.pagina}>
      <h1>Torneos que se acercan</h1>
      <p className={styles.subtitulo}>
        Fechas de competencia y cierre de inscripciones para preparar a tus alumnos a tiempo.
      </p>

      <div className={styles.lista}>
        {ordenados.map((t) => (
          <article key={t.nombre} className={styles.tarjeta}>
            <div className={styles.tarjetaCabecera}>
              <h3>{t.nombre}</h3>
              <span className={styles.fecha}>
                {new Date(t.fecha).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className={styles.sede}>{t.sede}</p>
            <div className={styles.categorias}>
              {t.categorias.map((c) => (
                <span key={c} className={styles.chip}>{c}</span>
              ))}
            </div>
            <p className={styles.inscripcion}>
              Cierre de inscripciones:{' '}
              {new Date(t.inscripcion).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
              })}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
