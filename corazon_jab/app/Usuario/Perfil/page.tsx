'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Perfil.module.css';
import { obtenerSesion, guardarSesion, type Sesion } from '../../lib/sesionStorage';
import { actualizarCuenta, imagenPerfilABase64 } from '../../lib/authStorage';
import {
  obtenerAlumnoPorUsuarioId,
  actualizarPerfilAlumno,
  actualizarEntrenadorAlumno,
  type DatosAlumno,
  type OrigenEntrenador,
} from '../../lib/alumnoStorage';
import { obtenerEntrenadoresPublicos, type PerfilEntrenador } from '../../lib/entrenadorStorage';

export default function EditarPerfilAlumno() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [apodo, setApodo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [peso, setPeso] = useState('');
  const [nivel, setNivel] = useState('Principiante');
  const [objetivo, setObjetivo] = useState('Acondicionamiento físico');
  const [ciudad, setCiudad] = useState('');
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [guardado, setGuardado] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // --- Entrenador ---
  const [datosAlumno, setDatosAlumno] = useState<DatosAlumno | null>(null);
  const [entrenadores, setEntrenadores] = useState<PerfilEntrenador[]>([]);
  const [editandoEntrenador, setEditandoEntrenador] = useState(false);
  const [opcionEntrenador, setOpcionEntrenador] = useState<OrigenEntrenador>('independiente');
  const [entrenadorIdSeleccionado, setEntrenadorIdSeleccionado] = useState('');
  const [nombreManual, setNombreManual] = useState('');

  useEffect(() => {
    const s = obtenerSesion();
    setSesion(s);
    setFoto(s.foto);

    const [primerNombre = '', ...resto] = s.nombre.split(' ');
    setNombre(primerNombre);
    setApellido(resto.join(' '));

    const datos = obtenerAlumnoPorUsuarioId(s.usuarioId);
    if (datos) {
      setNombre(datos.nombre);
      setApellido(datos.apellido);
      setApodo(datos.apodo ?? '');
      setFechaNacimiento(datos.fechaNacimiento);
      setPeso(datos.peso ? String(datos.peso) : '');
      setNivel(datos.nivel || 'Principiante');
      setObjetivo(datos.objetivo || 'Acondicionamiento físico');
      setCiudad(datos.ciudad);
    }
    setDatosAlumno(datos);
    setEntrenadores(obtenerEntrenadoresPublicos());
  }, []);

  if (!sesion) return null;

  const entrenadorActual =
    datosAlumno?.origenEntrenador === 'directorio' && datosAlumno.entrenadorId
      ? entrenadores.find((e) => e.id === datosAlumno.entrenadorId)
      : null;

  const handleAbrirEditorEntrenador = () => {
    setOpcionEntrenador(datosAlumno?.origenEntrenador ?? 'independiente');
    setEntrenadorIdSeleccionado(datosAlumno?.entrenadorId ?? '');
    setNombreManual(datosAlumno?.nombreEntrenadorManual ?? '');
    setEditandoEntrenador(true);
  };

  const handleGuardarEntrenador = () => {
    actualizarEntrenadorAlumno(sesion.usuarioId, {
      origenEntrenador: opcionEntrenador,
      entrenadorId: opcionEntrenador === 'directorio' ? entrenadorIdSeleccionado : undefined,
      nombreEntrenadorManual: opcionEntrenador === 'manual' ? nombreManual.trim() : undefined,
    });
    setDatosAlumno(obtenerAlumnoPorUsuarioId(sesion.usuarioId));
    setEditandoEntrenador(false);
  };

  const handleQuitarEntrenador = () => {
    if (!confirm('¿Quieres dejar de tener entrenador y pasar a entrenamiento independiente?')) return;
    actualizarEntrenadorAlumno(sesion.usuarioId, { origenEntrenador: 'independiente' });
    setDatosAlumno(obtenerAlumnoPorUsuarioId(sesion.usuarioId));
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const base64 = await imagenPerfilABase64(archivo);
    setFoto(base64);
    setGuardado(false);
  };

  const handleGuardar = () => {
    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`.trim();

    // Actualiza el perfil deportivo (crea el registro si aún no existía).
    actualizarPerfilAlumno(sesion.usuarioId, {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      apodo: apodo.trim() || undefined,
      fechaNacimiento,
      peso: Number(peso) || 0,
      nivel,
      objetivo,
      ciudad,
    });

    // Actualiza la cuenta (nombre/foto) para que se refleje en login futuros.
    actualizarCuenta(sesion.usuarioId, { nombre: nombreCompleto, foto });

    // Actualiza la sesión activa para que el cambio se vea de inmediato
    // en el sidebar y el dashboard, sin tener que volver a iniciar sesión.
    const nuevaSesion: Sesion = { ...sesion, nombre: nombreCompleto, foto };
    guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);

    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1>Editar perfil</h1>
        <button type="button" className={styles.btnGuardar} onClick={handleGuardar}>
          {guardado ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </header>

      {/* ---------- Foto de perfil ---------- */}
      <section className={styles.seccion}>
        <h2>Foto de perfil</h2>
        <div className={styles.fotoPerfilWrap}>
          <div className={styles.fotoPreview}>
            {foto ? (
              <Image src={foto} alt="Foto de perfil" width={140} height={140} className={styles.fotoImg} unoptimized />
            ) : (
              <span className={styles.fotoPlaceholder}>{nombre.charAt(0).toUpperCase() || 'Sin foto'}</span>
            )}
          </div>
          <button type="button" className={styles.btnSecundario} onClick={() => fotoInputRef.current?.click()}>
            {foto ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <input ref={fotoInputRef} type="file" accept="image/*" hidden onChange={handleFotoChange} />
        </div>
      </section>

      {/* ---------- Información básica ---------- */}
      <section className={styles.seccion}>
        <h2>Información básica</h2>
        <div className={styles.formGrid}>
          <label className={styles.campo}>
            <span>Nombre</span>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label className={styles.campo}>
            <span>Apellido</span>
            <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          </label>
          <label className={styles.campo}>
            <span>Apodo</span>
            <input type="text" placeholder="Ej. El Rayo" value={apodo} onChange={(e) => setApodo(e.target.value)} />
          </label>
          <label className={styles.campo}>
            <span>Fecha de nacimiento</span>
            <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          </label>
          <label className={styles.campo}>
            <span>Peso (kg)</span>
            <input type="number" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)} />
          </label>
          <label className={styles.campo}>
            <span>Ciudad</span>
            <input type="text" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
          </label>
        </div>
      </section>

      {/* ---------- Entrenamiento ---------- */}
      <section className={styles.seccion}>
        <h2>Entrenamiento</h2>
        <div className={styles.formGrid}>
          <label className={styles.campo}>
            <span>Nivel</span>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option>Principiante</option>
              <option>Amateur</option>
              <option>Semi-profesional</option>
              <option>Profesional</option>
            </select>
          </label>
          <label className={styles.campo}>
            <span>Objetivo principal</span>
            <select value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
              <option>Acondicionamiento físico</option>
              <option>Aprender técnica</option>
              <option>Competir amateur</option>
              <option>Carrera profesional</option>
              <option>Bajar de peso</option>
            </select>
          </label>
        </div>
      </section>

      {/* ---------- Entrenador ---------- */}
      <section className={styles.seccion}>
        <div className={styles.entrenadorTitleRow}>
          <h2>Mi entrenador</h2>
          {!editandoEntrenador && (
            <button type="button" className={styles.btnSecundario} onClick={handleAbrirEditorEntrenador}>
              {datosAlumno && datosAlumno.origenEntrenador !== 'independiente' ? 'Cambiar entrenador' : 'Elegir entrenador'}
            </button>
          )}
        </div>

        {!editandoEntrenador ? (
          <>
            {entrenadorActual ? (
              <div className={styles.entrenadorCard}>
                <div className={styles.entrenadorAvatar}>
                  {entrenadorActual.foto ? (
                    <Image src={entrenadorActual.foto} alt={entrenadorActual.nombre} width={48} height={48} className={styles.entrenadorAvatarImg} unoptimized />
                  ) : (
                    entrenadorActual.nombre.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={styles.entrenadorInfo}>
                  <Link href={`/entrenadores/${entrenadorActual.id}`} className={styles.entrenadorNombre}>{entrenadorActual.nombre}</Link>
                  <span className={styles.entrenadorEspecialidad}>{entrenadorActual.especialidad}</span>
                </div>
                <button type="button" className={styles.btnQuitarEntrenador} onClick={handleQuitarEntrenador}>
                  Quitar entrenador
                </button>
              </div>
            ) : datosAlumno?.origenEntrenador === 'manual' && datosAlumno.nombreEntrenadorManual ? (
              <div className={styles.entrenadorCard}>
                <div className={styles.entrenadorAvatar}>{datosAlumno.nombreEntrenadorManual.charAt(0).toUpperCase()}</div>
                <div className={styles.entrenadorInfo}>
                  <span className={styles.entrenadorNombre}>{datosAlumno.nombreEntrenadorManual}</span>
                  <span className={styles.entrenadorEspecialidad}>Agregado manualmente (no está en el directorio)</span>
                </div>
                <button type="button" className={styles.btnQuitarEntrenador} onClick={handleQuitarEntrenador}>
                  Quitar entrenador
                </button>
              </div>
            ) : (
              <p className={styles.entrenadorVacio}>Actualmente entrenas de forma independiente, sin entrenador asignado.</p>
            )}
          </>
        ) : (
          <div className={styles.entrenadorEditor}>
            <div className={styles.entrenadorOpciones}>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === 'independiente' ? styles.entrenadorOpcionActiva : ''}`}
                onClick={() => setOpcionEntrenador('independiente')}
              >
                Independiente
              </button>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === 'directorio' ? styles.entrenadorOpcionActiva : ''}`}
                onClick={() => setOpcionEntrenador('directorio')}
              >
                Del directorio
              </button>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === 'manual' ? styles.entrenadorOpcionActiva : ''}`}
                onClick={() => setOpcionEntrenador('manual')}
              >
                No está en el directorio
              </button>
            </div>

            {opcionEntrenador === 'directorio' && (
              <select
                className={styles.entrenadorSelect}
                value={entrenadorIdSeleccionado}
                onChange={(e) => setEntrenadorIdSeleccionado(e.target.value)}
              >
                <option value="">— Elige un entrenador —</option>
                {entrenadores.map((ent) => (
                  <option key={ent.id} value={ent.id}>{ent.nombre} · {ent.especialidad}</option>
                ))}
              </select>
            )}

            {opcionEntrenador === 'manual' && (
              <input
                type="text"
                className={styles.entrenadorInput}
                placeholder="Nombre de tu entrenador"
                value={nombreManual}
                onChange={(e) => setNombreManual(e.target.value)}
              />
            )}

            <div className={styles.entrenadorEditorAcciones}>
              <button type="button" className={styles.btnGuardarEntrenador} onClick={handleGuardarEntrenador}>Guardar</button>
              <button type="button" className={styles.btnCancelarEntrenador} onClick={() => setEditandoEntrenador(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
