// app/api/gimnasios/route.ts
// Route handler (servidor) que consulta la Places API (New) de Google para
// encontrar específicamente gimnasios de BOXEO cerca de una ubicación dada.
//
// La API key de Google NUNCA se expone al cliente: vive solo en la variable
// de entorno `GOOGLE_MAPS_API_KEY` (sin prefijo NEXT_PUBLIC_) y esta ruta
// corre en el servidor de Next.js.
//
// Usamos Places API (New) - Text Search (searchText) con una consulta de
// texto ("gimnasio de boxeo") en lugar de Nearby Search con el tipo genérico
// "gym". Nearby Search con type=gym devuelve deportivos, hoteles con
// gimnasio, clubes deportivos, etc. sin relación con boxeo. Text Search con
// una consulta explícita de boxeo sí filtra por relevancia semántica y
// devuelve resultados como "Jaguar Boxing Gym", "Thunder Boxing Gym", etc.
// Requiere habilitar "Places API (New)" en Google Cloud Console:
// https://console.cloud.google.com/apis/library/places.googleapis.com
//
// Si la key no está configurada, la API no está habilitada, o la llamada a
// Google falla, respondemos con `results: []` y un mensaje de error para
// que el cliente pueda hacer fallback a los gimnasios de ejemplo sin romper
// la página.

import { NextRequest, NextResponse } from "next/server";
import type { GimnasioApiResult, GimnasiosApiResponse } from "../../gimnasios/types";

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const DEFAULT_RADIUS_METERS = 10000; // 10 km
const BOXING_QUERY = "gimnasio de boxeo";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.currentOpeningHours.openNow",
  "places.photos",
  "places.primaryType",
].join(",");

interface GooglePlaceNew {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: { openNow?: boolean };
  photos?: { name: string }[];
  primaryType?: string;
}

interface GoogleSearchTextResponse {
  places?: GooglePlaceNew[];
  error?: { message?: string };
}

// Tipos de lugar de Google que no son gimnasios/escuelas de boxeo, aunque el
// texto de búsqueda los haga aparecer (ej. tiendas de equipo de boxeo).
const EXCLUDED_TYPES = new Set(["store", "clothing_store", "shoe_store", "sporting_goods_store"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radius = Number(searchParams.get("radius")) || DEFAULT_RADIUS_METERS;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json<GimnasiosApiResponse>(
      { results: [], error: "Faltan las coordenadas (lat, lng)." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json<GimnasiosApiResponse>({
      results: [],
      error: "GOOGLE_MAPS_API_KEY no está configurada en el servidor.",
    });
  }

  try {
    const googleRes = await fetch(TEXT_SEARCH_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: BOXING_QUERY,
        maxResultCount: 20,
        languageCode: "es",
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius,
          },
        },
      }),
    });

    const data = (await googleRes.json()) as GoogleSearchTextResponse;

    if (!googleRes.ok) {
      return NextResponse.json<GimnasiosApiResponse>({
        results: [],
        error: data.error?.message ?? `Google Places respondió con error ${googleRes.status}.`,
      });
    }

    const results: GimnasioApiResult[] = (data.places ?? [])
      .filter((place) => place.location && !EXCLUDED_TYPES.has(place.primaryType ?? ""))
      .map((place) => {
        const photoName = place.photos?.[0]?.name;
        return {
          id: place.id,
          name: place.displayName?.text ?? "",
          address: place.formattedAddress ?? "",
          lat: place.location!.latitude,
          lng: place.location!.longitude,
          rating: place.rating ?? null,
          reviews: place.userRatingCount ?? 0,
          isOpen: place.currentOpeningHours?.openNow ?? null,
          photoUrl: photoName
            ? `/api/gimnasios/photo?ref=${encodeURIComponent(photoName)}`
            : null,
          mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.id}`,
        };
      });

    return NextResponse.json<GimnasiosApiResponse>({ results, error: null });
  } catch {
    return NextResponse.json<GimnasiosApiResponse>({
      results: [],
      error: "No se pudo contactar a Google Places en este momento.",
    });
  }
}
