'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminNav.module.css';

const SECCIONES = [
  { href: '/Admin', etiqueta: 'Panel' },
  { href: '/Admin/Directorio', etiqueta: 'Directorio' },
];

export default function AdminNav() {
  const pathname = usePathname();

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
      </div>
    </nav>
  );
}
