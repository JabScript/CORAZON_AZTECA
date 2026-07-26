// app/registro/admin/page.tsx
"use client";

import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function RegistroAdminPage() {
  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <Link href="/registro" className={styles.backLink}>← Cambiar tipo de usuario</Link>

        <span className={styles.tag}>REGISTRO DE ADMINISTRADOR</span>
        <h1 className={styles.title}>
          Acceso<span className={styles.titleAccent}>Restringido</span>
        </h1>
        <p className={styles.subtitle}>
          Las cuentas de administrador requieren aprobación. Envía tu solicitud y te contactaremos.
        </p>

        <form className={styles.form}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input type="text" className={styles.input} placeholder="Nombre" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apellido</label>
              <input type="text" className={styles.input} placeholder="Apellido" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Correo corporativo</label>
            <input type="email" className={styles.input} placeholder="admin@corazonazteca.com" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Teléfono</label>
            <input type="tel" className={styles.input} placeholder="+52 55 1234 5678" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Organización / Empresa</label>
            <input type="text" className={styles.input} placeholder="Corazón Azteca Boxing Gym" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Puesto / Rol</label>
            <select className={styles.select}>
              <option>Dueño de gimnasio</option>
              <option>Gerente de operaciones</option>
              <option>Director técnico</option>
              <option>Federación / Organizador</option>
              <option>Otro</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Código de invitación</label>
            <input type="text" className={styles.input} placeholder="XXXX-XXXX-XXXX" />
            <span className={styles.hint}>Si no tienes uno, deja este campo vacío. Revisaremos tu solicitud manualmente.</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Motivo de solicitud</label>
            <textarea className={styles.textarea} placeholder="Describe brevemente el propósito de la cuenta administrativa..." />
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
              Acepto los <a href="/terminos">términos y condiciones</a> y entiendo que la solicitud está sujeta a revisión.
            </label>
          </div>

          <button type="submit" className={styles.submitBtn}>Enviar solicitud</button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
