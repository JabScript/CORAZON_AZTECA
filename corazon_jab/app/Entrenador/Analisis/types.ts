// app/Entrenador/Analisis/types.ts
// Tipos compartidos entre la ruta API de análisis IA (server, usa Gemini) y
// la página del entrenador (client).

export interface AlumnoParaAnalisis {
  nombre: string;
  categoria: string;
  nivel: string;
  adherencia: number;
  lesionado: boolean;
  tipoLesion?: string | null;
  altaMedica: boolean;
  esCampeon: boolean;
}

export type TipoInsight = "riesgo" | "oportunidad" | "prediccion";
export type PrioridadInsight = "alta" | "media" | "baja";

export interface InsightIA {
  tipo: TipoInsight;
  prioridad: PrioridadInsight;
  alumno: string;
  titulo: string;
  desc: string;
  accion: string;
}

export interface AnalisisIAResponse {
  insights: InsightIA[];
  error: string | null;
}

/** Un turno de la conversación con la IA (chat de "Análisis Inteligente") */
export interface MensajeChatIA {
  rol: "usuario" | "ia";
  texto: string;
}

export interface ChatIARequest {
  mensajes: MensajeChatIA[];
  alumnos: AlumnoParaAnalisis[];
}

export interface ChatIAResponse {
  respuesta: string | null;
  error: string | null;
}
