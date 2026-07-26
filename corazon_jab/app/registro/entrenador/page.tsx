// app/registro/entrenador/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function RegistroEntrenadorPage() {
  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <Link href="/registro" className={styles.backLink}>← Cambiar tipo de usuario</Link>

        <span className={styles.tag}>REGISTRO DE ENTRENADOR</span>
        <h1 className={styles.title}>
          Únete como<span className={styles.titleAccent}>Coach</span>
        </h1>
        <p className={styles.subtitle}>Comparte tu experiencia y guía a la próxima generación.</p>

        <form className={styles.form}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input type="text" className={styles.input} placeholder="Ricardo" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apellido</label>
              <input type="text" className={styles.input} placeholder="Mendoza" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <input type="email" className={styles.input} placeholder="coach@correo.com" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Teléfono</label>
            <input type="tel" className={styles.input} placeholder="+52 55 1234 5678" />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Años de experiencia</label>
              <input type="number" className={styles.input} placeholder="12" min="0" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ciudad</label>
              <input type="text" className={styles.input} placeholder="CDMX" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Especialidades</label>
            <input type="text" className={styles.input} placeholder="Ej. Boxeo profesional, Sparring, Preparación física" />
            <span className={styles.hint}>Sepáralas con comas.</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Certificaciones</label>
            <input type="text" className={styles.input} placeholder="Ej. WBC Trainer Level 2" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Gimnasio principal</label>
            <input type="text" className={styles.input} placeholder="Nombre del gimnasio donde trabajas" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Biografía breve</label>
            <textarea className={styles.textarea} placeholder="Cuéntanos tu trayectoria, filosofía de entrenamiento y logros..." />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <input type="password" className={styles.input} placeholder="••••••••" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirmar contraseña</label>
              <input type="password" className={styles.input} placeholder="••••••••" />
            </div>
          </div>

          <div className={styles.checkboxField}>
            <input type="checkbox" id="terms" className={styles.checkbox} />
            <label htmlFor="terms" className={styles.checkboxLabel}>
              Acepto los <a href="/terminos">términos y condiciones</a>, la <a href="/privacidad">política de privacidad</a> y confirmo que la información profesional es verídica.
            </label>
          </div>

          <button type="submit" className={styles.submitBtn}>Crear cuenta de Entrenador</button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
