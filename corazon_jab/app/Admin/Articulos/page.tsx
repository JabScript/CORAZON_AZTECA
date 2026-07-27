// app/Admin/Articulos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  obtenerArticulos,
  aprobarArticulo,
  rechazarArticulo,
  eliminarArticulo,
  type ArticuloBlog,
  type EstadoArticulo,
} from '../../lib/blogStorage';
import styles from './Articulos.module.css';

const FILTROS: { key: EstadoArticulo | 'todos'; label: string }[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobado', label: 'Aprobados' },
  { key: 'rechazado', label: 'Rechazados' },
  { key: 'todos', label: 'Todos' },
];

export default function ArticulosAdminPage() {
  const [articulos, setArticulos] = useState<ArticuloBlog[]>([]);
  const [filtro, setFiltro] = useState<EstadoArticulo | 'todos'>('pendiente');
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    setArticulos(obtenerArticulos());
  }, []);

  const refrescar = () => setArticulos(obtenerArticulos());

  const handleAprobar = (id: number) => {
    aprobarArticulo(id);
    refrescar();
  };

  const handleRechazar = (id: number) => {
    const motivo = window.prompt('Motivo del rechazo (opcional):') ?? undefined;
    rechazarArticulo(id, motivo);
    refrescar();
  };

  const handleEliminar = (id: number, titulo: string) => {
    const confirmado = window.confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;
    eliminarArticulo(id);
    refrescar();
  };

  const filtrados = articulos.filter((a) => filtro === 'todos' || a.estado === filtro);
  const pendientesCount = articulos.filter((a) => a.estado === 'pendiente').length;

  return (
    <main className={styles.pagina}>
      <h1>Artículos y Logros</h1>
      <p className={styles.subtitulo}>
        Revisa, aprueba o rechaza los artículos y logros deportivos enviados por entrenadores y alumnos.
        {pendientesCount > 0 && (
          <span className={styles.pendingBadge}> {pendientesCount} pendiente{pendientesCount !== 1 ? 's' : ''} de revisión</span>
        )}
      </p>

      <div className={styles.filtros}>
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filtroBtn} ${filtro === f.key ? styles.filtroActivo : ''}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <p className={styles.vacio}>No hay artículos en esta categoría.</p>
      ) : (
        <div className={styles.lista}>
          {filtrados.map((a) => (
            <article key={a.id} className={styles.tarjeta}>
              <div className={styles.cabecera}>
                <div>
                  <span className={styles.tipoBadge} data-tipo={a.tipo}>
                    {a.tipo === 'logro' ? `${a.icono ?? '🏆'} LOGRO` : '📝 ARTÍCULO'}
                  </span>
                  <span className={styles.estado} data-estado={a.estado}>{a.estado.toUpperCase()}</span>
                  <h3 className={styles.titulo}>{a.titulo}</h3>
                  <p className={styles.autor}>
                    Por {a.autorNombre} ({a.autorRol === 'entrenador' ? 'Entrenador' : 'Alumno'}) ·{' '}
                    {new Date(a.fechaEnvio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={styles.categoria}>{a.categoria}</span>
              </div>

              <p className={styles.extracto}>{a.extracto}</p>

              {expandido === a.id && (
                <div className={styles.contenidoCompleto}>{a.contenido}</div>
              )}

              <div className={styles.acciones}>
                <button
                  type="button"
                  className={styles.verMas}
                  onClick={() => setExpandido(expandido === a.id ? null : a.id)}
                >
                  {expandido === a.id ? 'Ocultar contenido' : 'Ver contenido completo'}
                </button>

                <div className={styles.botones}>
                  {a.estado === 'pendiente' && (
                    <>
                      <button type="button" className={styles.btnRechazar} onClick={() => handleRechazar(a.id)}>
                        Rechazar
                      </button>
                      <button type="button" className={styles.btnAprobar} onClick={() => handleAprobar(a.id)}>
                        Aprobar y publicar
                      </button>
                    </>
                  )}
                  <button type="button" className={styles.btnEliminar} onClick={() => handleEliminar(a.id, a.titulo)}>
                    Eliminar
                  </button>
                </div>

                {a.estado === 'rechazado' && a.motivoRechazo && (
                  <span className={styles.motivo}>Motivo: {a.motivoRechazo}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
