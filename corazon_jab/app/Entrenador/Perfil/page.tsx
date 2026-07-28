'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Perfil.module.css';
import { useSesion } from '../../lib/auth/SessionProvider';
import {
  obtenerPerfilPorCuentaId,
  guardarPerfil,
  subirFotoPerfilEntrenador,
  subirFotoGaleria,
  type PerfilEntrenador,
  type RedSocial,
  type FotoGaleria,
} from '../../lib/entrenadorStorage';

export default function EditarPerfil() {
  const { sesion } = useSesion();
  const cuenta = sesion.estado === 'con_sesion' ? sesion.cuenta : null;

  const [perfil, setPerfil] = useState<PerfilEntrenador | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [nuevoLogro, setNuevoLogro] = useState('');
  const [nuevaRed, setNuevaRed] = useState<RedSocial>({ nombre: '', usuario: '', url: '' });
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const galeriaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cuenta) return;
    obtenerPerfilPorCuentaId(cuenta.id).then(setPerfil);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuenta?.id]);

  if (!perfil || !cuenta) return null;

  const actualizar = (campos: Partial<PerfilEntrenador>) => {
    setPerfil((prev) => (prev ? { ...prev, ...campos } : prev));
    setGuardado(false);
  };

  const handleGuardar = async () => {
    if (!perfil) return;
    setGuardando(true);
    try {
      await guardarPerfil({
        cuentaId: cuenta.id,
        especialidad: perfil.especialidad,
        anosTrayectoria: perfil.anosTrayectoria,
        bio: perfil.bio,
        logros: perfil.logros,
        redes: perfil.redes,
        galeria: perfil.galeria,
      });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } finally {
      setGuardando(false);
    }
  };

  // --- Foto de perfil ---
  const handleFotoPerfil = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const ruta = await subirFotoPerfilEntrenador(cuenta.id, archivo);
    const actualizado = await obtenerPerfilPorCuentaId(cuenta.id);
    if (actualizado) setPerfil(actualizado);
    else actualizar({ fotoRef: ruta });
  };

  // --- Galería ---
  const handleFotosGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;
    const nuevasFotos: FotoGaleria[] = [];
    for (let i = 0; i < archivos.length; i++) {
      const foto = await subirFotoGaleria(perfil.id, archivos[i]);
      nuevasFotos.push(foto);
    }
    actualizar({ galeria: [...perfil.galeria, ...nuevasFotos] });
  };

  const eliminarFotoGaleria = (id: string) => {
    actualizar({ galeria: perfil.galeria.filter((f) => f.id !== id) });
  };

  // --- Logros ---
  const agregarLogro = () => {
    if (!nuevoLogro.trim()) return;
    actualizar({ logros: [...perfil.logros, nuevoLogro.trim()] });
    setNuevoLogro('');
  };

  const eliminarLogro = (idx: number) => {
    actualizar({ logros: perfil.logros.filter((_, i) => i !== idx) });
  };

  // --- Redes sociales ---
  const agregarRed = () => {
    if (!nuevaRed.nombre.trim() || !nuevaRed.url.trim()) return;
    actualizar({ redes: [...perfil.redes, nuevaRed] });
    setNuevaRed({ nombre: '', usuario: '', url: '' });
  };

  const eliminarRed = (idx: number) => {
    actualizar({ redes: perfil.redes.filter((_, i) => i !== idx) });
  };

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1>Editar perfil</h1>
        <button
          type="button"
          className={styles.btnGuardar}
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </header>

      {/* ---------- Foto de perfil ---------- */}
      <section className={styles.seccion}>
        <h2>Foto de perfil</h2>
        <div className={styles.fotoPerfilWrap}>
          <div className={styles.fotoPreview}>
            {perfil.foto ? (
              <Image
                src={perfil.foto}
                alt="Foto de perfil"
                width={140}
                height={140}
                className={styles.fotoImg}
                unoptimized
              />
            ) : (
              <span className={styles.fotoPlaceholder}>Sin foto</span>
            )}
          </div>
          <button
            type="button"
            className={styles.btnSecundario}
            onClick={() => fotoInputRef.current?.click()}
          >
            Cambiar foto
          </button>
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFotoPerfil}
          />
        </div>
      </section>

      {/* ---------- Info básica ---------- */}
      <section className={styles.seccion}>
        <h2>Información básica</h2>
        <div className={styles.formGrid}>
          <label className={styles.campo}>
            <span>Especialidad</span>
            <input
              type="text"
              value={perfil.especialidad}
              onChange={(e) => actualizar({ especialidad: e.target.value })}
            />
          </label>
          <label className={styles.campo}>
            <span>Años de trayectoria</span>
            <input
              type="number"
              min={0}
              value={perfil.anosTrayectoria}
              onChange={(e) => actualizar({ anosTrayectoria: Number(e.target.value) })}
            />
          </label>
        </div>
        <label className={styles.campo}>
          <span>Biografía</span>
          <textarea
            rows={4}
            value={perfil.bio}
            onChange={(e) => actualizar({ bio: e.target.value })}
          />
        </label>
      </section>

      {/* ---------- Logros ---------- */}
      <section className={styles.seccion}>
        <h2>Logros destacados</h2>
        <ul className={styles.listaItems}>
          {perfil.logros.map((logro, idx) => (
            <li key={idx}>
              <span>{logro}</span>
              <button
                type="button"
                className={styles.btnEliminar}
                onClick={() => eliminarLogro(idx)}
                aria-label={`Eliminar logro: ${logro}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.agregarRow}>
          <input
            type="text"
            placeholder="Nuevo logro..."
            value={nuevoLogro}
            onChange={(e) => setNuevoLogro(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregarLogro()}
          />
          <button type="button" className={styles.btnSecundario} onClick={agregarLogro}>
            Agregar
          </button>
        </div>
      </section>

      {/* ---------- Redes sociales ---------- */}
      <section className={styles.seccion}>
        <h2>Redes sociales</h2>
        <ul className={styles.listaItems}>
          {perfil.redes.map((red, idx) => (
            <li key={idx}>
              <div className={styles.redInfo}>
                <strong>{red.nombre}</strong>
                <span>{red.usuario}</span>
              </div>
              <button
                type="button"
                className={styles.btnEliminar}
                onClick={() => eliminarRed(idx)}
                aria-label={`Eliminar red: ${red.nombre}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.agregarRedForm}>
          <input
            type="text"
            placeholder="Nombre (Instagram, TikTok...)"
            value={nuevaRed.nombre}
            onChange={(e) => setNuevaRed({ ...nuevaRed, nombre: e.target.value })}
          />
          <input
            type="text"
            placeholder="Usuario (@usuario)"
            value={nuevaRed.usuario}
            onChange={(e) => setNuevaRed({ ...nuevaRed, usuario: e.target.value })}
          />
          <input
            type="url"
            placeholder="URL (https://...)"
            value={nuevaRed.url}
            onChange={(e) => setNuevaRed({ ...nuevaRed, url: e.target.value })}
          />
          <button type="button" className={styles.btnSecundario} onClick={agregarRed}>
            Agregar red
          </button>
        </div>
      </section>

      {/* ---------- Galería ---------- */}
      <section className={styles.seccion}>
        <h2>Galería de fotos</h2>
        <p className={styles.hint}>
          Sube fotos de entrenamientos, competencias, reconocimientos, etc.
        </p>
        <div className={styles.galeriaGrid}>
          {perfil.galeria.map((foto) => (
            <div key={foto.id} className={styles.galeriaItem}>
              <Image
                src={foto.src}
                alt={foto.alt}
                width={160}
                height={160}
                className={styles.galeriaImg}
                unoptimized
              />
              <button
                type="button"
                className={styles.btnEliminarFoto}
                onClick={() => eliminarFotoGaleria(foto.id)}
                aria-label={`Eliminar foto: ${foto.alt}`}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.galeriaAdd}
            onClick={() => galeriaInputRef.current?.click()}
          >
            + Agregar fotos
          </button>
        </div>
        <input
          ref={galeriaInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFotosGaleria}
        />
      </section>
    </main>
  );
}
