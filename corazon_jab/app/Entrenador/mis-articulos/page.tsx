// app/Entrenador/mis-articulos/page.tsx
// Ruta anidada dentro del panel de Entrenador para que el sidebar
// se mantenga visible (ver app/components/MisArticulos/MisArticulos.tsx).
"use client";

import MisArticulos from "../../components/MisArticulos/MisArticulos";

export default function MisArticulosEntrenadorPage() {
  return <MisArticulos writeHref="/blog/escribir" />;
}
