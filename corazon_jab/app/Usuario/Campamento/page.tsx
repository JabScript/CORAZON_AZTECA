// app/usuario/campamento/page.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./Campamento.module.css";

const fightInfo = {
  opponent: "Carlos 'El Tigre' Hernández",
  date: "2026-08-15",
  weight: "70 kg (Peso Welter)",
  rounds: 10,
  // Control de peso del campamento
  pesoInicial: 78,
  pesoActual: 73.5,
  pesoObjetivo: 70,
};

const sessionsInfo = { sessions: 12, sparrings: 4 };

/** Calcula días, horas y minutos restantes hasta la fecha de la pelea */
function calcularCuentaRegresiva(fechaObjetivo: string) {
  const ahora = new Date().getTime();
  const objetivo = new Date(fechaObjetivo).getTime();
  const diferencia = Math.max(0, objetivo - ahora);

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return { dias, horas, vencido: diferencia <= 0 };
}

const weekSchedule = [
  { day: "Lunes", am: "Cardio + Saco", pm: "Sparring" },
  { day: "Martes", am: "Preparación Física", pm: "Técnica" },
  { day: "Miércoles", am: "Descanso activo", pm: "Saco + Pads" },
  { day: "Jueves", am: "Cardio + Cuerda", pm: "Sparring" },
  { day: "Viernes", am: "Preparación Física", pm: "Técnica avanzada" },
  { day: "Sábado", am: "Sparring libre", pm: "—" },
  { day: "Domingo", am: "Descanso", pm: "Descanso" },
];

export default function CampamentoPage() {
  const [tiempo, setTiempo] = useState(() => calcularCuentaRegresiva(fightInfo.date));

  // Actualiza la cuenta regresiva cada minuto para que se sienta "en vivo"
  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempo(calcularCuentaRegresiva(fightInfo.date));
    }, 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Progreso de peso: cuánto se ha avanzado desde el peso inicial hacia el objetivo
  const totalPorBajar = fightInfo.pesoInicial - fightInfo.pesoObjetivo;
  const bajadoHastaAhora = fightInfo.pesoInicial - fightInfo.pesoActual;
  const progresoPeso = totalPorBajar > 0
    ? Math.min(100, Math.max(0, (bajadoHastaAhora / totalPorBajar) * 100))
    : 100;
  const faltantePeso = Math.max(0, fightInfo.pesoActual - fightInfo.pesoObjetivo);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modo Campamento</h1>
        <p className={styles.subtitle}>Plan especial de preparación para tu próxima pelea.</p>
        <span className={styles.activeBadge}>● ACTIVO</span>
      </div>

      {/* Info de la pelea */}
      <div className={styles.fightCard}>
        <h2 className={styles.fightTitle}>Próxima Pelea</h2>
        <div className={styles.fightDetails}>
          <div><span className={styles.label}>Oponente:</span> {fightInfo.opponent}</div>
          <div><span className={styles.label}>Fecha:</span> {fightInfo.date}</div>
          <div><span className={styles.label}>Categoría:</span> {fightInfo.weight}</div>
          <div><span className={styles.label}>Rounds:</span> {fightInfo.rounds}</div>
        </div>
      </div>

      {/* Cuenta regresiva en vivo */}
      <div className={styles.countdownHero}>
        <span className={styles.countdownHeroLabel}>⏱ CUENTA REGRESIVA PARA LA PELEA</span>
        <div className={styles.countdownHeroValue}>
          {tiempo.vencido ? (
            <span className={styles.countdownVencido}>¡Es hora de pelear! 🥊</span>
          ) : (
            <>
              <span className={styles.countdownNum}>{tiempo.dias}</span>
              <span className={styles.countdownUnit}>{tiempo.dias === 1 ? "día" : "días"}</span>
              <span className={styles.countdownNum}>{tiempo.horas}</span>
              <span className={styles.countdownUnit}>{tiempo.horas === 1 ? "hora" : "horas"}</span>
            </>
          )}
        </div>
      </div>

      {/* Countdown */}
      <div className={styles.countdown}>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{tiempo.dias}</span>
          <span className={styles.countdownLabel}>Días restantes</span>
        </div>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{sessionsInfo.sessions}</span>
          <span className={styles.countdownLabel}>Sesiones planeadas</span>
        </div>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{sessionsInfo.sparrings}</span>
          <span className={styles.countdownLabel}>Sparrings programados</span>
        </div>
      </div>

      {/* Progreso de peso objetivo */}
      <div className={styles.weightCard}>
        <div className={styles.weightHeader}>
          <h2 className={styles.fightTitle}>Progreso de Peso</h2>
          <span className={styles.weightBadge}>
            {faltantePeso > 0 ? `Faltan ${faltantePeso.toFixed(1)} kg` : "¡Peso alcanzado!"}
          </span>
        </div>
        <div className={styles.weightBarTrack}>
          <div className={styles.weightBarFill} style={{ width: `${progresoPeso}%` }} />
        </div>
        <div className={styles.weightMarks}>
          <span>{fightInfo.pesoInicial} kg <em>inicio</em></span>
          <span className={styles.weightCurrent}>{fightInfo.pesoActual} kg <em>actual</em></span>
          <span>{fightInfo.pesoObjetivo} kg <em>objetivo</em></span>
        </div>
      </div>

      {/* Plan semanal */}
      <h2 className={styles.sectionTitle}>Plan Semanal</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DÍA</th>
              <th>MAÑANA</th>
              <th>TARDE</th>
            </tr>
          </thead>
          <tbody>
            {weekSchedule.map((row) => (
              <tr key={row.day}>
                <td className={styles.dayName}>{row.day}</td>
                <td>{row.am}</td>
                <td>{row.pm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
