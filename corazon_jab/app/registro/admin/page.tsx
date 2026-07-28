// app/registro/admin/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Playfair_Display, Oswald } from "next/font/google";
import { correoExiste, registrarCuenta } from "../../lib/authStorage";
import { useFormValidation } from "../../lib/validation/useFormValidation";
import type { ValidationSchema } from "../../lib/validation/validateField";
import FormField from "../../lib/validation/FormField";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

interface RegistroAdminValues {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  organizacion: string;
  puesto: string;
  codigoInvitacion: string;
  motivo: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
  [key: string]: string | boolean;
}

const registroAdminSchema: ValidationSchema<RegistroAdminValues> = {
  nombre: [{ type: "required" }],
  apellido: [{ type: "required" }],
  email: [{ type: "required" }, { type: "email" }],
  password: [{ type: "required" }, { type: "minLength", length: 6 }],
  confirmPassword: [{ type: "required" }, { type: "matches", field: "password", message: "Las contraseñas no coinciden." }],
  aceptaTerminos: [{ type: "required", message: "Debes aceptar los términos y condiciones." }],
};

export default function RegistroAdminPage() {
  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation<RegistroAdminValues>(
      {
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        organizacion: "",
        puesto: "Dueño de gimnasio",
        codigoInvitacion: "",
        motivo: "",
        password: "",
        confirmPassword: "",
        aceptaTerminos: false,
      },
      registroAdminSchema
    );

  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateAll()) return;

    if (correoExiste(values.email)) {
      setError("Ya existe una cuenta con ese correo.");
      return;
    }

    // Las cuentas de admin quedan marcadas como "pendiente" — requieren
    // aprobación manual antes de poder iniciar sesión. No hay auto-login.
    registrarCuenta({
      email: values.email,
      password: values.password,
      nombre: `${values.nombre.trim()} ${values.apellido.trim()}`,
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
            <FormField
              id="admin-nombre"
              label="Nombre"
              error={touched.nombre ? errors.nombre : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="admin-nombre"
                type="text"
                className={styles.input}
                placeholder="Nombre"
                value={values.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                aria-invalid={Boolean(touched.nombre && errors.nombre)}
                aria-describedby={touched.nombre && errors.nombre ? "admin-nombre-error" : undefined}
              />
            </FormField>
            <FormField
              id="admin-apellido"
              label="Apellido"
              error={touched.apellido ? errors.apellido : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="admin-apellido"
                type="text"
                className={styles.input}
                placeholder="Apellido"
                value={values.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                onBlur={() => handleBlur("apellido")}
                aria-invalid={Boolean(touched.apellido && errors.apellido)}
                aria-describedby={touched.apellido && errors.apellido ? "admin-apellido-error" : undefined}
              />
            </FormField>
          </div>

          <FormField
            id="admin-email"
            label="Correo corporativo"
            error={touched.email ? errors.email : undefined}
            className={styles.field}
            labelClassName={styles.label}
          >
            <input
              id="admin-email"
              type="email"
              className={styles.input}
              placeholder="admin@corazonazteca.com"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              aria-invalid={Boolean(touched.email && errors.email)}
              aria-describedby={touched.email && errors.email ? "admin-email-error" : undefined}
            />
          </FormField>

          <FormField id="admin-telefono" label="Teléfono" className={styles.field} labelClassName={styles.label}>
            <input
              id="admin-telefono"
              type="tel"
              className={styles.input}
              placeholder="+52 55 1234 5678"
              value={values.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              onBlur={() => handleBlur("telefono")}
            />
          </FormField>

          <FormField id="admin-organizacion" label="Organización / Empresa" className={styles.field} labelClassName={styles.label}>
            <input
              id="admin-organizacion"
              type="text"
              className={styles.input}
              placeholder="Corazón Azteca Boxing Gym"
              value={values.organizacion}
              onChange={(e) => handleChange("organizacion", e.target.value)}
              onBlur={() => handleBlur("organizacion")}
            />
          </FormField>

          <FormField id="admin-puesto" label="Puesto / Rol" className={styles.field} labelClassName={styles.label}>
            <select
              id="admin-puesto"
              className={styles.select}
              value={values.puesto}
              onChange={(e) => handleChange("puesto", e.target.value)}
              onBlur={() => handleBlur("puesto")}
            >
              <option>Dueño de gimnasio</option>
              <option>Gerente de operaciones</option>
              <option>Director técnico</option>
              <option>Federación / Organizador</option>
              <option>Otro</option>
            </select>
          </FormField>

          <FormField id="admin-codigo" label="Código de invitación" className={styles.field} labelClassName={styles.label}>
            <>
              <input
                id="admin-codigo"
                type="text"
                className={styles.input}
                placeholder="XXXX-XXXX-XXXX"
                value={values.codigoInvitacion}
                onChange={(e) => handleChange("codigoInvitacion", e.target.value)}
                onBlur={() => handleBlur("codigoInvitacion")}
              />
              <span className={styles.hint}>Si no tienes uno, deja este campo vacío. Revisaremos tu solicitud manualmente.</span>
            </>
          </FormField>

          <FormField id="admin-motivo" label="Motivo de solicitud" className={styles.field} labelClassName={styles.label}>
            <textarea
              id="admin-motivo"
              className={styles.textarea}
              placeholder="Describe brevemente el propósito de la cuenta administrativa..."
              value={values.motivo}
              onChange={(e) => handleChange("motivo", e.target.value)}
              onBlur={() => handleBlur("motivo")}
            />
          </FormField>

          <div className={styles.fieldGroup}>
            <FormField
              id="admin-password"
              label="Contraseña"
              error={touched.password ? errors.password : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="admin-password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={values.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-invalid={Boolean(touched.password && errors.password)}
                aria-describedby={touched.password && errors.password ? "admin-password-error" : undefined}
              />
            </FormField>
            <FormField
              id="admin-confirmPassword"
              label="Confirmar contraseña"
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="admin-confirmPassword"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
                aria-describedby={touched.confirmPassword && errors.confirmPassword ? "admin-confirmPassword-error" : undefined}
              />
            </FormField>
          </div>

          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="terms"
              className={styles.checkbox}
              checked={values.aceptaTerminos}
              onChange={(e) => handleChange("aceptaTerminos", e.target.checked)}
              onBlur={() => handleBlur("aceptaTerminos")}
              aria-invalid={Boolean(touched.aceptaTerminos && errors.aceptaTerminos)}
              aria-describedby={touched.aceptaTerminos && errors.aceptaTerminos ? "terms-error" : undefined}
            />
            <label htmlFor="terms" className={styles.checkboxLabel}>
              Acepto los <a href="/terminos">términos y condiciones</a> y entiendo que la solicitud está sujeta a revisión.
            </label>
          </div>
          {touched.aceptaTerminos && errors.aceptaTerminos && (
            <p id="terms-error" role="alert" className={styles.errorMsg}>{errors.aceptaTerminos}</p>
          )}

          {error && <p className={styles.errorMsg} role="alert">{error}</p>}

          <button type="submit" className={styles.submitBtn}>Enviar solicitud</button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
