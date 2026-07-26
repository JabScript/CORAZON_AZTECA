// app/Entrenador/Alumnos/[id]/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './Detalle.module.css';

const ALUMNOS = [
  { id: 1, nombre: 'Iker Domínguez', categoria: 'Ligero', nivel: 'Avanzado', peso: '61.2 kg', edad: 24, plan: 'Camp Preparación', adherencia: 92 },
  { id: 2, nombre: 'Mariana Solís', categoria: 'Pluma', nivel: 'Intermedio', peso: '57.8 kg', edad: 21, plan: 'Base Técnica', adherencia: 78 },
  { id: 3, nombre: 'Bruno Estrada', categoria: 'Welter', nivel: 'Principiante', peso: '69.5 kg', edad: 19, plan: 'Iniciación', adherencia: 65 },
  { id: 4, nombre: 'Camila Vega', categoria: 'Mosca', nivel: 'Avanzado', peso: '50.1 kg', edad: 26, plan: 'Camp Preparación', adherencia: 88 },
  { id: 5, nombre: 'Santiago Rúa', categoria: 'Ligero', nivel: 'Intermedio', peso: '60.4 kg', edad: 23, plan: 'Base Técnica', adherencia: 71 },
  { id: 6, nombre: 'Fernanda Pineda', categoria: 'Welter', nivel: 'Principiante', peso: '68.0 kg', edad: 20, plan: 'Iniciación', adherencia: 55 },
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

const tabs = ['Información', 'Plan', 'Evaluaciones', 'Objetivos', 'Historial'] as const;
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
          <h1 className={styles.nombre}>{alumno.nombre}</h1>
          <p className={styles.meta}>{alumno.categoria} · {alumno.nivel} · {alumno.edad} años · {alumno.peso}</p>
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
        <div className={styles.infoGrid}>
          <div><span className={styles.label}>Categoría:</span> {alumno.categoria}</div>
          <div><span className={styles.label}>Nivel:</span> {alumno.nivel}</div>
          <div><span className={styles.label}>Peso:</span> {alumno.peso}</div>
          <div><span className={styles.label}>Edad:</span> {alumno.edad} años</div>
          <div><span className={styles.label}>Plan actual:</span> {alumno.plan}</div>
          <div><span className={styles.label}>Adherencia:</span> {alumno.adherencia}%</div>
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
