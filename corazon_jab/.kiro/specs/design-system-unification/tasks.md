# Implementation Plan: Unificación del Sistema de Diseño (Corazón Azteca)

## Overview

Este plan implementa el diseño en cuatro bloques incrementales y no disruptivos: (1) tokens de diseño centralizados con alias retrocompatibles y consolidación de fuentes vía `next/font`, (2) limpieza incremental de los `.module.css` legacy y `admin-theme.css` para depender solo de los tokens globales, (3) `DashboardLayout` compartido entre `Usuario` y `Entrenador`, (4) validación de formularios accesible (`useFormValidation`/`FormField`) y estados de carga/error para dashboards (`useAsyncData`/`DashboardSkeleton`/`ErrorState`), cerrando con la corrección de `sizes` en imágenes con `fill`. Se configura `vitest` + `fast-check` como parte del primer bloque de testing, ya que el proyecto no tiene runner de pruebas hoy.

## Tasks

- [x] 1. Configurar el runner de pruebas del proyecto
  - Instalar `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` y `fast-check` como `devDependencies` con versiones fijas
  - Añadir script `"test": "vitest run"` a `package.json` y archivo de configuración `vitest.config.ts` con entorno `jsdom`
  - Crear un test trivial (`sanity.test.ts`) que confirme que el runner ejecuta correctamente
  - _Requirements: (soporte de infraestructura para todas las propiedades de las secciones 2-5)_

- [x] 2. Crear la fuente única de verdad de tokens de diseño
  - [x] 2.1 Crear `app/styles/tokens.css` con los tokens canónicos (`--ca-color-*`, `--ca-font-*`, `--ca-space-*`) y los 14 alias legacy documentados en el diseño, con comentarios que mapeen cada alias a su token canónico
    - _Requirements: 1.1, 1.2, 2.4_
  - [x] 2.2 Importar `tokens.css` desde `app/globals.css` (`@import "./styles/tokens.css";`) sin remover el contenido existente de `globals.css`
    - _Requirements: 1.1_
  - [ ]* 2.3 Escribir prueba de propiedad: alias legacy resuelven al mismo valor que su token canónico
    - **Property 1: Alias de tokens legacy resuelven al mismo valor que su token canónico**
    - **Validates: Requirements 1.2**
    - Usar jsdom para montar `:root` con `tokens.css` y comparar `getComputedStyle` de cada alias contra su token canónico, para los 14 pares fijos
  - [ ]* 2.4 Escribir prueba de propiedad: los alias son referencias vivas, no copias
    - **Property 2: Los alias son referencias vivas, no copias**
    - **Validates: Requirements 1.5**
    - Cambiar el valor de un token canónico en tiempo de prueba (`style.setProperty`) y verificar que el alias correspondiente refleja el nuevo valor en el mismo render, para cada uno de los 14 pares

- [x] 3. Crear el módulo compartido de fuentes con `next/font/google`
  - [x] 3.1 Crear `app/styles/fonts.ts` exportando `fontHeading` (Playfair Display), `fontBody` (Oswald), `fontDisplay` (Anton), `fontAccent` (Bungee) y `fontBodyAlt` (Barlow), cada uno con su `variable` CSS correspondiente
    - _Requirements: 1.3, 1.4_
  - [x] 3.2 Aplicar las clases `variable` de las 5 fuentes al elemento `<html>` en `app/layout.tsx` (root layout)
    - _Requirements: 1.3_
  - [x] 3.3 Actualizar `app/styles/tokens.css` para que `--ca-font-heading`, `--ca-font-display`, `--ca-font-accent`, `--ca-font-body` y `--ca-font-body-alt` referencien las variables `--font-*` expuestas por `fonts.ts`
    - _Requirements: 1.3, 1.4_
  - [x] 3.4 Reemplazar en `app/Admin/admin-theme.css` las declaraciones `font-family: 'Anton'` / `'Barlow'` (string suelto) por `var(--ca-font-display)` / `var(--ca-font-body-alt)`
    - _Requirements: 1.4_

- [x] 4. Checkpoint - Verificar que la introducción de tokens no cambia el aspecto visual
  - Ejecutar la suite de pruebas (`npm run test`) y revisar manualmente que Header, Footer, Inicio, Admin y Entrenador se ven igual que antes de introducir `tokens.css`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Migrar `.module.css` legacy y `admin-theme.css` a depender solo de los tokens globales
  - [x] 5.1 Eliminar el bloque de redefinición local de `--gold`/`--red`/`--cream` en cada uno de los módulos: `Header.module.css`, `Footer.module.css`, `CTA.module.css`, `Inicio.module.css`, `Funcionalidades.module.css`, `Secciones.module.css`, `login`, `registro`, `blog` (`Blog.module.css`)
    - _Requirements: 2.2_
  - [x] 5.2 Eliminar el bloque de redefinición local de `--ca-oro`/`--ca-rojo`/`--ca-crema` (y variantes) en `app/Admin/admin-theme.css`, dejando que resuelvan desde los tokens globales
    - _Requirements: 2.3_
  - [ ]* 5.3 Ejecutar de nuevo la prueba de propiedad de la tarea 2.3 tras la limpieza para confirmar que los módulos migrados siguen resolviendo los mismos valores
    - **Property 1: Alias de tokens legacy resuelven al mismo valor que su token canónico**
    - **Validates: Requirements 1.2, 2.1**

- [x] 6. Implementar `DashboardLayout` compartido
  - [x] 6.1 Crear `app/components/DashboardLayout/DashboardLayout.tsx` con la interfaz `DashboardLayoutProps` (`role`, `navItems`, `sidebarWidthPx`, `subNav`, `children`), envolviendo el contenido en `RequireRole`
    - _Requirements: 3.1, 3.2, 3.6_
  - [x] 6.2 Implementar el renderizado del `<aside>` con `navItems`, marcando el ítem activo según `usePathname()`, y el bloque de usuario (avatar, nombre) + botón de logout usando `obtenerSesion()`/`cerrarSesion()`
    - _Requirements: 3.3, 3.4, 3.5_
  - [x] 6.3 Crear `app/components/DashboardLayout/DashboardLayout.module.css` consolidando las clases `.sidebar`, `.navItem`, `.logoutBtn` (y variantes) hoy duplicadas en `Usuario.module.css`/`Entrenador.module.css`, usando los tokens de diseño
    - _Requirements: 3.7_
  - [ ]* 6.4 Escribir prueba de propiedad: `DashboardLayout` preserva la guarda de acceso por rol
    - **Property 3: `DashboardLayout` preserva la guarda de acceso por rol**
    - **Validates: Requirements 3.2**
    - Generar combinaciones arbitrarias de `role` de `DashboardLayout` y `rol` de sesión mockeada de {`usuario`,`entrenador`,`admin`}; verificar que el contenido se renderiza si y solo si coinciden
  - [ ]* 6.5 Escribir prueba de propiedad: exactamente un ítem de navegación activo por ruta
    - **Property 4: Exactamente un ítem de navegación activo por ruta**
    - **Validates: Requirements 3.4, 3.5**
    - Generar listas arbitrarias de `navItems` (hrefs únicos) y una ruta activa arbitraria (mockeando `usePathname()`); verificar que el ítem marcado activo es exactamente el que coincide, o ninguno
  - [ ]* 6.6 Escribir prueba unitaria: `DashboardLayout` renderiza el bloque de usuario y logout usando la sesión actual
    - _Requirements: 3.3_

- [x] 7. Migrar `Usuario` y `Entrenador` a `DashboardLayout`
  - [x] 7.1 Crear `app/components/DashboardLayout/EntrenadorTabs.tsx` (o equivalente) para la navegación secundaria de tabs horizontales, pasado vía `subNav`
    - _Requirements: 3.6_
  - [x] 7.2 Reescribir `app/Usuario/layout.tsx` para usar `DashboardLayout role="usuario"` con sus `navItems` y `sidebarWidthPx={220}`
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 7.3 Reescribir `app/Entrenador/layout.tsx` para usar `DashboardLayout role="entrenador"` con sus `navItems`, `sidebarWidthPx={240}` y `subNav={<EntrenadorTabs />}`
    - _Requirements: 3.1, 3.2, 3.3, 3.6_
  - [x] 7.4 Eliminar las clases `.sidebar`, `.navItem`, `.logoutBtn` (y variantes) de `Usuario.module.css` y `Entrenador.module.css`, dejando solo los estilos específicos de contenido de cada uno
    - _Requirements: 3.7_

- [x] 8. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implementar el sistema de validación de formularios accesible
  - [x] 9.1 Crear `app/lib/validation/validateField.ts` implementando `validateField` (reglas `required`, `email`, `minLength`, `matches`) según el orden determinista de evaluación descrito en el diseño
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 9.2 Escribir prueba de propiedad: validación por regla es exacta respecto a su predicado declarado
    - **Property 6: Validación por regla es exacta respecto a su predicado declarado**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - Generar strings/pares arbitrarios (incluyendo strings construidos con la gramática `local@domain.tld` para positivos de email) para cada tipo de regla y verificar equivalencia con el predicado declarado
  - [x] 9.3 Crear `app/lib/validation/useFormValidation.ts` implementando el hook (`values`, `errors`, `touched`, `isValid`, `handleChange`, `handleBlur`, `validateAll`, `setValues`) sobre `validateField`
    - _Requirements: 5.1, 5.5, 5.6_
  - [ ]* 9.4 Escribir prueba de propiedad: los `Error_Campo` permanecen ocultos hasta que el campo es tocado o se envía el formulario
    - **Property 7: Los `Error_Campo` permanecen ocultos hasta que el campo es tocado o se envía el formulario**
    - **Validates: Requirements 5.5**
    - Generar esquemas y valores arbitrarios (válidos e inválidos) sin invocar `handleBlur`/`validateAll` y verificar que ningún `Error_Campo` se marca como visible
  - [ ]* 9.5 Escribir prueba de propiedad: `validateAll()` es consistente con el contenido de `errors`
    - **Property 8: `validateAll()` es consistente con el contenido de `errors`**
    - **Validates: Requirements 5.6**
    - Generar esquemas y valores arbitrarios; verificar que el booleano retornado por `validateAll()` coincide con `Object.keys(errors).length === 0` y que todos los campos del esquema quedan `touched`
  - [x] 9.6 Crear el componente `FormField` (`app/lib/validation/FormField.tsx`) que asocia `<label htmlFor={id}>` con el control de entrada y renderiza el `Error_Campo` con `role="alert"` e `id={`${id}-error`}`
    - _Requirements: 4.1, 4.3_
  - [ ]* 9.7 Escribir prueba de propiedad: asociación label-input y `aria-describedby` total en formularios validados
    - **Property 5: Asociación label-input y `aria-describedby` total en formularios validados**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Generar configuraciones arbitrarias de campos (con/sin error visible, incluyendo el caso checkbox) renderizados con `FormField`; verificar que todo `<label>` tiene `htmlFor` apuntando a un `id` existente y que todo campo con error visible expone `aria-describedby` apuntando al `id` del mensaje

- [x] 10. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [-] 11. Aplicar la validación accesible a los formularios de autenticación
  - [x] 11.1 Migrar `login/page.tsx` para usar `useFormValidation` + `FormField`, incluyendo la asociación `htmlFor`/`id` del checkbox "Recordarme", preservando el flujo de `autenticar()` y el mensaje de error de negocio a nivel de formulario (`role="alert"`)
    - _Requirements: 4.1, 4.2, 4.4, 5.7, 5.8, 5.9_
  - [x] 11.2 Migrar el formulario de registro de alumno para usar `useFormValidation` + `FormField`, preservando el flujo de `registrarCuenta()`
    - _Requirements: 4.1, 4.4, 5.4, 5.7, 5.8, 5.9_
  - [x] 11.3 Migrar el formulario de registro de entrenador para usar `useFormValidation` + `FormField`, preservando su flujo existente
    - _Requirements: 4.1, 4.4, 5.7, 5.8, 5.9_
  - [x] 11.4 Migrar el formulario de registro de admin para usar `useFormValidation` + `FormField`, preservando su flujo existente
    - _Requirements: 4.1, 4.4, 5.7, 5.8, 5.9_
  - [x] 11.5 Migrar el formulario de forgot-password para usar `useFormValidation` + `FormField`, preservando su flujo existente
    - _Requirements: 4.1, 4.4, 5.9_
  - [ ]* 11.6 Escribir pruebas de integración para login: email inválido muestra error inline sin submit, corregirlo lo hace desaparecer, y credenciales incorrectas muestran error de formulario (no de campo)
    - _Requirements: 5.7, 5.8_
  - [ ]* 11.7 Escribir pruebas de integración equivalentes para al menos uno de los formularios de registro (confirmación de contraseña no coincidente muestra `Error_Campo` en el campo de confirmación)
    - _Requirements: 5.4, 5.7_

- [x] 12. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implementar el manejo de estados de carga y error para datos asíncronos
  - [x] 13.1 Crear `app/lib/async/useAsyncData.ts` implementando el hook (`status`, `data`, `error`, `refetch`) con protección contra actualizaciones tras desmontaje
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8_
  - [ ]* 13.2 Escribir prueba de propiedad: la máquina de estados de `useAsyncData` nunca queda inconsistente
    - **Property 9: La máquina de estados de `useAsyncData` nunca queda inconsistente**
    - **Validates: Requirements 6.2, 6.4, 6.5, 6.6**
    - Generar secuencias arbitrarias de resolución/rechazo/`refetch()` con `fc.commands` (o reductor de estados equivalente) sobre un fetcher mockeado; verificar que la secuencia de `status` observada siempre es un subcamino válido de `idle → loading → (success|error)`
  - [ ]* 13.3 Escribir prueba de propiedad: `useAsyncData` no actualiza estado tras el desmontaje del componente
    - **Property 10: `useAsyncData` no actualiza estado tras el desmontaje del componente**
    - **Validates: Requirements 6.8**
    - Generar momentos de desmontaje arbitrarios relativos a la resolución/rechazo del fetcher mockeado (antes, durante, después); verificar que ninguna transición de estado ocurre después del desmontaje
  - [x] 13.4 Crear `DashboardSkeleton` (`app/lib/async/DashboardSkeleton.tsx`) y `ErrorState` (`app/lib/async/ErrorState.tsx`) según las interfaces `SkeletonProps`/`ErrorStateProps` del diseño
    - _Requirements: 6.3, 6.5_
  - [ ]* 13.5 Escribir prueba unitaria: durante `status === "loading"` se renderiza `DashboardSkeleton` y no el contenido final ni una pantalla vacía
    - _Requirements: 6.3_

- [ ] 14. Aplicar `useAsyncData` a los dashboards existentes
  - [x] 14.1 Migrar `Usuario/page.tsx` para envolver su lectura actual de `localStorage` (`obtenerAlumnoPorUsuarioId`) en un fetcher de `useAsyncData`, renderizando `DashboardSkeleton` en `loading` y `ErrorState` en `error`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [x] 14.2 Migrar `Entrenador/page.tsx` de la misma forma, envolviendo su lectura actual de datos en un fetcher de `useAsyncData`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [x] 14.3 Migrar `Admin/page.tsx` de la misma forma, envolviendo su lectura actual de datos en un fetcher de `useAsyncData`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [ ]* 14.4 Escribir prueba de integración: `Usuario/page.tsx` con `useAsyncData` mockeado — loading muestra skeleton, success muestra contenido, error muestra `ErrorState` con retry funcional que vuelve a invocar el fetcher
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [x] 15. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Endurecer `ImagenEditable` y corregir usos de `fill` sin `sizes`
  - [x] 16.1 Implementar `assertSizesWhenFill` en `app/components/ImagenEditable/ImagenEditable.tsx`: si `fill === true` y `sizes` es `undefined`, emitir `console.error` en desarrollo y aplicar `sizes="100vw"` como fallback antes de renderizar
    - _Requirements: 7.1, 7.2_
  - [ ]* 16.2 Escribir prueba de propiedad: toda imagen con `fill` tiene `sizes` definido
    - **Property 11: Toda imagen con `fill` tiene `sizes` definido**
    - **Validates: Requirements 7.1, 7.2**
    - Generar combinaciones arbitrarias de props `{fill: boolean, sizes?: string}`; verificar que el elemento renderizado siempre tiene `sizes` no vacío cuando `fill === true`, y que el valor del caller se preserva cuando se provee
  - [ ]* 16.3 Escribir prueba unitaria con spy: `fill` sin `sizes` invoca `console.error` con el `clave` de la imagen en entorno de desarrollo
    - _Requirements: 7.2_
  - [x] 16.4 Añadir `sizes="(max-width: 768px) 100vw, 33vw"` a los usos de `next/image` con `fill` en `app/blog/page.tsx` (tarjetas de logros y posts de comunidad)
    - _Requirements: 7.3, 7.4_
  - [x] 16.5 Añadir `sizes="(max-width: 768px) 100vw, 33vw"` al uso de `next/image` con `fill` en `app/components/MisArticulos/MisArticulos.tsx`
    - _Requirements: 7.3, 7.4_
  - [x] 16.6 Añadir `sizes="(max-width: 768px) 100vw, 33vw"` al uso de `next/image` con `fill` en `app/Admin/Articulos/page.tsx`
    - _Requirements: 7.3, 7.4_

- [x] 17. Checkpoint final - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales (principalmente pruebas) y pueden omitirse para un MVP más rápido, aunque se recomienda no omitir las pruebas de propiedad de tokens (2.3/2.4) y de la máquina de estados de `useAsyncData` (13.2/13.3) por ser las de mayor riesgo de regresión silenciosa.
- Cada tarea referencia los criterios de aceptación específicos de `requirements.md` para trazabilidad.
- Los checkpoints (4, 8, 10, 12, 15, 17) marcan puntos de validación incremental antes de avanzar al siguiente bloque.
- Las pruebas de propiedad usan `fast-check` con un mínimo de 100 iteraciones cada una, y cada test debe etiquetarse con el formato `Feature: design-system-unification, Property N: <texto de la propiedad>`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["2.3", "2.4", "3.2"] },
    { "id": 4, "tasks": ["3.3"] },
    { "id": 5, "tasks": ["3.4", "4"] },
    { "id": 6, "tasks": ["5.1", "5.2"] },
    { "id": 7, "tasks": ["5.3"] },
    { "id": 8, "tasks": ["6.1"] },
    { "id": 9, "tasks": ["6.2"] },
    { "id": 10, "tasks": ["6.3", "6.4", "6.5", "6.6"] },
    { "id": 11, "tasks": ["7.1"] },
    { "id": 12, "tasks": ["7.2", "7.3"] },
    { "id": 13, "tasks": ["7.4", "8"] },
    { "id": 14, "tasks": ["9.1"] },
    { "id": 15, "tasks": ["9.2", "9.3"] },
    { "id": 16, "tasks": ["9.4", "9.5", "9.6"] },
    { "id": 17, "tasks": ["9.7", "10"] },
    { "id": 18, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5"] },
    { "id": 19, "tasks": ["11.6", "11.7", "12"] },
    { "id": 20, "tasks": ["13.1"] },
    { "id": 21, "tasks": ["13.2", "13.3", "13.4"] },
    { "id": 22, "tasks": ["13.5", "14.1", "14.2", "14.3"] },
    { "id": 23, "tasks": ["14.4", "15"] },
    { "id": 24, "tasks": ["16.1"] },
    { "id": 25, "tasks": ["16.2", "16.3", "16.4", "16.5", "16.6"] },
    { "id": 26, "tasks": ["17"] }
  ]
}
```
