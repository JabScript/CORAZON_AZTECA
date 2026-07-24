// app/Header/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
//import { Instagram, Facebook, Youtube } from "lucide-react";
import styles from "./Header.module.css";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Clases", href: "/clases" },
  { label: "Blog", href: "/blog" },
  { label: "Galería", href: "/galeria" },
  { label: "Contacto", href: "/contacto" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.brand}>
          <Image
            src="/corazon-azteca-icon.png"
            alt=""
            width={44}
            height={44}
            className={styles.brandIcon}
          />
          <span className={styles.brandText}>
            CORAZÓN <span className={styles.brandAccent}>AZTECA</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className={styles.nav} aria-label="Navegación principal">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {link.label.toUpperCase()}
              </Link>
            );
          })}
        </nav>

        
    
      </div>
    </header>
  );
}