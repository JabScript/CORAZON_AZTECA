// app/entrenador/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { cerrarSesion, obtenerSesion } from "../lib/sesionStorage";
import RequireRole from "../components/RequireRole/RequireRole";
import styles from "./Entrenador.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const navItems = [
  {
    label: "Mi Perfil", href: "/Entrenador",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg>,
  },
  {
    label: "Horarios", href: "/Entrenador/Horarios",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 4v2"/><path d="M16 4v2"/></svg>,
  },
  {
    label: "Alumnos", href: "/Entrenador/Alumnos",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><path d="M15 15a4 4 0 0 1 4 4v2"/></svg>,
  },
  {
    label: "Planes", href: "/Entrenador/planes",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h4"/></svg>,
  },
  {
    label: "Análisis IA", href: "/Entrenador/Analisis",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a4 4 0 0 0-4 4v1a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3v1a4 4 0 0 0 8 0v-1a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3V6a4 4 0 0 0-4-4z"/><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M12 15v.01"/></svg>,
  },
  {
    label: "Gimnasios", href: "/Entrenador/Gimnasios",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M8 4h8"/></svg>,
  },
  {
    label: "Competencias", href: "/Entrenador/competencias",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 3h10v6a5 5 0 0 1-10 0V3z"/></svg>,
  },
  {
    label: "Editar Perfil", href: "/Entrenador/Perfil",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
  {
    label: "Mis Artículos", href: "/Entrenador/mis-articulos",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
];

function EntrenadorLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sesion = obtenerSesion();

  const handleLogout = () => {
    cerrarSesion();
    router.push("/login");
  };

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
        <div className={styles.sidebarFooter}>
          <span className={styles.sidebarUser}>{sesion.nombre}</span>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}

export default function EntrenadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole rolPermitido="entrenador">
      <EntrenadorLayoutInner>{children}</EntrenadorLayoutInner>
    </RequireRole>
  );
}
