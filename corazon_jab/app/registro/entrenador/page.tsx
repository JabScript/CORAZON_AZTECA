// app/registro/entrenador/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { correoExiste, registrarCuenta, rutaPanel } from "../../lib/authStorage";
import { guardarSesion } from "../../lib/sesionStorage";
import { guardarPerfil } from "../../lib/entrenadorStorage";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function RegistroEntrenadorPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [anosExperiencia, setAnosExperiencia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [especialidades, setEspecialidades] = useState("");
  const [certificaciones, setCertificaciones] = useState("");
  const [gimnasio, setGimnasio] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState("");

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

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`;

    const cuenta = registrarCuenta({
      email,
      password,
      nombre: nombreCompleto,
      rol: "entrenador",
    });

    // Crea el perfil público de entrenador para que aparezca en /entrenadores
    // y en el selector de "elegir entrenador del directorio" al registrar alumnos.
    guardarPerfil({
      id: `entrenador-${cuenta.usuarioId}`,
      nombre: nombreCompleto,
      especialidad: especialidades.trim() || "Boxeo",
      anosTrayectoria: Number(anosExperiencia) || 0,
      foto: "",
      bio: bio.trim() || `Entrenador en ${gimnasio.trim() || "Corazón Azteca"}.`,
      logros: certificaciones.trim() ? [certificaciones.trim()] : [],
      redes: [],
      galeria: [],
    });

    // Auto-login: el entrenador queda logueado inmediatamente tras registrarse.
    guardarSesion({ usuarioId: cuenta.usuarioId, nombre: nombreCompleto, rol: "entrenador" });
    router.push(rutaPanel("entrenador"));
  };

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <Link href="/registro" className={styles.backLink}>← Cambiar tipo de usuario</Link>

        <span className={styles.tag}>REGISTRO DE ENTRENADOR</span>
        <h1 className={styles.title}>
          Únete como<span className={styles.titleAccent}>Coach</span>
        </h1>
        <p className={styles.subtitle}>Comparte tu experiencia y guía a la próxima generación.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input type="text" className={styles.input} placeholder="Ricardo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apellido</label>
              <input type="text" className={styles.input} placeholder="Mendoza" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <input type="email" className={styles.input} placeholder="coach@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Teléfono</label>
            <input type="tel" className={styles.input} placeholder="+52 55 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Años de experiencia</label>
              <input type="number" className={styles.input} placeholder="12" min="0" value={anosExperiencia} onChange={(e) => setAnosExperiencia(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ciudad</label>
              <input type="text" className={styles.input} placeholder="CDMX" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Especialidades</label>
            <input type="text" className={styles.input} placeholder="Ej. Boxeo profesional, Sparring, Preparación física" value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} />
            <span className={styles.hint}>Sepáralas con comas.</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Certificaciones</label>
            <input type="text" className={styles.input} placeholder="Ej. WBC Trainer Level 2" value={certificaciones} onChange={(e) => setCertificaciones(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Gimnasio principal</label>
            <input type="text" className={styles.input} placeholder="Nombre del gimnasio donde trabajas" value={gimnasio} onChange={(e) => setGimnasio(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Biografía breve</label>
            <textarea className={styles.textarea} placeholder="Cuéntanos tu trayectoria, filosofía de entrenamiento y logros..." value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <input type="password" className={styles.input} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirmar contraseña</label>
              <input type="password" className={styles.input} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
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
              Acepto los <a href="/terminos">términos y condiciones</a>, la <a href="/privacidad">política de privacidad</a> y confirmo que la información profesional es verídica.
            </label>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>Crear cuenta de Entrenador</button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
