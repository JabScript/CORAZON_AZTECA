// app/registro/alumno/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { obtenerEntrenadoresPublicos, type PerfilEntrenador } from "../../lib/entrenadorStorage";
import { registrarAlumno, type OrigenEntrenador } from "../../lib/alumnoStorage";
import { correoExiste, registrarCuenta, rutaPanel, imagenPerfilABase64 } from "../../lib/authStorage";
import { guardarSesion } from "../../lib/sesionStorage";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

type OpcionEntrenador = "sin_entrenador" | "del_directorio" | "manual";

export default function RegistroAlumnoPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [apodo, setApodo] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [peso, setPeso] = useState("");
  const [nivel, setNivel] = useState("Principiante");
  const [objetivo, setObjetivo] = useState("Acondicionamiento físico");
  const [ciudad, setCiudad] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // --- Entrenador ---
  const [opcionEntrenador, setOpcionEntrenador] = useState<OpcionEntrenador>("sin_entrenador");
  const [entrenadores, setEntrenadores] = useState<PerfilEntrenador[]>([]);
  const [entrenadorSeleccionadoId, setEntrenadorSeleccionadoId] = useState("");
  const [nombreEntrenadorManual, setNombreEntrenadorManual] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    setEntrenadores(obtenerEntrenadoresPublicos());
  }, []);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const base64 = await imagenPerfilABase64(archivo);
    setFoto(base64);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError("Completa tu nombre, apellido y correo electrónico.");
      return;
    }

    if (correoExiste(email)) {
      setError("Ya existe una cuenta con ese correo. Intenta iniciar sesión.");
      return;
    }

    if (opcionEntrenador === "del_directorio" && !entrenadorSeleccionadoId) {
      setError("Selecciona a tu entrenador del directorio.");
      return;
    }

    if (opcionEntrenador === "manual" && !nombreEntrenadorManual.trim()) {
      setError("Escribe el nombre de tu entrenador.");
      return;
    }

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const origenEntrenador: OrigenEntrenador =
      opcionEntrenador === "del_directorio"
        ? "directorio"
        : opcionEntrenador === "manual"
        ? "manual"
        : "independiente";

    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`;

    // Crea la cuenta de login real
    const cuenta = registrarCuenta({
      email,
      password,
      nombre: nombreCompleto,
      rol: "usuario",
      foto: foto ?? undefined,
    });

    // Guarda los datos deportivos/de entrenador del alumno
    registrarAlumno({
      usuarioId: cuenta.usuarioId,
      nombre,
      apellido,
      apodo: apodo.trim() || undefined,
      email,
      fechaNacimiento,
      peso: Number(peso) || 0,
      nivel,
      objetivo,
      ciudad,
      origenEntrenador,
      entrenadorId: origenEntrenador === "directorio" ? entrenadorSeleccionadoId : undefined,
      nombreEntrenadorManual: origenEntrenador === "manual" ? nombreEntrenadorManual.trim() : undefined,
    });

    // Auto-login: el alumno queda logueado inmediatamente tras registrarse.
    guardarSesion({ usuarioId: cuenta.usuarioId, nombre: nombreCompleto, rol: "usuario", foto: foto ?? undefined });
    router.push(rutaPanel("usuario"));
  };

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <Link href="/registro" className={styles.backLink}>← Cambiar tipo de usuario</Link>

        <span className={styles.tag}>REGISTRO DE ALUMNO</span>
        <h1 className={styles.title}>
          Crear cuenta<span className={styles.titleAccent}>Boxeador</span>
        </h1>
        <p className={styles.subtitle}>Completa tus datos para empezar a entrenar.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Foto de perfil (opcional)</label>
            <div className={styles.fotoPerfilWrap}>
              <div className={styles.fotoPreviewCircle}>
                {foto ? (
                  <Image src={foto} alt="Vista previa" width={72} height={72} className={styles.fotoPreviewImg} unoptimized />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
                  </svg>
                )}
              </div>
              <button type="button" className={styles.entrenadorOpcionBtn} onClick={() => fotoInputRef.current?.click()}>
                {foto ? "Cambiar foto" : "Subir foto"}
              </button>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFotoChange}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input type="text" className={styles.input} placeholder="Carlos" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apellido</label>
              <input type="text" className={styles.input} placeholder="Gutiérrez" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Apodo (opcional)</label>
            <input type="text" className={styles.input} placeholder="El Rayo" value={apodo} onChange={(e) => setApodo(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <input type="email" className={styles.input} placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Fecha de nacimiento</label>
              <input type="date" className={styles.input} value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Peso (kg)</label>
              <input type="number" className={styles.input} placeholder="68.5" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)} />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Nivel</label>
              <select className={styles.select} value={nivel} onChange={(e) => setNivel(e.target.value)}>
                <option>Principiante</option>
                <option>Amateur</option>
                <option>Semi-profesional</option>
                <option>Profesional</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Objetivo principal</label>
              <select className={styles.select} value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
                <option>Acondicionamiento físico</option>
                <option>Aprender técnica</option>
                <option>Competir amateur</option>
                <option>Carrera profesional</option>
                <option>Bajar de peso</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ciudad</label>
            <input type="text" className={styles.input} placeholder="Ciudad de México" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
          </div>

          {/* --- Entrenador --- */}
          <div className={styles.field}>
            <label className={styles.label}>¿Tienes entrenador?</label>

            <div className={styles.entrenadorOpciones}>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === "sin_entrenador" ? styles.entrenadorOpcionActiva : ""}`}
                onClick={() => setOpcionEntrenador("sin_entrenador")}
              >
                No, entreno de forma independiente
              </button>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === "del_directorio" ? styles.entrenadorOpcionActiva : ""}`}
                onClick={() => setOpcionEntrenador("del_directorio")}
              >
                Sí, elegirlo del directorio
              </button>
              <button
                type="button"
                className={`${styles.entrenadorOpcionBtn} ${opcionEntrenador === "manual" ? styles.entrenadorOpcionActiva : ""}`}
                onClick={() => setOpcionEntrenador("manual")}
              >
                Sí, pero no está en el directorio
              </button>
            </div>

            {opcionEntrenador === "sin_entrenador" && (
              <p className={styles.hint}>Se marcará tu perfil como &quot;Entrenamiento independiente&quot;.</p>
            )}

            {opcionEntrenador === "del_directorio" && (
              <div className={styles.entrenadorSubcampo}>
                {entrenadores.length === 0 ? (
                  <p className={styles.hint}>
                    Aún no hay entrenadores en el directorio. Puedes{" "}
                    <button type="button" className={styles.linkComoTexto} onClick={() => setOpcionEntrenador("manual")}>
                      agregarlo manualmente
                    </button>.
                  </p>
                ) : (
                  <>
                    <label className={styles.label}>Selecciona a tu entrenador</label>
                    <select
                      className={styles.select}
                      value={entrenadorSeleccionadoId}
                      onChange={(e) => setEntrenadorSeleccionadoId(e.target.value)}
                    >
                      <option value="">— Elige un entrenador —</option>
                      {entrenadores.map((ent) => (
                        <option key={ent.id} value={ent.id}>
                          {ent.nombre} · {ent.especialidad}
                        </option>
                      ))}
                    </select>
                    <p className={styles.hint}>
                      ¿No lo encuentras?{" "}
                      <button type="button" className={styles.linkComoTexto} onClick={() => setOpcionEntrenador("manual")}>
                        Agrégalo manualmente
                      </button>.
                    </p>
                  </>
                )}
              </div>
            )}

            {opcionEntrenador === "manual" && (
              <div className={styles.entrenadorSubcampo}>
                <label className={styles.label}>Nombre de tu entrenador</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej. Rodrigo Cazares"
                  value={nombreEntrenadorManual}
                  onChange={(e) => setNombreEntrenadorManual(e.target.value)}
                />
                <p className={styles.hint}>
                  Tu entrenador no aparece en el directorio de Corazón Azteca. Podrás actualizar esta información después si él se registra.
                </p>
              </div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <input type="password" className={styles.input} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirmar contraseña</label>
              <input type="password" className={styles.input} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="terms"
              className={styles.checkbox}
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
            />
            <label htmlFor="terms" className={styles.checkboxLabel}>
              Acepto los <a href="/terminos">términos y condiciones</a> y la <a href="/privacidad">política de privacidad</a>.
            </label>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={!aceptaTerminos}>
            Crear cuenta de Alumno
          </button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
