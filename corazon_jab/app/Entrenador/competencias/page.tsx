// app/Entrenador/Competencias/page.tsx
"use client";

import { useState } from "react";
import styles from "./Competencias.module.css";

const peleas = [
  { fecha: "20 Sep 2025", alumno: "Carlos 'El Rayo' Gutiérrez", rival: "Miguel Hernández", categoria: "Peso Ligero", lugar: "Arena México, CDMX", estado: "Programada" },
  { fecha: "15 Nov 2025", alumno: "Ana Martínez", rival: "Laura Ramos", categoria: "Amateur - Peso Mosca", lugar: "Deportivo Plan Sexenal", estado: "Programada" },
  { fecha: "12 Jul 2025", alumno: "Carlos 'El Rayo' Gutiérrez", rival: "David Ortega", categoria: "Peso Ligero", lugar: "Toluca", estado: "Ganada · UD 6R" },
  { fecha: "08 Jun 2025", alumno: "Diego Rivera", rival: "Pedro López", categoria: "Amateur - Peso Welter", lugar: "Puebla", estado: "Perdida · SD 3R" },
];

const torneos = [
  { nombre: "Guantes de Oro CDMX 2025", fecha: "Nov 15-25 2025", categorias: "Amateur, Mosca a Welter", participantes: ["Ana Martínez", "Diego Rivera"], estado: "Inscritos" },
  { nombre: "Copa Nacional Amateur", fecha: "Ene 10-20 2026", categorias: "Amateur, todas las categorías", participantes: ["Ana Martínez"], estado: "Pre-inscripción" },
  { nombre: "Torneo Regional Bajío", fecha: "Mar 5-15 2025", categorias: "Amateur", participantes: ["Diego Rivera"], estado: "Completado · Bronce" },
];

export default function CompetenciasPage() {
  const [activeTab, setActiveTab] = useState<"peleas" | "torneos">("peleas");

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Competencias</h1>
          <p className={styles.subtitle}>Peleas y torneos de tus alumnos — programados, en curso y completados.</p>
        </div>
        <button className={styles.newBtn}>+ Nueva Competencia</button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>2</span>
          <span className={styles.statLabel}>Peleas próximas</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>2</span>
          <span className={styles.statLabel}>Torneos activos</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>8</span>
          <span className={styles.statLabel}>Peleas ganadas</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>1</span>
          <span className={styles.statLabel}>Medallas 2025</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "peleas" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("peleas")}
        >
          Peleas
        </button>
        <button
          className={`${styles.tab} ${activeTab === "torneos" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("torneos")}
        >
          Torneos
        </button>
      </div>

      {activeTab === "peleas" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>FECHA</th>
                <th>ALUMNO</th>
                <th>RIVAL</th>
                <th>CATEGORÍA</th>
                <th>LUGAR</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {peleas.map((p, i) => (
                <tr key={i}>
                  <td>{p.fecha}</td>
                  <td className={styles.alumno}>{p.alumno}</td>
                  <td>{p.rival}</td>
                  <td>{p.categoria}</td>
                  <td>{p.lugar}</td>
                  <td>
                    <span
                      className={styles.estado}
                      data-estado={p.estado.split(" ")[0]}
                    >
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "torneos" && (
        <div className={styles.torneosGrid}>
          {torneos.map((t) => (
            <div key={t.nombre} className={styles.torneoCard}>
              <div className={styles.torneoHeader}>
                <h3 className={styles.torneoNombre}>{t.nombre}</h3>
                <span
                  className={styles.torneoEstado}
                  data-estado={t.estado.split(" ")[0]}
                >
                  {t.estado}
                </span>
              </div>
              <div className={styles.torneoInfo}>
                <span><strong>Fecha:</strong> {t.fecha}</span>
                <span><strong>Categorías:</strong> {t.categorias}</span>
              </div>
              <div className={styles.participantes}>
                <span className={styles.participantesLabel}>Mis alumnos inscritos:</span>
                <div className={styles.participantesList}>
                  {t.participantes.map((p) => (
                    <span key={p} className={styles.participanteChip}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
