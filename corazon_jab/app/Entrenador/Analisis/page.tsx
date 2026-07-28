// app/Entrenador/Analisis/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { AlumnoParaAnalisis, AnalisisIAResponse, InsightIA } from "./types";
import ChatIA from "./ChatIA";
import styles from "./Analisis.module.css";

// Alumnos de ejemplo del entrenador (mismos datos que app/Entrenador/Alumnos/page.tsx),
// enviados a Gemini para generar insights reales sobre este grupo específico.
const alumnosEntrenador: AlumnoParaAnalisis[] = [
  { nombre: "Carlos 'El Rayo' Gutiérrez", categoria: "Ligero", nivel: "Avanzado", adherencia: 92, lesionado: false, altaMedica: true, esCampeon: true },
  { nombre: "Ana Martínez", categoria: "Pluma", nivel: "Intermedio", adherencia: 92, lesionado: false, altaMedica: true, esCampeon: false },
  { nombre: "Diego Rivera", categoria: "Welter", nivel: "Principiante", adherencia: 55, lesionado: true, tipoLesion: "Contusión en costillas", altaMedica: false, esCampeon: false },
  { nombre: "Mariana Solís", categoria: "Pluma", nivel: "Intermedio", adherencia: 78, lesionado: true, tipoLesion: "Esguince de tobillo (grado I)", altaMedica: false, esCampeon: false },
  { nombre: "Camila Vega", categoria: "Mosca", nivel: "Avanzado", adherencia: 88, lesionado: false, altaMedica: true, esCampeon: true },
];

// Insights de respaldo, usados mientras Gemini responde o si la API falla.
const insightsFallback: InsightIA[] = [
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
  const [insights, setInsights] = useState<InsightIA[]>(insightsFallback);
  const [cargando, setCargando] = useState(true);
  const [usandoIA, setUsandoIA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preguntaInicialChat, setPreguntaInicialChat] = useState<string | null>(null);

  const handleAccionInsight = (insight: InsightIA) => {
    setPreguntaInicialChat(
      `Sobre este insight de ${insight.alumno} — "${insight.titulo}": ${insight.desc}\n\n` +
        `Quiero: ${insight.accion}. Dame una recomendación concreta y los siguientes pasos.`
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/analisis-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnos: alumnosEntrenador }),
      signal: controller.signal,
    })
      .then((res) => res.json() as Promise<AnalisisIAResponse>)
      .then((data) => {
        if (data.error || data.insights.length === 0) {
          setError(data.error);
          setInsights(insightsFallback);
          setUsandoIA(false);
          return;
        }
        setInsights(data.insights);
        setUsandoIA(true);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("No se pudo conectar con Gemini en este momento.");
        setInsights(insightsFallback);
        setUsandoIA(false);
      })
      .finally(() => setCargando(false));

    return () => controller.abort();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>◇ POWERED BY GEMINI</span>
          <h1 className={styles.title}>Análisis Inteligente</h1>
          <p className={styles.subtitle}>Insights automáticos, predicciones y recomendaciones basadas en los datos de tus alumnos.</p>
          {cargando && (
            <p className={styles.iaEstado}>Generando insights con Gemini...</p>
          )}
          {!cargando && usandoIA && (
            <p className={styles.iaEstadoActivo}>✓ Insights generados en tiempo real por Gemini</p>
          )}
          {!cargando && !usandoIA && (
            <p className={styles.iaEstado}>
              {error ?? "Mostrando insights de ejemplo."}
            </p>
          )}
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
            <button type="button" className={styles.insightBtn} onClick={() => handleAccionInsight(i)}>
              {i.accion} →
            </button>
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

      <ChatIA
        alumnos={alumnosEntrenador}
        preguntaInicial={preguntaInicialChat}
        onPreguntaInicialConsumida={() => setPreguntaInicialChat(null)}
      />
    </div>
  );
}
