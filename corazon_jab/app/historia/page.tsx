// app/historia/page.tsx
"use client";

import { useState } from "react";
import { Playfair_Display, Oswald } from "next/font/google";
import ImagenEditable from "../components/ImagenEditable/ImagenEditable";
import styles from "./Historia.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const eras = [
  {
    slug: "inicios",
    decade: "1890s",
    title: "Los Inicios",
    image: "/inicios.webp",
    description:
      "El boxeo llegó a México a finales del siglo XIX a través de marineros y trabajadores ferroviarios estadounidenses. Las primeras peleas se realizaban en patios y plazas públicas, cautivando rápidamente a la clase trabajadora mexicana.",
  },
  {
    slug: "campeones",
    decade: "1920s",
    title: "Primeros Campeones",
    image: "/primeros.jpg",
    description:
      "La década de 1920 vio nacer a los primeros campeones mexicanos reconocidos internacionalmente. Los gimnasios comenzaron a proliferar en la Ciudad de México y Guadalajara, profesionalizando el deporte.",
  },
  {
    slug: "epoca-dorada",
    decade: "1940s–50s",
    title: "La Época Dorada",
    image: "/epo.jpg",
    description:
      "México se consolidó como potencia mundial del boxeo. Raúl 'Ratón' Macías, Kid Azteca y otros ídolos llenaron la Arena Coliseo y la Arena México, convirtiendo el boxeo en el deporte nacional por excelencia.",
  },
  {
    slug: "impacto-social",
    decade: "1970s–80s",
    title: "Impacto Social y Cultural",
    image: "/imp.jpg",
    description:
      "El boxeo se convirtió en un camino de ascenso social para miles de jóvenes mexicanos. Figuras como Salvador Sánchez y Rubén Olivares trascendieron el ring para convertirse en símbolos culturales.",
  },
  {
    slug: "leyendas-era",
    decade: "1990s–2000s",
    title: "La Era de las Leyendas",
    image: "/leyendas.jpg",
    description:
      "Julio César Chávez, Erik Morales, Marco Antonio Barrera y Juan Manuel Márquez protagonizaron las peleas más memorables de la historia, llevando el boxeo mexicano a su punto más alto de popularidad global.",
  },
  {
    slug: "actualidad",
    decade: "Actualidad",
    title: "El Legado Continúa",
    image: "/actual.jpg",
    description:
      "Canelo Álvarez y una nueva generación de peleadores mantienen viva la tradición. El boxeo mexicano sigue siendo sinónimo de valentía, corazón y técnica en todo el mundo.",
  },
];

export default function HistoriaPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeEra = eras[activeIndex];

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.tag}>NUESTRA HERENCIA</span>
        <h1 className={styles.title}>
          Historia del Boxeo
          <br />
          <span className={styles.titleAccent}>en México</span>
        </h1>
      </div>

      {/* Contenido principal */}
      <div className={styles.content}>
        {/* Timeline lateral */}
        <aside className={styles.timeline}>
          {eras.map((era, index) => (
            <button
              key={era.decade}
              className={`${styles.timelineItem} ${index === activeIndex ? styles.timelineItemActive : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              <span className={styles.timelineDecade}>{era.decade}</span>
              <span className={styles.timelineTitle}>{era.title}</span>
            </button>
          ))}
        </aside>

        {/* Imagen principal */}
        <div className={styles.imageWrapper}>
          <ImagenEditable
            clave={`historia-${activeEra.slug}`}
            srcOriginal={activeEra.image}
            alt={activeEra.title}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className={styles.image}
          />
        </div>
      </div>

      {/* Descripción debajo */}
      <div className={styles.description}>
        <div className={styles.descMeta}>
          <span className={styles.descDecade}>{activeEra.decade}</span>
          <span className={styles.descCount}>{activeIndex + 1} DE {eras.length}</span>
        </div>
        <h2 className={styles.descTitle}>{activeEra.title}</h2>
        <p className={styles.descText}>{activeEra.description}</p>
      </div>
    </main>
  );
}
