// app/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Playfair_Display, Oswald } from "next/font/google";
import { useFormValidation } from "../lib/validation/useFormValidation";
import type { ValidationSchema } from "../lib/validation/validateField";
import FormField from "../lib/validation/FormField";
import styles from "./ForgotPassword.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

interface ForgotPasswordValues {
  email: string;
  [key: string]: string | boolean;
}

const forgotPasswordSchema: ValidationSchema<ForgotPasswordValues> = {
  email: [{ type: "required" }, { type: "email" }],
};

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation<ForgotPasswordValues>({ email: "" }, forgotPasswordSchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) return;

    setSent(true);
  };

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <Link href="/login" className={styles.backLink}>← Volver a iniciar sesión</Link>

        <span className={styles.tag}>RECUPERAR ACCESO</span>
        <h1 className={styles.title}>
          Recuperar<span className={styles.titleAccent}>Contraseña</span>
        </h1>

        {!sent ? (
          <>
            <p className={styles.subtitle}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <FormField
                id="forgot-email"
                label="Correo electrónico"
                error={touched.email ? errors.email : undefined}
                className={styles.field}
                labelClassName={styles.label}
              >
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <polyline points="3 7 12 13 21 7"/>
                  </svg>
                  <input
                    id="forgot-email"
                    type="email"
                    className={styles.input}
                    placeholder="tu@correo.com"
                    value={values.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? "forgot-email-error" : undefined}
                  />
                </div>
              </FormField>

              <button type="submit" className={styles.submitBtn}>Enviar enlace de recuperación</button>
            </form>
          </>
        ) : (
          <div className={styles.confirmation}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.confirmIcon}>
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <p className={styles.confirmText}>
              Si existe una cuenta asociada a <strong>{values.email}</strong>, recibirás un correo con
              instrucciones para restablecer tu contraseña.
            </p>
          </div>
        )}

        <p className={styles.footerNote}>
          ¿Recordaste tu contraseña? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
