'use client';

import { useState, useEffect } from 'react';
import styles from './Contrincante.module.css';
import {
  obtenerSesion,
  obtenerPeleasProximas,
  type PeleaProxima,
} from '../../lib/sesionStorage';

type PeleaHistorial = {
  fecha: string;
  lugar: string;
  rival: string;
  resultado: 'V' | 'D' | 'E';
  metodo: string;
  categoria: string;
  peso: string;
};

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
  historial: PeleaHistorial[];
};

// Datos de ejemplo con historial deportivo incluido
const USUARIOS: Usuario[] = [
  {
    id: 1, nombre: 'Iker Domínguez', edad: 22, peso: 61.2, estatura: 172,
    nacionalidad: 'Mexicana', gimnasio: 'Gimnasio Corazón Azteca',
    foto: '/img/usuarios/iker-dominguez.jpg', peleas: 14, victorias: 10,
    empates: 1, derrotas: 3, victoriasKO: 6, tieneEntrenador: true,
    nombreEntrenador: 'Rodrigo Cazares',
    historial: [
      { fecha: '2025-03-15', lugar: 'Arena CDMX', rival: 'vs Raúl Torres', resultado: 'V', metodo: 'UD 6R', categoria: 'Peso Ligero', peso: '61 kg' },
      { fecha: '2025-01-20', lugar: 'Auditorio Toluca', rival: 'vs Pedro Salas', resultado: 'V', metodo: 'KO 3R', categoria: 'Peso Ligero', peso: '61.2 kg' },
      { fecha: '2024-11-08', lugar: 'Gimnasio Olímpico', rival: 'vs Ángel Rivas', resultado: 'D', metodo: 'SD 8R', categoria: 'Peso Ligero', peso: '61.5 kg' },
      { fecha: '2024-09-14', lugar: 'Arena Monterrey', rival: 'vs Juan Méndez', resultado: 'V', metodo: 'TKO 5R', categoria: 'Peso Ligero', peso: '61 kg' },
      { fecha: '2024-07-02', lugar: 'Deportivo CDMX', rival: 'vs Marco López', resultado: 'V', metodo: 'UD 6R', categoria: 'Peso Ligero', peso: '60.8 kg' },
    ],
  },
  {
    id: 2, nombre: 'Mariana Solís', edad: 24, peso: 57.4, estatura: 165,
    nacionalidad: 'Mexicana', gimnasio: 'Box Imperial',
    foto: '/img/usuarios/mariana-solis.jpg', peleas: 9, victorias: 7,
    empates: 0, derrotas: 2, victoriasKO: 3, tieneEntrenador: true,
    nombreEntrenador: 'Rodrigo Cazares',
    historial: [
      { fecha: '2025-02-22', lugar: 'Arena Puebla', rival: 'vs Laura Gómez', resultado: 'V', metodo: 'UD 6R', categoria: 'Peso Gallo', peso: '57 kg' },
      { fecha: '2024-12-10', lugar: 'Deportivo Morelos', rival: 'vs Ana Ruiz', resultado: 'V', metodo: 'KO 2R', categoria: 'Peso Gallo', peso: '57.4 kg' },
      { fecha: '2024-10-05', lugar: 'Arena CDMX', rival: 'vs Carmen Díaz', resultado: 'D', metodo: 'UD 8R', categoria: 'Peso Gallo', peso: '57.2 kg' },
    ],
  },
  {
    id: 3, nombre: 'Bruno Estrada', edad: 27, peso: 66.8, estatura: 178,
    nacionalidad: 'Colombiana', gimnasio: 'Entrenamiento por su cuenta',
    foto: '/img/usuarios/bruno-estrada.jpg', peleas: 5, victorias: 2,
    empates: 1, derrotas: 2, victoriasKO: 1, tieneEntrenador: false,
    historial: [
      { fecha: '2025-04-10', lugar: 'Arena Bogotá', rival: 'vs Carlos Henao', resultado: 'D', metodo: 'TKO 4R', categoria: 'Peso Welter', peso: '66.5 kg' },
      { fecha: '2025-01-28', lugar: 'Coliseo Medellín', rival: 'vs Andrés Parra', resultado: 'V', metodo: 'UD 6R', categoria: 'Peso Welter', peso: '66.8 kg' },
      { fecha: '2024-10-19', lugar: 'Arena Cali', rival: 'vs Diego Muñoz', resultado: 'E', metodo: 'SD 6R', categoria: 'Peso Welter', peso: '67 kg' },
      { fecha: '2024-08-03', lugar: 'Centro Deportivo', rival: 'vs Julián Ríos', resultado: 'D', metodo: 'UD 6R', categoria: 'Peso Welter', peso: '66.5 kg' },
      { fecha: '2024-05-15', lugar: 'Arena México, CDMX', rival: 'vs Tomás Varela', resultado: 'V', metodo: 'KO 1R', categoria: 'Peso Welter', peso: '66.8 kg' },
    ],
  },
  {
    id: 4, nombre: 'Camila Vega', edad: 20, peso: 51.0, estatura: 158,
    nacionalidad: 'Mexicana', gimnasio: 'Guantes de Fuego',
    foto: '/img/usuarios/camila-vega.jpg', peleas: 11, victorias: 9,
    empates: 0, derrotas: 2, victoriasKO: 5, tieneEntrenador: true,
    nombreEntrenador: 'Diana Reséndiz',
    historial: [
      { fecha: '2025-05-17', lugar: 'Arena GDL', rival: 'vs Sofía Lira', resultado: 'V', metodo: 'KO 3R', categoria: 'Peso Mosca', peso: '51 kg' },
      { fecha: '2025-03-01', lugar: 'Auditorio León', rival: 'vs Daniela Cruz', resultado: 'V', metodo: 'UD 6R', categoria: 'Peso Mosca', peso: '50.8 kg' },
      { fecha: '2024-12-14', lugar: 'Arena Querétaro', rival: 'vs Valeria Mora', resultado: 'D', metodo: 'SD 8R', categoria: 'Peso Mosca', peso: '51.2 kg' },
    ],
  },
  {
    id: 5, nombre: 'Santiago Rúa', edad: 29, peso: 70.3, estatura: 180,
    nacionalidad: 'Venezolana', gimnasio: 'Entrenamiento por su cuenta',
    foto: '/img/usuarios/santiago-rua.jpg', peleas: 17, victorias: 12,
    empates: 2, derrotas: 3, victoriasKO: 8, tieneEntrenador: false,
    historial: [
      { fecha: '2025-06-01', lugar: 'Arena Caracas', rival: 'vs Luis Pérez', resultado: 'V', metodo: 'KO 2R', categoria: 'Peso Mediano', peso: '70 kg' },
      { fecha: '2025-03-22', lugar: 'Poliedro, Caracas', rival: 'vs Mario Castro', resultado: 'V', metodo: 'UD 10R', categoria: 'Peso Mediano', peso: '70.3 kg' },
      { fecha: '2025-01-11', lugar: 'Arena Maracaibo', rival: 'vs Raúl Bravo', resultado: 'E', metodo: 'SD 8R', categoria: 'Peso Mediano', peso: '70.1 kg' },
      { fecha: '2024-10-26', lugar: 'Gimnasio Valencia', rival: 'vs Pedro Acosta', resultado: 'V', metodo: 'TKO 7R', categoria: 'Peso Mediano', peso: '70 kg' },
      { fecha: '2024-08-09', lugar: 'Arena Barquisimeto', rival: 'vs Jesús Ortega', resultado: 'D', metodo: 'KO 4R', categoria: 'Peso Mediano', peso: '70.5 kg' },
    ],
  },
  {
    id: 6, nombre: 'Fernanda Pineda', edad: 19, peso: 54.5, estatura: 163,
    nacionalidad: 'Mexicana', gimnasio: 'Club Halcones',
    foto: '/img/usuarios/fernanda-pineda.jpg', peleas: 3, victorias: 2,
    empates: 0, derrotas: 1, victoriasKO: 1, tieneEntrenador: true,
    nombreEntrenador: 'Diana Reséndiz',
    historial: [
      { fecha: '2025-04-26', lugar: 'Arena CDMX', rival: 'vs Karla Soto', resultado: 'V', metodo: 'UD 4R', categoria: 'Peso Pluma', peso: '54.5 kg' },
      { fecha: '2025-02-08', lugar: 'Deportivo Xalapa', rival: 'vs Lucía Ramos', resultado: 'D', metodo: 'SD 4R', categoria: 'Peso Pluma', peso: '54.3 kg' },
      { fecha: '2024-11-30', lugar: 'Gimnasio Veracruz', rival: 'vs Ivonne Paz', resultado: 'V', metodo: 'KO 2R', categoria: 'Peso Pluma', peso: '54.5 kg' },
    ],
  },
];

export default function ContrincantePage() {
  const [peleas, setPeleas] = useState<PeleaProxima[]>([]);
  const [contrincantes, setContrincantes] = useState<Usuario[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const sesion = obtenerSesion();
    const todasPeleas = obtenerPeleasProximas();
    const hoy = new Date();

    const peleasFuturas = todasPeleas.filter(
      (p) => p.usuarioId === sesion.usuarioId && new Date(p.fecha) >= hoy
    );

    setPeleas(peleasFuturas);

    const oponentes = peleasFuturas
      .map((p) => USUARIOS.find((u) => u.id === p.contrincanteId))
      .filter((u): u is Usuario => u !== undefined);

    setContrincantes(oponentes);
    setCargado(true);
  }, []);

  if (!cargado) return null;

  // Sin pelea próxima
  if (peleas.length === 0 || contrincantes.length === 0) {
    return (
      <main className={styles.pagina}>
        <h1>Próxima pelea</h1>
        <div className={styles.sinPelea}>
          <span className={styles.iconoRing}>🥊</span>
          <h2>Sin peleas programadas</h2>
          <p>
            Cuando tengas una pelea agendada, aquí podrás ver la información
            y el historial deportivo de tu contrincante para que puedas prepararte.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pagina}>
      <h1>Próxima pelea</h1>

      {peleas.map((pelea, idx) => {
        const contrincante = contrincantes[idx];
        if (!contrincante) return null;

        const efectividad = contrincante.peleas > 0
          ? Math.round((contrincante.victorias / contrincante.peleas) * 100)
          : 0;

        // Generar timeline de resultados desde historial
        const timeline = contrincante.historial.map((p) => p.resultado);

        return (
          <div key={pelea.id} className={styles.peleaBlock}>
            {/* Banner del evento */}
            <div className={styles.bannerPelea}>
              <p className={styles.eventoNombre}>{pelea.evento}</p>
              <p className={styles.eventoDetalle}>
                {pelea.lugar} ·{' '}
                {new Date(pelea.fecha).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Info del contrincante */}
            <section className={styles.seccion}>
              <h2>Tu contrincante</h2>
              <article className={styles.tarjeta}>
                <div className={styles.tarjetaHeader}>
                  <div
                    className={styles.foto}
                    style={{ '--foto': `url('${contrincante.foto}')` } as React.CSSProperties}
                  />
                  <div className={styles.infoHeader}>
                    <h3>{contrincante.nombre}</h3>
                    <p className={styles.datoLinea}>
                      {contrincante.edad} años · {contrincante.peso} kg · {contrincante.estatura} cm
                    </p>
                    <p className={styles.datoLinea}>
                      {contrincante.nacionalidad} · {contrincante.gimnasio}
                    </p>
                  </div>
                </div>

                {contrincante.tieneEntrenador ? (
                  <span className={styles.entrenadorBadge}>
                    Entrenado por <strong>{contrincante.nombreEntrenador}</strong>
                  </span>
                ) : (
                  <span className={styles.independienteBadge}>Entrenamiento independiente</span>
                )}
              </article>
            </section>

            {/* Récord profesional del contrincante */}
            <section className={styles.seccion}>
              <h2>Récord Profesional</h2>
              <div className={styles.recordCard}>
                <div className={styles.recordStats}>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{contrincante.peleas}</span>
                    <span className={styles.recordLabel}>Peleas</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{contrincante.victorias}</span>
                    <span className={styles.recordLabel}>Victorias</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{contrincante.derrotas}</span>
                    <span className={styles.recordLabel}>Derrotas</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{contrincante.empates}</span>
                    <span className={styles.recordLabel}>Empates</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{contrincante.victoriasKO}</span>
                    <span className={styles.recordLabel}>KO/TKO</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{efectividad}%</span>
                    <span className={styles.recordLabel}>Efectividad</span>
                  </div>
                </div>

                {/* Timeline de resultados */}
                <div className={styles.timeline}>
                  {timeline.map((r, i) => (
                    <span
                      key={i}
                      className={`${styles.timelineDot} ${
                        r === 'V' ? styles.dotV : r === 'D' ? styles.dotD : styles.dotE
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Cronología de peleas */}
            <section className={styles.seccion}>
              <h2>Historial de Peleas</h2>
              <div className={styles.historialLista}>
                {contrincante.historial.map((p, i) => (
                  <div key={i} className={styles.historialItem}>
                    <span
                      className={`${styles.historialDot} ${
                        p.resultado === 'V' ? styles.hDotV : p.resultado === 'D' ? styles.hDotD : styles.hDotE
                      }`}
                    >
                      {p.resultado}
                    </span>
                    <div className={styles.historialInfo}>
                      <p className={styles.historialMeta}>
                        {p.fecha} · {p.lugar}
                      </p>
                      <p className={styles.historialRival}>{p.rival}</p>
                      <div className={styles.historialTags}>
                        <span
                          className={`${styles.hTag} ${
                            p.resultado === 'V' ? styles.hTagV : p.resultado === 'D' ? styles.hTagD : styles.hTagE
                          }`}
                        >
                          {p.metodo}
                        </span>
                        <span className={styles.hTagInfo}>{p.categoria}</span>
                        <span className={styles.hTagInfo}>{p.peso}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      })}
    </main>
  );
}
