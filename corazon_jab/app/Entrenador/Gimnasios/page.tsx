'use client';

import { useState, useMemo } from 'react';
import { useGeolocation, distanceKm } from '../../hooks/useGeolocation';
import styles from './Gimnasios.module.css';

const GIMNASIOS_ACTUALES = [
  { nombre: 'Box Azteca Centro', direccion: 'Av. Juárez 145, Centro', desde: 'Cliente desde 2019' },
  { nombre: 'Guerrero Gym Norte', direccion: 'Calz. Guadalupe 803, Norte', desde: 'Cliente desde 2022' },
];

const GIMNASIOS_CERCANOS = [
  { nombre: 'Templo del Ring', direccion: 'Av. Insurgentes 412', vacantes: 'Busca entrenador de boxeo turno matutino', lat: 19.3714, lng: -99.1653 },
  { nombre: 'Fuerza Azteca Sur', direccion: 'Blvd. Sur 220', vacantes: 'Busca entrenador para clases grupales', lat: 19.3467, lng: -99.1345 },
  { nombre: 'Combat House', direccion: 'Calle Reforma 90', vacantes: 'Busca entrenador de kickboxing/box', lat: 19.4034, lng: -99.1715 },
];

export default function GimnasiosEntrenador() {
  const [vista, setVista] = useState<'actuales' | 'cercanos'>('actuales');
  const { coords, loading, error, requestLocation } = useGeolocation();

  const cercanosConDistancia = useMemo(() => {
    return GIMNASIOS_CERCANOS
      .map((g) => ({
        ...g,
        distancia: coords ? distanceKm(coords, { lat: g.lat, lng: g.lng }) : null,
      }))
      .sort((a, b) => {
        if (a.distancia === null || b.distancia === null) return 0;
        return a.distancia - b.distancia;
      });
  }, [coords]);

  const mapSrc = coords
    ? `https://www.google.com/maps?q=gimnasios+de+box+cerca+de+${coords.lat},${coords.lng}&output=embed`
    : null;

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
        <>
          <div className={styles.locationBar}>
            <button
              type="button"
              className={styles.locationBtn}
              onClick={requestLocation}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z"/>
                <circle cx="12" cy="10" r="2.5"/>
              </svg>
              {loading ? "Buscando tu ubicación…" : coords ? "Ubicación activada" : "Usar mi ubicación"}
            </button>
            {coords && <span className={styles.locationStatus}>Ordenado por cercanía</span>}
            {error && <span className={styles.locationError}>{error}</span>}
          </div>

          <div className={styles.lista}>
            {cercanosConDistancia.map((g) => (
              <article key={g.nombre} className={styles.tarjeta}>
                <div className={styles.tarjetaCabecera}>
                  <h3>{g.nombre}</h3>
                  {g.distancia !== null && (
                    <span className={styles.distancia}>{g.distancia.toFixed(1)} km</span>
                  )}
                </div>
                <p className={styles.direccion}>{g.direccion}</p>
                <span className={styles.etiquetaVacante}>{g.vacantes}</span>
                <button type="button" className={styles.btnContactar}>
                  Contactar gimnasio
                </button>
              </article>
            ))}
          </div>

          {mapSrc && (
            <div className={styles.mapSection}>
              <iframe
                src={mapSrc}
                className={styles.map}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de gimnasios de box cercanos"
                allowFullScreen
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}
