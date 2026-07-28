'use client';

import { useState, useEffect } from 'react';
import styles from './Directorio.module.css';
import { crearClienteSupabaseNavegador } from '../../lib/supabase/client';
import { resolverUrlFoto } from '../../lib/auth/fotoPerfil';

interface AlumnoDirectorio {
  cuentaId: string;
  nombre: string;
  fotoUrl: string | null;
  ciudad: string | null;
  nivel: string | null;
  peso: number | null;
  origenEntrenador: string | null;
  nombreEntrenador: string | null;
}

interface EntrenadorDirectorio {
  cuentaId: string;
  nombre: string;
  fotoUrl: string | null;
  especialidad: string | null;
  anosTrayectoria: number | null;
  logros: string[];
}

const FILTROS_USUARIOS = ['Todos', 'Con entrenador', 'Independientes'] as const;
type FiltroUsuarios = (typeof FILTROS_USUARIOS)[number];

type Tab = 'alumnos' | 'entrenadores';

export default function DirectorioAdmin() {
  const [tab, setTab] = useState<Tab>('alumnos');
  const [filtro, setFiltro] = useState<FiltroUsuarios>('Todos');
  const [usuarios, setUsuarios] = useState<AlumnoDirectorio[]>([]);
  const [entrenadores, setEntrenadores] = useState<EntrenadorDirectorio[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    const supabase = crearClienteSupabaseNavegador();

    interface PerfilDeportivoFila {
      ciudad: string | null;
      nivel: string | null;
      peso_kg: number | string | null;
      origen_entrenador: string | null;
      entrenador_manual_nombre: string | null;
      entrenador_directorio_id: string | null;
    }
    interface AccountConPerfilDeportivo {
      id: string;
      nombre: string;
      foto_ref: string | null;
      perfiles_deportivos: PerfilDeportivoFila | PerfilDeportivoFila[] | null;
    }
    interface LogroFila {
      descripcion: string;
    }
    interface PerfilEntrenadorFila {
      especialidad: string | null;
      anos_trayectoria: number | null;
      logros_entrenador: LogroFila[] | null;
    }
    interface AccountConPerfilEntrenador {
      id: string;
      nombre: string;
      foto_ref: string | null;
      perfiles_publicos_entrenador: PerfilEntrenadorFila | PerfilEntrenadorFila[] | null;
    }

    const { data: alumnosData } = await supabase
      .from('accounts')
      .select(
        'id, nombre, foto_ref, perfiles_deportivos(ciudad, nivel, peso_kg, origen_entrenador, entrenador_manual_nombre, entrenador_directorio_id)'
      )
      .eq('rol', 'usuario')
      .returns<AccountConPerfilDeportivo[]>();

    const alumnosMapeados: AlumnoDirectorio[] = await Promise.all(
      (alumnosData ?? []).map(async (fila) => {
        const perfil = Array.isArray(fila.perfiles_deportivos)
          ? fila.perfiles_deportivos[0]
          : fila.perfiles_deportivos;

        let nombreEntrenador: string | null = null;
        if (perfil?.origen_entrenador === 'directorio' && perfil.entrenador_directorio_id) {
          const { data: entrenadorRef } = await supabase
            .from('perfiles_publicos_entrenador')
            .select('accounts(nombre)')
            .eq('id', perfil.entrenador_directorio_id)
            .maybeSingle<{ accounts: { nombre: string } | { nombre: string }[] | null }>();
          const cuentaEntrenador = Array.isArray(entrenadorRef?.accounts)
            ? entrenadorRef?.accounts[0]
            : entrenadorRef?.accounts;
          nombreEntrenador = cuentaEntrenador?.nombre ?? null;
        } else if (perfil?.origen_entrenador === 'manual') {
          nombreEntrenador = perfil.entrenador_manual_nombre ?? null;
        }

        return {
          cuentaId: fila.id,
          nombre: fila.nombre,
          fotoUrl: resolverUrlFoto(fila.foto_ref ?? null),
          ciudad: perfil?.ciudad ?? null,
          nivel: perfil?.nivel ?? null,
          peso: perfil?.peso_kg != null ? Number(perfil.peso_kg) : null,
          origenEntrenador: perfil?.origen_entrenador ?? null,
          nombreEntrenador,
        };
      })
    );

    const { data: entrenadoresData } = await supabase
      .from('accounts')
      .select(
        'id, nombre, foto_ref, perfiles_publicos_entrenador(especialidad, anos_trayectoria, logros_entrenador(descripcion))'
      )
      .eq('rol', 'entrenador')
      .returns<AccountConPerfilEntrenador[]>();

    const entrenadoresMapeados: EntrenadorDirectorio[] = (entrenadoresData ?? []).map((fila) => {
      const perfil = Array.isArray(fila.perfiles_publicos_entrenador)
        ? fila.perfiles_publicos_entrenador[0]
        : fila.perfiles_publicos_entrenador;

      return {
        cuentaId: fila.id,
        nombre: fila.nombre,
        fotoUrl: resolverUrlFoto(fila.foto_ref ?? null),
        especialidad: perfil?.especialidad ?? null,
        anosTrayectoria: perfil?.anos_trayectoria ?? null,
        logros: (perfil?.logros_entrenador ?? []).map((l) => l.descripcion),
      };
    });

    setUsuarios(alumnosMapeados);
    setEntrenadores(entrenadoresMapeados);
    setCargando(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtro === 'Con entrenador') return u.origenEntrenador && u.origenEntrenador !== 'independiente';
    if (filtro === 'Independientes') return !u.origenEntrenador || u.origenEntrenador === 'independiente';
    return true;
  });

  const handleEliminarCuenta = async (cuentaId: string, nombre: string) => {
    const confirmado = window.confirm(
      `¿Eliminar la cuenta de "${nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    const res = await fetch(`/api/admin/cuentas/${cuentaId}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      window.alert(body.error ?? 'No se pudo eliminar la cuenta.');
      return;
    }

    setUsuarios((prev) => prev.filter((u) => u.cuentaId !== cuentaId));
    setEntrenadores((prev) => prev.filter((e) => e.cuentaId !== cuentaId));
  };

  if (cargando) {
    return (
      <main className={styles.pagina}>
        <h1>Directorio</h1>
        <p className={styles.subtitulo}>Cargando...</p>
      </main>
    );
  }

  return (
    <main className={styles.pagina}>
      <h1>Directorio</h1>
      <p className={styles.subtitulo}>
        Gestión de alumnos y entrenadores registrados en la plataforma.
      </p>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${tab === 'alumnos' ? styles.tabActivo : ''}`}
          onClick={() => setTab('alumnos')}
        >
          Alumnos ({usuarios.length})
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${tab === 'entrenadores' ? styles.tabActivo : ''}`}
          onClick={() => setTab('entrenadores')}
        >
          Entrenadores ({entrenadores.length})
        </button>
      </div>

      {tab === 'alumnos' && (
        <>
          <div className={styles.filtros}>
            {FILTROS_USUARIOS.map((f) => (
              <button
                key={f}
                type="button"
                className={`${styles.filtroBtn} ${filtro === f ? styles.filtroActivo : ''}`}
                onClick={() => setFiltro(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {usuariosFiltrados.map((u) => (
              <article key={u.cuentaId} className={styles.tarjeta}>
                <div className={styles.tarjetaHeader}>
                  <div
                    className={styles.foto}
                    style={u.fotoUrl ? ({ '--foto': `url('${u.fotoUrl}')` } as React.CSSProperties) : undefined}
                  />
                  <div className={styles.infoHeader}>
                    <h3>{u.nombre}</h3>
                    <p className={styles.datoLinea}>
                      {u.nivel ?? '—'} {u.peso ? `· ${u.peso} kg` : ''}
                    </p>
                    <p className={styles.datoLinea}>{u.ciudad ?? '—'}</p>
                  </div>
                </div>

                {u.origenEntrenador && u.origenEntrenador !== 'independiente' ? (
                  <span className={styles.entrenadorBadge}>
                    Entrenado por <strong>{u.nombreEntrenador ?? '—'}</strong>
                  </span>
                ) : (
                  <span className={styles.independienteBadge}>Entrenamiento independiente</span>
                )}

                <button
                  type="button"
                  className={styles.btnEliminarPerfil}
                  onClick={() => handleEliminarCuenta(u.cuentaId, u.nombre)}
                >
                  Eliminar cuenta
                </button>
              </article>
            ))}
          </div>

          {usuariosFiltrados.length === 0 && (
            <p className={styles.vacio}>No hay usuarios en esta categoría.</p>
          )}
        </>
      )}

      {tab === 'entrenadores' && (
        <>
          <div className={styles.grid}>
            {entrenadores.map((ent) => (
              <article key={ent.cuentaId} className={styles.tarjeta}>
                <div className={styles.tarjetaHeader}>
                  <div
                    className={styles.foto}
                    style={ent.fotoUrl ? ({ '--foto': `url('${ent.fotoUrl}')` } as React.CSSProperties) : undefined}
                  />
                  <div className={styles.infoHeader}>
                    <h3>{ent.nombre}</h3>
                    <p className={styles.datoLinea}>{ent.especialidad ?? '—'}</p>
                    <p className={styles.datoLinea}>{ent.anosTrayectoria ?? 0} años de trayectoria</p>
                  </div>
                </div>

                {ent.logros.length > 0 && (
                  <ul className={styles.logrosLista}>
                    {ent.logros.slice(0, 2).map((logro, i) => (
                      <li key={i}>{logro}</li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  className={styles.btnEliminarPerfil}
                  onClick={() => handleEliminarCuenta(ent.cuentaId, ent.nombre)}
                >
                  Eliminar cuenta
                </button>
              </article>
            ))}
          </div>

          {entrenadores.length === 0 && (
            <p className={styles.vacio}>No hay entrenadores registrados.</p>
          )}
        </>
      )}
    </main>
  );
}
