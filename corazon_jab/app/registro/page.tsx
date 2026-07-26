// app/registro/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "./Registro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const roles = [
  {
    key: "alumno",
    title: "Alumno",
    description: "Registra tus entrenamientos, sigue tu progreso y conecta con entrenadores.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
        <polygon points="19 6 20 8 22 8 20.5 9.5 21 12 19 10.8 17 12 17.5 9.5 16 8 18 8" fill="currentColor" stroke="none"/>
      </svg>
    ),
    href: "/registro/alumno",
  },
  {
    key: "entrenador",
    title: "Entrenador",
    description: "Gestiona alumnos, crea rutinas y lleva el seguimiento de tu equipo.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/>
        <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/>
        <path d="M8 21h8"/>
        <path d="M12 17v4"/>
        <path d="M7 3h10v6a5 5 0 0 1-10 0V3z"/>
      </svg>
    ),
    href: "/registro/entrenador",
  },
  {
    key: "admin",
    title: "Administrador",
    description: "Gestiona la plataforma, gimnasios, usuarios y contenido global.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    href: "/registro/admin",
  },
];

export default function RegistroPage() {
  const [selected, setSelected] = useState<string | null>("alumno");

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <span className={styles.tag}>ÚNETE A KNOCKOUT</span>
        <h1 className={styles.title}>
          Crear<span className={styles.titleAccent}>Cuenta</span>
        </h1>
        <p className={styles.subtitle}>Primero, dinos qué tipo de usuario eres.</p>

        <div className={styles.rolesList}>
          {roles.map((role) => (
            <Link
              key={role.key}
              href={role.href}
              className={`${styles.roleCard} ${selected === role.key ? styles.roleCardActive : ""}`}
              onMouseEnter={() => setSelected(role.key)}
            >
              <span className={styles.roleIcon}>{role.icon}</span>
              <div className={styles.roleContent}>
                <h3 className={styles.roleTitle}>{role.title}</h3>
                <p className={styles.roleDesc}>{role.description}</p>
              </div>
              <span className={styles.roleArrow}>›</span>
            </Link>
          ))}
        </div>

        <div className={styles.divider}>
          <span>O INICIA SESIÓN</span>
        </div>

        <Link href="/login" className={styles.loginLink}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Ya tengo una cuenta
        </Link>
      </div>
    </main>
  );
}
