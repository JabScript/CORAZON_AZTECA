'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Alumnos.module.css';

const ALUMNOS = [
  { id: 1, nombre: 'Iker Domínguez', categoria: 'Ligero', nivel: 'Avanzado', foto: '/img/alumnos/iker-dominguez.jpg', lesionado: false, tipoLesion: null, altaMedica: true, esCampeon: true, federacion: 'FMB (Federación Mexicana de Boxeo)' },
  { id: 2, nombre: 'Mariana Solís', categoria: 'Pluma', nivel: 'Intermedio', foto: '/img/alumnos/mariana-solis.jpg', lesionado: true, tipoLesion: 'Esguince de tobillo (grado I)', altaMedica: false, esCampeon: false, federacion: null },
  { id: 3, nombre: 'Bruno Estrada', categoria: 'Welter', nivel: 'Principiante', foto: '/img/alumnos/bruno-estrada.jpg', lesionado: false, tipoLesion: null, altaMedica: true, esCampeon: false, federacion: null },
  { id: 4, nombre: 'Camila Vega', categoria: 'Mosca', nivel: 'Avanzado', foto: '/img/alumnos/camila-vega.jpg', lesionado: true, tipoLesion: 'Tendinitis en muñeca derecha', altaMedica: true, esCampeon: true, federacion: 'WBC (World Boxing Council)' },
  { id: 5, nombre: 'Santiago Rúa', categoria: 'Ligero', nivel: 'Intermedio', foto: '/img/alumnos/santiago-rua.jpg', lesionado: false, tipoLesion: null, altaMedica: true, esCampeon: false, federacion: null },
  { id: 6, nombre: 'Fernanda Pineda', categoria: 'Welter', nivel: 'Principiante', foto: '/img/alumnos/fernanda-pineda.jpg', lesionado: true, tipoLesion: 'Contusión en costillas', altaMedica: false, esCampeon: false, federacion: null },
];

const CATEGORIAS = ['Todas', ...Array.from(new Set(ALUMNOS.map((a) => a.categoria)))];
const ESTADOS_SALUD = ['Todos', 'Lesionados', 'Sin lesión'] as const;
const ESTADOS_TITULO = ['Todos', 'Campeones'] as const;

export default function AlumnosEntrenador() {
  const [categoria, setCategoria] = useState('Todas');
  const [estadoSalud, setEstadoSalud] = useState<typeof ESTADOS_SALUD[number]>('Todos');
  const [estadoTitulo, setEstadoTitulo] = useState<typeof ESTADOS_TITULO[number]>('Todos');

  const alumnosFiltrados = ALUMNOS.filter((a) => {
    const coincideCategoria = categoria === 'Todas' || a.categoria === categoria;
    const coincideSalud =
      estadoSalud === 'Todos' ||
      (estadoSalud === 'Lesionados' && a.lesionado) ||
      (estadoSalud === 'Sin lesión' && !a.lesionado);
    const coincideTitulo = estadoTitulo === 'Todos' || (estadoTitulo === 'Campeones' && a.esCampeon);
    return coincideCategoria && coincideSalud && coincideTitulo;
  });

  const lesionadosCount = ALUMNOS.filter((a) => a.lesionado).length;
  const campeonesCount = ALUMNOS.filter((a) => a.esCampeon).length;

  return (
    <main className={styles.pagina}>
      <h1>Mis alumnos</h1>
      <p className={styles.subtitulo}>
        {ALUMNOS.length} alumnos activos bajo tu cargo.
        {campeonesCount > 0 && (
          <span className={styles.alertaCampeones}> 🏆 {campeonesCount} campeón{campeonesCount !== 1 ? 'es' : ''} de división</span>
        )}
        {lesionadosCount > 0 && (
          <span className={styles.alertaLesionados}> ⚠ {lesionadosCount} con lesión activa</span>
        )}
      </p>

      <div className={styles.filtros}>
        {CATEGORIAS.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.filtroBtn} ${categoria === c ? styles.filtroActivo : ''}`}
            onClick={() => setCategoria(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={styles.filtros}>
        {ESTADOS_SALUD.map((e) => (
          <button
            key={e}
            type="button"
            className={`${styles.filtroBtn} ${estadoSalud === e ? styles.filtroActivo : ''}`}
            onClick={() => setEstadoSalud(e)}
          >
            {e}
          </button>
        ))}
        {ESTADOS_TITULO.map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.filtroBtn} ${estadoTitulo === t ? styles.filtroActivo : ''}`}
            onClick={() => setEstadoTitulo(t)}
          >
            {t === 'Campeones' ? '🏆 Campeones' : t}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {alumnosFiltrados.map((a) => (
          <Link key={a.id} href={`/Entrenador/Alumnos/${a.id}`} className={styles.tarjeta}>
            <div
              className={styles.foto}
              style={{ '--foto': `url('${a.foto}')` } as React.CSSProperties}
            />
            <div className={styles.info}>
              <h3>{a.nombre}</h3>
              <p className={styles.categoria}>{a.categoria}</p>
              <span className={styles.nivel}>{a.nivel}</span>
              {a.esCampeon && (
                <span className={styles.badgeCampeon}>
                  🏆 Campeón {a.categoria} · {a.federacion}
                </span>
              )}
              {a.lesionado ? (
                <span className={styles.badgeLesion} data-alta={a.altaMedica}>
                  🩹 {a.tipoLesion}
                  {a.altaMedica ? ' · Alta médica' : ' · Sin alta'}
                </span>
              ) : (
                <span className={styles.badgeSano}>✓ Sin lesión</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {alumnosFiltrados.length === 0 && (
        <p className={styles.vacio}>No tienes alumnos en esta categoría.</p>
      )}
    </main>
  );
}
