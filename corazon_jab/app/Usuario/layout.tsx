// app/usuario/layout.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { cerrarSesion, obtenerSesion } from "../lib/sesionStorage";
import RequireRole from "../components/RequireRole/RequireRole";
import styles from "./Usuario.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

const navItems = [
  {
    label: "Dashboard", href: "/Usuario",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    label: "Historial Deportivo", href: "/Usuario/Historial",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  },
  {
    label: "Entrenamientos", href: "/Usuario/Entrenamientos",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21C12 21 4 15 4 9.5C4 6.5 6.5 4 9 4c1.5 0 2.5.8 3 1.5C12.5 4.8 13.5 4 15 4c2.5 0 5 2.5 5 5.5C20 15 12 21 12 21z"/></svg>,
  },
  {
    label: "Mi Progreso", href: "/Usuario/Progreso",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="17 7 21 7 21 11"/></svg>,
  },
  {
    label: "Alimentación", href: "/Usuario/Alimentacion",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4v16"/><path d="M4 12h4c2 0 3-1 3-4s-1-4-3-4H4"/><path d="M15 4v16"/><path d="M15 4c0 0 5 0 5 4s-5 4-5 4"/></svg>,
  },
  {
    label: "Modo Campamento", href: "/Usuario/Campamento",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 20h12"/><path d="M12 4v2"/><path d="M8 8l1 1"/><path d="M16 8l-1 1"/><circle cx="12" cy="14" r="4"/><path d="M12 10v4"/><path d="M10 14h4"/></svg>,
  },
  {
    label: "Buscar Contrincante", href: "/Usuario/Contrincante",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  },
  {
    label: "Mis Artículos", href: "/Usuario/mis-articulos",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    label: "Editar Perfil", href: "/Usuario/Perfil",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
];

function UsuarioLayoutInner({ children }: { children: React.ReactNode }) {
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
          <div className={styles.sidebarUserRow}>
            <div className={styles.sidebarAvatar}>
              {sesion.foto ? (
                <Image src={sesion.foto} alt={sesion.nombre} width={32} height={32} className={styles.sidebarAvatarImg} unoptimized />
              ) : (
                sesion.nombre.charAt(0).toUpperCase()
              )}
            </div>
            <span className={styles.sidebarUser}>{sesion.nombre}</span>
          </div>
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

export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole rolPermitido="usuario">
      <UsuarioLayoutInner>{children}</UsuarioLayoutInner>
    </RequireRole>
  );
}
