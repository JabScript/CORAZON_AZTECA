// app/components/MisArticulos/MisArticulos.tsx
// Componente compartido: se renderiza dentro del layout de Entrenador o Usuario
// para que el sidebar de cada panel se mantenga visible al navegar.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Playfair_Display, Oswald } from "next/font/google";
import { obtenerMisArticulos, eliminarArticulo, type ArticuloBlog } from "../../lib/blogStorage";
import { useSesion } from "../../lib/auth/SessionProvider";
import styles from "./MisArticulos.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

interface MisArticulosProps {
  /** Ruta a la que lleva el botón "+ Nuevo artículo" */
  writeHref: string;
}

export default function MisArticulos({ writeHref }: MisArticulosProps) {
  const { sesion } = useSesion();
  const cuenta = sesion.estado === "con_sesion" ? sesion.cuenta : null;
  const [articulos, setArticulos] = useState<ArticuloBlog[]>([]);

  useEffect(() => {
    if (!cuenta) return;
    obtenerMisArticulos(cuenta.id).then(setArticulos).catch(() => setArticulos([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuenta?.id]);

  const handleEliminar = async (id: string, titulo: string) => {
    const confirmado = window.confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    if (await eliminarArticulo(id)) {
      setArticulos((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.header}>
        <div>
          <span className={styles.tag}>TUS PUBLICACIONES</span>
          <h1 className={styles.title}>Mis Artículos</h1>
        </div>
        <Link href={writeHref} className={styles.newBtn}>+ Nuevo artículo</Link>
      </div>

      {articulos.length === 0 ? (
        <div className={styles.empty}>
          <p>Aún no has enviado ningún artículo.</p>
          <Link href={writeHref} className={styles.emptyLink}>Escribe tu primer artículo →</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {articulos.map((a) => (
            <article key={a.id} className={styles.card}>
              {a.imagen && (
                <div className={styles.cardImageWrap}>
                  <Image src={a.imagen} alt={a.titulo} fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.cardImg} unoptimized />
                </div>
              )}
              <div className={styles.cardTop}>
                <span className={styles.tipoBadge} data-tipo={a.tipo}>
                  {a.tipo === "logro" ? `${a.icono ?? "🏆"} Logro` : "📝 Artículo"}
                </span>
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
              <div className={styles.cardFooter}>
                <span className={styles.category}>{a.categoria}</span>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleEliminar(a.id, a.titulo)}
                >
                  Eliminar
                </button>
              </div>

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
