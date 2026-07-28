// app/components/ImagenEditable/ImagenEditable.tsx
// Envuelve una imagen de contenido editorial (leyendas, historia) y permite
// que un admin la reemplace subiendo una foto. Los visitantes normales solo
// ven la imagen, sin ningún control.
"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { useSesion } from "../../lib/auth/SessionProvider";
import {
  obtenerImagenPersonalizada,
  guardarImagenPersonalizada,
  quitarImagenPersonalizada,
  imagenABase64,
} from "../../lib/contenidoStorage";
import styles from "./ImagenEditable.module.css";

interface ImagenEditableProps extends Omit<ImageProps, "src"> {
  /** Clave estable que identifica esta imagen (ej. "leyenda-barby-juarez") */
  clave: string;
  /** Imagen original/por defecto (ruta en /public) */
  srcOriginal: string;
  /** Clase para el contenedor relativo (necesaria cuando se usa `fill`) */
  wrapperClassName?: string;
}

/**
 * Garantiza que toda imagen renderizada con `fill` tenga `sizes` definido.
 *
 * Si `imageProps.fill === true` y `imageProps.sizes` es `undefined`, emite un
 * `console.error` en desarrollo (mencionando la `clave` de la imagen para
 * ubicar fácilmente el caller) y retorna `"100vw"` como fallback en cualquier
 * entorno. Si `fill` no está presente o `sizes` ya viene definido, retorna el
 * `sizes` original sin modificar (no-op). Nunca lanza una excepción: es una
 * salvaguarda, no una validación bloqueante.
 */
function assertSizesWhenFill(
  imageProps: Omit<ImageProps, "src">,
  clave: string
): ImageProps["sizes"] | undefined {
  if (imageProps.fill === true && imageProps.sizes === undefined) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `ImagenEditable ("${clave}"): se usó "fill" sin "sizes". Se aplicará sizes="100vw" como fallback, pero deberías declarar un "sizes" explícito para evitar servir la imagen a resolución completa en todos los breakpoints.`
      );
    }
    return "100vw";
  }
  return imageProps.sizes;
}

export default function ImagenEditable({
  clave,
  srcOriginal,
  wrapperClassName,
  className,
  ...imageProps
}: ImagenEditableProps) {
  const { sesion } = useSesion();
  const esAdminActual = sesion.estado === "con_sesion" && sesion.cuenta.rol === "admin";

  const [srcActual, setSrcActual] = useState(srcOriginal);
  const [cargando, setCargando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const personalizada = obtenerImagenPersonalizada(clave);
    setSrcActual(personalizada ?? srcOriginal);
  }, [clave, srcOriginal]);

  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) return;

    setCargando(true);
    try {
      const base64 = await imagenABase64(archivo);
      guardarImagenPersonalizada(clave, base64);
      setSrcActual(base64);
    } finally {
      setCargando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleQuitar = () => {
    quitarImagenPersonalizada(clave);
    setSrcActual(srcOriginal);
  };

  const tieneImagenPersonalizada = srcActual !== srcOriginal;
  const sizesEfectivo = assertSizesWhenFill(imageProps, clave);

  return (
    <div className={`${styles.wrapper} ${wrapperClassName ?? ""}`}>
      <Image
        {...imageProps}
        src={srcActual}
        className={className}
        sizes={sizesEfectivo}
        unoptimized={srcActual.startsWith("data:")}
      />

      {esAdminActual && (
        <div className={styles.controles}>
          <button
            type="button"
            className={styles.btnSubir}
            onClick={() => inputRef.current?.click()}
            disabled={cargando}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            {cargando ? "Subiendo..." : "Cambiar foto"}
          </button>
          {tieneImagenPersonalizada && (
            <button type="button" className={styles.btnQuitar} onClick={handleQuitar}>
              Restaurar original
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleArchivo}
          />
        </div>
      )}
    </div>
  );
}
