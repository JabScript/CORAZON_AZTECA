// app/leyendas/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "./Leyendas.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const mexicanLegends = [
  {
    name: "Julio César Chávez",
    tag: "LEYENDA ABSOLUTA",
    tagColor: "#b7212a",
    image: "/leyendas/chavez.jpg",
    record: "107-6-2",
    titles: "6 títulos mundiales",
    era: "1980s–2000s",
  },
  {
    name: "Canelo Álvarez",
    tag: "CAMPEÓN MUNDIAL",
    tagColor: "#c9a13a",
    image: "/leyendas/canelo.jpg",
    record: "61-2-2",
    titles: "Indiscutido 168 lbs",
    era: "2010s–Presente",
  },
  {
    name: "Salvador Sánchez",
    tag: "CAMPEÓN INVICTO",
    tagColor: "#2f8c4f",
    image: "/leyendas/sanchez.jpg",
    record: "44-1-1",
    titles: "Campeón pluma WBC",
    era: "1970s–1982",
  },
  {
    name: "Rubén Olivares",
    tag: "LEYENDA ETERNA",
    tagColor: "#b7212a",
    image: "/leyendas/olivares.jpg",
    record: "88-13-3",
    titles: "3 títulos mundiales",
    era: "1960s–1980s",
  },
];

const internationalLegends = [
  {
    name: "Muhammad Ali",
    tag: "EL MÁS GRANDE",
    image: "/leyendas/ali.jpg",
    record: "56-5-0",
    country: "EE.UU.",
  },
  {
    name: "Manny Pacquiao",
    tag: "PAC-MAN",
    image: "/leyendas/pacquiao.jpg",
    record: "62-8-2",
    country: "Filipinas",
  },
  {
    name: "Mike Tyson",
    tag: "IRON MIKE",
    image: "/leyendas/tyson.jpg",
    record: "50-6-0",
    country: "EE.UU.",
  },
];

type Tab = "mexicanos" | "internacionales";

export default function LeyendasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("mexicanos");

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      {/* Hero header */}
      <div className={styles.header}>
        <span className={styles.tag}>SALÓN DE LA FAMA</span>
        <h1 className={styles.title}>
          Leyendas del<span className={styles.titleAccent}>Boxeo</span>
        </h1>
        <p className={styles.subtitle}>
          Los guerreros que forjaron la historia del boxeo con su talento, coraje y corazón inquebrantable dentro del ring.
        </p>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "mexicanos" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("mexicanos")}
          >
            Nuestros Héroes
          </button>
          <button
            className={`${styles.tab} ${activeTab === "internacionales" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("internacionales")}
          >
            Más Allá de las Fronteras
          </button>
        </div>
      </div>

      {/* Sección Mexicanos */}
      {activeTab === "mexicanos" && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Leyendas del Boxeo
              <br />
              <span className={styles.sectionAccent}>Mexicano</span>
            </h2>
            <p className={styles.sectionDesc}>
              Los guerreros que forjaron el legado del boxeo mexicano con su talento, coraje y corazón inquebrantable dentro del ring.
            </p>
          </div>

          <div className={styles.grid4}>
            {mexicanLegends.map((legend) => (
              <article key={legend.name} className={styles.card}>
                <div className={styles.cardImage}>
                  <Image
                    src={legend.image}
                    alt={legend.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className={styles.cardImg}
                  />
                  <span className={styles.cardTag} style={{ background: legend.tagColor }}>
                    {legend.tag}
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardName}>{legend.name}</h3>
                  <p className={styles.cardRecord}>{legend.record}</p>
                  <p className={styles.cardMeta}>{legend.titles} · {legend.era}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Sección Internacional */}
      {activeTab === "internacionales" && (
        <section className={styles.section}>
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionTitleCenter}>
              Más Allá de las
              <br />
              <span className={styles.sectionAccent}>Fronteras</span>
            </h2>
            <p className={styles.sectionDesc}>
              Las leyendas que trascendieron fronteras y marcaron la historia del boxeo mundial con su grandeza.
            </p>
          </div>

          <div className={styles.grid3}>
            {internationalLegends.map((legend) => (
              <article key={legend.name} className={styles.card}>
                <div className={styles.cardImage}>
                  <Image
                    src={legend.image}
                    alt={legend.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.cardImg}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardName}>{legend.name}</h3>
                  <p className={styles.cardRecord}>{legend.record}</p>
                  <p className={styles.cardMeta}>{legend.country}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
