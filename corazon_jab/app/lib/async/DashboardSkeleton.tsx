// app/lib/async/DashboardSkeleton.tsx
// Placeholder visual de "esqueleto de carga" para dashboards (Usuario/Entrenador/Admin)
// mientras `useAsyncData` está en status === "loading". Ver diseño:
// .kiro/specs/design-system-unification/design.md, sección
// "4. useAsyncData + estados de carga" (interfaz SkeletonProps).
//
// No depende de ninguna librería externa: la animación de pulso/shimmer se implementa
// con `@keyframes pulse` en DashboardSkeleton.module.css usando los tokens de diseño
// (--gold) para que combine visualmente con el resto del sitio.

import type { JSX } from "react";
import styles from "./DashboardSkeleton.module.css";

export interface SkeletonProps {
  /** Número de bloques a renderizar (ej. 4 stat cards) */
  count?: number;
  variant?: "card" | "row" | "text";
}

/**
 * Renderiza `count` bloques (default 4) con la variante indicada (default "card").
 * El contenedor lleva `aria-hidden="true"` porque es un placeholder puramente visual
 * (no hay contenido real que anunciar), y expone un texto visualmente oculto
 * "Cargando..." vía `role="status"` para que los lectores de pantalla sepan que
 * el contenido está en progreso de carga.
 */
export default function DashboardSkeleton({
  count = 4,
  variant = "card",
}: SkeletonProps): JSX.Element {
  const blocks = Array.from({ length: count }, (_, index) => index);

  return (
    <div className={styles.container} data-variant={variant} aria-hidden="true">
      <span role="status" className={styles.srOnly}>
        Cargando...
      </span>
      {blocks.map((index) => (
        <div key={index} className={styles.block} data-variant={variant} />
      ))}
    </div>
  );
}
