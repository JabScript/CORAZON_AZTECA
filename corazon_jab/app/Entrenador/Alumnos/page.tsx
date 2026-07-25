'use client';

import { useState } from 'react';
import styles from './Alumnos.module.css';

const ALUMNOS = [
  { id: 1, nombre: 'Iker Domínguez', categoria: 'Ligero', nivel: 'Avanzado', foto: '/img/alumnos/iker-dominguez.jpg' },
  { id: 2, nombre: 'Mariana Solís', categoria: 'Pluma', nivel: 'Intermedio', foto: '/img/alumnos/mariana-solis.jpg' },
  { id: 3, nombre: 'Bruno Estrada', categoria: 'Welter', nivel: 'Principiante', foto: '/img/alumnos/bruno-estrada.jpg' },
  { id: 4, nombre: 'Camila Vega', categoria: 'Mosca', nivel: 'Avanzado', foto: '/img/alumnos/camila-vega.jpg' },
  { id: 5, nombre: 'Santiago Rúa', categoria: 'Ligero', nivel: 'Intermedio', foto: '/img/alumnos/santiago-rua.jpg' },
  { id: 6, nombre: 'Fernanda Pineda', categoria: 'Welter', nivel: 'Principiante', foto: '/img/alumnos/fernanda-pineda.jpg' },
];

const CATEGORIAS = ['Todas', ...Array.from(new Set(ALUMNOS.map((a) => a.categoria)))];

export default function AlumnosEntrenador() {
  const [categoria, setCategoria] = useState('Todas');

  const alumnosFiltrados = ALUMNOS.filter(
    (a) => categoria === 'Todas' || a.categoria === categoria
  );

  return (
    <main className={styles.pagina}>
      <h1>Mis alumnos</h1>
      <p className={styles.subtitulo}>{ALUMNOS.length} alumnos activos bajo tu cargo.</p>

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

      <div className={styles.grid}>
        {alumnosFiltrados.map((a) => (
          <article key={a.id} className={styles.tarjeta}>
            <div
              className={styles.foto}
              style={{ '--foto': `url('${a.foto}')` } as React.CSSProperties}
            />
            <div className={styles.info}>
              <h3>{a.nombre}</h3>
              <p className={styles.categoria}>{a.categoria}</p>
              <span className={styles.nivel}>{a.nivel}</span>
            </div>
          </article>
        ))}
      </div>

      {alumnosFiltrados.length === 0 && (
        <p className={styles.vacio}>No tienes alumnos en esta categoría.</p>
      )}
    </main>
  );
}
