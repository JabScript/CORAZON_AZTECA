// app/usuario/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import styles from "./Usuario.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const navItems = [
  {
    label: "Dashboard", href: "/Usuario",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    label: "Historial Deportivo", href: "/Usuario/historial",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  },
  {
    label: "Entrenamientos", href: "/Usuario/entrenamientos",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21C12 21 4 15 4 9.5C4 6.5 6.5 4 9 4c1.5 0 2.5.8 3 1.5C12.5 4.8 13.5 4 15 4c2.5 0 5 2.5 5 5.5C20 15 12 21 12 21z"/></svg>,
  },
  {
    label: "Mi Progreso", href: "/Usuario/progreso",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="17 7 21 7 21 11"/></svg>,
  },
  {
    label: "Alimentación", href: "/Usuario/alimentacion",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4v16"/><path d="M4 12h4c2 0 3-1 3-4s-1-4-3-4H4"/><path d="M15 4v16"/><path d="M15 4c0 0 5 0 5 4s-5 4-5 4"/></svg>,
  },
  {
    label: "Modo Campamento", href: "/Usuario/campamento",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 20h12"/><path d="M12 4v2"/><path d="M8 8l1 1"/><path d="M16 8l-1 1"/><circle cx="12" cy="14" r="4"/><path d="M12 10v4"/><path d="M10 14h4"/></svg>,
  },
  {
    label: "Mensajería", href: "/Usuario/mensajeria",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  },
];

export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={`${styles.layout} ${playfair.variable} ${oswald.variable}`}>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
              <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
