// app/registro/alumno/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function RegistroAlumnoPage() {
  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <Link href="/registro" className={styles.backLink}>← Cambiar tipo de usuario</Link>

        <span className={styles.tag}>REGISTRO DE ALUMNO</span>
        <h1 className={styles.title}>
          Crear cuenta<span className={styles.titleAccent}>Boxeador</span>
        </h1>
        <p className={styles.subtitle}>Completa tus datos para empezar a entrenar.</p>

        <form className={styles.form}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input type="text" className={styles.input} placeholder="Carlos" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apellido</label>
              <input type="text" className={styles.input} placeholder="Gutiérrez" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Apodo (opcional)</label>
            <input type="text" className={styles.input} placeholder="El Rayo" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <input type="email" className={styles.input} placeholder="tu@correo.com" />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Fecha de nacimiento</label>
              <input type="date" className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Peso (kg)</label>
              <input type="number" className={styles.input} placeholder="68.5" step="0.1" />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Nivel</label>
              <select className={styles.select}>
                <option>Principiante</option>
                <option>Amateur</option>
                <option>Semi-profesional</option>
                <option>Profesional</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Objetivo principal</label>
              <select className={styles.select}>
                <option>Acondicionamiento físico</option>
                <option>Aprender técnica</option>
                <option>Competir amateur</option>
                <option>Carrera profesional</option>
                <option>Bajar de peso</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ciudad</label>
            <input type="text" className={styles.input} placeholder="Ciudad de México" />
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
              Acepto los <a href="/terminos">términos y condiciones</a> y la <a href="/privacidad">política de privacidad</a>.
            </label>
          </div>

          <button type="submit" className={styles.submitBtn}>Crear cuenta de Alumno</button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
