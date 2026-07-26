// app/usuario/progreso/page.tsx
"use client";

import { useState } from "react";
import styles from "./Progreso.module.css";

const tabs = ["Horas", "Intensidad", "Peso", "Rendimiento"];

const weeklyData = [
  { label: "S1", hours: 6 },
  { label: "S2", hours: 6.5 },
  { label: "S3", hours: 7 },
  { label: "S4", hours: 6.5 },
  { label: "S5", hours: 7.5 },
  { label: "S6", hours: 8 },
  { label: "S7", hours: 7.5 },
  { label: "S8", hours: 5.5 },
  { label: "S9", hours: 7 },
  { label: "S10", hours: 8 },
  { label: "S11", hours: 7.5 },
  { label: "S12", hours: 8 },
];

const summaryStats = [
  { label: "Total Horas", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>, value: "88.0h", change: "+16%" },
  { label: "Intensidad Actual", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, value: "8.5/10", change: "+11%" },
  { label: "Velocidad", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>, value: "80", change: "+11%" },
  { label: "Potencia", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M5 8H4a4 4 0 0 0 0 8h1"/><line x1="6" y1="12" x2="18" y2="12"/></svg>, value: "78", change: "+15%" },
  { label: "Resistencia", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21C12 21 4 15 4 9.5C4 6.5 6.5 4 9 4c1.5 0 2.5.8 3 1.5C12.5 4.8 13.5 4 15 4c2.5 0 5 2.5 5 5.5C20 15 12 21 12 21z"/></svg>, value: "81", change: "+12%" },
];

const recentSessions = [
  { date: "2025-06-30", type: "Saco", duration: "60m", intensity: "7/10", fc: "138 bpm", rating: 7 },
  { date: "2025-07-01", type: "Boxeo Avanzado", duration: "90m", intensity: "8/10", fc: "150 bpm", rating: 9 },
  { date: "2025-07-02", type: "Preparación Física", duration: "90m", intensity: "8/10", fc: "160 bpm", rating: 8 },
  { date: "2025-07-04", type: "Técnica", duration: "90m", intensity: "7/10", fc: "120 bpm", rating: 8 },
  { date: "2025-07-05", type: "Defensa Personal", duration: "60m", intensity: "5/10", fc: "118 bpm", rating: 7 },
  { date: "2025-07-07", type: "Sparring", duration: "120m", intensity: "9/10", fc: "152 bpm", rating: 9 },
];

export default function ProgresoPage() {
  const [activeTab, setActiveTab] = useState("Horas");
  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Mi Progreso</h1>
        <p className={styles.subtitle}>Seguimiento detallado de tu evolución como boxeador.</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Gráfica de barras */}
      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Horas de Entrenamiento</h2>
        <p className={styles.chartSubtitle}>Evolución semanal de horas entrenadas (Últimas 12 semanas)</p>

        <div className={styles.chart}>
          {weeklyData.map((d, i) => (
            <div key={i} className={styles.bar}>
              <div
                className={styles.barFill}
                style={{ height: `${(d.hours / maxHours) * 100}%` }}
              />
              <span className={styles.barValue}>{d.hours}h</span>
              <span className={styles.barLabel}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen + Sesiones */}
      <div className={styles.bottomGrid}>
        {/* Resumen 12 semanas */}
        <div className={styles.summarySection}>
          <h3 className={styles.sectionTitle}>Resumen 12 Semanas</h3>
          <div className={styles.summaryList}>
            {summaryStats.map((stat) => (
              <div key={stat.label} className={styles.summaryItem}>
                <span className={styles.summaryIcon}>{stat.icon}</span>
                <span className={styles.summaryLabel}>{stat.label}</span>
                <span className={styles.summaryValue}>{stat.value}</span>
                <span className={styles.summaryChange}>{stat.change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas sesiones */}
        <div className={styles.sessionsSection}>
          <h3 className={styles.sectionTitle}>Últimas 12 Sesiones</h3>
          <table className={styles.sessionsTable}>
            <thead>
              <tr>
                <th>FECHA</th>
                <th>TIPO</th>
                <th>DUR.</th>
                <th>INT.</th>
                <th>FC</th>
                <th>RATING</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s, i) => (
                <tr key={i}>
                  <td>{s.date}</td>
                  <td><span className={styles.sessionType}>{s.type}</span></td>
                  <td>{s.duration}</td>
                  <td className={styles.intensityVal}>{s.intensity}</td>
                  <td>{s.fc}</td>
                  <td><span className={styles.ratingVal}>★ {s.rating}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
