// app/blog/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import { obtenerArticulosAprobados, type ArticuloBlog } from "../lib/blogStorage";
import styles from "./Blog.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const categories = ["Noticias", "Entrenamiento", "Nutrición", "Técnica", "Psicología", "Eventos"];

const posts = [
  {
    slug: "guia-nutricion-boxeadores",
    category: "Nutrición",
    categoryColor: "#b7212a",
    image: "/blog/nutricion.jpg",
    author: "Coach Martínez",
    date: "10 Jul 2026",
    readTime: "8 min lectura",
    title: "Guía completa de nutrición para boxeadores",
    excerpt: "Descubre cómo estructurar tu alimentación para maximizar el rendimiento en el ring, controlar el peso y acelerar la recuperación muscular.",
    tags: ["Nutrición", "Suplementos", "Dietas"],
  },
  {
    slug: "tecnicas-golpes-jab-cross",
    category: "Técnica",
    categoryColor: "#c9a13a",
    image: "/blog/tecnica.jpg",
    author: "Coach Ramírez",
    date: "12 Jul 2026",
    readTime: "6 min lectura",
    title: "Técnicas de golpes: perfecciona tu jab y cross",
    excerpt: "El jab y el cross son los fundamentos del boxeo. Aprende la biomecánica correcta, errores comunes y ejercicios para mejorar tu precisión.",
    tags: ["Práctica", "Posición", "Fundamentos"],
  },
  {
    slug: "preparacion-mental-campeon",
    category: "Psicología",
    categoryColor: "#b7212a",
    image: "/blog/psicologia.jpg",
    author: "Dra. Sánchez",
    date: "15 Jul 2026",
    readTime: "10 min lectura",
    title: "Preparación mental: la psicología del campeón",
    excerpt: "El boxeo es 80% mental. Estrategias de visualización, manejo de la presión pre-pelea y cómo desarrollar una mentalidad ganadora.",
    tags: ["Enfoque", "Visualización", "Mentalidad"],
  },
  {
    slug: "rutina-entrenamiento-principiantes",
    category: "Entrenamiento",
    categoryColor: "#2f8c4f",
    image: "/blog/entrenamiento.jpg",
    author: "Coach López",
    date: "18 Jul 2026",
    readTime: "7 min lectura",
    title: "Rutina de entrenamiento para principiantes",
    excerpt: "Tu primera semana en el gimnasio de boxeo. Ejercicios básicos, calentamiento correcto y cómo evitar lesiones comunes al inicio.",
    tags: ["Principiantes", "Rutinas", "Cardio"],
  },
  {
    slug: "mejores-peleas-2026",
    category: "Noticias",
    categoryColor: "#c9a13a",
    image: "/blog/noticias.jpg",
    author: "Redacción",
    date: "20 Jul 2026",
    readTime: "5 min lectura",
    title: "Las mejores peleas programadas para 2026",
    excerpt: "Un repaso por las peleas más esperadas del año. Análisis de los combates que definirán el panorama del boxeo mundial.",
    tags: ["Peleas", "Calendario", "Análisis"],
  },
  {
    slug: "recuperacion-post-pelea",
    category: "Entrenamiento",
    categoryColor: "#2f8c4f",
    image: "/blog/recuperacion.jpg",
    author: "Coach Martínez",
    date: "22 Jul 2026",
    readTime: "6 min lectura",
    title: "Recuperación post-pelea: guía completa",
    excerpt: "Cómo cuidar tu cuerpo después de un combate. Técnicas de recuperación, descanso activo y cuándo volver al entrenamiento.",
    tags: ["Recuperación", "Descanso", "Salud"],
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [communityPosts, setCommunityPosts] = useState<ArticuloBlog[]>([]);

  useEffect(() => {
    setCommunityPosts(obtenerArticulosAprobados());
  }, []);

  const filteredPosts = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.tag}>APRENDE Y CRECE</span>
          <h1 className={styles.title}>Blog de Boxeo</h1>
        </div>
        <div className={styles.headerRight}>
          <Link href="/blog/escribir" className={styles.writeBtn}>
            + Escribir artículo
          </Link>
          <div className={styles.categories}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ""}`}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Artículos de la comunidad (enviados por entrenadores/alumnos y aprobados) */}
      {communityPosts.length > 0 && (
        <div className={styles.communitySection}>
          <h2 className={styles.communityTitle}>De la Comunidad</h2>
          <div className={styles.communityGrid}>
            {communityPosts.map((post) => (
              <article key={post.id} className={styles.communityCard}>
                <span className={styles.communityCategory}>{post.categoria}</span>
                <h3 className={styles.communityCardTitle}>{post.titulo}</h3>
                <p className={styles.communityExcerpt}>{post.extracto}</p>
                <span className={styles.communityAuthor}>
                  Por {post.autorNombre} · {post.autorRol === "entrenador" ? "Entrenador" : "Alumno"}
                </span>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Grid de posts */}
      <div className={styles.grid}>
        {filteredPosts.map((post) => (
          <article key={post.slug} className={styles.card}>
            <div className={styles.cardImage}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={styles.cardImg}
              />
              <span className={styles.cardCategory} style={{ background: post.categoryColor }}>
                {post.category.toUpperCase()}
              </span>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.cardMeta}>
                <span>{post.author}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>

              <h3 className={styles.cardTitle}>{post.title}</h3>
              <p className={styles.cardExcerpt}>{post.excerpt}</p>

              <div className={styles.cardTags}>
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.cardTagPill}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Botón ver más */}
      <div className={styles.viewAll}>
        <Link href="/blog/todos" className={styles.viewAllBtn}>
          Ver todos los artículos →
        </Link>
      </div>
    </main>
  );
}
