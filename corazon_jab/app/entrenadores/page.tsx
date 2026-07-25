'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Entrenadores.module.css';
import { obtenerEntrenadoresPublicos, type PerfilEntrenador } from '../lib/entrenadorStorage';

export default function EntrenadoresPage() {
  const [entrenadores, setEntrenadores] = useState<PerfilEntrenador[]>([]);

  useEffect(() => {
    setEntrenadores(obtenerEntrenadoresPublicos());
  }, []);

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1>Nuestros Entrenadores</h1>
        <p className={styles.subtitulo}>
          Conoce a los entrenadores que forman campeones en Corazón Azteca
        </p>
      </header>

      <div className={styles.grid}>
        {entrenadores.map((entrenador) => (
          <Link
            key={entrenador.id}
            href={`/entrenadores/${entrenador.id}`}
            className={styles.card}
          >
            <div className={styles.cardFoto}>
              {entrenador.foto ? (
                <Image
                  src={entrenador.foto}
                  alt={`Foto de ${entrenador.nombre}`}
                  width={120}
                  height={120}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <span className={styles.cardPlaceholder}>🥊</span>
              )}
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.cardEspecialidad}>{entrenador.especialidad}</span>
              <h2>{entrenador.nombre}</h2>
              <p className={styles.cardBio}>
                {entrenador.bio.length > 100
                  ? entrenador.bio.slice(0, 100) + '...'
                  : entrenador.bio}
              </p>
              <span className={styles.cardTrayectoria}>
                {entrenador.anosTrayectoria} años de experiencia
              </span>
            </div>
          </Link>
        ))}
      </div>

      {entrenadores.length === 0 && (
        <p className={styles.vacio}>Aún no hay entrenadores registrados.</p>
      )}
    </main>
  );
}
