// app/Entrenador/Analisis/ChatIA.tsx
// Panel de chat flotante para conversar con Gemini en el contexto de
// "Análisis Inteligente". Se abre con un botón flotante o con la acción de
// un insight (que pre-carga una pregunta relacionada a ese alumno).
"use client";

import { useEffect, useRef, useState } from "react";
import type { AlumnoParaAnalisis, ChatIAResponse, MensajeChatIA } from "./types";
import styles from "./ChatIA.module.css";

interface ChatIAProps {
  alumnos: AlumnoParaAnalisis[];
  /** Pregunta pendiente de enviar (ej. al hacer clic en la acción de un insight) */
  preguntaInicial: string | null;
  /** Se llama tras consumir `preguntaInicial`, para que el padre no la reenvíe */
  onPreguntaInicialConsumida: () => void;
}

export default function ChatIA({ alumnos, preguntaInicial, onPreguntaInicialConsumida }: ChatIAProps) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChatIA[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  const enviarMensaje = async (contenido: string) => {
    const nuevoMensaje: MensajeChatIA = { rol: "usuario", texto: contenido };
    const historial = [...mensajes, nuevoMensaje];
    setMensajes(historial);
    setEnviando(true);
    setError(null);

    try {
      const res = await fetch("/api/analisis-ia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: historial, alumnos }),
      });
      const data = (await res.json()) as ChatIAResponse;

      if (data.error || !data.respuesta) {
        setError(data.error ?? "No se pudo obtener respuesta de la IA.");
        return;
      }

      setMensajes([...historial, { rol: "ia", texto: data.respuesta }]);
    } catch {
      setError("No se pudo conectar con Gemini en este momento.");
    } finally {
      setEnviando(false);
    }
  };

  // Cuando el padre indica una pregunta inicial (desde el botón de un
  // insight), la abrimos y enviamos automáticamente.
  useEffect(() => {
    if (!preguntaInicial) return;
    setAbierto(true);
    onPreguntaInicialConsumida();
    void enviarMensaje(preguntaInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enviarMensaje es estable en la práctica; evitar loop por dependencias de mensajes/alumnos
  }, [preguntaInicial]);

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, enviando]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;
    setTexto("");
    void enviarMensaje(contenido);
  };

  if (!abierto) {
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => setAbierto(true)}
        aria-label="Abrir chat con la IA"
      >
        💬 Preguntar a la IA
      </button>
    );
  }

  return (
    <div className={styles.panel} role="dialog" aria-label="Chat con la IA de análisis">
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>◇ Asistente Gemini</span>
        <button type="button" className={styles.closeBtn} onClick={() => setAbierto(false)} aria-label="Cerrar chat">
          ✕
        </button>
      </div>

      <div className={styles.mensajes} ref={listaRef}>
        {mensajes.length === 0 && (
          <p className={styles.hint}>
            Pregúntame sobre tus alumnos: riesgos, planes de entrenamiento, sparring, o lo que necesites.
          </p>
        )}
        {mensajes.map((m, idx) => (
          <div key={idx} className={m.rol === "usuario" ? styles.mensajeUsuario : styles.mensajeIA}>
            {m.texto}
          </div>
        ))}
        {enviando && <div className={styles.mensajeIA}>Escribiendo...</div>}
        {error && <p className={styles.errorText}>{error}</p>}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Escribe tu pregunta..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={enviando}
        />
        <button type="submit" className={styles.sendBtn} disabled={enviando || !texto.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
