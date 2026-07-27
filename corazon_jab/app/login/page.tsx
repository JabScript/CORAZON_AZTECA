// app/login/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { guardarSesion, haySesion, obtenerSesion } from "../lib/sesionStorage";
import { autenticar, rutaPanel } from "../lib/authStorage";
import styles from "./Login.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const demoAccounts = [
  { role: "Alumno", email: "iker.dominguez@corazonazteca.com", password: "Boxer123" },
  { role: "Entrenador", email: "rodrigo.cazares@corazonazteca.com", password: "Coach123" },
  { role: "Admin", email: "admin1@corazonazteca.com", password: "Admin123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Si ya hay una sesión activa, no tiene sentido mostrar el login: redirige al panel.
  useEffect(() => {
    if (haySesion()) {
      router.replace(rutaPanel(obtenerSesion().rol));
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cuenta = autenticar(email, password);

    if (!cuenta) {
      setError("Correo o contraseña incorrectos, o la cuenta está pendiente de aprobación.");
      return;
    }

    guardarSesion({ usuarioId: cuenta.usuarioId, nombre: cuenta.nombre, rol: cuenta.rol, foto: cuenta.foto });
    router.push(rutaPanel(cuenta.rol));
  };

  const usarCuentaDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <span className={styles.tag}>BIENVENIDO DE VUELTA</span>
        <h1 className={styles.title}>
          Inicia<span className={styles.titleAccent}>Sesión</span>
        </h1>
        <p className={styles.subtitle}>Accede a tu panel personalizado y continúa tu camino en el boxeo.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <polyline points="3 7 12 13 21 7"/>
              </svg>
              <input
                type="email"
                className={styles.input}
                placeholder="alumno@knockout.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="11" width="14" height="10" rx="2"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className={styles.options}>
            <label className={styles.rememberLabel}>
              <input type="checkbox" className={styles.checkbox} />
              <span>Recordarme</span>
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          {/* Submit */}
          <button type="submit" className={styles.submitBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Iniciar Sesión
          </button>
        </form>

        {/* Separador */}
        <div className={styles.divider}>
          <span>O REGÍSTRATE</span>
        </div>

        {/* Crear cuenta */}
        <Link href="/registro" className={styles.registerBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
          </svg>
          Crear Cuenta Nueva
        </Link>

        {/* Cuentas demo */}
        <div className={styles.demoSection}>
          <span className={styles.demoLabel}>CUENTAS DE DEMOSTRACIÓN</span>
          <div className={styles.demoGrid}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                className={styles.demoCard}
                onClick={() => usarCuentaDemo(acc.email, acc.password)}
              >
                <span className={styles.demoRole}>{acc.role}</span>
                <span className={styles.demoEmail}>{acc.email}</span>
              </button>
            ))}
          </div>
          <p className={styles.demoHint}>Haz clic en una cuenta para autocompletar y luego pulsa &quot;Iniciar Sesión&quot;.</p>
        </div>
      </div>
    </main>
  );
}
