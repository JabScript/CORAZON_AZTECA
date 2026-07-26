// app/Entrenador/Objetivos/page.tsx
"use client";

import styles from "./Objetivos.module.css";

const objetivos = [
  {
    alumno: "Carlos 'El Rayo' Gutiérrez",
    metas: [
      { desc: "Bajar a 66 kg para pelea del 20 sep", tipo: "peso", progreso: 60, deadline: "20 sep 2025" },
      { desc: "Aumentar velocidad de jab a 92", tipo: "tecnica", progreso: 85, deadline: "Continuo" },
      { desc: "Ganar cinturón regional peso ligero", tipo: "carrera", progreso: 40, deadline: "Dic 2025" },
    ],
  },
  {
    alumno: "Ana Martínez",
    metas: [
      { desc: "Debut amateur en torneo estatal", tipo: "carrera", progreso: 75, deadline: "15 nov 2025" },
      { desc: "Mejorar resistencia a 85+", tipo: "fisico", progreso: 68, deadline: "3 meses" },
    ],
  },
  {
    alumno: "Diego Rivera",
    metas: [
      { desc: "Completar 30 sesiones", tipo: "compromiso", progreso: 47, deadline: "Continuo" },
      { desc: "Aprender los 6 golpes fundamentales", tipo: "tecnica", progreso: 100, deadline: "Completado" },
    ],
  },
];

const tipoColors: Record<string, string> = {
  peso: "#b7212a",
  tecnica: "#c9a13a",
  carrera: "#2f8c4f",
  fisico: "#c9a13a",
  compromiso: "#e6c565",
};

export default function ObjetivosPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Objetivos</h1>
          <p className={styles.subtitle}>Metas personalizadas para cada alumno con seguimiento en tiempo real.</p>
        </div>
        <button className={styles.newBtn}>+ Nueva Meta</button>
      </div>

      {/* Resumen */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>7</span>
          <span className={styles.summaryLabel}>Metas activas</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>2</span>
          <span className={styles.summaryLabel}>Completadas este mes</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>68%</span>
          <span className={styles.summaryLabel}>Progreso promedio</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValueRed}>1</span>
          <span className={styles.summaryLabel}>Con retraso</span>
        </div>
      </div>

      {/* Lista por alumno */}
      <div className={styles.grid}>
        {objetivos.map((o) => (
          <div key={o.alumno} className={styles.alumnoCard}>
            <h3 className={styles.alumnoName}>{o.alumno}</h3>
            <div className={styles.metasList}>
              {o.metas.map((m, i) => (
                <div key={i} className={styles.metaItem}>
                  <div className={styles.metaHeader}>
                    <span className={styles.metaTipo} style={{ background: tipoColors[m.tipo] + "22", color: tipoColors[m.tipo] }}>
                      {m.tipo.toUpperCase()}
                    </span>
                    <span className={styles.metaDeadline}>{m.deadline}</span>
                  </div>
                  <p className={styles.metaDesc}>{m.desc}</p>
                  <div className={styles.metaProgress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${m.progreso}%` }} />
                    </div>
                    <span className={styles.progressPercent}>{m.progreso}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
