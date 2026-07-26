// app/blog/mis-articulos/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import { obtenerMisArticulos, type ArticuloBlog } from "../../lib/blogStorage";
import styles from "./MisArticulos.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function MisArticulosPage() {
  const [articulos, setArticulos] = useState<ArticuloBlog[]>([]);

  useEffect(() => {
    setArticulos(obtenerMisArticulos());
  }, []);

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.header}>
        <div>
          <span className={styles.tag}>TUS PUBLICACIONES</span>
          <h1 className={styles.title}>Mis Artículos</h1>
        </div>
        <Link href="/blog/escribir" className={styles.newBtn}>+ Nuevo artículo</Link>
      </div>

      {articulos.length === 0 ? (
        <div className={styles.empty}>
          <p>Aún no has enviado ningún artículo.</p>
          <Link href="/blog/escribir" className={styles.emptyLink}>Escribe tu primer artículo →</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {articulos.map((a) => (
            <article key={a.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.estado} data-estado={a.estado}>
                  {a.estado === "pendiente" && "⏳ En revisión"}
                  {a.estado === "aprobado" && "✓ Publicado"}
                  {a.estado === "rechazado" && "✕ Rechazado"}
                </span>
                <span className={styles.date}>
                  {new Date(a.fechaEnvio).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <h3 className={styles.cardTitle}>{a.titulo}</h3>
              <p className={styles.cardExcerpt}>{a.extracto}</p>
              <span className={styles.category}>{a.categoria}</span>

              {a.estado === "rechazado" && a.motivoRechazo && (
                <p className={styles.rejectionNote}>Motivo: {a.motivoRechazo}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
