// app/reset-password/page.tsx
// Formulario_Nueva_Contrasena: pantalla de callback a la que Supabase
// redirige tras `resetPasswordForEmail`. Detecta si la sesión de
// recuperación es válida y permite capturar/confirmar una nueva contraseña.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { actualizarContrasena } from "../lib/auth/authService";
import { crearClienteSupabaseNavegador } from "../lib/supabase/client";
import styles from "./ResetPassword.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const LONGITUD_MINIMA = 6;

type EstadoEnlace = "verificando" | "valido" | "invalido";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [estadoEnlace, setEstadoEnlace] = useState<EstadoEnlace>("verificando");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    const supabase = crearClienteSupabaseNavegador();
    supabase.auth.getSession().then(({ data }) => {
      setEstadoEnlace(data.session ? "valido" : "invalido");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Property 11: se rechaza si y solo si la longitud es menor al mínimo.
    if (password.length < LONGITUD_MINIMA) {
      setError(`La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    const { error: errorUpdate } = await actualizarContrasena(password);
    setEnviando(false);

    if (errorUpdate) {
      setError("No pudimos actualizar tu contraseña. Intenta de nuevo.");
      return;
    }

    setCompletado(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (estadoEnlace === "verificando") {
    return (
      <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
        <div className={styles.container}>
          <p className={styles.subtitle}>Verificando enlace…</p>
        </div>
      </main>
    );
  }

  if (estadoEnlace === "invalido") {
    return (
      <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
        <div className={styles.container}>
          <span className={styles.tag}>ENLACE INVÁLIDO</span>
          <h1 className={styles.title}>
            Enlace<span className={styles.titleAccent}>Expirado</span>
          </h1>
          <div className={styles.errorBox}>
            <p className={styles.confirmText}>
              Este enlace de recuperación no es válido o ya expiró. Solicita uno nuevo para
              continuar.
            </p>
            <Link href="/forgot-password" className={styles.link}>
              Solicitar nuevo enlace →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (completado) {
    return (
      <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
        <div className={styles.container}>
          <span className={styles.tag}>CONTRASEÑA ACTUALIZADA</span>
          <h1 className={styles.title}>
            Listo<span className={styles.titleAccent}>!</span>
          </h1>
          <div className={styles.confirmation}>
            <p className={styles.confirmText}>
              Tu contraseña se actualizó correctamente. Te redirigiremos al inicio de sesión...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <span className={styles.tag}>NUEVA CONTRASEÑA</span>
        <h1 className={styles.title}>
          Define tu<span className={styles.titleAccent}>Contraseña</span>
        </h1>
        <p className={styles.subtitle}>Elige una nueva contraseña para tu cuenta.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reset-password">Nueva contraseña</label>
            <input
              id="reset-password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reset-confirm">Confirmar contraseña</label>
            <input
              id="reset-confirm"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className={styles.errorMsg} role="alert">{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}
