// app/usuario/page.tsx (Dashboard)
"use client";

import styles from "./Dashboard.module.css";

const stats = [
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 4v2"/><path d="M16 4v2"/></svg>, value: "14", label: "Entrenamientos este mes", sub: "+2 vs mes pasado", trend: "up" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18"/><path d="M8 7h8"/><circle cx="12" cy="12" r="3"/><path d="M5 21h14"/></svg>, value: "68.5 kg", label: "Peso Actual", sub: "Objetivo: 66 kg", trend: "up" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>, value: "28h", label: "Horas Entrenadas", sub: "Promedio: 7h/sem", trend: "up" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, value: "5 días", label: "Racha Actual", sub: "+1 vs semana pasada", trend: "up" },
];

const weeklyProgress = [
  { label: "Sem 1", hours: 5, intensity: 6 },
  { label: "Sem 2", hours: 6, intensity: 7 },
  { label: "Sem 3", hours: 4, intensity: 8 },
  { label: "Sem 4", hours: 7, intensity: 6 },
  { label: "Sem 5", hours: 6, intensity: 7 },
  { label: "Sem 6", hours: 5, intensity: 5 },
];

const recentTrainings = [
  { type: "Boxeo Avanzado", duration: "1h 30m", intensity: "Alta", date: "14 Jul", rating: 9 },
  { type: "Sparring", duration: "2h", intensity: "Muy Alta", date: "13 Jul", rating: 8 },
  { type: "Preparación Física", duration: "1h", intensity: "Media", date: "11 Jul", rating: 8 },
  { type: "Técnica", duration: "1h 45m", intensity: "Alta", date: "09 Jul", rating: 8 },
];

export default function DashboardPage() {
  const maxVal = Math.max(...weeklyProgress.map(w => Math.max(w.hours, w.intensity)));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>¡A entrenar, <em>Carlos</em>!</h1>
          <p className={styles.subtitle}>Tu resumen de entrenamiento.</p>
        </div>
        <div className={styles.nextTraining}>
          <span className={styles.nextLabel}>▲ PRÓXIMO ENTRENAMIENTO</span>
          <h3 className={styles.nextTitle}>Boxeo Avanzado</h3>
          <p className={styles.nextTime}>Hoy, 15 de Julio · 07:00 - 08:30</p>
          <div className={styles.nextDetails}>
            <span>◇ Gimnasio Triple Boxing</span>
            <span>◇ Ricardo Mendoza</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statTrend}>▲</span>
            </div>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statSub}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className={styles.bottomGrid}>
        {/* Progreso semanal */}
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Progreso Semanal</h2>
          <div className={styles.chart}>
            {weeklyProgress.map((w, i) => (
              <div key={i} className={styles.barGroup}>
                <div className={styles.bars}>
                  <div className={styles.barHours} style={{ height: `${(w.hours / maxVal) * 100}%` }} />
                  <div className={styles.barIntensity} style={{ height: `${(w.intensity / maxVal) * 100}%` }} />
                </div>
                <span className={styles.barLabel}>{w.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={styles.legendDotHours} /> Horas</span>
            <span className={styles.legendItem}><span className={styles.legendDotIntensity} /> Intensidad</span>
          </div>
        </div>

        {/* Últimos entrenamientos */}
        <div className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Últimos Entrenamientos</h2>
          <div className={styles.recentList}>
            {recentTrainings.map((t, i) => (
              <div key={i} className={styles.recentItem}>
                <div className={styles.recentInfo}>
                  <span className={styles.recentType}>{t.type}</span>
                  <span className={styles.recentMeta}>⏱ {t.duration} · {t.intensity}</span>
                </div>
                <div className={styles.recentRight}>
                  <span className={styles.recentDate}>{t.date}</span>
                  <span className={styles.recentRating}>★ {t.rating}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usuario footer */}
      <div className={styles.userBar}>
        <div className={styles.userAvatar}>CG</div>
        <span className={styles.userName}>Carlos &quot;El Rayo&quot; Gut...</span>
      </div>
    </div>
  );
}
