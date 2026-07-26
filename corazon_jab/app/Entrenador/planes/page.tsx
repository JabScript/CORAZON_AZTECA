// app/Entrenador/Planes/page.tsx
"use client";

import { useState } from "react";
import styles from "./Planes.module.css";

const alumnos = [
  { id: 1, name: "Carlos 'El Rayo' Gutiérrez", level: "Profesional", weight: "68.5 kg", plan: "Camp Preparación", adherence: 92 },
  { id: 2, name: "Ana Martínez", level: "Amateur", weight: "58 kg", plan: "Base Técnica", adherence: 78 },
  { id: 3, name: "Diego Rivera", level: "Principiante", weight: "72 kg", plan: "Iniciación", adherence: 65 },
  { id: 4, name: "Sofía Hernández", level: "Amateur", weight: "55 kg", plan: "Acondicionamiento", adherence: 88 },
];

const planTemplates = [
  { name: "Iniciación (8 sem)", desc: "Base para principiantes: técnica, cardio y flexibilidad.", sessions: 3, focus: "Técnica base" },
  { name: "Acondicionamiento (12 sem)", desc: "Enfoque en resistencia, fuerza y explosividad.", sessions: 4, focus: "Físico" },
  { name: "Base Técnica (10 sem)", desc: "Perfeccionamiento de golpes, defensas y footwork.", sessions: 4, focus: "Técnico" },
  { name: "Camp Preparación (8 sem)", desc: "Preparación intensiva pre-pelea con sparring.", sessions: 6, focus: "Competencia" },
  { name: "Recuperación (4 sem)", desc: "Descarga post-pelea con trabajo regenerativo.", sessions: 2, focus: "Recuperación" },
];

export default function PlanesPage() {
  const [activeTab, setActiveTab] = useState<"asignados" | "biblioteca">("asignados");

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Planes de Entrenamiento</h1>
        <p className={styles.subtitle}>Diseña y asigna planes personalizados a cada alumno.</p>
        <button className={styles.newBtn}>+ Nuevo Plan</button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "asignados" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("asignados")}
        >
          Alumnos con Plan
        </button>
        <button
          className={`${styles.tab} ${activeTab === "biblioteca" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("biblioteca")}
        >
          Biblioteca de Plantillas
        </button>
      </div>

      {activeTab === "asignados" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ALUMNO</th>
                <th>NIVEL</th>
                <th>PESO</th>
                <th>PLAN ACTUAL</th>
                <th>ADHERENCIA</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id}>
                  <td className={styles.alumnoName}>{a.name}</td>
                  <td><span className={styles.levelBadge} data-level={a.level}>{a.level}</span></td>
                  <td>{a.weight}</td>
                  <td className={styles.planName}>{a.plan}</td>
                  <td>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${a.adherence}%` }} />
                      <span className={styles.progressText}>{a.adherence}%</span>
                    </div>
                  </td>
                  <td><button className={styles.actionBtn}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "biblioteca" && (
        <div className={styles.grid}>
          {planTemplates.map((t) => (
            <div key={t.name} className={styles.templateCard}>
              <span className={styles.focusTag}>{t.focus}</span>
              <h3 className={styles.templateName}>{t.name}</h3>
              <p className={styles.templateDesc}>{t.desc}</p>
              <div className={styles.templateMeta}>
                <span>◇ {t.sessions} sesiones/semana</span>
              </div>
              <button className={styles.assignBtn}>Asignar a alumno →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
