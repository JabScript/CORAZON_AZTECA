// app/privacidad/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "../legal/Legal.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export default function PrivacidadPage() {
  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <span className={styles.tag}>LEGAL</span>
      <h1 className={styles.title}>Política de Privacidad</h1>
      <p className={styles.updated}>Última actualización: julio 2026</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Información que recopilamos</h2>
        <p className={styles.text}>
          Recopilamos la información que proporcionas al registrarte: nombre, correo, peso,
          nivel de boxeo, ubicación aproximada (con tu permiso) y datos de entrenamiento.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Uso de la ubicación</h2>
        <p className={styles.text}>
          Si activas la función de "gimnasios cercanos", solicitamos acceso a tu ubicación
          únicamente para calcular distancias y mostrarte resultados relevantes. No almacenamos
          tu ubicación exacta ni la compartimos con terceros.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Cómo usamos tu información</h2>
        <ul className={styles.list}>
          <li>Personalizar tu experiencia (planes, recomendaciones, análisis de progreso).</li>
          <li>Conectarte con entrenadores y gimnasios.</li>
          <li>Enviar notificaciones relevantes sobre tu cuenta.</li>
          <li>Mejorar la plataforma mediante análisis agregados y anónimos.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Con quién compartimos datos</h2>
        <p className={styles.text}>
          No vendemos tu información personal. Tu entrenador asignado puede ver tu progreso,
          evaluaciones y objetivos para brindarte mejor seguimiento. Los gimnasios solo ven
          la información necesaria para gestionar tu membresía.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Seguridad</h2>
        <p className={styles.text}>
          Implementamos medidas razonables para proteger tu información, incluyendo cifrado de
          contraseñas y acceso restringido a datos sensibles.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Tus derechos</h2>
        <p className={styles.text}>
          Puedes solicitar acceso, corrección o eliminación de tu información personal en
          cualquier momento contactándonos a contacto@corazonazteca.com.
        </p>
      </section>

      <Link href="/" className={styles.backLink}>← Volver al inicio</Link>
    </main>
  );
}
