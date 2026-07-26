// app/usuario/entrenamientos/page.tsx
"use client";

import { useState } from "react";
import styles from "./Entrenamientos.module.css";

const types = ["Todos los tipos", "Sparring", "Técnica", "Preparación Física", "Saco", "Boxeo Avanzado", "Cardio Box", "Defensa Personal"];

const trainings = [
  { date: "2025-07-15", type: "Sparring", duration: "2h", intensity: "9/10", trainer: "Ricardo Mendoza", rating: 9, notes: "Excelente trabajo de esquivas y contraataques..." },
  { date: "2025-07-14", type: "Técnica", duration: "1h 30m", intensity: "7/10", trainer: "Ricardo Mendoza", rating: 8, notes: "Enfoque en jab y footwork lateral. Mucha repe..." },
  { date: "2025-07-12", type: "Preparación Física", duration: "1h 15m", intensity: "8/10", trainer: "Diego Ramírez", rating: 7, notes: "Circuito de barras, cuerdas, saltos, abdominal..." },
  { date: "2025-07-11", type: "Saco", duration: "1h", intensity: "7/10", trainer: "Ricardo Mendoza", rating: 8, notes: "8 rounds al saco pesado. Trabajo de potencia ..." },
  { date: "2025-07-09", type: "Boxeo Avanzado", duration: "1h 30m", intensity: "8/10", trainer: "Ricardo Mendoza", rating: 9, notes: "Clase grupal avanzada. Combinaciones largas..." },
  { date: "2025-07-08", type: "Cardio Box", duration: "0h 45m", intensity: "6/10", trainer: "Lucía Fernández", rating: 6, notes: "Cardio ligero de recuperación activa. Drainee..." },
  { date: "2025-07-07", type: "Sparring", duration: "2h", intensity: "9/10", trainer: "Ricardo Mendoza", rating: 9, notes: "Sparring intenso con cambio de compañeros..." },
  { date: "2025-07-05", type: "Defensa Personal", duration: "1h", intensity: "5/10", trainer: "Diego Ramírez", rating: 7, notes: "Técnicas de clinch y salida de cuerdas. Traba..." },
  { date: "2025-07-04", type: "Técnica", duration: "1h 30m", intensity: "7/10", trainer: "Ricardo Mendoza", rating: 8, notes: "Perfeccionamiento de uppercut y gancho. Mi..." },
];

export default function EntrenamientosPage() {
  const [activeType, setActiveType] = useState("Todos los tipos");

  const filtered = activeType === "Todos los tipos"
    ? trainings
    : trainings.filter((t) => t.type === activeType);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Entrenamientos</h1>
          <p className={styles.subtitle}>Registra y consulta tu historial de entrenamiento.</p>
        </div>
        <button className={styles.registerBtn}>+ Registrar Entrenamiento</button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 4v2"/><path d="M16 4v2"/></svg></span>
          <span className={styles.statValue}>18</span>
          <span className={styles.statLabel}>Sesiones Totales</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span>
          <span className={styles.statValue}>23.8h</span>
          <span className={styles.statLabel}>Horas Totales</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
          <span className={styles.statValue}>7/10</span>
          <span className={styles.statLabel}>Intensidad Promedio</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9"/></svg></span>
          <span className={styles.statValue}>9/10</span>
          <span className={styles.statLabel}>Mejor Rating</span>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <span className={styles.filterLabel}>Filtro:</span>
        {types.map((type) => (
          <button
            key={type}
            className={`${styles.filterBtn} ${activeType === type ? styles.filterBtnActive : ""}`}
            onClick={() => setActiveType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>FECHA</th>
              <th>TIPO</th>
              <th>DURACIÓN</th>
              <th>INTENS.</th>
              <th>ENTRENADOR</th>
              <th>RATING</th>
              <th>NOTAS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i}>
                <td>{t.date}</td>
                <td><span className={styles.typeBadge} data-type={t.type}>{t.type}</span></td>
                <td>{t.duration}</td>
                <td><span className={styles.intensity}>{t.intensity}</span></td>
                <td>{t.trainer}</td>
                <td><span className={styles.rating}>★ {t.rating}</span></td>
                <td className={styles.notes}>{t.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
