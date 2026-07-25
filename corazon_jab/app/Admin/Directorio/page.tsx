'use client';

import { useState } from 'react';
import styles from './Directorio.module.css';

type Usuario = {
  id: number;
  nombre: string;
  edad: number;
  peso: number;
  estatura: number;
  nacionalidad: string;
  gimnasio: string;
  foto: string;
  peleas: number;
  victorias: number;
  empates: number;
  derrotas: number;
  victoriasKO: number;
  tieneEntrenador: boolean;
  nombreEntrenador?: string;
};

const USUARIOS: Usuario[] = [
  {
    id: 1, nombre: 'Iker Domínguez', edad: 22, peso: 61.2, estatura: 172,
    nacionalidad: 'Mexicana', gimnasio: 'Gimnasio Corazón Azteca',
    foto: '/img/usuarios/iker-dominguez.jpg', peleas: 14, victorias: 10,
    empates: 1, derrotas: 3, victoriasKO: 6, tieneEntrenador: true,
    nombreEntrenador: 'Rodrigo Cazares',
  },
  {
    id: 2, nombre: 'Mariana Solís', edad: 24, peso: 57.4, estatura: 165,
    nacionalidad: 'Mexicana', gimnasio: 'Box Imperial',
    foto: '/img/usuarios/mariana-solis.jpg', peleas: 9, victorias: 7,
    empates: 0, derrotas: 2, victoriasKO: 3, tieneEntrenador: true,
    nombreEntrenador: 'Rodrigo Cazares',
  },
  {
    id: 3, nombre: 'Bruno Estrada', edad: 27, peso: 66.8, estatura: 178,
    nacionalidad: 'Colombiana', gimnasio: 'Entrenamiento por su cuenta',
    foto: '/img/usuarios/bruno-estrada.jpg', peleas: 5, victorias: 2,
    empates: 1, derrotas: 2, victoriasKO: 1, tieneEntrenador: false,
  },
  {
    id: 4, nombre: 'Camila Vega', edad: 20, peso: 51.0, estatura: 158,
    nacionalidad: 'Mexicana', gimnasio: 'Guantes de Fuego',
    foto: '/img/usuarios/camila-vega.jpg', peleas: 11, victorias: 9,
    empates: 0, derrotas: 2, victoriasKO: 5, tieneEntrenador: true,
    nombreEntrenador: 'Diana Reséndiz',
  },
  {
    id: 5, nombre: 'Santiago Rúa', edad: 29, peso: 70.3, estatura: 180,
    nacionalidad: 'Venezolana', gimnasio: 'Entrenamiento por su cuenta',
    foto: '/img/usuarios/santiago-rua.jpg', peleas: 17, victorias: 12,
    empates: 2, derrotas: 3, victoriasKO: 8, tieneEntrenador: false,
  },
  {
    id: 6, nombre: 'Fernanda Pineda', edad: 19, peso: 54.5, estatura: 163,
    nacionalidad: 'Mexicana', gimnasio: 'Club Halcones',
    foto: '/img/usuarios/fernanda-pineda.jpg', peleas: 3, victorias: 2,
    empates: 0, derrotas: 1, victoriasKO: 1, tieneEntrenador: true,
    nombreEntrenador: 'Diana Reséndiz',
  },
];

const FILTROS = ['Todos', 'Con entrenador', 'Independientes'] as const;
type Filtro = (typeof FILTROS)[number];

export default function DirectorioAdmin() {
  const [filtro, setFiltro] = useState<Filtro>('Todos');

  const usuariosFiltrados = USUARIOS.filter((u) => {
    if (filtro === 'Con entrenador') return u.tieneEntrenador;
    if (filtro === 'Independientes') return !u.tieneEntrenador;
    return true;
  });

  return (
    <main className={styles.pagina}>
      <h1>Directorio de usuarios</h1>
      <p className={styles.subtitulo}>
        {USUARIOS.length} boxeadores registrados en la plataforma.
      </p>

      <div className={styles.filtros}>
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.filtroBtn} ${filtro === f ? styles.filtroActivo : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {usuariosFiltrados.map((u) => (
          <article key={u.id} className={styles.tarjeta}>
            <div className={styles.tarjetaHeader}>
              <div
                className={styles.foto}
                style={{ '--foto': `url('${u.foto}')` } as React.CSSProperties}
              />
              <div className={styles.infoHeader}>
                <h3>{u.nombre}</h3>
                <p className={styles.datoLinea}>
                  {u.edad} años · {u.peso} kg · {u.estatura} cm
                </p>
                <p className={styles.datoLinea}>
                  {u.nacionalidad} · {u.gimnasio}
                </p>
              </div>
            </div>

            <div className={styles.record}>
              <span><strong>{u.peleas}</strong> peleas</span>
              <span><strong>{u.victorias}</strong> V</span>
              <span><strong>{u.empates}</strong> E</span>
              <span><strong>{u.derrotas}</strong> D</span>
              <span><strong>{u.victoriasKO}</strong> KO</span>
            </div>

            {u.tieneEntrenador ? (
              <span className={styles.entrenadorBadge}>
                Entrenado por <strong>{u.nombreEntrenador}</strong>
              </span>
            ) : (
              <span className={styles.independienteBadge}>Entrenamiento independiente</span>
            )}
          </article>
        ))}
      </div>

      {usuariosFiltrados.length === 0 && (
        <p className={styles.vacio}>No hay usuarios en esta categoría.</p>
      )}
    </main>
  );
}
