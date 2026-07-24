'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './EntrenadorNav.module.css';

const SECCIONES = [
  { href: '/Entrenador', etiqueta: 'Mi Perfil' },
  { href: '/Entrenador/Perfil', etiqueta: 'Editar Perfil' },
  { href: '/Entrenador/Horarios', etiqueta: 'Horarios' },
  { href: '/Entrenador/Alumnos', etiqueta: 'Alumnos' },
  { href: '/Entrenador/Gimnasios', etiqueta: 'Gimnasios' },
  { href: '/Entrenador/Peleas', etiqueta: 'Peleas' },
  { href: '/Entrenador/Torneos', etiqueta: 'Torneos' },
];

export default function EntrenadorNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Secciones del entrenador">
      <div className={styles.navInner}>
        {SECCIONES.map((s) => {
          // '/Entrenador' solo debe marcarse activo en la ruta exacta,
          // el resto se marca activo si el pathname empieza con su href.
          const activo =
            s.href === '/Entrenador'
              ? pathname === '/Entrenador'
              : pathname === s.href || (s.href !== '/Entrenador/Perfil' && pathname?.startsWith(s.href));

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
      </div>
    </nav>
  );
}
