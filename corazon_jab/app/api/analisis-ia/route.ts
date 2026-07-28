// app/api/analisis-ia/route.ts
// Route handler (servidor) que envía los datos de los alumnos de un
// entrenador al modelo Gemini de Google y devuelve insights estructurados
// (riesgos, oportunidades, predicciones) para el panel de "Análisis
// Inteligente" del entrenador.
//
// La API key de Gemini NUNCA se expone al cliente: vive solo en la variable
// de entorno `GEMINI_API_KEY` (sin prefijo NEXT_PUBLIC_) y esta ruta corre
// en el servidor de Next.js.
//
// Requiere una API key de Google AI Studio (https://aistudio.google.com/apikey).
//
// Si la key no está configurada o la llamada a Gemini falla, respondemos con
// `insights: []` y un mensaje de error para que el cliente pueda hacer
// fallback a insights de ejemplo sin romper la página.

import { NextRequest, NextResponse } from "next/server";
import type { AlumnoParaAnalisis, AnalisisIAResponse, InsightIA } from "../../Entrenador/Analisis/types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

// Esquema que fuerza a Gemini a responder con un arreglo de insights bien
// tipado, en vez de texto libre que habría que parsear a mano.
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    insights: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          tipo: { type: "STRING", enum: ["riesgo", "oportunidad", "prediccion"] },
          prioridad: { type: "STRING", enum: ["alta", "media", "baja"] },
          alumno: { type: "STRING" },
          titulo: { type: "STRING" },
          desc: { type: "STRING" },
          accion: { type: "STRING" },
        },
        required: ["tipo", "prioridad", "alumno", "titulo", "desc", "accion"],
      },
    },
  },
  required: ["insights"],
};

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

function construirPrompt(alumnos: AlumnoParaAnalisis[]): string {
  const resumen = alumnos
    .map(
      (a) =>
        `- ${a.nombre}: categoría ${a.categoria}, nivel ${a.nivel}, adherencia al plan ${a.adherencia}%, ` +
        `${a.lesionado ? `lesionado (${a.tipoLesion ?? "sin especificar"}, ${a.altaMedica ? "con alta médica" : "SIN alta médica"})` : "sin lesión"}, ` +
        `${a.esCampeon ? "es campeón de división" : "no es campeón"}.`
    )
    .join("\n");

  return `Eres un asistente de análisis deportivo para un entrenador de boxeo. Analiza los siguientes alumnos y genera entre 2 y 5 insights accionables (riesgos de sobreentrenamiento o lesión, oportunidades de progreso, o predicciones de deserción/rendimiento). Responde en español, con un tono profesional y directo, orientado a boxeo.

Datos de los alumnos:
${resumen}

Para cada insight elige el "alumno" exacto de la lista anterior. El campo "accion" debe ser un texto corto tipo botón (ej. "Programar descanso", "Ver plan sugerido").`;
}

export async function POST(request: NextRequest) {
  let alumnos: AlumnoParaAnalisis[];
  try {
    const body = (await request.json()) as { alumnos?: AlumnoParaAnalisis[] };
    alumnos = body.alumnos ?? [];
  } catch {
    return NextResponse.json<AnalisisIAResponse>(
      { insights: [], error: "Cuerpo de la petición inválido." },
      { status: 400 }
    );
  }

  if (alumnos.length === 0) {
    return NextResponse.json<AnalisisIAResponse>(
      { insights: [], error: "No hay alumnos para analizar." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json<AnalisisIAResponse>({
      insights: [],
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
        contents: [{ parts: [{ text: construirPrompt(alumnos) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });

    const data = (await geminiRes.json()) as GeminiResponse;

    if (!geminiRes.ok) {
      return NextResponse.json<AnalisisIAResponse>({
        insights: [],
        error: data.error?.message ?? `Gemini respondió con error ${geminiRes.status}.`,
      });
    }

    const textoJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textoJson) {
      return NextResponse.json<AnalisisIAResponse>({
        insights: [],
        error: "Gemini no devolvió contenido para analizar.",
      });
    }

    const parsed = JSON.parse(textoJson) as { insights?: InsightIA[] };
    return NextResponse.json<AnalisisIAResponse>({ insights: parsed.insights ?? [], error: null });
  } catch {
    return NextResponse.json<AnalisisIAResponse>({
      insights: [],
      error: "No se pudo contactar a Gemini en este momento.",
    });
  }
}
