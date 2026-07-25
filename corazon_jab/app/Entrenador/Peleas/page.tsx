'use client';

import styles from './Peleas.module.css';

const PELEAS = [
  { alumno: 'Iker Domínguez', rival: 'C. Reyna (Gimnasio Rival Norte)', fecha: '2026-08-02', lugar: 'Arena Azteca, Ring 1', categoria: 'Ligero' },
  { alumno: 'Camila Vega', rival: 'D. Franco (Box Imperial)', fecha: '2026-08-09', lugar: 'Auditorio Municipal', categoria: 'Mosca' },
  { alumno: 'Mariana Solís', rival: 'L. Osorio (Guantes de Fuego)', fecha: '2026-08-16', lugar: 'Arena Azteca, Ring 2', categoria: 'Pluma' },
  { alumno: 'Santiago Rúa', rival: 'P. Cano (Club Halcones)', fecha: '2026-09-01', lugar: 'Gimnasio Municipal Sur', categoria: 'Ligero' },
];

function diasRestantes(fechaISO: string) {
  const hoy = new Date();
  const fecha = new Date(fechaISO);
  const dias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  return dias;
}

export default function PeleasEntrenador() {
  const ordenadas = [...PELEAS].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  return (
    <main className={styles.pagina}>
      <h1>Peleas cercanas de tus alumnos</h1>
      <p className={styles.subtitulo}>
        Combates confirmados, ordenados por fecha más próxima.
      </p>

      <div className={styles.lista}>
        {ordenadas.map((p) => {
          const dias = diasRestantes(p.fecha);
          return (
            <article key={`${p.alumno}-${p.fecha}`} className={styles.tarjeta}>
              <div className={styles.fechaBloque}>
                <span className={styles.dias}>{dias >= 0 ? `${dias} días` : 'Realizada'}</span>
                <span className={styles.fecha}>
                  {new Date(p.fecha).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className={styles.info}>
                <h3>{p.alumno}</h3>
                <p className={styles.rival}>vs. {p.rival}</p>
                <p className={styles.lugar}>{p.lugar}</p>
                <span className={styles.categoria}>{p.categoria}</span>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
