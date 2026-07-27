// app/components/Header/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Bungee, Oswald } from "next/font/google";
import { haySesion, obtenerSesion, cerrarSesion, type Sesion } from "../../lib/sesionStorage";
import { rutaPanel } from "../../lib/authStorage";
import styles from "./Header.module.css";

const bungee = Bungee({ subsets: ["latin"], weight: "400", variable: "--font-brand" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-nav" });

const navLinks = [
  { label: "Historia", href: "/historia" },
  { label: "Leyendas", href: "/leyendas" },
  { label: "Gimnasios", href: "/gimnasios" },
  { label: "Blog", href: "/blog" },
];



export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [sesion, setSesion] = useState<Sesion | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Revisa la sesión al montar y cada vez que cambia la ruta (ej. tras login/logout).
  useEffect(() => {
    setSesion(haySesion() ? obtenerSesion() : null);
  }, [pathname]);

  const handleLogout = () => {
    cerrarSesion();
    setSesion(null);
    router.push("/");
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""} ${bungee.variable} ${oswald.variable}`}>
      <div className={styles.inner}>
        {/* Logo — el texto se oculta al hacer scroll, el icono permanece */}
        <Link href="/" className={styles.brand}>
          <Image
            src="/corazon-azteca_icon.png"
            alt="Corazón Azteca"
            width={44}
            height={44}
            className={styles.brandIcon}
          />
          <span className={`${styles.brandText} ${scrolled ? styles.brandTextHidden : ""}`}>
            <span className={styles.brandCorazon}>CORAZÓN</span>
            <span className={styles.brandAccent}>AZTECA</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className={`${styles.nav} ${scrolled ? styles.navCentered : ""}`} aria-label="Navegación principal">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Botones de acción */}
        <div className={styles.actions}>
          {sesion ? (
            <>
              <Link href={rutaPanel(sesion.rol)} className={styles.btnLogin}>
                {sesion.nombre}
              </Link>
              <button type="button" className={styles.btnStart} onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.btnLogin}>
                Iniciar sesión
              </Link>
              <Link href="/registro" className={styles.btnStart}>
                Comenzar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
