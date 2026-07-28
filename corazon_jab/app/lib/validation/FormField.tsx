// app/lib/validation/FormField.tsx
// Componente genérico de campo de formulario: asocia <label htmlFor> con el control de
// entrada que el caller renderiza como children, y expone el mensaje de error del campo
// (Error_Campo) con role="alert" e id={`${id}-error`} para enlazarlo vía aria-describedby.
// Ver diseño: .kiro/specs/design-system-unification/design.md, sección
// "3. useFormValidation + FieldError" y "Example Usage → useFormValidation en login/page.tsx".
//
// FormField es deliberadamente agnóstico de estilos: no hardcodea clases de ningún
// .module.css específico. Cada formulario consumidor (login, registro, forgot-password)
// le pasa sus propias clases vía props para conservar su apariencia visual actual.

import type { JSX, ReactNode } from "react";

export interface FormFieldProps {
  /** id único, compartido entre <label htmlFor> y el <input>/<select> que el caller renderiza dentro de children */
  id: string;
  label: string;
  error?: string;
  /** clase opcional para el <div> wrapper del campo completo (ej. styles.field del módulo consumidor) */
  className?: string;
  /** clase opcional para el <label> (ej. styles.label del módulo consumidor) */
  labelClassName?: string;
  /** clase opcional para el <p> de error (ej. styles.fieldError del módulo consumidor, o un estilo inline por defecto si no se provee) */
  errorClassName?: string;
  children: ReactNode; // el <input>/<select> ya debe recibir id={id} y aria-describedby={error ? `${id}-error` : undefined} desde el caller
}

/** Estilo inline mínimo para el mensaje de error cuando el caller no provee `errorClassName`. */
const defaultErrorStyle = {
  color: "#ff8a8a",
  fontSize: "0.8rem",
  margin: "0.3rem 0 0",
} as const;

/**
 * Renderiza un campo de formulario accesible: `<label htmlFor={id}>` asociado al control
 * de entrada (`children`, ya armado por el caller con su propio `id`/`aria-describedby`),
 * y el mensaje de error del campo (si `error` está definido y no vacío) con
 * `role="alert"` e `id={`${id}-error`}`.
 *
 * No clona ni inyecta props al hijo (sin `React.cloneElement`): el caller es responsable
 * de conectar `id`, `value`, `onChange`, `onBlur` y `aria-describedby` en su propio input.
 */
export default function FormField({
  id,
  label,
  error,
  className,
  labelClassName,
  errorClassName,
  children,
}: FormFieldProps): JSX.Element {
  const hasError = Boolean(error && error.length > 0);

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {children}
      {hasError && (
        <p
          id={`${id}-error`}
          role="alert"
          className={errorClassName}
          style={errorClassName ? undefined : defaultErrorStyle}
        >
          {error}
        </p>
      )}
    </div>
  );
}
