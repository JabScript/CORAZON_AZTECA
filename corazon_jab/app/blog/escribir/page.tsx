// app/blog/escribir/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import { enviarArticulo, type TipoPublicacion } from "../../lib/blogStorage";
import { obtenerSesion } from "../../lib/sesionStorage";
import styles from "./Escribir.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const categoriesArticulo = ["Noticias", "Entrenamiento", "Nutrición", "Técnica", "Psicología", "Eventos"];
const categoriesLogro = ["Debut", "Nocaut", "Racha de victorias", "Campeonato", "Certificación", "Otro logro"];

const iconosLogro = ["🥊", "💥", "🔥", "🏋️", "🏆", "🥇", "⭐", "🎯"];

export default function EscribirArticuloPage() {
  const sesion = obtenerSesion();
  const misArticulosHref = sesion.rol === "entrenador" ? "/Entrenador/mis-articulos" : "/Usuario/mis-articulos";

  const [tipo, setTipo] = useState<TipoPublicacion>("articulo");
  const [titulo, setTitulo] = useState("");
  const [extracto, setExtracto] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState(categoriesArticulo[0]);
  const [icono, setIcono] = useState(iconosLogro[0]);
  const [enviado, setEnviado] = useState(false);

  const puedeEscribir = sesion.rol === "entrenador" || sesion.rol === "usuario";
  const categorias = tipo === "logro" ? categoriesLogro : categoriesArticulo;

  const cambiarTipo = (nuevoTipo: TipoPublicacion) => {
    setTipo(nuevoTipo);
    setCategoria(nuevoTipo === "logro" ? categoriesLogro[0] : categoriesArticulo[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !extracto.trim() || !contenido.trim()) return;

    enviarArticulo({
      tipo,
      titulo,
      extracto,
      contenido,
      categoria,
      icono: tipo === "logro" ? icono : undefined,
    });
    setEnviado(true);
  };

  if (!puedeEscribir) {
    return (
      <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
        <div className={styles.container}>
          <p className={styles.errorText}>
            Solo entrenadores y alumnos registrados pueden enviar artículos o logros al blog.
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
            <h2 className={styles.confirmTitle}>
              {tipo === "logro" ? "Logro enviado a revisión" : "Artículo enviado a revisión"}
            </h2>
            <p className={styles.confirmText}>
              Nuestro equipo lo revisará pronto.{" "}
              {tipo === "logro"
                ? "Cuando se apruebe, aparecerá en tu Historial Deportivo y en el blog."
                : "Podrás ver su estado en \"Mis artículos\"."}
            </p>
            <div className={styles.confirmActions}>
              <Link href={misArticulosHref} className={styles.primaryBtn}>Ver mis artículos</Link>
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
          {tipo === "logro" ? (
            <>Compartir<span className={styles.titleAccent}>Logro</span></>
          ) : (
            <>Escribir<span className={styles.titleAccent}>Artículo</span></>
          )}
        </h1>
        <p className={styles.subtitle}>
          {tipo === "logro"
            ? "Comparte tus logros deportivos con la comunidad. Al aprobarse, aparecerán en tu Historial Deportivo."
            : "Comparte tu experiencia con la comunidad. Tu artículo será revisado por el equipo antes de publicarse."}
        </p>

        {/* Selector de tipo de publicación */}
        <div className={styles.tipoSelector} role="radiogroup" aria-label="Tipo de publicación">
          <button
            type="button"
            role="radio"
            aria-checked={tipo === "articulo"}
            className={`${styles.tipoBtn} ${tipo === "articulo" ? styles.tipoBtnActivo : ""}`}
            onClick={() => cambiarTipo("articulo")}
          >
            📝 Artículo
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={tipo === "logro"}
            className={`${styles.tipoBtn} ${tipo === "logro" ? styles.tipoBtnActivo : ""}`}
            onClick={() => cambiarTipo("logro")}
          >
            🏆 Logro deportivo
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {tipo === "logro" && (
            <div className={styles.field}>
              <label className={styles.label}>Ícono del logro</label>
              <div className={styles.iconoGrid}>
                {iconosLogro.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    className={`${styles.iconoBtn} ${icono === ic ? styles.iconoBtnActivo : ""}`}
                    onClick={() => setIcono(ic)}
                    aria-label={`Elegir ícono ${ic}`}
                    aria-pressed={icono === ic}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>{tipo === "logro" ? "Nombre del logro" : "Título"}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={tipo === "logro" ? "Ej. Primer Nocaut" : "Ej. Cómo mejorar tu jab en 4 semanas"}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Categoría</label>
            <select className={styles.select} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {tipo === "logro" ? "Descripción breve" : "Extracto breve"}
            </label>
            <textarea
              className={styles.textareaShort}
              placeholder={
                tipo === "logro"
                  ? "Ej. Gané por KO en mi quinta pelea profesional"
                  : "Un resumen corto que aparecerá en la vista previa (1-2 líneas)"
              }
              value={extracto}
              onChange={(e) => setExtracto(e.target.value)}
              maxLength={180}
              required
            />
            <span className={styles.hint}>{extracto.length}/180 caracteres</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {tipo === "logro" ? "Detalles del logro" : "Contenido completo"}
            </label>
            <textarea
              className={styles.textareaLong}
              placeholder={
                tipo === "logro"
                  ? "Cuéntanos más sobre este logro: cómo lo conseguiste, contra quién, en qué evento..."
                  : "Escribe el artículo completo aquí..."
              }
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            {tipo === "logro" ? "Enviar logro a revisión" : "Enviar a revisión"}
          </button>
        </form>
      </div>
    </main>
  );
}
