'use client';

import { useState } from 'react';
import styles from './Horarios.module.css';

/* Horario semanal del entrenador. Cada bloque indica en qué
   gimnasio da clase, para poder filtrar por sede. */
const HORARIO = [
  { dia: 'Lunes', hora: '7:00 – 9:00', gimnasio: 'Box Azteca Centro' },
  { dia: 'Lunes', hora: '18:00 – 20:00', gimnasio: 'Guerrero Gym Norte' },
  { dia: 'Martes', hora: '7:00 – 9:00', gimnasio: 'Box Azteca Centro' },
  { dia: 'Miércoles', hora: '18:00 – 21:00', gimnasio: 'Guerrero Gym Norte' },
  { dia: 'Jueves', hora: '7:00 – 9:00', gimnasio: 'Box Azteca Centro' },
  { dia: 'Viernes', hora: '18:00 – 21:00', gimnasio: 'Box Azteca Centro' },
  { dia: 'Sábado', hora: '9:00 – 12:00', gimnasio: 'Guerrero Gym Norte' },
];

const GIMNASIOS = ['Todos', 'Box Azteca Centro', 'Guerrero Gym Norte'];
const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function HorariosEntrenador() {
  const [gimFiltro, setGimFiltro] = useState('Todos');

  const horarioFiltrado = HORARIO.filter(
    (h) => gimFiltro === 'Todos' || h.gimnasio === gimFiltro
  );

  return (
    <main className={styles.pagina}>
      <h1>Mis horarios</h1>
      <p className={styles.subtitulo}>
        Así es como tus alumnos verán tu disponibilidad por gimnasio.
      </p>

      <div className={styles.filtros}>
        {GIMNASIOS.map((g) => (
          <button
            key={g}
            type="button"
            className={`${styles.filtroBtn} ${gimFiltro === g ? styles.filtroActivo : ''}`}
            onClick={() => setGimFiltro(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div className={styles.lista}>
        {DIAS_ORDEN.filter((dia) => horarioFiltrado.some((h) => h.dia === dia)).map((dia) => (
          <div key={dia} className={styles.diaBloque}>
            <h2>{dia}</h2>
            <ul>
              {horarioFiltrado
                .filter((h) => h.dia === dia)
                .map((h) => (
                  <li key={`${h.dia}-${h.hora}-${h.gimnasio}`} className={styles.item}>
                    <span className={styles.hora}>{h.hora}</span>
                    <span className={styles.gimnasio}>{h.gimnasio}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}

        {horarioFiltrado.length === 0 && (
          <p className={styles.vacio}>No tienes clases registradas en este gimnasio.</p>
        )}
      </div>
    </main>
  );
}
