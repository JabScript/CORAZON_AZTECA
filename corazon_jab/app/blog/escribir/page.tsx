// app/blog/escribir/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { enviarArticulo } from "../../lib/blogStorage";
import { obtenerSesion } from "../../lib/sesionStorage";
import styles from "./Escribir.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const categories = ["Noticias", "Entrenamiento", "Nutrición", "Técnica", "Psicología", "Eventos"];

export default function EscribirArticuloPage() {
  const router = useRouter();
  const sesion = obtenerSesion();
  const [titulo, setTitulo] = useState("");
  const [extracto, setExtracto] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState(categories[0]);
  const [enviado, setEnviado] = useState(false);

  const puedeEscribir = sesion.rol === "entrenador" || sesion.rol === "usuario";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !extracto.trim() || !contenido.trim()) return;

    enviarArticulo({ titulo, extracto, contenido, categoria });
    setEnviado(true);
  };

  if (!puedeEscribir) {
    return (
      <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
        <div className={styles.container}>
          <p className={styles.errorText}>
            Solo entrenadores y alumnos registrados pueden enviar artículos al blog.
          </p>
          <Link href="/login" className={styles.backLink}>Iniciar sesión →</Link>
        </div>
      </main>
    );
  }

  if (enviado) {
    return (
      <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
        <div className={styles.container}>
          <div className={styles.confirmation}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.confirmIcon}>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <h2 className={styles.confirmTitle}>Artículo enviado a revisión</h2>
            <p className={styles.confirmText}>
              Nuestro equipo lo revisará pronto. Podrás ver su estado en "Mis artículos".
            </p>
            <div className={styles.confirmActions}>
              <Link href="/blog/mis-articulos" className={styles.primaryBtn}>Ver mis artículos</Link>
              <Link href="/blog" className={styles.secondaryBtn}>Volver al blog</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <Link href="/blog" className={styles.backLink}>← Volver al blog</Link>

        <span className={styles.tag}>COMPARTE TU CONOCIMIENTO</span>
        <h1 className={styles.title}>
          Escribir<span className={styles.titleAccent}>Artículo</span>
        </h1>
        <p className={styles.subtitle}>
          Comparte tu experiencia con la comunidad. Tu artículo será revisado por el equipo antes de publicarse.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Título</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej. Cómo mejorar tu jab en 4 semanas"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Categoría</label>
            <select className={styles.select} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Extracto breve</label>
            <textarea
              className={styles.textareaShort}
              placeholder="Un resumen corto que aparecerá en la vista previa (1-2 líneas)"
              value={extracto}
              onChange={(e) => setExtracto(e.target.value)}
              maxLength={180}
              required
            />
            <span className={styles.hint}>{extracto.length}/180 caracteres</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contenido completo</label>
            <textarea
              className={styles.textareaLong}
              placeholder="Escribe el artículo completo aquí..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>Enviar a revisión</button>
        </form>
      </div>
    </main>
  );
}
