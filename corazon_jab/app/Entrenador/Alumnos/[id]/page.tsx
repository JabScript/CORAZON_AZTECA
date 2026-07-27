// app/Entrenador/Alumnos/[id]/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './Detalle.module.css';

const ALUMNOS = [
  {
    id: 1, nombre: 'Iker Domínguez', categoria: 'Ligero', nivel: 'Avanzado', peso: '61.2 kg', edad: 24, plan: 'Camp Preparación', adherencia: 92,
    lesionado: false, tipoLesion: null, altaMedica: true, fechaLesion: null, observacionesMedicas: 'Sin antecedentes relevantes.',
    esCampeon: true, federacion: 'FMB (Federación Mexicana de Boxeo)', tituloDesde: '2026-03-20',
  },
  {
    id: 2, nombre: 'Mariana Solís', categoria: 'Pluma', nivel: 'Intermedio', peso: '57.8 kg', edad: 21, plan: 'Base Técnica', adherencia: 78,
    lesionado: true, tipoLesion: 'Esguince de tobillo (grado I)', altaMedica: false, fechaLesion: '2026-07-02', observacionesMedicas: 'En reposo relativo. Evitar sparring y trabajo de piernas hasta nueva valoración.',
    esCampeon: false, federacion: null, tituloDesde: null,
  },
  {
    id: 3, nombre: 'Bruno Estrada', categoria: 'Welter', nivel: 'Principiante', peso: '69.5 kg', edad: 19, plan: 'Iniciación', adherencia: 65,
    lesionado: false, tipoLesion: null, altaMedica: true, fechaLesion: null, observacionesMedicas: 'Sin antecedentes relevantes.',
    esCampeon: false, federacion: null, tituloDesde: null,
  },
  {
    id: 4, nombre: 'Camila Vega', categoria: 'Mosca', nivel: 'Avanzado', peso: '50.1 kg', edad: 26, plan: 'Camp Preparación', adherencia: 88,
    lesionado: true, tipoLesion: 'Tendinitis en muñeca derecha', altaMedica: true, fechaLesion: '2026-06-10', observacionesMedicas: 'Alta médica otorgada el 15 jul 2026. Continuar con vendaje preventivo.',
    esCampeon: true, federacion: 'WBC (World Boxing Council)', tituloDesde: '2025-11-08',
  },
  {
    id: 5, nombre: 'Santiago Rúa', categoria: 'Ligero', nivel: 'Intermedio', peso: '60.4 kg', edad: 23, plan: 'Base Técnica', adherencia: 71,
    lesionado: false, tipoLesion: null, altaMedica: true, fechaLesion: null, observacionesMedicas: 'Sin antecedentes relevantes.',
    esCampeon: false, federacion: null, tituloDesde: null,
  },
  {
    id: 6, nombre: 'Fernanda Pineda', categoria: 'Welter', nivel: 'Principiante', peso: '68.0 kg', edad: 20, plan: 'Iniciación', adherencia: 55,
    lesionado: true, tipoLesion: 'Contusión en costillas', altaMedica: false, fechaLesion: '2026-07-14', observacionesMedicas: 'Pendiente valoración médica de seguimiento. No apta para contacto.',
    esCampeon: false, federacion: null, tituloDesde: null,
  },
];

const habilidades = [
  { label: 'Velocidad', value: 78 },
  { label: 'Potencia', value: 82 },
  { label: 'Resistencia', value: 70 },
  { label: 'Técnica', value: 85 },
  { label: 'Defensa', value: 68 },
  { label: 'Ring IQ', value: 74 },
];

const objetivos = [
  { desc: 'Debut amateur en torneo estatal', tipo: 'carrera', progreso: 75, deadline: '15 nov 2025' },
  { desc: 'Mejorar resistencia a 85+', tipo: 'fisico', progreso: 68, deadline: '3 meses' },
];

const tabs = ['Información', 'Salud', 'Plan', 'Evaluaciones', 'Objetivos', 'Historial'] as const;
type Tab = typeof tabs[number];

export default function DetalleAlumnoPage() {
  const params = useParams();
  const id = Number(params.id);
  const alumno = ALUMNOS.find((a) => a.id === id) ?? ALUMNOS[0];
  const [activeTab, setActiveTab] = useState<Tab>('Información');

  return (
    <main className={styles.pagina}>
      <Link href="/Entrenador/Alumnos" className={styles.backLink}>← Volver a Mis Alumnos</Link>

      <div className={styles.header}>
        <div className={styles.avatar}>{alumno.nombre.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <h1 className={styles.nombre}>
            {alumno.nombre} {alumno.esCampeon && <span className={styles.coronaTitulo} title="Campeón de división">🏆</span>}
          </h1>
          <p className={styles.meta}>{alumno.categoria} · {alumno.nivel} · {alumno.edad} años · {alumno.peso}</p>
          {alumno.esCampeon && (
            <p className={styles.tituloTexto}>🏆 Campeón {alumno.categoria} · {alumno.federacion}</p>
          )}
        </div>
        <div className={styles.headerBadges}>
          {alumno.lesionado ? (
            <span className={styles.headerBadgeLesion} data-alta={alumno.altaMedica}>
              🩹 {alumno.altaMedica ? 'Lesionado · Con alta médica' : 'Lesionado · Sin alta médica'}
            </span>
          ) : (
            <span className={styles.headerBadgeSano}>✓ Sin lesión</span>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Información' && (
        <>
          {alumno.esCampeon && (
            <div className={styles.tituloCard}>
              <span className={styles.tituloIcono}>🏆</span>
              <div>
                <h3 className={styles.cardTitle}>Campeón actual de la división {alumno.categoria}</h3>
                <p className={styles.tituloFederacion}>{alumno.federacion}</p>
                {alumno.tituloDesde && (
                  <p className={styles.hint}>Título obtenido el {alumno.tituloDesde}</p>
                )}
              </div>
            </div>
          )}

          <div className={styles.infoGrid}>
            <div><span className={styles.label}>Categoría:</span> {alumno.categoria}</div>
            <div><span className={styles.label}>Nivel:</span> {alumno.nivel}</div>
            <div><span className={styles.label}>Peso:</span> {alumno.peso}</div>
            <div><span className={styles.label}>Edad:</span> {alumno.edad} años</div>
            <div><span className={styles.label}>Plan actual:</span> {alumno.plan}</div>
            <div><span className={styles.label}>Adherencia:</span> {alumno.adherencia}%</div>
            <div>
              <span className={styles.label}>Título de división:</span>{' '}
              {alumno.esCampeon ? (
                <span className={styles.tituloTag}>🏆 Campeón · {alumno.federacion}</span>
              ) : (
                'No es campeón actualmente'
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'Salud' && (
        <div className={styles.saludCard}>
          <div className={styles.saludEstado} data-lesionado={alumno.lesionado}>
            <span className={styles.saludEstadoIcono}>{alumno.lesionado ? '🩹' : '✓'}</span>
            <div>
              <h3 className={styles.cardTitle}>
                {alumno.lesionado ? 'Alumno lesionado' : 'Sin lesiones activas'}
              </h3>
              {alumno.lesionado && (
                <p className={styles.saludTipo}>{alumno.tipoLesion}</p>
              )}
            </div>
          </div>

          {alumno.lesionado && (
            <div className={styles.infoGrid}>
              <div><span className={styles.label}>Tipo de lesión:</span> {alumno.tipoLesion}</div>
              <div><span className={styles.label}>Fecha de lesión:</span> {alumno.fechaLesion}</div>
              <div>
                <span className={styles.label}>Alta médica:</span>{' '}
                <span className={styles.altaTag} data-alta={alumno.altaMedica}>
                  {alumno.altaMedica ? 'Sí, con alta médica' : 'No, sin alta médica'}
                </span>
              </div>
            </div>
          )}

          <div className={styles.observacionesBox}>
            <span className={styles.label}>Observaciones médicas:</span>
            <p className={styles.hint}>{alumno.observacionesMedicas}</p>
          </div>

          {alumno.lesionado && !alumno.altaMedica && (
            <p className={styles.saludAdvertencia}>
              ⚠ Este alumno no debe participar en sparring, competencias ni ejercicios de contacto hasta recibir el alta médica.
            </p>
          )}
        </div>
      )}

      {activeTab === 'Plan' && (
        <div className={styles.planCard}>
          <h3 className={styles.cardTitle}>{alumno.plan}</h3>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${alumno.adherencia}%` }} />
          </div>
          <p className={styles.hint}>{alumno.adherencia}% de adherencia al plan asignado.</p>
          <Link href="/Entrenador/planes" className={styles.linkBtn}>Ver biblioteca de planes →</Link>
        </div>
      )}

      {activeTab === 'Evaluaciones' && (
        <div className={styles.radarSection}>
          <h3 className={styles.cardTitle}>Perfil de Habilidades</h3>
          <div className={styles.radarBars}>
            {habilidades.map((h) => (
              <div key={h.label} className={styles.barRow}>
                <span className={styles.barLabel}>{h.label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${h.value}%` }} />
                </div>
                <span className={styles.barValue}>{h.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Objetivos' && (
        <div className={styles.metasList}>
          {objetivos.map((m, i) => (
            <div key={i} className={styles.metaItem}>
              <div className={styles.metaHeader}>
                <span className={styles.metaTipo}>{m.tipo.toUpperCase()}</span>
                <span className={styles.metaDeadline}>{m.deadline}</span>
              </div>
              <p className={styles.metaDesc}>{m.desc}</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${m.progreso}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Historial' && (
        <p className={styles.hint}>Aún no hay historial de peleas registrado para este alumno.</p>
      )}
    </main>
  );
}
