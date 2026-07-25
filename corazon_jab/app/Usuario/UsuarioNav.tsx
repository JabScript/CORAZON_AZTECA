'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './UsuarioNav.module.css';

const SECCIONES = [
  { href: '/Usuario', etiqueta: 'Dashboard', icono: '📊' },
  { href: '/Usuario/Historial', etiqueta: 'Historial Deportivo', icono: '🏆' },
  { href: '/Usuario/Entrenamientos', etiqueta: 'Entrenamientos', icono: '🥊' },
  { href: '/Usuario/Progreso', etiqueta: 'Mi Progreso', icono: '📈' },
  { href: '/Usuario/Alimentacion', etiqueta: 'Alimentación', icono: '🍎' },
  { href: '/Usuario/Campamento', etiqueta: 'Modo Campamento', icono: '⚡' },
  { href: '/Usuario/Mensajeria', etiqueta: 'Mensajería', icono: '💬' },
  { href: '/Usuario/Contrincante', etiqueta: 'Próxima Pelea', icono: '🥋' },
];

export default function UsuarioNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar} aria-label="Secciones del usuario">
      <div className={styles.sidebarInner}>
        {SECCIONES.map((s) => {
          const activo =
            s.href === '/Usuario'
              ? pathname === '/Usuario'
              : pathname?.startsWith(s.href);

          return (
            <Link
              key={s.href}
              href={s.href}
              className={`${styles.sidebarLink} ${activo ? styles.sidebarLinkActivo : ''}`}
            >
              <span className={styles.linkIcono}>{s.icono}</span>
              <span className={styles.linkTexto}>{s.etiqueta}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
