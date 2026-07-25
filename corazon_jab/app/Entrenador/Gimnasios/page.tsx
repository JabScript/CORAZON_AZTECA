'use client';

import { useState } from 'react';
import styles from './Gimnasios.module.css';

const GIMNASIOS_ACTUALES = [
  { nombre: 'Box Azteca Centro', direccion: 'Av. Juárez 145, Centro', desde: 'Cliente desde 2019' },
  { nombre: 'Guerrero Gym Norte', direccion: 'Calz. Guadalupe 803, Norte', desde: 'Cliente desde 2022' },
];

const GIMNASIOS_CERCANOS = [
  { nombre: 'Templo del Ring', direccion: 'Av. Insurgentes 412', distancia: '1.8 km', vacantes: 'Busca entrenador de boxeo turno matutino' },
  { nombre: 'Fuerza Azteca Sur', direccion: 'Blvd. Sur 220', distancia: '3.2 km', vacantes: 'Busca entrenador para clases grupales' },
  { nombre: 'Combat House', direccion: 'Calle Reforma 90', distancia: '4.5 km', vacantes: 'Busca entrenador de kickboxing/box' },
];

export default function GimnasiosEntrenador() {
  const [vista, setVista] = useState<'actuales' | 'cercanos'>('actuales');

  return (
    <main className={styles.pagina}>
      <h1>Gimnasios</h1>
      <p className={styles.subtitulo}>
        Consulta dónde laboras actualmente o encuentra gimnasios cercanos que buscan entrenador.
      </p>

      <div className={styles.filtros}>
        <button
          type="button"
          className={`${styles.filtroBtn} ${vista === 'actuales' ? styles.filtroActivo : ''}`}
          onClick={() => setVista('actuales')}
        >
          Donde laboro
        </button>
        <button
          type="button"
          className={`${styles.filtroBtn} ${vista === 'cercanos' ? styles.filtroActivo : ''}`}
          onClick={() => setVista('cercanos')}
        >
          Cercanos disponibles
        </button>
      </div>

      {vista === 'actuales' ? (
        <div className={styles.lista}>
          {GIMNASIOS_ACTUALES.map((g) => (
            <article key={g.nombre} className={styles.tarjeta}>
              <h3>{g.nombre}</h3>
              <p className={styles.direccion}>{g.direccion}</p>
              <span className={styles.etiqueta}>{g.desde}</span>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.lista}>
          {GIMNASIOS_CERCANOS.map((g) => (
            <article key={g.nombre} className={styles.tarjeta}>
              <div className={styles.tarjetaCabecera}>
                <h3>{g.nombre}</h3>
                <span className={styles.distancia}>{g.distancia}</span>
              </div>
              <p className={styles.direccion}>{g.direccion}</p>
              <span className={styles.etiquetaVacante}>{g.vacantes}</span>
              <button type="button" className={styles.btnContactar}>
                Contactar gimnasio
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
