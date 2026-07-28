// app/registro/entrenador/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { registrarCuenta } from "../../lib/auth/authService";
import { rutaDestino } from "../../lib/auth/rutaDestino";
import { crearClienteSupabaseNavegador } from "../../lib/supabase/client";
import { useFormValidation } from "../../lib/validation/useFormValidation";
import type { ValidationSchema } from "../../lib/validation/validateField";
import FormField from "../../lib/validation/FormField";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

interface RegistroEntrenadorValues {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  anosExperiencia: string;
  ciudad: string;
  especialidades: string;
  certificaciones: string;
  gimnasio: string;
  bio: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
  [key: string]: string | boolean;
}

const initialValues: RegistroEntrenadorValues = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  anosExperiencia: "",
  ciudad: "",
  especialidades: "",
  certificaciones: "",
  gimnasio: "",
  bio: "",
  password: "",
  confirmPassword: "",
  aceptaTerminos: false,
};

const schema: ValidationSchema<RegistroEntrenadorValues> = {
  nombre: [{ type: "required" }],
  apellido: [{ type: "required" }],
  email: [{ type: "required" }, { type: "email" }],
  password: [{ type: "required" }, { type: "minLength", length: 6 }],
  confirmPassword: [{ type: "required" }, { type: "matches", field: "password", message: "Las contraseñas no coinciden." }],
  aceptaTerminos: [{ type: "required", message: "Debes aceptar los términos y condiciones." }],
};

export default function RegistroEntrenadorPage() {
  const router = useRouter();
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    initialValues,
    schema
  );

  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    if (!validateAll()) return;

    setEnviando(true);

    const nombreCompleto = `${values.nombre.trim()} ${values.apellido.trim()}`;

    const { data, error: signUpError } = await registrarCuenta({
      email: values.email,
      password: values.password,
      nombre: nombreCompleto,
      rol: "entrenador",
    });

    if (signUpError) {
      setEnviando(false);
      if (signUpError.code === "over_email_send_rate_limit") {
        setError("Demasiados intentos de registro. Espera unos minutos e intenta de nuevo.");
      } else if (
        signUpError.message.toLowerCase().includes("already registered") ||
        signUpError.message.toLowerCase().includes("already been registered")
      ) {
        setError("Ya existe una cuenta con ese correo. Intenta iniciar sesión.");
      } else {
        setError("No se pudo crear la cuenta. Intenta de nuevo más tarde.");
      }
      return;
    }

    if (!data.user) {
      setEnviando(false);
      setError("No se pudo crear la cuenta. Intenta de nuevo más tarde.");
      return;
    }

    if (!data.session) {
      setEnviando(false);
      setInfoMsg("Tu cuenta se creó correctamente. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.");
      return;
    }

    // Crea el perfil público de entrenador para que aparezca en /entrenadores
    // y en el selector de "elegir entrenador del directorio" al registrar alumnos.
    const supabase = crearClienteSupabaseNavegador();
    const { error: perfilError } = await supabase.from("perfiles_publicos_entrenador").insert({
      cuenta_id: data.user.id,
      especialidad: values.especialidades.trim() || "Boxeo",
      anos_trayectoria: Number(values.anosExperiencia) || 0,
      biografia: values.bio.trim() || `Entrenador en ${values.gimnasio.trim() || "Corazón Azteca"}.`,
    });

    if (perfilError) {
      setEnviando(false);
      setError("Tu cuenta se creó, pero no se pudo guardar tu perfil de entrenador. Intenta de nuevo más tarde.");
      return;
    }

    // Si Supabase requiere confirmación de correo, no habrá sesión activa todavía.
    if (!data.session) {
      setEnviando(false);
      setError("Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
      return;
    }

    // Auto-login: el entrenador queda logueado inmediatamente tras registrarse.
    router.push(rutaDestino("entrenador", "aprobado"));
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
            <FormField
              id="nombre"
              label="Nombre"
              error={touched.nombre ? errors.nombre : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="nombre"
                type="text"
                className={styles.input}
                placeholder="Ricardo"
                value={values.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                aria-invalid={touched.nombre && errors.nombre ? true : undefined}
                aria-describedby={touched.nombre && errors.nombre ? "nombre-error" : undefined}
              />
            </FormField>
            <FormField
              id="apellido"
              label="Apellido"
              error={touched.apellido ? errors.apellido : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="apellido"
                type="text"
                className={styles.input}
                placeholder="Mendoza"
                value={values.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                onBlur={() => handleBlur("apellido")}
                aria-invalid={touched.apellido && errors.apellido ? true : undefined}
                aria-describedby={touched.apellido && errors.apellido ? "apellido-error" : undefined}
              />
            </FormField>
          </div>

          <FormField
            id="email"
            label="Correo electrónico"
            error={touched.email ? errors.email : undefined}
            className={styles.field}
            labelClassName={styles.label}
          >
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="coach@correo.com"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              aria-invalid={touched.email && errors.email ? true : undefined}
              aria-describedby={touched.email && errors.email ? "email-error" : undefined}
            />
          </FormField>

          <FormField id="telefono" label="Teléfono" className={styles.field} labelClassName={styles.label}>
            <input
              id="telefono"
              type="tel"
              className={styles.input}
              placeholder="+52 55 1234 5678"
              value={values.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              onBlur={() => handleBlur("telefono")}
            />
          </FormField>

          <div className={styles.fieldGroup}>
            <FormField id="anosExperiencia" label="Años de experiencia" className={styles.field} labelClassName={styles.label}>
              <input
                id="anosExperiencia"
                type="number"
                className={styles.input}
                placeholder="12"
                min="0"
                value={values.anosExperiencia}
                onChange={(e) => handleChange("anosExperiencia", e.target.value)}
                onBlur={() => handleBlur("anosExperiencia")}
              />
            </FormField>
            <FormField id="ciudad" label="Ciudad" className={styles.field} labelClassName={styles.label}>
              <input
                id="ciudad"
                type="text"
                className={styles.input}
                placeholder="CDMX"
                value={values.ciudad}
                onChange={(e) => handleChange("ciudad", e.target.value)}
                onBlur={() => handleBlur("ciudad")}
              />
            </FormField>
          </div>

          <FormField id="especialidades" label="Especialidades" className={styles.field} labelClassName={styles.label}>
            <input
              id="especialidades"
              type="text"
              className={styles.input}
              placeholder="Ej. Boxeo profesional, Sparring, Preparación física"
              value={values.especialidades}
              onChange={(e) => handleChange("especialidades", e.target.value)}
              onBlur={() => handleBlur("especialidades")}
            />
          </FormField>
          <span className={styles.hint}>Sepáralas con comas.</span>

          <FormField id="certificaciones" label="Certificaciones" className={styles.field} labelClassName={styles.label}>
            <input
              id="certificaciones"
              type="text"
              className={styles.input}
              placeholder="Ej. WBC Trainer Level 2"
              value={values.certificaciones}
              onChange={(e) => handleChange("certificaciones", e.target.value)}
              onBlur={() => handleBlur("certificaciones")}
            />
          </FormField>

          <FormField id="gimnasio" label="Gimnasio principal" className={styles.field} labelClassName={styles.label}>
            <input
              id="gimnasio"
              type="text"
              className={styles.input}
              placeholder="Nombre del gimnasio donde trabajas"
              value={values.gimnasio}
              onChange={(e) => handleChange("gimnasio", e.target.value)}
              onBlur={() => handleBlur("gimnasio")}
            />
          </FormField>

          <FormField id="bio" label="Biografía breve" className={styles.field} labelClassName={styles.label}>
            <textarea
              id="bio"
              className={styles.textarea}
              placeholder="Cuéntanos tu trayectoria, filosofía de entrenamiento y logros..."
              value={values.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              onBlur={() => handleBlur("bio")}
            />
          </FormField>

          <div className={styles.fieldGroup}>
            <FormField
              id="password"
              label="Contraseña"
              error={touched.password ? errors.password : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={values.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-invalid={touched.password && errors.password ? true : undefined}
                aria-describedby={touched.password && errors.password ? "password-error" : undefined}
              />
            </FormField>
            <FormField
              id="confirmPassword"
              label="Confirmar contraseña"
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                aria-invalid={touched.confirmPassword && errors.confirmPassword ? true : undefined}
                aria-describedby={touched.confirmPassword && errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
            </FormField>
          </div>

          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="aceptaTerminos"
              className={styles.checkbox}
              checked={values.aceptaTerminos}
              onChange={(e) => handleChange("aceptaTerminos", e.target.checked)}
              onBlur={() => handleBlur("aceptaTerminos")}
              aria-invalid={touched.aceptaTerminos && errors.aceptaTerminos ? true : undefined}
              aria-describedby={touched.aceptaTerminos && errors.aceptaTerminos ? "aceptaTerminos-error" : undefined}
            />
            <label htmlFor="aceptaTerminos" className={styles.checkboxLabel}>
              Acepto los <a href="/terminos">términos y condiciones</a>, la <a href="/privacidad">política de privacidad</a> y confirmo que la información profesional es verídica.
            </label>
          </div>
          {touched.aceptaTerminos && errors.aceptaTerminos && (
            <p id="aceptaTerminos-error" role="alert" className={styles.errorMsg}>
              {errors.aceptaTerminos}
            </p>
          )}

          {error && <p className={styles.errorMsg} role="alert">{error}</p>}
          {infoMsg && <p className={styles.hint} role="status">{infoMsg}</p>}

          <button type="submit" className={styles.submitBtn} disabled={enviando}>
            {enviando ? "Creando cuenta..." : "Crear cuenta de Entrenador"}
          </button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
