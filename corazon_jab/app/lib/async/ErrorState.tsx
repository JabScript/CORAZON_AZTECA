// app/lib/async/ErrorState.tsx
// Estado de error para dashboards (Usuario/Entrenador/Admin) mientras `useAsyncData`
// está en status === "error". Ver diseño:
// .kiro/specs/design-system-unification/design.md, sección
// "4. useAsyncData + estados de carga" (interfaz ErrorStateProps).

import type { JSX } from "react";
import styles from "./ErrorState.module.css";

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Renderiza un ícono de error, el `message` (con `role="alert"` para que los
 * lectores de pantalla lo anuncien) y, si `onRetry` está definido, un botón
 * "Reintentar" que lo invoca (usado como `refetch` de `useAsyncData`).
 */
export default function ErrorState({ message, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <div className={styles.container}>
      <svg
        className={styles.icon}
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p role="alert" className={styles.message}>
        {message}
      </p>
      {onRetry && (
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
