// app/api/analisis-ia/chat/route.ts
// Route handler (servidor) que mantiene una conversación de chat con Gemini
// en el contexto de "Análisis Inteligente" del entrenador: el entrenador
// puede preguntar libremente sobre sus alumnos (o hacer clic en la acción de
// un insight) y Gemini responde con el contexto de los datos del grupo.
//
// La API key de Gemini NUNCA se expone al cliente: vive solo en la variable
// de entorno `GEMINI_API_KEY`, y esta ruta corre en el servidor de Next.js.

import { NextRequest, NextResponse } from "next/server";
import type { AlumnoParaAnalisis, ChatIAResponse, MensajeChatIA } from "../../../Entrenador/Analisis/types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

const MAX_MENSAJES = 20;

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

function construirInstruccionSistema(alumnos: AlumnoParaAnalisis[]): string {
  const resumen = alumnos
    .map(
      (a) =>
        `- ${a.nombre}: categoría ${a.categoria}, nivel ${a.nivel}, adherencia al plan ${a.adherencia}%, ` +
        `${a.lesionado ? `lesionado (${a.tipoLesion ?? "sin especificar"}, ${a.altaMedica ? "con alta médica" : "SIN alta médica"})` : "sin lesión"}, ` +
        `${a.esCampeon ? "es campeón de división" : "no es campeón"}.`
    )
    .join("\n");

  return `Eres el asistente de "Análisis Inteligente" de Corazón Azteca, una app para entrenadores de boxeo. Ayudas al entrenador a interpretar datos de sus alumnos, sugerir planes de entrenamiento, decisiones sobre lesiones/descansos y estrategias de sparring. Responde en español, en tono profesional, directo y breve (máximo 3-4 párrafos cortos).

Datos actuales de los alumnos del entrenador:
${resumen}`;
}

function mapearMensajes(mensajes: MensajeChatIA[]): GeminiContent[] {
  return mensajes.slice(-MAX_MENSAJES).map((m) => ({
    role: m.rol === "usuario" ? "user" : "model",
    parts: [{ text: m.texto }],
  }));
}

export async function POST(request: NextRequest) {
  let mensajes: MensajeChatIA[];
  let alumnos: AlumnoParaAnalisis[];
  try {
    const body = (await request.json()) as { mensajes?: MensajeChatIA[]; alumnos?: AlumnoParaAnalisis[] };
    mensajes = body.mensajes ?? [];
    alumnos = body.alumnos ?? [];
  } catch {
    return NextResponse.json<ChatIAResponse>(
      { respuesta: null, error: "Cuerpo de la petición inválido." },
      { status: 400 }
    );
  }

  if (mensajes.length === 0) {
    return NextResponse.json<ChatIAResponse>(
      { respuesta: null, error: "No hay mensajes en la conversación." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json<ChatIAResponse>({
      respuesta: null,
      error: "GEMINI_API_KEY no está configurada en el servidor.",
    });
  }

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: construirInstruccionSistema(alumnos) }] },
        contents: mapearMensajes(mensajes),
      }),
    });

    const data = (await geminiRes.json()) as GeminiResponse;

    if (!geminiRes.ok) {
      return NextResponse.json<ChatIAResponse>({
        respuesta: null,
        error: data.error?.message ?? `Gemini respondió con error ${geminiRes.status}.`,
      });
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) {
      return NextResponse.json<ChatIAResponse>({
        respuesta: null,
        error: "Gemini no devolvió una respuesta.",
      });
    }

    return NextResponse.json<ChatIAResponse>({ respuesta: texto, error: null });
  } catch {
    return NextResponse.json<ChatIAResponse>({
      respuesta: null,
      error: "No se pudo contactar a Gemini en este momento.",
    });
  }
}
