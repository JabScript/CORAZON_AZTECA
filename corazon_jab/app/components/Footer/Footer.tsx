// app/components/Footer/Footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Bungee, Oswald } from "next/font/google";
import styles from "./Footer.module.css";

const bungee = Bungee({ subsets: ["latin"], weight: "400", variable: "--font-brand" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

const navLinks = [
  { label: "Historia", href: "/historia" },
  { label: "Leyendas", href: "/leyendas" },
  { label: "Gimnasios", href: "/gimnasios" },
  { label: "Blog", href: "/blog" },
];

const legalLinks = [
  { label: "Términos y condiciones", href: "/terminos" },
  { label: "Política de privacidad", href: "/privacidad" },
];

export default function Footer() {
  return (
    <footer className={`${styles.footer} ${bungee.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        {/* Columna 1: Logo y descripción */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/corazon-azteca_icon.png"
              alt="Corazón Azteca"
              width={48}
              height={48}
              className={styles.logoImg}
            />
            <span className={styles.logoText}>
              <span className={styles.logoCorazon}>CORAZÓN</span>
              <span className={styles.logoAzteca}>AZTECA</span>
            </span>
          </Link>
          <p className={styles.desc}>
            Cuando el cuerpo se rinde, el corazón pelea. Tu plataforma integral para vivir el boxeo.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Explorar</h4>
          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Columna 3: Contacto */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contacto</h4>
          <ul className={styles.contactList}>
            <li>contacto@corazonazteca.com</li>
            <li>Ciudad de México, MX</li>
          </ul>
        </div>

        {/* Columna 4: Redes sociales */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Síguenos</h4>
          <div className={styles.socials}>
            <a href="https://instagram.com/corazonazteca" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialLink}>
              Instagram
            </a>
            <a href="https://facebook.com/corazonazteca" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.socialLink}>
              Facebook
            </a>
            <a href="https://youtube.com/@corazonazteca" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.socialLink}>
              YouTube
            </a>
            <a href="https://tiktok.com/@corazonazteca" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={styles.socialLink}>
              TikTok
            </a>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Corazón Azteca. Todos los derechos reservados.
        </p>
        <div className={styles.legal}>
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.legalLink}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
