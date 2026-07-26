// app/Entrenador/Evaluaciones/page.tsx
"use client";

import { useState } from "react";
import styles from "./Evaluaciones.module.css";

const alumnos = ["Carlos 'El Rayo' Gutiérrez", "Ana Martínez", "Diego Rivera", "Sofía Hernández"];

const evaluations = [
  { alumno: "Carlos 'El Rayo' Gutiérrez", tipo: "Físico completo", fecha: "12 Jul 2025", velocidad: 88, potencia: 92, resistencia: 85, tecnica: 90, defensa: 82, ring: 87 },
  { alumno: "Ana Martínez", tipo: "Técnico", fecha: "10 Jul 2025", velocidad: 75, potencia: 70, resistencia: 78, tecnica: 82, defensa: 76, ring: 72 },
  { alumno: "Diego Rivera", tipo: "Inicial", fecha: "08 Jul 2025", velocidad: 55, potencia: 60, resistencia: 65, tecnica: 50, defensa: 45, ring: 40 },
];

const categorias = [
  { label: "Velocidad", key: "velocidad" },
  { label: "Potencia", key: "potencia" },
  { label: "Resistencia", key: "resistencia" },
  { label: "Técnica", key: "tecnica" },
  { label: "Defensa", key: "defensa" },
  { label: "Ring IQ", key: "ring" },
];

export default function EvaluacionesPage() {
  const [selectedAlumno, setSelectedAlumno] = useState(alumnos[0]);
  const currentEval = evaluations.find(e => e.alumno === selectedAlumno);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Evaluaciones</h1>
          <p className={styles.subtitle}>Tests físicos y técnicos para medir el progreso real.</p>
        </div>
        <button className={styles.newBtn}>+ Nueva Evaluación</button>
      </div>

      {/* Selector alumno */}
      <div className={styles.alumnoTabs}>
        {alumnos.map((a) => (
          <button
            key={a}
            className={`${styles.alumnoTab} ${selectedAlumno === a ? styles.alumnoTabActive : ""}`}
            onClick={() => setSelectedAlumno(a)}
          >
            {a.split(" ")[0]}
          </button>
        ))}
      </div>

      {currentEval && (
        <>
          {/* Radar chart de habilidades */}
          <div className={styles.grid}>
            <div className={styles.radarSection}>
              <h2 className={styles.sectionTitle}>Perfil de Habilidades</h2>
              <div className={styles.radarBars}>
                {categorias.map((cat) => {
                  const value = currentEval[cat.key as keyof typeof currentEval] as number;
                  return (
                    <div key={cat.key} className={styles.barRow}>
                      <span className={styles.barLabel}>{cat.label}</span>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${value}%` }} />
                      </div>
                      <span className={styles.barValue}>{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.evalMeta}>
              <h2 className={styles.sectionTitle}>Última Evaluación</h2>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tipo:</span>
                <span className={styles.metaValue}>{currentEval.tipo}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Fecha:</span>
                <span className={styles.metaValue}>{currentEval.fecha}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Promedio:</span>
                <span className={styles.metaValueGold}>
                  {Math.round(categorias.reduce((sum, cat) => sum + (currentEval[cat.key as keyof typeof currentEval] as number), 0) / categorias.length)}/100
                </span>
              </div>
              <div className={styles.recommendations}>
                <h3 className={styles.recTitle}>◇ Áreas a mejorar</h3>
                <ul className={styles.recList}>
                  <li>Trabajar la resistencia con circuitos HIIT</li>
                  <li>Sesiones extra de defensa (bloqueo/rolling)</li>
                  <li>Sparring técnico 2x/semana</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
