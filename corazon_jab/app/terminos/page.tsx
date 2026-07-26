// app/terminos/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "../legal/Legal.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export default function TerminosPage() {
  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <span className={styles.tag}>LEGAL</span>
      <h1 className={styles.title}>Términos y Condiciones</h1>
      <p className={styles.updated}>Última actualización: julio 2026</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Aceptación de los términos</h2>
        <p className={styles.text}>
          Al crear una cuenta o usar la plataforma Corazón Azteca, aceptas cumplir con estos
          Términos y Condiciones. Si no estás de acuerdo, no debes usar el servicio.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Uso de la plataforma</h2>
        <p className={styles.text}>
          Corazón Azteca conecta a boxeadores, entrenadores y gimnasios. Te comprometes a:
        </p>
        <ul className={styles.list}>
          <li>Proporcionar información verídica al registrarte.</li>
          <li>No usar la plataforma para fines fraudulentos o ilegales.</li>
          <li>Respetar a otros usuarios, entrenadores y administradores.</li>
          <li>Mantener la confidencialidad de tu contraseña.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Cuentas de entrenador y administrador</h2>
        <p className={styles.text}>
          Las cuentas de entrenador requieren información profesional verídica. Las cuentas de
          administrador están sujetas a un proceso de aprobación manual antes de su activación.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Contenido generado por usuarios</h2>
        <p className={styles.text}>
          Eres responsable del contenido que publiques (entrenamientos, mensajes, evaluaciones).
          Nos reservamos el derecho de eliminar contenido que viole estos términos.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Limitación de responsabilidad</h2>
        <p className={styles.text}>
          Corazón Azteca no se responsabiliza por lesiones derivadas de entrenamientos, consejos
          nutricionales o interacciones entre usuarios y entrenadores fuera de la plataforma.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Modificaciones</h2>
        <p className={styles.text}>
          Podemos actualizar estos términos periódicamente. Te notificaremos de cambios
          significativos a través de la plataforma o por correo electrónico.
        </p>
      </section>

      <Link href="/" className={styles.backLink}>← Volver al inicio</Link>
    </main>
  );
}
