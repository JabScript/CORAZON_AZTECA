// app/components/DashboardLayout/DashboardLayout.tsx
// Layout de sidebar + contenido compartido entre Usuario y Entrenador (y
// disponible para Admin si adopta sidebar en el futuro). Envuelve el
// contenido en RequireRole para delegar la guarda de acceso por rol, sin
// duplicar esa lógica.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { Rol } from "../../lib/sesionStorage";
import { cerrarSesion, obtenerSesion } from "../../lib/sesionStorage";
import RequireRole from "../RequireRole/RequireRole";
import styles from "./DashboardLayout.module.css";

export type { Rol };

/** Ancho de sidebar por defecto (px) cuando el llamador no provee `sidebarWidthPx`. */
const SIDEBAR_WIDTH_DEFAULT_PX = 220;

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export interface DashboardLayoutProps {
  /** Rol requerido para ver este layout; se delega a RequireRole */
  role: Rol;
  /** Ítems de navegación del sidebar, en orden de aparición */
  navItems: NavItem[];
  /** Ancho del sidebar en px. Usuario usaba 220, Entrenador 240. */
  sidebarWidthPx?: number;
  /** Slot opcional para navegación secundaria (ej. tabs horizontales de Entrenador) */
  subNav?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Cuerpo del dashboard: sidebar (nav + bloque de usuario + logout),
 * subNav opcional y el contenido principal.
 */
function DashboardLayoutBody({
  navItems,
  sidebarWidthPx,
  subNav,
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sesion = obtenerSesion();

  const handleLogout = () => {
    cerrarSesion();
    router.push("/login");
  };

  return (
    <div
      className={styles.layout}
      style={{ "--sidebar-width": `${sidebarWidthPx ?? SIDEBAR_WIDTH_DEFAULT_PX}px` } as React.CSSProperties}
    >
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
                <Image
                  src={sesion.foto}
                  alt={sesion.nombre}
                  width={32}
                  height={32}
                  className={styles.sidebarAvatarImg}
                  unoptimized
                />
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
      {subNav}
      <main className={styles.content}>{children}</main>
    </div>
  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  const { role } = props;

  return (
    <RequireRole rolPermitido={role}>
      <DashboardLayoutBody {...props} />
    </RequireRole>
  );
}
