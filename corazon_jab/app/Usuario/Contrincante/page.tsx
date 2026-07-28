'use client';

import { useState, useEffect } from 'react';
import styles from './Contrincante.module.css';
import { useSesion } from '../../lib/auth/SessionProvider';
import { resolverUrlFoto } from '../../lib/auth/fotoPerfil';
import { obtenerAlumnoPorCuentaId } from '../../lib/alumnoStorage';
import {
  obtenerPeleasProximasDeAlumno,
  type PeleaProximaConContrincante,
} from '../../lib/peleasProximasStorage';

export default function ContrincantePage() {
  const { sesion } = useSesion();
  const cuenta = sesion.estado === 'con_sesion' ? sesion.cuenta : null;

  const [peleas, setPeleas] = useState<PeleaProximaConContrincante[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (!cuenta) return;
    let activo = true;

    (async () => {
      const perfil = await obtenerAlumnoPorCuentaId(cuenta.id);
      if (!perfil) {
        if (activo) {
          setPeleas([]);
          setCargado(true);
        }
        return;
      }
      const resultado = await obtenerPeleasProximasDeAlumno(perfil.id);
      if (activo) {
        setPeleas(resultado);
        setCargado(true);
      }
    })();

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuenta?.id]);

  if (!cargado) return null;

  // Sin pelea próxima
  if (peleas.length === 0) {
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

      {peleas.map((pelea) => {
        const contrincante = pelea.contrincante;
        const historial = pelea.historialContrincante;

        const total = historial.length;
        const victorias = historial.filter((p) => p.resultado === 'victoria').length;
        const derrotas = historial.filter((p) => p.resultado === 'derrota').length;
        const empates = historial.filter((p) => p.resultado === 'empate').length;
        const nocauts = historial.filter((p) => (p.metodo ?? '').toUpperCase().includes('KO')).length;
        const efectividad = total > 0 ? Math.round((victorias / total) * 100) : 0;

        const fotoUrl = resolverUrlFoto(contrincante.fotoRef);

        // Timeline de resultados (más reciente primero, ya viene ordenado así)
        const timeline = historial.map((p) =>
          p.resultado === 'victoria' ? 'V' : p.resultado === 'derrota' ? 'D' : 'E'
        );

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
                    style={fotoUrl ? ({ '--foto': `url('${fotoUrl}')` } as React.CSSProperties) : undefined}
                  />
                  <div className={styles.infoHeader}>
                    <h3>{contrincante.nombre}</h3>
                  </div>
                </div>
              </article>
            </section>

            {/* Récord profesional del contrincante */}
            <section className={styles.seccion}>
              <h2>Récord Profesional</h2>
              <div className={styles.recordCard}>
                <div className={styles.recordStats}>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{total}</span>
                    <span className={styles.recordLabel}>Peleas</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{victorias}</span>
                    <span className={styles.recordLabel}>Victorias</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{derrotas}</span>
                    <span className={styles.recordLabel}>Derrotas</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{empates}</span>
                    <span className={styles.recordLabel}>Empates</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{nocauts}</span>
                    <span className={styles.recordLabel}>KO/TKO</span>
                  </div>
                  <div className={styles.recordItem}>
                    <span className={styles.recordNumero}>{efectividad}%</span>
                    <span className={styles.recordLabel}>Efectividad</span>
                  </div>
                </div>

                {/* Timeline de resultados */}
                {timeline.length > 0 && (
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
                )}
              </div>
            </section>

            {/* Cronología de peleas */}
            {historial.length > 0 && (
              <section className={styles.seccion}>
                <h2>Historial de Peleas</h2>
                <div className={styles.historialLista}>
                  {historial.map((p) => {
                    const resultadoCorto = p.resultado === 'victoria' ? 'V' : p.resultado === 'derrota' ? 'D' : 'E';
                    return (
                      <div key={p.id} className={styles.historialItem}>
                        <span
                          className={`${styles.historialDot} ${
                            resultadoCorto === 'V' ? styles.hDotV : resultadoCorto === 'D' ? styles.hDotD : styles.hDotE
                          }`}
                        >
                          {resultadoCorto}
                        </span>
                        <div className={styles.historialInfo}>
                          <p className={styles.historialMeta}>
                            {p.fecha} · {p.lugar}
                          </p>
                          <p className={styles.historialRival}>{p.rivalTexto ?? 'Rival registrado'}</p>
                          <div className={styles.historialTags}>
                            <span
                              className={`${styles.hTag} ${
                                resultadoCorto === 'V' ? styles.hTagV : resultadoCorto === 'D' ? styles.hTagD : styles.hTagE
                              }`}
                            >
                              {p.metodo ?? '—'}
                            </span>
                            <span className={styles.hTagInfo}>{p.categoriaPeso}</span>
                            <span className={styles.hTagInfo}>{p.pesoKg} kg</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        );
      })}
    </main>
  );
}
