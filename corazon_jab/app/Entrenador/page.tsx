'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { obtenerPerfil, type PerfilEntrenador } from '../lib/entrenadorStorage';

export default function PerfilEntrenadorPage() {
  const [perfil, setPerfil] = useState<PerfilEntrenador | null>(null);
  const [fotoAmpliada, setFotoAmpliada] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    setPerfil(obtenerPerfil());
  }, []);

  if (!perfil) return null;

  return (
    <main className={styles.pagina}>
      {/* ---------- Cabecera de perfil ---------- */}
      <section className={styles.cabecera}>
        <div className={styles.foto}>
          {perfil.foto ? (
            <Image
              src={perfil.foto}
              alt={`Foto de ${perfil.nombre}`}
              width={160}
              height={160}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : null}
        </div>
        <div className={styles.cabeceraInfo}>
          <span className={styles.especialidad}>{perfil.especialidad}</span>
          <h1>{perfil.nombre}</h1>
          <p className={styles.trayectoria}>
            {perfil.anosTrayectoria} años de trayectoria como entrenador
          </p>
          <p className={styles.bio}>{perfil.bio}</p>
          <Link href="/Entrenador/Perfil" className={styles.btnEditar}>
            Editar perfil
          </Link>
        </div>
      </section>

      {/* ---------- Lo más relevante ---------- */}
      {perfil.logros.length > 0 && (
        <section className={styles.seccion}>
          <h2>Lo más relevante</h2>
          <ul className={styles.logros}>
            {perfil.logros.map((logro, idx) => (
              <li key={idx}>{logro}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Galería de trayectoria ---------- */}
      {perfil.galeria.length > 0 && (
        <section className={styles.seccion}>
          <h2>Galería de trayectoria</h2>
          <div className={styles.galeria}>
            {perfil.galeria.map((foto) => (
              <button
                key={foto.id}
                type="button"
                className={styles.galeriaItem}
                onClick={() => setFotoAmpliada(foto)}
                aria-label={`Ampliar foto: ${foto.alt}`}
              >
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  width={200}
                  height={200}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Redes sociales ---------- */}
      {perfil.redes.length > 0 && (
        <section className={styles.seccion}>
          <h2>Redes sociales</h2>
          <div className={styles.redes}>
            {perfil.redes.map((red, idx) => (
              <a
                key={idx}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.redItem}
              >
                <span className={styles.redNombre}>{red.nombre}</span>
                <span className={styles.redUsuario}>{red.usuario}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Visor de foto ampliada ---------- */}
      {fotoAmpliada && (
        <div
          className={styles.visor}
          role="dialog"
          aria-modal="true"
          onClick={() => setFotoAmpliada(null)}
        >
          <Image
            src={fotoAmpliada.src}
            alt={fotoAmpliada.alt}
            width={800}
            height={800}
            className={styles.visorImg}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
          />
          <button
            type="button"
            className={styles.visorCerrar}
            onClick={() => setFotoAmpliada(null)}
            aria-label="Cerrar foto"
          >
            &times;
          </button>
        </div>
      )}
    </main>
  );
}
