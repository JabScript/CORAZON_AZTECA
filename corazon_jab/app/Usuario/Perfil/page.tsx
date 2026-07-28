'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Perfil.module.css';
import { useSesion } from '../../lib/auth/SessionProvider';
import { subirFotoPerfil, resolverUrlFoto } from '../../lib/auth/fotoPerfil';
import {
  obtenerAlumnoPorCuentaId,
  actualizarPerfilAlumno,
  actualizarEntrenadorAlumno,
  type DatosAlumno,
  type OrigenEntrenador,
} from '../../lib/alumnoStorage';
import { obtenerEntrenadoresPublicos, type PerfilEntrenador } from '../../lib/entrenadorStorage';

export default function EditarPerfilAlumno() {
  const { sesion } = useSesion();
  const cuenta = sesion.estado === 'con_sesion' ? sesion.cuenta : null;

  const [apellido, setApellido] = useState('');
  const [apodo, setApodo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [peso, setPeso] = useState('');
  const [nivel, setNivel] = useState('Principiante');
  const [objetivo, setObjetivo] = useState('Acondicionamiento físico');
  const [ciudad, setCiudad] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // --- Entrenador ---
  const [datosAlumno, setDatosAlumno] = useState<DatosAlumno | null>(null);
  const [entrenadores, setEntrenadores] = useState<PerfilEntrenador[]>([]);
  const [editandoEntrenador, setEditandoEntrenador] = useState(false);
  const [opcionEntrenador, setOpcionEntrenador] = useState<OrigenEntrenador>('independiente');
  const [entrenadorIdSeleccionado, setEntrenadorIdSeleccionado] = useState('');
  const [nombreManual, setNombreManual] = useState('');

  const cargarDatos = async () => {
    if (!cuenta) return;
    setFotoUrl(resolverUrlFoto(cuenta.fotoRef));

    const datos = await obtenerAlumnoPorCuentaId(cuenta.id);
    if (datos) {
      setApellido(datos.apellido);
      setApodo(datos.apodo ?? '');
      setFechaNacimiento(datos.fechaNacimiento);
      setPeso(datos.peso ? String(datos.peso) : '');
      setNivel(datos.nivel || 'Principiante');
      setObjetivo(datos.objetivo || 'Acondicionamiento físico');
      setCiudad(datos.ciudad);
    }
    setDatosAlumno(datos);

    const lista = await obtenerEntrenadoresPublicos();
    setEntrenadores(lista);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuenta?.id]);

  if (!cuenta) return null;

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

  const handleGuardarEntrenador = async () => {
    await actualizarEntrenadorAlumno(cuenta.id, {
      origenEntrenador: opcionEntrenador,
      entrenadorId: opcionEntrenador === 'directorio' ? entrenadorIdSeleccionado : undefined,
      nombreEntrenadorManual: opcionEntrenador === 'manual' ? nombreManual.trim() : undefined,
    });
    setDatosAlumno(await obtenerAlumnoPorCuentaId(cuenta.id));
    setEditandoEntrenador(false);
  };

  const handleQuitarEntrenador = async () => {
    if (!confirm('¿Quieres dejar de tener entrenador y pasar a entrenamiento independiente?')) return;
    await actualizarEntrenadorAlumno(cuenta.id, { origenEntrenador: 'independiente' });
    setDatosAlumno(await obtenerAlumnoPorCuentaId(cuenta.id));
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const ruta = await subirFotoPerfil(cuenta.id, archivo);
    setFotoUrl(resolverUrlFoto(ruta));
    setGuardado(false);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await actualizarPerfilAlumno(cuenta.id, {
        apellido: apellido.trim(),
        apodo: apodo.trim() || undefined,
        fechaNacimiento,
        peso: Number(peso) || 0,
        nivel,
        objetivo,
        ciudad,
      });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1>Editar perfil</h1>
        <button type="button" className={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
          {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </header>

      {/* ---------- Foto de perfil ---------- */}
      <section className={styles.seccion}>
        <h2>Foto de perfil</h2>
        <div className={styles.fotoPerfilWrap}>
          <div className={styles.fotoPreview}>
            {fotoUrl ? (
              <Image src={fotoUrl} alt="Foto de perfil" width={140} height={140} className={styles.fotoImg} unoptimized />
            ) : (
              <span className={styles.fotoPlaceholder}>{cuenta.nombre.charAt(0).toUpperCase() || 'Sin foto'}</span>
            )}
          </div>
          <button type="button" className={styles.btnSecundario} onClick={() => fotoInputRef.current?.click()}>
            {fotoUrl ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <input ref={fotoInputRef} type="file" accept="image/*" hidden onChange={handleFotoChange} />
        </div>
      </section>

      {/* ---------- Información básica ---------- */}
      <section className={styles.seccion}>
        <h2>Información básica</h2>
        <div className={styles.formGrid}>
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
