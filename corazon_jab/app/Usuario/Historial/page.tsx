'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerMisLogrosAprobados, type ArticuloBlog } from '../../lib/blogStorage';
import { useSesion } from '../../lib/auth/SessionProvider';
import styles from './Historial.module.css';

/* Datos de ejemplo — en producción vendrían de una API/BD */
const RECORD = {
  peleas: 8,
  victorias: 5,
  derrotas: 2,
  empates: 1,
  ko: 3,
  efectividad: '63%',
  rounds: 47,
  categorias: 2,
};

// Secuencia de resultados (cronológica de más reciente a más antigua)
const RESULTADOS_TIMELINE: ('V' | 'D' | 'E')[] = ['V', 'D', 'V', 'E', 'V', 'D', 'V', 'V'];

const PELEAS = [
  {
    fecha: '2024-02-03',
    lugar: 'Deportivo Plan Sexenal, CDMX',
    rival: 'vs Marco "El Halcón" Ruiz',
    resultado: 'V' as const,
    metodo: 'TKO 4R',
    categoria: 'Peso Ligero',
    peso: '64.5 kg',
  },
  {
    fecha: '2024-04-13',
    lugar: 'Centro de Convenciones, Toluca',
    rival: 'vs David "El Maestro" Ortega',
    resultado: 'V' as const,
    metodo: 'UD 6R',
    categoria: 'Peso Ligero',
    peso: '64.8 kg',
  },
  {
    fecha: '2024-07-20',
    lugar: 'Arena Ciudad de México',
    rival: 'vs Antonio "Rayo" Reyes',
    resultado: 'D' as const,
    metodo: 'SD 8R',
    categoria: 'Peso Ligero',
    peso: '65 kg',
  },
  {
    fecha: '2024-09-07',
    lugar: 'Palacio de los Deportes, CDMX',
    rival: 'vs Luis "El Toro" Contreras',
    resultado: 'V' as const,
    metodo: 'KO 2R',
    categoria: 'Peso Ligero',
    peso: '65.2 kg',
  },
  {
    fecha: '2024-11-16',
    lugar: 'Gimnasio Olímpico, Puebla',
    rival: 'vs Fernando "El Gallo" Silva',
    resultado: 'E' as const,
    metodo: 'MD 6R',
    categoria: 'Peso Ligero',
    peso: '64.8 kg',
  },
];

const PROXIMA_PELEA = {
  rival: 'vs Miguel "El Terremoto" Hernández',
  fecha: '2025-09-20',
  lugar: 'Arena México, CDMX',
  rounds: '8 rounds',
  categoria: 'Peso Welter Jr.',
};

export default function HistorialDeportivo() {
  const { sesion } = useSesion();
  const cuenta = sesion.estado === 'con_sesion' ? sesion.cuenta : null;
  const [logros, setLogros] = useState<ArticuloBlog[]>([]);

  useEffect(() => {
    if (!cuenta) return;
    obtenerMisLogrosAprobados(cuenta.id).then(setLogros).catch(() => setLogros([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuenta?.id]);

  return (
    <main className={styles.pagina}>
      {/* ---------- Header ---------- */}
      <header>
        <h1>Historial Deportivo</h1>
        <p className={styles.subtitulo}>Tu récord profesional, logros y trayectoria.</p>
      </header>

      {/* ---------- Récord Profesional ---------- */}
      <section className={styles.recordSeccion}>
        <h2>Récord Profesional</h2>
        <div className={styles.recordCard}>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{RECORD.peleas}</span>
              <span className={styles.statLabel}>Peleas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{RECORD.victorias}</span>
              <span className={styles.statLabel}>Victorias</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{RECORD.derrotas}</span>
              <span className={styles.statLabel}>Derrotas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{RECORD.empates}</span>
              <span className={styles.statLabel}>Empates</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{RECORD.ko}</span>
              <span className={styles.statLabel}>KO / TKO</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{RECORD.efectividad}</span>
              <span className={styles.statLabel}>Efectividad</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{RECORD.rounds}</span>
              <span className={styles.statLabel}>Rounds</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{RECORD.categorias}</span>
              <span className={styles.statLabel}>Categorías</span>
            </div>
          </div>

          {/* Timeline de resultados */}
          <div className={styles.timelineResultados}>
            {RESULTADOS_TIMELINE.map((r, idx) => (
              <span
                key={idx}
                className={`${styles.resultBadge} ${
                  r === 'V' ? styles.resultV : r === 'D' ? styles.resultD : styles.resultE
                }`}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Contenido: Cronología + Panel lateral ---------- */}
      <div className={styles.contenidoPrincipal}>
        {/* Cronología de Peleas */}
        <section className={styles.cronologia}>
          <h2>Cronología de Peleas</h2>
          <div className={styles.cronologiaLista}>
            {PELEAS.map((pelea, idx) => (
              <div key={idx} className={styles.peleaItem}>
                <span
                  className={`${styles.peleaDot} ${
                    pelea.resultado === 'V'
                      ? styles.dotVictoria
                      : pelea.resultado === 'D'
                      ? styles.dotDerrota
                      : styles.dotEmpate
                  }`}
                >
                  {pelea.resultado}
                </span>
                <p className={styles.peleaMeta}>
                  {pelea.fecha} · {pelea.lugar}
                </p>
                <p className={styles.peleaRival}>{pelea.rival}</p>
                <div className={styles.peleaTags}>
                  <span
                    className={`${styles.tagResultado} ${
                      pelea.resultado === 'V'
                        ? styles.tagVictoria
                        : pelea.resultado === 'D'
                        ? styles.tagDerrota
                        : styles.tagEmpate
                    }`}
                  >
                    {pelea.metodo}
                  </span>
                  <span className={styles.tagInfo}>{pelea.categoria}</span>
                  <span className={styles.tagInfo}>{pelea.peso}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Panel lateral */}
        <aside className={styles.panelLateral}>
          {/* Próxima pelea */}
          <div className={styles.proximaPelea}>
            <div className={styles.proximaLabel}>
              <span className={styles.proximaDot} />
              Próxima Pelea
            </div>
            <p className={styles.proximaRival}>{PROXIMA_PELEA.rival}</p>
            <p className={styles.proximaDetalle}>
              {PROXIMA_PELEA.fecha} · {PROXIMA_PELEA.lugar}
            </p>
            <div className={styles.proximaTags}>
              <span className={styles.proximaTag}>{PROXIMA_PELEA.rounds}</span>
              <span className={styles.proximaTagInfo}>{PROXIMA_PELEA.categoria}</span>
            </div>
          </div>

          {/* Logros */}
          <section className={styles.logros}>
            <div className={styles.logrosHeader}>
              <h2>Logros</h2>
              <Link href="/blog/escribir" className={styles.btnCompartirLogro}>
                + Compartir logro
              </Link>
            </div>

            {logros.length === 0 ? (
              <div className={styles.logrosVacio}>
                <p>Aún no tienes logros publicados.</p>
                <Link href="/blog/escribir" className={styles.logrosVacioLink}>
                  Comparte tu primer logro →
                </Link>
              </div>
            ) : (
              <div className={styles.logrosLista}>
                {logros.map((logro) => (
                  <div key={logro.id} className={styles.logroItem}>
                    <div className={styles.logroIcono}>{logro.icono ?? '🏆'}</div>
                    <div className={styles.logroInfo}>
                      <span className={styles.logroNombre}>{logro.titulo}</span>
                      <span className={styles.logroDesc}>{logro.extracto}</span>
                      <span className={styles.logroFecha}>
                        {new Date(logro.fechaEnvio).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
