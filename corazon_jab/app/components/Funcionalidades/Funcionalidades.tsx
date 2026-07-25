// app/components/Funcionalidades/Funcionalidades.tsx
"use client";

import { Playfair_Display, Oswald } from "next/font/google";
import styles from "./Funcionalidades.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

const features = [
  {
    icon: "👤",
    title: "Gestión de Entrenadores",
    description: "Administra alumnos, crea rutinas personalizadas, da seguimiento al rendimiento y comunícate directamente con cada boxeador desde un panel profesional.",
  },
  {
    icon: "📈",
    title: "Seguimiento Deportivo",
    description: "Monitorea peso, resistencia, asistencia, intensidad y evolución física con gráficas dinámicas y reportes automáticos de progreso.",
  },
  {
    icon: "◎",
    title: "Gimnasios Cercanos",
    description: "Encuentra gimnasios de boxeo por ubicación, horarios, servicios y calificaciones. Guarda tus favoritos y recibe recomendaciones inteligentes.",
  },
  {
    icon: "🗓",
    title: "Modo Campamento",
    description: "Activa un plan especial cuando tengas una pelea próxima. Control de peso, días restantes, sparrings registrados y cuenta regresiva hacia el combate.",
  },
  {
    icon: "🍽",
    title: "Planes Alimenticios",
    description: "Crea y sigue planes de nutrición personalizados con registro de calorías, macronutrientes, hidratación y gráficas de evolución de peso.",
  },
  {
    icon: "♥",
    title: "Historial Permanente",
    description: "Tu expediente deportivo te acompaña toda tu carrera. Cambia de gimnasio o entrenador sin perder tu historial de peleas, entrenamientos y logros.",
  },
];

export default function Funcionalidades() {
  return (
    <section className={`${styles.section} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>TU ENTORNO DE ENTRENAMIENTO</span>
          <h2 className={styles.title}>
            Todo lo que necesitas para llevar tu boxeo al siguiente nivel.
          </h2>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.card}>
              <span className={styles.cardIcon}>{feature.icon}</span>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
