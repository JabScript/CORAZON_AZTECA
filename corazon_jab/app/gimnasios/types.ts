// app/gimnasios/types.ts
// Tipos compartidos entre la ruta API de gimnasios (server, usa Google Maps
// Platform) y la página (client).

export interface GimnasioApiResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviews: number;
  /** true = abierto ahora, false = cerrado ahora, null = sin dato de horario */
  isOpen: boolean | null;
  /** URL propia (proxy) que sirve la foto del lugar sin exponer la API key */
  photoUrl: string | null;
  /** Enlace directo a Google Maps para ese lugar */
  mapsUrl: string;
}

export interface GimnasiosApiResponse {
  results: GimnasioApiResult[];
  error: string | null;
}
