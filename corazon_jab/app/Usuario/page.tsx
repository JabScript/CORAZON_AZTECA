// app/usuario/page.tsx (Dashboard)
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { obtenerSesion } from "../lib/sesionStorage";
import {
  obtenerAlumnoPorUsuarioId,
  actualizarEntrenadorAlumno,
  type DatosAlumno,
  type OrigenEntrenador,
} from "../lib/alumnoStorage";
import { obtenerEntrenadoresPublicos, type PerfilEntrenador } from "../lib/entrenadorStorage";
import styles from "./Dashboard.module.css";

const stats = [
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 4v2"/><path d="M16 4v2"/></svg>, value: "14", label: "Entrenamientos este mes", sub: "+2 vs mes pasado", trend: "up" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18"/><path d="M8 7h8"/><circle cx="12" cy="12" r="3"/><path d="M5 21h14"/></svg>, value: "68.5 kg", label: "Peso Actual", sub: "Objetivo: 66 kg", trend: "up" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>, value: "28h", label: "Horas Entrenadas", sub: "Promedio: 7h/sem", trend: "up" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, value: "5 días", label: "Racha Actual", sub: "+1 vs semana pasada", trend: "up" },
];

const weeklyProgress = [
  { label: "Sem 1", hours: 5, intensity: 6 },
  { label: "Sem 2", hours: 6, intensity: 7 },
  { label: "Sem 3", hours: 4, intensity: 8 },
  { label: "Sem 4", hours: 7, intensity: 6 },
  { label: "Sem 5", hours: 6, intensity: 7 },
  { label: "Sem 6", hours: 5, intensity: 5 },
];

const recentTrainings = [
  { type: "Boxeo Avanzado", duration: "1h 30m", intensity: "Alta", date: "14 Jul", rating: 9 },
  { type: "Sparring", duration: "2h", intensity: "Muy Alta", date: "13 Jul", rating: 8 },
  { type: "Preparación Física", duration: "1h", intensity: "Media", date: "11 Jul", rating: 8 },
  { type: "Técnica", duration: "1h 45m", intensity: "Alta", date: "09 Jul", rating: 8 },
];

export default function DashboardPage() {
  const maxVal = Math.max(...weeklyProgress.map(w => Math.max(w.hours, w.intensity)));
  const sesion = obtenerSesion();
  const primerNombre = sesion.nombre.split(" ")[0] || sesion.nombre;

  const [datosAlumno, setDatosAlumno] = useState<DatosAlumno | null>(null);
  const [entrenadores, setEntrenadores] = useState<PerfilEntrenador[]>([]);
  const [editandoEntrenador, setEditandoEntrenador] = useState(false);
  const [opcionEntrenador, setOpcionEntrenador] = useState<OrigenEntrenador>("independiente");
  const [entrenadorIdSeleccionado, setEntrenadorIdSeleccionado] = useState("");
  const [nombreManual, setNombreManual] = useState("");

  useEffect(() => {
    setDatosAlumno(obtenerAlumnoPorUsuarioId(sesion.usuarioId));
    setEntrenadores(obtenerEntrenadoresPublicos());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion.usuarioId]);

  const entrenadorActual =
    datosAlumno?.origenEntrenador === "directorio" && datosAlumno.entrenadorId
      ? entrenadores.find((e) => e.id === datosAlumno.entrenadorId)
      : null;

  const handleAbrirEditor = () => {
    setOpcionEntrenador(datosAlumno?.origenEntrenador ?? "independiente");
    setEntrenadorIdSeleccionado(datosAlumno?.entrenadorId ?? "");
    setNombreManual(datosAlumno?.nombreEntrenadorManual ?? "");
    setEditandoEntrenador(true);
  };

  const handleGuardarEntrenador = () => {
    actualizarEntrenadorAlumno(sesion.usuarioId, {
      origenEntrenador: opcionEntrenador,
      entrenadorId: opcionEntrenador === "directorio" ? entrenadorIdSeleccionado : undefined,
      nombreEntrenadorManual: opcionEntrenador === "manual" ? nombreManual.trim() : undefined,
    });
    setDatosAlumno(obtenerAlumnoPorUsuarioId(sesion.usuarioId));
    setEditandoEntrenador(false);
  };

  const handleQuitarEntrenador = () => {
    if (!confirm("¿Quieres dejar de tener entrenador y pasar a entrenamiento independiente?")) return;
    actualizarEntrenadorAlumno(sesion.usuarioId, { origenEntrenador: "independiente" });
    setDatosAlumno(obtenerAlumnoPorUsuarioId(sesion.usuarioId));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerUserRow}>
            <div className={styles.headerAvatar}>
              {sesion.foto ? (
                <Image src={sesion.foto} alt={sesion.nombre} width={56} height={56} className={styles.headerAvatarImg} unoptimized />
              ) : (
                sesion.nombre.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className={styles.title}>¡A entrenar, <em>{primerNombre}</em>!</h1>
              <p className={styles.subtitle}>Tu resumen de entrenamiento.</p>
            </div>
          </div>
        </div>
        <div className={styles.nextTraining}>
          <span className={styles.nextLabel}>▲ PRÓXIMO ENTRENAMIENTO</span>
          <h3 className={styles.nextTitle}>Boxeo Avanzado</h3>
          <p className={styles.nextTime}>Hoy, 15 de Julio · 07:00 - 08:30</p>
          <div className={styles.nextDetails}>
            <span>◇ Gimnasio Triple Boxing</span>
            <span>◇ Ricardo Mendoza</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statTrend}>▲</span>
            </div>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statSub}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Entrenador */}
      <div className={styles.entrenadorSection}>
        <div className={styles.entrenadorHeader}>
          <h2 className={styles.sectionTitle}>Mi Entrenador</h2>
          {!editandoEntrenador && (
            <button type="button" className={styles.btnCambiarEntrenador} onClick={handleAbrirEditor}>
              {datosAlumno && datosAlumno.origenEntrenador !== "independiente" ? "Cambiar entrenador" : "Elegir entrenador"}
            </button>
          )}
        </div>

        {!editandoEntrenador ? (
          <>
            {entrenadorActual ? (
              <div className={styles.entrenadorCard}>
                <div className={styles.entrenadorAvatar}>
                  {entrenadorActual.foto ? (
                    <Image src={entrenadorActual.foto} alt={entrenadorActual.nombre} width={48} height={48} className={styles.entrenadorAvatarImg} unoptimized />
                  ) : (
                    entrenadorActual.nombre.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={styles.entrenadorInfo}>
                  <Link href={`/entrenadores/${entrenadorActual.id}`} className={styles.entrenadorNombre}>{entrenadorActual.nombre}</Link>
                  <span className={styles.entrenadorEspecialidad}>{entrenadorActual.especialidad}</span>
                </div>
                <button type="button" className={styles.btnQuitarEntrenador} onClick={handleQuitarEntrenador}>
                  Quitar entrenador
                </button>
              </div>
            ) : datosAlumno?.origenEntrenador === "manual" && datosAlumno.nombreEntrenadorManual ? (
              <div className={styles.entrenadorCard}>
                <div className={styles.entrenadorAvatar}>{datosAlumno.nombreEntrenadorManual.charAt(0).toUpperCase()}</div>
                <div className={styles.entrenadorInfo}>
                  <span className={styles.entrenadorNombre}>{datosAlumno.nombreEntrenadorManual}</span>
                  <span className={styles.entrenadorEspecialidad}>Agregado manualmente (no está en el directorio)</span>
                </div>
                <button type="button" className={styles.btnQuitarEntrenador} onClick={handleQuitarEntrenador}>
                  Quitar entrenador
                </button>
              </div>
            ) : (
              <p className={styles.entrenadorVacio}>Actualmente entrenas de forma independiente, sin entrenador asignado.</p>
            )}
          </>
        ) : (
          <div className={styles.entrenadorEditor}>
            <div className={styles.entrenadorOpciones}>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === "independiente" ? styles.entrenadorOpcionActiva : ""}`}
                onClick={() => setOpcionEntrenador("independiente")}
              >
                Independiente
              </button>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === "directorio" ? styles.entrenadorOpcionActiva : ""}`}
                onClick={() => setOpcionEntrenador("directorio")}
              >
                Del directorio
              </button>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === "manual" ? styles.entrenadorOpcionActiva : ""}`}
                onClick={() => setOpcionEntrenador("manual")}
              >
                No está en el directorio
              </button>
            </div>

            {opcionEntrenador === "directorio" && (
              <select
                className={styles.entrenadorSelect}
                value={entrenadorIdSeleccionado}
                onChange={(e) => setEntrenadorIdSeleccionado(e.target.value)}
              >
                <option value="">— Elige un entrenador —</option>
                {entrenadores.map((ent) => (
                  <option key={ent.id} value={ent.id}>{ent.nombre} · {ent.especialidad}</option>
                ))}
              </select>
            )}

            {opcionEntrenador === "manual" && (
              <input
                type="text"
                className={styles.entrenadorInput}
                placeholder="Nombre de tu entrenador"
                value={nombreManual}
                onChange={(e) => setNombreManual(e.target.value)}
              />
            )}

            <div className={styles.entrenadorEditorAcciones}>
              <button type="button" className={styles.btnGuardarEntrenador} onClick={handleGuardarEntrenador}>Guardar</button>
              <button type="button" className={styles.btnCancelarEntrenador} onClick={() => setEditandoEntrenador(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom grid */}
      <div className={styles.bottomGrid}>
        {/* Progreso semanal */}
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Progreso Semanal</h2>
          <div className={styles.chart}>
            {weeklyProgress.map((w, i) => (
              <div key={i} className={styles.barGroup}>
                <div className={styles.bars}>
                  <div className={styles.barHours} style={{ height: `${(w.hours / maxVal) * 100}%` }} />
                  <div className={styles.barIntensity} style={{ height: `${(w.intensity / maxVal) * 100}%` }} />
                </div>
                <span className={styles.barLabel}>{w.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={styles.legendDotHours} /> Horas</span>
            <span className={styles.legendItem}><span className={styles.legendDotIntensity} /> Intensidad</span>
          </div>
        </div>

        {/* Últimos entrenamientos */}
        <div className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Últimos Entrenamientos</h2>
          <div className={styles.recentList}>
            {recentTrainings.map((t, i) => (
              <div key={i} className={styles.recentItem}>
                <div className={styles.recentInfo}>
                  <span className={styles.recentType}>{t.type}</span>
                  <span className={styles.recentMeta}>⏱ {t.duration} · {t.intensity}</span>
                </div>
                <div className={styles.recentRight}>
                  <span className={styles.recentDate}>{t.date}</span>
                  <span className={styles.recentRating}>★ {t.rating}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usuario footer */}
      <div className={styles.userBar}>
        <div className={styles.userAvatar}>
          {sesion.foto ? (
            <Image src={sesion.foto} alt={sesion.nombre} width={34} height={34} className={styles.userAvatarImg} unoptimized />
          ) : (
            sesion.nombre.charAt(0).toUpperCase()
          )}
        </div>
        <span className={styles.userName}>{sesion.nombre}</span>
      </div>
    </div>
  );
}
