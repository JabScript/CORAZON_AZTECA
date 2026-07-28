// app/registro/alumno/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Playfair_Display, Oswald } from "next/font/google";
import { obtenerEntrenadoresPublicos, type PerfilEntrenador } from "../../lib/entrenadorStorage";
import { registrarCuenta } from "../../lib/auth/authService";
import { rutaDestino } from "../../lib/auth/rutaDestino";
import { crearClienteSupabaseNavegador } from "../../lib/supabase/client";
import { useFormValidation } from "../../lib/validation/useFormValidation";
import type { ValidationSchema } from "../../lib/validation/validateField";
import FormField from "../../lib/validation/FormField";
import styles from "../FormRegistro.module.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], style: ["normal", "italic"], variable: "--font-heading" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

type OpcionEntrenador = "sin_entrenador" | "del_directorio" | "manual";
type OrigenEntrenador = "directorio" | "manual" | "independiente";

interface AlumnoFormValues {
  nombre: string;
  apellido: string;
  apodo: string;
  email: string;
  fechaNacimiento: string;
  peso: string;
  nivel: string;
  objetivo: string;
  ciudad: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
  [key: string]: string | boolean;
}

const alumnoSchema: ValidationSchema<AlumnoFormValues> = {
  nombre: [{ type: "required" }],
  apellido: [{ type: "required" }],
  email: [{ type: "required" }, { type: "email" }],
  password: [{ type: "required" }, { type: "minLength", length: 6 }],
  confirmPassword: [{ type: "required" }, { type: "matches", field: "password", message: "Las contraseñas no coinciden." }],
  aceptaTerminos: [{ type: "required", message: "Debes aceptar los términos y condiciones." }],
};

export default function RegistroAlumnoPage() {
  const router = useRouter();

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation<AlumnoFormValues>(
      {
        nombre: "",
        apellido: "",
        apodo: "",
        email: "",
        fechaNacimiento: "",
        peso: "",
        nivel: "Principiante",
        objetivo: "Acondicionamiento físico",
        ciudad: "",
        password: "",
        confirmPassword: "",
        aceptaTerminos: false,
      },
      alumnoSchema
    );

  const [foto, setFoto] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // --- Entrenador ---
  const [opcionEntrenador, setOpcionEntrenador] = useState<OpcionEntrenador>("sin_entrenador");
  const [entrenadores, setEntrenadores] = useState<PerfilEntrenador[]>([]);
  const [entrenadorSeleccionadoId, setEntrenadorSeleccionadoId] = useState("");
  const [nombreEntrenadorManual, setNombreEntrenadorManual] = useState("");

  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setEntrenadores(obtenerEntrenadoresPublicos());
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    // TODO(task 17.2): subir la foto vía `subirFotoPerfil` (app/lib/auth/fotoPerfil.ts)
    // una vez exista una cuenta creada. Por ahora solo se muestra la vista previa
    // y no se persiste en el registro.
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(archivo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    if (!validateAll()) return;

    if (opcionEntrenador === "del_directorio" && !entrenadorSeleccionadoId) {
      setError("Selecciona a tu entrenador del directorio.");
      return;
    }

    if (opcionEntrenador === "manual" && !nombreEntrenadorManual.trim()) {
      setError("Escribe el nombre de tu entrenador.");
      return;
    }

    const origenEntrenador: OrigenEntrenador =
      opcionEntrenador === "del_directorio"
        ? "directorio"
        : opcionEntrenador === "manual"
        ? "manual"
        : "independiente";

    const nombreCompleto = `${values.nombre.trim()} ${values.apellido.trim()}`;

    setEnviando(true);

    const { data, error: authError } = await registrarCuenta({
      email: values.email,
      password: values.password,
      nombre: nombreCompleto,
      rol: "usuario",
    });

    if (authError) {
      const mensaje = authError.message.toLowerCase();
      setError(
        mensaje.includes("already registered") || mensaje.includes("already exists") || mensaje.includes("ya registrad")
          ? "Ya existe una cuenta con ese correo. Intenta iniciar sesión."
          : "No pudimos crear tu cuenta. Intenta de nuevo en unos minutos."
      );
      setEnviando(false);
      return;
    }

    if (!data.user) {
      setError("No pudimos crear tu cuenta. Intenta de nuevo en unos minutos.");
      setEnviando(false);
      return;
    }

    // Crea el registro deportivo asociado a la cuenta recién creada.
    const supabase = crearClienteSupabaseNavegador();
    const { error: perfilError } = await supabase.from("perfiles_deportivos").insert({
      cuenta_id: data.user.id,
      apellido: values.apellido.trim(),
      apodo: values.apodo.trim() || null,
      fecha_nacimiento: values.fechaNacimiento,
      peso_kg: Number(values.peso) || 0.1,
      nivel: values.nivel,
      objetivo: values.objetivo || null,
      ciudad: values.ciudad || null,
      origen_entrenador: origenEntrenador,
      entrenador_directorio_id: origenEntrenador === "directorio" ? entrenadorSeleccionadoId : null,
      entrenador_manual_nombre: origenEntrenador === "manual" ? nombreEntrenadorManual.trim() : null,
    });

    if (perfilError) {
      setError("Tu cuenta se creó pero hubo un problema guardando tus datos deportivos. Contacta soporte.");
      setEnviando(false);
      return;
    }

    // Auto-login: si Supabase ya dejó una sesión activa (confirmación de correo
    // deshabilitada), redirigimos directo al panel. Si no, el proyecto requiere
    // confirmar el correo antes de poder iniciar sesión.
    if (data.session) {
      router.push(rutaDestino("usuario", "aprobado"));
      return;
    }

    setEnviando(false);
    setInfoMsg("Tu cuenta se creó correctamente. Revisa tu correo para confirmarla antes de iniciar sesión.");
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
          <FormField id="alumno-foto" label="Foto de perfil (opcional)" className={styles.field} labelClassName={styles.label}>
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
                id="alumno-foto"
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFotoChange}
              />
            </div>
          </FormField>

          <div className={styles.fieldGroup}>
            <FormField
              id="alumno-nombre"
              label="Nombre"
              error={touched.nombre ? errors.nombre : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="alumno-nombre"
                type="text"
                className={styles.input}
                placeholder="Carlos"
                value={values.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                aria-invalid={Boolean(touched.nombre && errors.nombre)}
                aria-describedby={touched.nombre && errors.nombre ? "alumno-nombre-error" : undefined}
              />
            </FormField>
            <FormField
              id="alumno-apellido"
              label="Apellido"
              error={touched.apellido ? errors.apellido : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="alumno-apellido"
                type="text"
                className={styles.input}
                placeholder="Gutiérrez"
                value={values.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                onBlur={() => handleBlur("apellido")}
                aria-invalid={Boolean(touched.apellido && errors.apellido)}
                aria-describedby={touched.apellido && errors.apellido ? "alumno-apellido-error" : undefined}
              />
            </FormField>
          </div>

          <FormField id="alumno-apodo" label="Apodo (opcional)" className={styles.field} labelClassName={styles.label}>
            <input
              id="alumno-apodo"
              type="text"
              className={styles.input}
              placeholder="El Rayo"
              value={values.apodo}
              onChange={(e) => handleChange("apodo", e.target.value)}
              onBlur={() => handleBlur("apodo")}
            />
          </FormField>

          <FormField
            id="alumno-email"
            label="Correo electrónico"
            error={touched.email ? errors.email : undefined}
            className={styles.field}
            labelClassName={styles.label}
          >
            <input
              id="alumno-email"
              type="email"
              className={styles.input}
              placeholder="tu@correo.com"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              aria-invalid={Boolean(touched.email && errors.email)}
              aria-describedby={touched.email && errors.email ? "alumno-email-error" : undefined}
            />
          </FormField>

          <div className={styles.fieldGroup}>
            <FormField id="alumno-fechaNacimiento" label="Fecha de nacimiento" className={styles.field} labelClassName={styles.label}>
              <input
                id="alumno-fechaNacimiento"
                type="date"
                className={styles.input}
                value={values.fechaNacimiento}
                onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
                onBlur={() => handleBlur("fechaNacimiento")}
              />
            </FormField>
            <FormField id="alumno-peso" label="Peso (kg)" className={styles.field} labelClassName={styles.label}>
              <input
                id="alumno-peso"
                type="number"
                className={styles.input}
                placeholder="68.5"
                step="0.1"
                value={values.peso}
                onChange={(e) => handleChange("peso", e.target.value)}
                onBlur={() => handleBlur("peso")}
              />
            </FormField>
          </div>

          <div className={styles.fieldGroup}>
            <FormField id="alumno-nivel" label="Nivel" className={styles.field} labelClassName={styles.label}>
              <select
                id="alumno-nivel"
                className={styles.select}
                value={values.nivel}
                onChange={(e) => handleChange("nivel", e.target.value)}
                onBlur={() => handleBlur("nivel")}
              >
                <option>Principiante</option>
                <option>Amateur</option>
                <option>Semi-profesional</option>
                <option>Profesional</option>
              </select>
            </FormField>
            <FormField id="alumno-objetivo" label="Objetivo principal" className={styles.field} labelClassName={styles.label}>
              <select
                id="alumno-objetivo"
                className={styles.select}
                value={values.objetivo}
                onChange={(e) => handleChange("objetivo", e.target.value)}
                onBlur={() => handleBlur("objetivo")}
              >
                <option>Acondicionamiento físico</option>
                <option>Aprender técnica</option>
                <option>Competir amateur</option>
                <option>Carrera profesional</option>
                <option>Bajar de peso</option>
              </select>
            </FormField>
          </div>

          <FormField id="alumno-ciudad" label="Ciudad" className={styles.field} labelClassName={styles.label}>
            <input
              id="alumno-ciudad"
              type="text"
              className={styles.input}
              placeholder="Ciudad de México"
              value={values.ciudad}
              onChange={(e) => handleChange("ciudad", e.target.value)}
              onBlur={() => handleBlur("ciudad")}
            />
          </FormField>

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
                    <label htmlFor="alumno-entrenador-select" className={styles.label}>Selecciona a tu entrenador</label>
                    <select
                      id="alumno-entrenador-select"
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
                <label htmlFor="alumno-entrenador-manual" className={styles.label}>Nombre de tu entrenador</label>
                <input
                  id="alumno-entrenador-manual"
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
            <FormField
              id="alumno-password"
              label="Contraseña"
              error={touched.password ? errors.password : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="alumno-password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={values.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-invalid={Boolean(touched.password && errors.password)}
                aria-describedby={touched.password && errors.password ? "alumno-password-error" : undefined}
              />
            </FormField>
            <FormField
              id="alumno-confirmPassword"
              label="Confirmar contraseña"
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              className={styles.field}
              labelClassName={styles.label}
            >
              <input
                id="alumno-confirmPassword"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
                aria-describedby={touched.confirmPassword && errors.confirmPassword ? "alumno-confirmPassword-error" : undefined}
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
              Acepto los <a href="/terminos">términos y condiciones</a> y la <a href="/privacidad">política de privacidad</a>.
            </label>
          </div>
          {touched.aceptaTerminos && errors.aceptaTerminos && (
            <p id="terms-error" role="alert" className={styles.errorMsg}>{errors.aceptaTerminos}</p>
          )}

          {error && <p className={styles.errorMsg} role="alert">{error}</p>}
          {infoMsg && <p className={styles.hint} role="status">{infoMsg}</p>}

          <button type="submit" className={styles.submitBtn} disabled={!values.aceptaTerminos || enviando}>
            {enviando ? "Creando cuenta..." : "Crear cuenta de Alumno"}
          </button>
        </form>

        <p className={styles.footerNote}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
