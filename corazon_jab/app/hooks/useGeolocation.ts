// app/hooks/useGeolocation.ts
"use client";

import { useState, useCallback } from "react";

export interface Coords {
  lat: number;
  lng: number;
}

interface GeolocationState {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

/**
 * Hook para solicitar y obtener la ubicación del usuario.
 * No se solicita automáticamente al montar — se dispara con requestLocation()
 * para respetar el gesto explícito del usuario (mejor UX y requerido por algunos navegadores).
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState((s) => ({ ...s, error: "Tu navegador no soporta geolocalización." }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          coords: null,
          loading: false,
          error: denied
            ? "Permiso de ubicación denegado. Actívalo en la configuración de tu navegador."
            : "No pudimos obtener tu ubicación. Intenta de nuevo.",
          permissionDenied: denied,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  return { ...state, requestLocation };
}

/** Distancia en km entre dos coordenadas usando la fórmula de Haversine. */
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
