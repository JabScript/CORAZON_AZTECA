'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cerrarSesion, obtenerSesion } from '../lib/sesionStorage';
import styles from './AdminNav.module.css';

const SECCIONES = [
  { href: '/Admin', etiqueta: 'Panel' },
  { href: '/Admin/Directorio', etiqueta: 'Directorio' },
  { href: '/Admin/Articulos', etiqueta: 'Artículos y Logros' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const sesion = obtenerSesion();

  const handleLogout = () => {
    cerrarSesion();
    router.push('/login');
  };

  return (
    <nav className={styles.nav} aria-label="Secciones de administración">
      <div className={styles.navInner}>
        {SECCIONES.map((s) => {
          const activo =
            s.href === '/Admin'
              ? pathname === '/Admin'
              : pathname?.startsWith(s.href);

          return (
            <Link
              key={s.href}
              href={s.href}
              className={`${styles.tab} ${activo ? styles.tabActivo : ''}`}
            >
              {s.etiqueta}
            </Link>
          );
        })}
        <span className={styles.adminTag}>Admin</span>
        <span className={styles.adminUser}>{sesion.nombre}</span>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
