// app/lib/async/useAsyncData.ts
// Manejo uniforme de estados de carga/error/success para datos asíncronos, hoy envolviendo
// lecturas síncronas de `localStorage` y en el futuro consultas a Supabase sin cambiar la interfaz.
// Ver diseño: .kiro/specs/design-system-unification/design.md, sección
// "4. useAsyncData + estados de carga" y "Key Functions with Formal Specifications → useAsyncData".

import { useEffect, useState } from "react";

/** Estado de progreso de una Fuente_Datos_Asincrona. */
export type AsyncStatus = "idle" | "loading" | "success" | "error";

/** Estado observable expuesto por `useAsyncData`. */
export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

/** Resultado expuesto por `useAsyncData`, incluye la función para forzar una nueva ejecución. */
export interface UseAsyncDataResult<T> extends AsyncState<T> {
  refetch: () => void;
}

/**
 * Hook de datos asíncronos con protección contra actualizaciones tras desmontaje.
 *
 * Comportamiento:
 * - Al montar y cada vez que `deps` cambia: transiciona `status` a `"loading"` de forma
 *   síncrona (antes de que la promesa resuelva).
 * - Si la promesa resuelve: `status = "success"`, `data` poblado, `error = null`.
 * - Si la promesa es rechazada: `status = "error"`, `data = null`, `error` con el mensaje
 *   normalizado (`error instanceof Error ? error.message : "Error desconocido"`).
 * - `refetch()`: fuerza una nueva ejecución del fetcher sin depender de cambios en `deps`.
 * - Invariante: nunca se llama `setState` después de que el efecto fue cancelado (por
 *   desmontaje o por una nueva ejecución del efecto antes de que la anterior resolviera).
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList
): UseAsyncDataResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: "idle",
    data: null,
    error: null,
  });
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setState({ status: "loading", data: null, error: null });

    fetcher()
      .then((result) => {
        if (cancelled) {
          return;
        }
        setState({ status: "success", data: result, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        const message = err instanceof Error ? err.message : "Error desconocido";
        setState({ status: "error", data: null, error: message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { ...state, refetch };
}
