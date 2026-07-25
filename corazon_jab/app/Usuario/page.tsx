'use client';

import styles from './page.module.css';

/* Datos de ejemplo — en producción vendrían de una API/BD */
const USUARIO = {
  nombre: 'Carlos',
};

const PROXIMO_ENTRENAMIENTO = {
  nombre: 'Boxeo Avanzado',
  fecha: 'Hoy, 15 de Julio · 07:00 - 08:30',
  lugar: 'Gimnasio Tigre Boxing',
  entrenador: 'Ricardo Mendoza',
};

const STATS = [
  {
    icono: '🗓️',
    valor: '14',
    etiqueta: 'Entrenamientos este mes',
    extra: '+2 vs mes pasado',
    trend: 'up' as const,
  },
  {
    icono: '⚖️',
    valor: '68.5 kg',
    etiqueta: 'Peso Actual',
    extra: 'Objetivo: 66 kg',
    trend: 'neutral' as const,
  },
  {
    icono: '⏱️',
    valor: '28h',
    etiqueta: 'Horas Entrenadas',
    extra: 'Promedio 7h/semana',
    trend: 'up' as const,
  },
  {
    icono: '🔥',
    valor: '5 días',
    etiqueta: 'Racha Actual',
    extra: '¡En camino al récord!',
    trend: 'up' as const,
  },
];

const PROGRESO_SEMANAL = [
  { semana: 'Sem 1', horas: 6, intensidad: 5 },
  { semana: 'Sem 2', horas: 7, intensidad: 6 },
  { semana: 'Sem 3', horas: 8, intensidad: 7 },
  { semana: 'Sem 4', horas: 5, intensidad: 6 },
  { semana: 'Sem 5', horas: 7, intensidad: 8 },
  { semana: 'Sem 6', horas: 9, intensidad: 7 },
];

const ULTIMOS_ENTRENAMIENTOS = [
  {
    nombre: 'Boxeo Avanzado',
    duracion: '1h 30m',
    intensidad: 'Alta',
    fecha: '14 Jul',
    rating: '8/10',
  },
  {
    nombre: 'Sparring',
    duracion: '2h',
    intensidad: 'Muy Alta',
    fecha: '12 Jul',
    rating: '9/10',
  },
  {
    nombre: 'Preparación Física',
    duracion: '1h',
    intensidad: 'Media',
    fecha: '11 Jul',
    rating: '7/10',
  },
  {
    nombre: 'Técnica',
    duracion: '1h 15m',
    intensidad: 'Media',
    fecha: '09 Jul',
    rating: '8/10',
  },
];

export default function DashboardUsuario() {
  const maxHoras = Math.max(...PROGRESO_SEMANAL.map((s) => s.horas));

  return (
    <main className={styles.pagina}>
      {/* ---------- Header ---------- */}
      <div className={styles.header}>
        <div className={styles.saludo}>
          <h1>
            ¡A entrenar, <em>{USUARIO.nombre}</em>!
          </h1>
          <p className={styles.saludoSub}>Tu resumen de entrenamiento.</p>
        </div>

        <div className={styles.proximoCard}>
          <div className={styles.proximoLabel}>
            <span className={styles.proximoDot} />
            Próximo entrenamiento
          </div>
          <p className={styles.proximoNombre}>{PROXIMO_ENTRENAMIENTO.nombre}</p>
          <p className={styles.proximoFecha}>{PROXIMO_ENTRENAMIENTO.fecha}</p>
          <div className={styles.proximoDetalle}>
            <span>📍 {PROXIMO_ENTRENAMIENTO.lugar}</span>
            <span>👤 {PROXIMO_ENTRENAMIENTO.entrenador}</span>
          </div>
        </div>
      </div>

      {/* ---------- Stats ---------- */}
      <div className={styles.statsGrid}>
        {STATS.map((stat) => (
          <div key={stat.etiqueta} className={styles.statCard}>
            <span className={styles.statIcono}>{stat.icono}</span>
            <span className={styles.statValor}>{stat.valor}</span>
            <span className={styles.statEtiqueta}>{stat.etiqueta}</span>
            <span className={styles.statExtra}>{stat.extra}</span>
            <span
              className={`${styles.statTrend} ${
                stat.trend === 'up' ? styles.trendUp : styles.trendNeutral
              }`}
            >
              {stat.trend === 'up' ? '▲' : '●'}
            </span>
          </div>
        ))}
      </div>

      {/* ---------- Progreso semanal + Últimos entrenamientos ---------- */}
      <div className={styles.dosColumnas}>
        {/* Progreso semanal */}
        <section className={styles.seccion}>
          <h2>Progreso Semanal</h2>
          <div className={styles.chartWrap}>
            <div className={styles.barChart}>
              {PROGRESO_SEMANAL.map((s) => (
                <div key={s.semana} className={styles.barGroup}>
                  <div className={styles.bars}>
                    <div
                      className={styles.barHoras}
                      style={{ height: `${(s.horas / maxHoras) * 100}%` }}
                    />
                    <div
                      className={styles.barIntensidad}
                      style={{ height: `${(s.intensidad / 10) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barLabel}>{s.semana}</span>
                </div>
              ))}
            </div>
            <div className={styles.chartLeyenda}>
              <span className={styles.leyendaItem}>
                <span className={`${styles.leyendaDot} ${styles.dotRojo}`} />
                Horas
              </span>
              <span className={styles.leyendaItem}>
                <span className={`${styles.leyendaDot} ${styles.dotOro}`} />
                Intensidad
              </span>
            </div>
          </div>
        </section>

        {/* Últimos entrenamientos */}
        <section className={styles.seccion}>
          <h2>Últimos Entrenamientos</h2>
          <div className={styles.listaEntrenamientos}>
            {ULTIMOS_ENTRENAMIENTOS.map((e) => (
              <div key={e.nombre + e.fecha} className={styles.entrenamientoItem}>
                <div className={styles.entrenamientoInfo}>
                  <span className={styles.entrenamientoNombre}>{e.nombre}</span>
                  <span className={styles.entrenamientoMeta}>
                    ⏱ {e.duracion} · {e.intensidad}
                  </span>
                </div>
                <div className={styles.entrenamientoDerecha}>
                  <span className={styles.entrenamientoFecha}>{e.fecha}</span>
                  <span className={styles.entrenamientoRating}>★ {e.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
