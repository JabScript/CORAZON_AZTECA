// app/blog/todos/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "./Todos.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const categories = ["Todos", "Noticias", "Entrenamiento", "Nutrición", "Técnica", "Psicología", "Eventos"];

const allPosts = [
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
  },
  {
    slug: "historia-guantes-boxeo",
    category: "Noticias",
    categoryColor: "#c9a13a",
    image: "/blog/guantes.jpg",
    author: "Redacción",
    date: "25 Jun 2026",
    readTime: "4 min lectura",
    title: "La evolución de los guantes de boxeo",
    excerpt: "Desde las vendas de cuero hasta la tecnología moderna. Cómo los guantes han transformado la seguridad y la técnica del deporte.",
  },
  {
    slug: "defensa-peekaboo",
    category: "Técnica",
    categoryColor: "#c9a13a",
    image: "/blog/defensa.jpg",
    author: "Coach Ramírez",
    date: "20 Jun 2026",
    readTime: "7 min lectura",
    title: "Estilos defensivos: el Peek-a-Boo de Tyson",
    excerpt: "Análisis profundo del estilo defensivo que hizo legendario a Mike Tyson. Movimiento de cabeza, ángulos y contraataque explosivo.",
  },
  {
    slug: "control-peso-pelea",
    category: "Nutrición",
    categoryColor: "#b7212a",
    image: "/blog/peso.jpg",
    author: "Dra. Sánchez",
    date: "15 Jun 2026",
    readTime: "9 min lectura",
    title: "Control de peso antes de una pelea",
    excerpt: "Estrategias saludables para dar el peso sin comprometer tu rendimiento. Hidratación, timing y lo que los campeones hacen diferente.",
  },
  {
    slug: "sparring-seguro",
    category: "Entrenamiento",
    categoryColor: "#2f8c4f",
    image: "/blog/sparring.jpg",
    author: "Coach López",
    date: "10 Jun 2026",
    readTime: "5 min lectura",
    title: "Cómo hacer sparring de forma segura",
    excerpt: "Reglas de oro para sesiones de sparring productivas. Protección, comunicación con tu compañero y cuándo parar.",
  },
  {
    slug: "campeon-madruga",
    category: "Psicología",
    categoryColor: "#b7212a",
    image: "/blog/madruga.jpg",
    author: "Dra. Sánchez",
    date: "5 Jun 2026",
    readTime: "6 min lectura",
    title: "La rutina matutina del campeón",
    excerpt: "Qué hacen los boxeadores de élite antes de que salga el sol. Disciplina, meditación y el poder del hábito en el rendimiento.",
  },
  {
    slug: "evento-corazon-azteca",
    category: "Eventos",
    categoryColor: "#c9a13a",
    image: "/blog/evento.jpg",
    author: "Redacción",
    date: "1 Jun 2026",
    readTime: "3 min lectura",
    title: "Próximo evento: Noche de Campeones 2026",
    excerpt: "Toda la información sobre la velada más esperada del año. Cartelera completa, sede, horarios y cómo conseguir boletos.",
  },
];

export default function TodosPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = activeCategory === "Todos" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/blog" className={styles.backLink}>← Volver al Blog</Link>
        <h1 className={styles.title}>Todos los Artículos</h1>
        <p className={styles.subtitle}>{filteredPosts.length} artículos disponibles</p>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar artículos..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filteredPosts.map((post) => (
          <article key={post.slug} className={styles.card}>
            <div className={styles.cardImage}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
              <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                Leer artículo →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className={styles.empty}>
          <p>No se encontraron artículos con esos filtros.</p>
        </div>
      )}
    </main>
  );
}
