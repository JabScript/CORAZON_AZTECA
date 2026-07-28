// app/lib/validation/useFormValidation.ts
// Hook reutilizable de validación de formularios por campo, construido sobre `validateField`.
// Ver diseño: .kiro/specs/design-system-unification/design.md, sección
// "3. useFormValidation + FieldError" y "Key Functions with Formal Specifications → useFormValidation.validateAll".

import { useState } from "react";
import { type ValidationSchema, validateField } from "./validateField";

/** Resultado expuesto por `useFormValidation`. */
export interface UseFormValidationResult<TValues extends Record<string, string | boolean>> {
  values: TValues;
  errors: Partial<Record<keyof TValues, string>>;
  touched: Partial<Record<keyof TValues, boolean>>;
  isValid: boolean;
  handleChange: (field: keyof TValues, value: TValues[keyof TValues]) => void;
  handleBlur: (field: keyof TValues) => void;
  validateAll: () => boolean;
  setValues: React.Dispatch<React.SetStateAction<TValues>>;
}

/**
 * Hook de validación de formularios por campo, con mensajes inline.
 *
 * Comportamiento:
 * - `handleChange`: actualiza el valor. Si el campo ya fue `touched`, revalida ese
 *   campo de inmediato; si no, no calcula ni muestra error todavía.
 * - `handleBlur`: marca el campo como `touched` y lo valida de inmediato.
 * - `validateAll`: marca todos los campos del `schema` como `touched`, revalida todos
 *   y retorna `true` si y solo si el objeto de errores resultante queda vacío.
 * - `isValid`: derivado de si `errors` está vacío en el estado actual.
 */
export function useFormValidation<TValues extends Record<string, string | boolean>>(
  initialValues: TValues,
  schema: ValidationSchema<TValues>
): UseFormValidationResult<TValues> {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof TValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TValues, boolean>>>({});

  const validateSingleField = (
    field: keyof TValues,
    currentValues: TValues
  ): string | null => {
    const rules = schema[field];
    if (!rules || rules.length === 0) {
      return null;
    }
    return validateField(currentValues[field], rules, currentValues);
  };

  const handleChange: UseFormValidationResult<TValues>["handleChange"] = (field, value) => {
    const nextValues = { ...values, [field]: value } as TValues;
    setValues(nextValues);

    if (touched[field]) {
      const message = validateSingleField(field, nextValues);
      setErrors((prev) => {
        const next = { ...prev };
        if (message === null) {
          delete next[field];
        } else {
          next[field] = message;
        }
        return next;
      });
    }
  };

  const handleBlur: UseFormValidationResult<TValues>["handleBlur"] = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const message = validateSingleField(field, values);
    setErrors((prev) => {
      const next = { ...prev };
      if (message === null) {
        delete next[field];
      } else {
        next[field] = message;
      }
      return next;
    });
  };

  const validateAll = (): boolean => {
    const schemaKeys = Object.keys(schema) as Array<keyof TValues>;

    const nextTouched: Partial<Record<keyof TValues, boolean>> = { ...touched };
    const nextErrors: Partial<Record<keyof TValues, string>> = {};

    for (const key of schemaKeys) {
      nextTouched[key] = true;
      const message = validateSingleField(key, values);
      if (message !== null) {
        nextErrors[key] = message;
      }
    }

    setTouched(nextTouched);
    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    setValues,
  };
}
