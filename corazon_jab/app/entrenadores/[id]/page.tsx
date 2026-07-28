'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './EntrenadorPublico.module.css';
import { obtenerEntrenadorPorId, type PerfilEntrenador } from '../../lib/entrenadorStorage';

export default function EntrenadorPublico() {
  const params = useParams();
  const id = params.id as string;
  const [perfil, setPerfil] = useState<PerfilEntrenador | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    obtenerEntrenadorPorId(id).then((datos) => {
      if (datos) {
        setPerfil(datos);
      } else {
        setNoEncontrado(true);
      }
    });
  }, [id]);

  if (noEncontrado) {
    return (
      <main className={styles.pagina}>
        <div className={styles.noEncontrado}>
          <h1>Entrenador no encontrado</h1>
          <p>El perfil que buscas no existe o no ha sido creado aún.</p>
          <Link href="/entrenadores" className={styles.btnVolver}>
            Ver todos los entrenadores
          </Link>
        </div>
      </main>
    );
  }

  if (!perfil) return null;

  return (
    <main className={styles.pagina}>
      <Link href="/entrenadores" className={styles.breadcrumb}>
        ← Todos los entrenadores
      </Link>

      {/* ---------- Cabecera ---------- */}
      <section className={styles.cabecera}>
        <div className={styles.foto}>
          {perfil.foto ? (
            <Image
              src={perfil.foto}
              alt={`Foto de ${perfil.nombre}`}
              width={180}
              height={180}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              unoptimized
            />
          ) : (
            <span className={styles.fotoPlaceholder}>🥊</span>
          )}
        </div>
        <div className={styles.cabeceraInfo}>
          <span className={styles.especialidad}>{perfil.especialidad}</span>
          <h1>{perfil.nombre}</h1>
          <p className={styles.trayectoria}>
            {perfil.anosTrayectoria} años de trayectoria como entrenador
          </p>
          <p className={styles.bio}>{perfil.bio}</p>
        </div>
      </section>

      {/* ---------- Logros ---------- */}
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

      {/* ---------- Galería ---------- */}
      {perfil.galeria.length > 0 && (
        <section className={styles.seccion}>
          <h2>Galería</h2>
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
                  unoptimized
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

      {/* ---------- Visor ---------- */}
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
            unoptimized
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
