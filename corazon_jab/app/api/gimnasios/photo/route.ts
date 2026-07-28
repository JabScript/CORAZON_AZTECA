// app/api/gimnasios/photo/route.ts
// Proxy de fotos de Google Places API (New): recibe el "name" de una foto
// (formato "places/{placeId}/photos/{photoId}") y devuelve la imagen
// binaria, sin exponer nunca la API key al navegador del cliente.

import { NextRequest, NextResponse } from "next/server";

const MAX_WIDTH_PX = 800;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Falta el parámetro 'ref'." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY no configurada." }, { status: 500 });
  }

  // `ref` viene como "places/XXXX/photos/YYYY" (el "name" que devuelve
  // Places API New). Le agregamos "/media" para pedir el binario de la foto.
  const url = new URL(`https://places.googleapis.com/v1/${ref}/media`);
  url.searchParams.set("maxWidthPx", String(MAX_WIDTH_PX));
  url.searchParams.set("key", apiKey);

  const googleRes = await fetch(url.toString());

  if (!googleRes.ok || !googleRes.body) {
    return NextResponse.json({ error: "No se pudo obtener la foto." }, { status: 502 });
  }

  return new NextResponse(googleRes.body, {
    headers: {
      "Content-Type": googleRes.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
