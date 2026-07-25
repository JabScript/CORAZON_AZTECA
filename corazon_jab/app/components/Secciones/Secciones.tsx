// app/components/Secciones/Secciones.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "./Secciones.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

const cards = [
  {
    tag: "EN MÉXICO",
    title: "Historia del Boxeo",
    description: "Recorre la línea del tiempo desde los inicios del boxeo mexicano hasta la actualidad. Conoce las épocas que forjaron nuestra...",
    image: "/cards/historia.jpg",
    href: "/historia",
  },
  {
    tag: "DEL BOXEO",
    title: "Leyendas",
    description: "Los guerreros que marcaron la historia: Chávez, Olivares, Sánchez, Ali, Tyson, Mayweather y más. Sus récords, legados y peleas...",
    image: "/cards/leyendas.jpg",
    href: "/leyendas",
  },
  {
    tag: "DE BOXEO",
    title: "Blog",
    description: "Artículos sobre entrenamiento, nutrición, técnica, psicología deportiva y las últimas noticias del mundo del boxeo escritos por...",
    image: "/cards/blog.jpg",
    href: "/blog",
  },
  {
    tag: "CERCANOS",
    title: "Gimnasios",
    description: "Encuentra el mejor gimnasio de boxeo cerca de ti. Filtra por ubicación, horarios, servicios y calificaciones. Guarda tus favoritos.",
    image: "/cards/gimnasios.jpg",
    href: "/gimnasios",
  },
];

export default function Secciones() {
  return (
    <section className={`${styles.section} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Sumérgete en el mundo{" "}
          <span className={styles.titleAccent}>del boxeo</span>
        </h2>
        <p className={styles.subtitle}>
          Descubre la historia, las leyendas, el conocimiento y los lugares que hacen grande a este deporte.
        </p>
      </div>

      <div className={styles.grid}>
        {cards.map((card) => (
          <article key={card.href} className={styles.card}>
            <div className={styles.cardImage}>
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.cardImg}
              />
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardTag}>
                <span className={styles.tagIcon}>◈</span> {card.tag}
              </span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.description}</p>
              <Link href={card.href} className={styles.cardLink}>
                Explorar →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
