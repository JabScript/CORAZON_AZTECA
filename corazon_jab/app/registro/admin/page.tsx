// app/registro/admin/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import { correoExiste, registrarCuenta } from "../../lib/authStorage";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function RegistroAdminPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [organizacion, setOrganizacion] = useState("");
  const [puesto, setPuesto] = useState("Dueño de gimnasio");
  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError("Completa tu nombre, apellido y correo electrónico.");
      return;
    }

    if (correoExiste(email)) {
      setError("Ya existe una cuenta con ese correo.");
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

    // Las cuentas de admin quedan marcadas como "pendiente" — requieren
    // aprobación manual antes de poder iniciar sesión. No hay auto-login.
    registrarCuenta({
      email,
      password,
      nombre: `${nombre.trim()} ${apellido.trim()}`,
      rol: "admin",
      pendiente: true,
    });

    setEnviado(true);
  };

  if (enviado) {
    return (
      <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
        <div className={styles.container}>
          <span className={styles.tag}>SOLICITUD ENVIADA</span>
          <h1 className={styles.title}>
            En<span className={styles.titleAccent}>Revisión</span>
          </h1>
          <p className={styles.subtitle}>
            Tu solicitud de cuenta administrativa fue registrada. Nuestro equipo la revisará
            y te contactaremos por correo. No podrás iniciar sesión hasta que sea aprobada.
          </p>
          <Link href="/" className={styles.submitBtn} style={{ textAlign: "center", textDecoration: "none" }}>
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.page} ${playfair.variable} ${oswald.variable}`}>
      <div className={styles.container}>
        <Link href="/registro" className={styles.backLink}>← Cambiar tipo de usuario</Link>

        <span className={styles.tag}>REGISTRO DE ADMINISTRADOR</span>
        <h1 className={styles.title}>
          Acceso<span className={styles.titleAccent}>Restringido</span>
        </h1>
        <p className={styles.subtitle}>
          Las cuentas de administrador requieren aprobación. Envía tu solicitud y te contactaremos.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input type="text" className={styles.input} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apellido</label>
              <input type="text" className={styles.input} placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Correo corporativo</label>
            <input type="email" className={styles.input} placeholder="admin@corazonazteca.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Teléfono</label>
            <input type="tel" className={styles.input} placeholder="+52 55 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Organización / Empresa</label>
            <input type="text" className={styles.input} placeholder="Corazón Azteca Boxing Gym" value={organizacion} onChange={(e) => setOrganizacion(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Puesto / Rol</label>
            <select className={styles.select} value={puesto} onChange={(e) => setPuesto(e.target.value)}>
              <option>Dueño de gimnasio</option>
              <option>Gerente de operaciones</option>
              <option>Director técnico</option>
              <option>Federación / Organizador</option>
              <option>Otro</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Código de invitación</label>
            <input type="text" className={styles.input} placeholder="XXXX-XXXX-XXXX" value={codigoInvitacion} onChange={(e) => setCodigoInvitacion(e.target.value)} />
            <span className={styles.hint}>Si no tienes uno, deja este campo vacío. Revisaremos tu solicitud manualmente.</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Motivo de solicitud</label>
            <textarea className={styles.textarea} placeholder="Describe brevemente el propósito de la cuenta administrativa..." value={motivo} onChange={(e) => setMotivo(e.target.value)} />
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
              Acepto los <a href="/terminos">términos y condiciones</a> y entiendo que la solicitud está sujeta a revisión.
            </label>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>Enviar solicitud</button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
