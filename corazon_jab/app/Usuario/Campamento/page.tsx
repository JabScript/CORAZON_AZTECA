// app/usuario/campamento/page.tsx
"use client";

import styles from "./Campamento.module.css";

const fightInfo = {
  opponent: "Carlos 'El Tigre' Hernández",
  date: "2025-08-15",
  weight: "70 kg (Peso Welter)",
  rounds: 10,
};

const countdown = { days: 31, sessions: 12, sparrings: 4 };

const weekSchedule = [
  { day: "Lunes", am: "Cardio + Saco", pm: "Sparring" },
  { day: "Martes", am: "Preparación Física", pm: "Técnica" },
  { day: "Miércoles", am: "Descanso activo", pm: "Saco + Pads" },
  { day: "Jueves", am: "Cardio + Cuerda", pm: "Sparring" },
  { day: "Viernes", am: "Preparación Física", pm: "Técnica avanzada" },
  { day: "Sábado", am: "Sparring libre", pm: "—" },
  { day: "Domingo", am: "Descanso", pm: "Descanso" },
];

export default function CampamentoPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modo Campamento</h1>
        <p className={styles.subtitle}>Plan especial de preparación para tu próxima pelea.</p>
        <span className={styles.activeBadge}>● ACTIVO</span>
      </div>

      {/* Info de la pelea */}
      <div className={styles.fightCard}>
        <h2 className={styles.fightTitle}>Próxima Pelea</h2>
        <div className={styles.fightDetails}>
          <div><span className={styles.label}>Oponente:</span> {fightInfo.opponent}</div>
          <div><span className={styles.label}>Fecha:</span> {fightInfo.date}</div>
          <div><span className={styles.label}>Categoría:</span> {fightInfo.weight}</div>
          <div><span className={styles.label}>Rounds:</span> {fightInfo.rounds}</div>
        </div>
      </div>

      {/* Countdown */}
      <div className={styles.countdown}>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{countdown.days}</span>
          <span className={styles.countdownLabel}>Días restantes</span>
        </div>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{countdown.sessions}</span>
          <span className={styles.countdownLabel}>Sesiones planeadas</span>
        </div>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{countdown.sparrings}</span>
          <span className={styles.countdownLabel}>Sparrings programados</span>
        </div>
      </div>

      {/* Plan semanal */}
      <h2 className={styles.sectionTitle}>Plan Semanal</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DÍA</th>
              <th>MAÑANA</th>
              <th>TARDE</th>
            </tr>
          </thead>
          <tbody>
            {weekSchedule.map((row) => (
              <tr key={row.day}>
                <td className={styles.dayName}>{row.day}</td>
                <td>{row.am}</td>
                <td>{row.pm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
