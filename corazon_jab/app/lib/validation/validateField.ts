// app/lib/validation/validateField.ts
// Validación de campo por reglas declarativas, para el patrón useFormValidation + FormField.
// Ver diseño: .kiro/specs/design-system-unification/design.md, sección
// "3. useFormValidation + FieldError" y "Key Functions with Formal Specifications → validateField".

/**
 * Regla de validación aplicable a un campo de un formulario cuyos valores son `TValues`.
 * - `required`: el valor no puede estar vacío (string) o debe ser `true` (checkbox).
 * - `email`: el valor debe tener forma de correo electrónico.
 * - `minLength`: el valor (string) debe tener al menos `length` caracteres.
 * - `matches`: el valor debe ser idéntico al de otro campo (`field`), ej. confirmar contraseña.
 */
export type FieldRule<TValues> =
  | { type: "required"; message?: string }
  | { type: "email"; message?: string }
  | { type: "minLength"; length: number; message?: string }
  | { type: "matches"; field: keyof TValues; message?: string };

/** Mapa de reglas de validación por campo, todas las keys son opcionales. */
export type ValidationSchema<TValues> = {
  [K in keyof TValues]?: FieldRule<TValues>[];
};

const DEFAULT_MESSAGES = {
  required: "Este campo es obligatorio.",
  email: "Ingresa un correo válido.",
  minLength: (length: number) => `Debe tener al menos ${length} caracteres.`,
  matches: "No coincide.",
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida `value` contra `rules`, en el orden en que aparecen (orden determinista).
 *
 * Postcondiciones:
 * - Devuelve el mensaje de la PRIMERA regla que falla.
 * - Devuelve `null` si y solo si `value` satisface todas las reglas.
 * - No muta `value`, `rules` ni `values`.
 */
export function validateField<TValues extends Record<string, string | boolean>>(
  value: TValues[keyof TValues],
  rules: FieldRule<TValues>[],
  values: TValues
): string | null {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    switch (rule.type) {
      case "required": {
        const passes = typeof value === "string" ? value.trim().length > 0 : value === true;
        if (!passes) {
          return rule.message ?? DEFAULT_MESSAGES.required;
        }
        break;
      }
      case "email": {
        const passes = typeof value === "string" && EMAIL_PATTERN.test(value);
        if (!passes) {
          return rule.message ?? DEFAULT_MESSAGES.email;
        }
        break;
      }
      case "minLength": {
        const passes = typeof value === "string" && value.length >= rule.length;
        if (!passes) {
          return rule.message ?? DEFAULT_MESSAGES.minLength(rule.length);
        }
        break;
      }
      case "matches": {
        const passes = value === values[rule.field];
        if (!passes) {
          return rule.message ?? DEFAULT_MESSAGES.matches;
        }
        break;
      }
    }
  }

  return null;
}
