// app/Entrenador/Analisis/page.tsx
"use client";

import styles from "./Analisis.module.css";

const insights = [
  {
    tipo: "riesgo",
    prioridad: "alta",
    alumno: "Carlos 'El Rayo' Gutiérrez",
    titulo: "Riesgo de sobreentrenamiento detectado",
    desc: "La intensidad de los últimos 10 días supera 8/10 sin descarga. Recomiendo día activo de recuperación.",
    accion: "Programar descanso",
  },
  {
    tipo: "oportunidad",
    prioridad: "media",
    alumno: "Ana Martínez",
    titulo: "Lista para subir de nivel",
    desc: "Adherencia del 92% y evaluación técnica >80. Considera avanzar a plan intermedio.",
    accion: "Ver plan sugerido",
  },
  {
    tipo: "prediccion",
    prioridad: "media",
    alumno: "Diego Rivera",
    titulo: "Predicción de deserción",
    desc: "Asistencia bajó 30% en 2 semanas. Alto riesgo de abandono (72% probabilidad).",
    accion: "Enviar mensaje motivacional",
  },
];

const sparringMatches = [
  { a: "Carlos G.", b: "Miguel R.", peso: "68 vs 69 kg", nivel: "Similar", match: 94 },
  { a: "Ana M.", b: "Laura P.", peso: "58 vs 57 kg", nivel: "Ana +1", match: 87 },
  { a: "Diego R.", b: "Pablo T.", peso: "72 vs 70 kg", nivel: "Similar", match: 82 },
];

const trends = [
  { label: "Alumnos activos", value: "+12%", positive: true },
  { label: "Adherencia global", value: "+8%", positive: true },
  { label: "Lesiones reportadas", value: "-2", positive: true },
  { label: "Peso promedio grupo", value: "-1.2 kg", positive: true },
];

export default function AnalisisPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>◇ POWERED BY AI</span>
          <h1 className={styles.title}>Análisis Inteligente</h1>
          <p className={styles.subtitle}>Insights automáticos, predicciones y recomendaciones basadas en los datos de tus alumnos.</p>
        </div>
      </div>

      {/* Tendencias */}
      <div className={styles.trends}>
        {trends.map((t) => (
          <div key={t.label} className={styles.trendCard}>
            <span className={styles.trendLabel}>{t.label}</span>
            <span className={t.positive ? styles.trendValuePositive : styles.trendValueNegative}>{t.value}</span>
          </div>
        ))}
      </div>

      {/* Insights IA */}
      <h2 className={styles.sectionTitle}>Insights Recomendados</h2>
      <div className={styles.insightsList}>
        {insights.map((i, idx) => (
          <div key={idx} className={`${styles.insight} ${styles["insight" + i.tipo]}`}>
            <div className={styles.insightLeft}>
              <span className={styles.insightTipo}>
                {i.tipo === "riesgo" ? "⚠ RIESGO" : i.tipo === "oportunidad" ? "◆ OPORTUNIDAD" : "◈ PREDICCIÓN"}
              </span>
              <span className={styles.insightAlumno}>{i.alumno}</span>
              <h3 className={styles.insightTitle}>{i.titulo}</h3>
              <p className={styles.insightDesc}>{i.desc}</p>
            </div>
            <button className={styles.insightBtn}>{i.accion} →</button>
          </div>
        ))}
      </div>

      {/* Sparring matcher */}
      <h2 className={styles.sectionTitle}>Emparejamiento de Sparring</h2>
      <p className={styles.sectionDesc}>Recomendaciones automáticas según peso, nivel técnico y estilo de pelea.</p>
      <div className={styles.matchesGrid}>
        {sparringMatches.map((m, i) => (
          <div key={i} className={styles.matchCard}>
            <div className={styles.matchFighters}>
              <span className={styles.fighter}>{m.a}</span>
              <span className={styles.vs}>VS</span>
              <span className={styles.fighter}>{m.b}</span>
            </div>
            <div className={styles.matchDetails}>
              <span>{m.peso}</span>
              <span>·</span>
              <span>{m.nivel}</span>
            </div>
            <div className={styles.matchScore}>
              <span className={styles.matchScoreValue}>{m.match}%</span>
              <span className={styles.matchScoreLabel}>Compatibilidad</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
