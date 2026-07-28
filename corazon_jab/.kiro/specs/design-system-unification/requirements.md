# Requirements Document

## Introduction

Este documento define los requisitos derivados de la revisión de interfaz/frontend de **Corazón Azteca** (`corazon_jab`), una plataforma Next.js (App Router) de boxeo/entrenamiento con roles Usuario, Entrenador y Admin. La revisión identificó fragmentación del sistema de diseño (dos temas de color/tipografía coexistiendo), duplicación de layout entre dashboards, problemas de accesibilidad y validación en formularios de autenticación, ausencia de estados de carga ante la migración a Supabase en curso, y usos de imagen sin `sizes` con `fill`.

El alcance de este documento es **de interfaz y experiencia**: unificación de tokens de diseño, un layout de dashboard compartido, corrección de accesibilidad y validación de formularios, y manejo de estados de carga/error. No cubre el modelo de datos ni el esquema de Supabase (ver spec `supabase-database-schema`), aunque sí define el contrato de interfaz (`fetcher` asíncrono) que consumirán los dashboards cuando esa migración esté disponible.

Este documento se deriva del diseño técnico ya elaborado en `design.md` de esta misma spec (flujo Design-First): tokens de diseño (`app/styles/tokens.css`), `DashboardLayout`, `useFormValidation`/`FormField`, `useAsyncData`/`DashboardSkeleton`/`ErrorState`, y el endurecimiento de `ImagenEditable`.

## Glossary

- **Sistema**: La plataforma Corazón Azteca (frontend Next.js `corazon_jab`).
- **Token_Diseño**: Una variable CSS canónica (`--ca-color-*`, `--ca-font-*`, `--ca-space-*`) declarada en una única fuente de verdad (`app/styles/tokens.css`).
- **Alias_Legacy**: Una variable CSS con un nombre históricamente usado por los módulos existentes (`--gold`, `--red`, `--cream`, `--ca-oro`, `--ca-rojo`, `--ca-crema`, etc.) que debe resolver al mismo valor que su Token_Diseño correspondiente.
- **Tema_Moderno**: El conjunto de variables `--gold`/`--red`/`--cream` redefinidas hoy dentro de cada `.module.css` (Header, Footer, CTA, Inicio, Funcionalidades, Secciones, Usuario, Entrenador, login, registro, blog).
- **Tema_Admin**: El conjunto de variables `--ca-oro`/`--ca-rojo`/`--ca-crema` definido en `admin-theme.css`, usado en Admin y en `Entrenador/Alumnos/[id]`.
- **DashboardLayout**: El componente de layout compartido (sidebar + contenido) parametrizable por Rol que sustituye la duplicación entre `Usuario.module.css` y `Entrenador.module.css`.
- **Rol**: Uno de `usuario`, `entrenador`, `admin`; determina qué DashboardLayout y navegación se muestran.
- **Formulario_Autenticacion**: Cualquiera de los formularios de login, registro (alumno, entrenador, admin) o recuperación de contraseña (forgot-password).
- **Campo_Formulario**: Un control de entrada individual (input, select, checkbox) dentro de un Formulario_Autenticacion.
- **Error_Campo**: Un mensaje de validación específico de un Campo_Formulario, mostrado junto a ese campo (no al final del formulario).
- **Regla_Validacion**: Una condición de validación aplicable a un Campo_Formulario (`required`, `email`, `minLength`, `matches`).
- **Panel_Dashboard**: Cualquiera de las páginas `Usuario/page.tsx`, `Entrenador/page.tsx`, `Admin/page.tsx` (y listados relacionados) que hoy leen datos de `localStorage` de forma síncrona.
- **Fuente_Datos_Asincrona**: Una función `fetcher` que retorna una `Promise`, hoy envolviendo `localStorage` y en el futuro consultas a Supabase.
- **Estado_Carga**: Uno de `idle`, `loading`, `success`, `error`, que describe el progreso de una Fuente_Datos_Asincrona consumida por un Panel_Dashboard.
- **Componente_Imagen_Rellenante**: Cualquier uso de `next/image` (directo o vía `ImagenEditable`) con la prop `fill` activa.

## Requirements

### Requirement 1: Fuente única de verdad de tokens de diseño

**User Story:** Como equipo de desarrollo, quiero una única fuente de verdad de colores, tipografía y espaciado, para no tener que mantener los mismos valores duplicados en 9+ archivos `.module.css` y en `admin-theme.css`.

#### Acceptance Criteria

1. THE Sistema SHALL definir todos los Token_Diseño de color, tipografía y espaciado en un único archivo (`app/styles/tokens.css`) importado desde `app/globals.css`.
2. THE Sistema SHALL declarar, para cada Alias_Legacy usado hoy por el Tema_Moderno (`--gold`, `--gold-light`, `--red`, `--cream`) y por el Tema_Admin (`--ca-oro`, `--ca-oro-suave`, `--ca-rojo`, `--ca-rojo-oscuro`, `--ca-negro`, `--ca-negro-alt`, `--ca-verde`, `--ca-crema`, `--ca-texto-muted`, `--ca-borde`), una referencia hacia el Token_Diseño canónico correspondiente, de forma que ambos resuelvan al mismo valor computado.
3. THE Sistema SHALL cargar las familias tipográficas Playfair Display, Oswald, Anton y Bungee mediante `next/font/google` desde un único módulo compartido, en lugar de reimportarlas por página.
4. WHERE `admin-theme.css` declara `font-family: 'Anton'` o `'Barlow'` como cadena de texto suelta, THE Sistema SHALL sustituir esa declaración por la variable CSS expuesta por `next/font/google` para esa familia tipográfica.
5. IF un Token_Diseño canónico cambia de valor, THEN THE Sistema SHALL reflejar ese cambio en todo Alias_Legacy asociado sin requerir modificar ningún `.module.css` individual.
6. THE Sistema SHALL mantener el aspecto visual (colores, tipografía) de cada página existente sin cambios perceptibles inmediatamente después de introducir `tokens.css`, antes de que se elimine la redefinición local de variables en cada módulo.

### Requirement 2: Migración incremental de módulos existentes a los tokens

**User Story:** Como equipo de desarrollo, quiero migrar los módulos `.module.css` existentes a los tokens centralizados sin un cambio disruptivo, para reducir el riesgo de romper el look actual del sitio.

#### Acceptance Criteria

1. THE Sistema SHALL permitir que los módulos `.module.css` que hoy redefinen `--gold`/`--red`/`--cream` (Header, Footer, CTA, Inicio, Funcionalidades, Secciones, Usuario, Entrenador, login, registro, blog) sigan funcionando sin modificación inmediatamente después de introducir `tokens.css`.
2. WHEN un módulo `.module.css` legacy se actualiza como parte de la limpieza posterior, THE Sistema SHALL eliminar su bloque de redefinición local de variables y depender únicamente de los Token_Diseño globales.
3. THE Sistema SHALL aplicar la misma estrategia de migración a `admin-theme.css`, sustituyendo sus variables `--ca-*` locales por referencias a los Token_Diseño globales.
4. THE Sistema SHALL documentar (en el propio código o en comentarios) qué Alias_Legacy corresponde a qué Token_Diseño canónico, para guiar la limpieza incremental de cada módulo.

### Requirement 3: Layout de dashboard compartido por rol

**User Story:** Como equipo de desarrollo, quiero un componente de layout de dashboard compartido y parametrizable por rol, para eliminar la duplicación casi idéntica entre `Usuario.module.css` y `Entrenador.module.css`.

#### Acceptance Criteria

1. THE Sistema SHALL proveer un componente DashboardLayout que acepte como parámetros el Rol requerido, la lista de ítems de navegación, y el ancho del sidebar.
2. WHEN DashboardLayout se renderiza para un Rol dado, THE Sistema SHALL restringir el acceso al contenido exactamente igual que lo hacía `RequireRole` antes de introducir DashboardLayout (ni más permisivo ni más restrictivo).
3. THE Sistema SHALL renderizar, dentro de DashboardLayout, el bloque de usuario (avatar y nombre) y el botón de cerrar sesión usando la misma lógica de sesión (`obtenerSesion`, `cerrarSesion`) que usan hoy `Usuario/layout.tsx` y `Entrenador/layout.tsx`.
4. WHEN la ruta activa coincide con el `href` de un ítem de navegación, THE Sistema SHALL marcar exactamente ese ítem como activo.
5. IF ningún ítem de navegación coincide con la ruta activa, THEN THE Sistema SHALL no marcar ningún ítem como activo.
6. THE Sistema SHALL permitir que `Entrenador/layout.tsx` incorpore su navegación secundaria de tabs horizontales a través de un punto de extensión de DashboardLayout, sin necesidad de que DashboardLayout conozca los detalles de esas tabs.
7. WHEN `Usuario/layout.tsx` y `Entrenador/layout.tsx` se migran a usar DashboardLayout, THE Sistema SHALL eliminar la definición duplicada de clases `.sidebar`, `.navItem`, `.logoutBtn` de ambos módulos CSS.

### Requirement 4: Asociación correcta de labels e inputs en formularios de autenticación

**User Story:** Como usuario que depende de un lector de pantalla o de la navegación por teclado, quiero que cada etiqueta de un campo de formulario esté asociada programáticamente a su control, para poder identificar y activar cada campo correctamente.

#### Acceptance Criteria

1. THE Sistema SHALL asignar a todo Campo_Formulario en login, registro (alumno, entrenador, admin) y forgot-password un `id` único, y a su `<label>` correspondiente un atributo `htmlFor` con ese mismo `id`.
2. THE Sistema SHALL aplicar la asociación `htmlFor`/`id` al checkbox "Recordarme" del formulario de login, que hoy carece de dicha asociación.
3. WHERE un Campo_Formulario tiene un Error_Campo visible, THE Sistema SHALL enlazar dicho mensaje mediante `aria-describedby` en el control de entrada correspondiente.
4. THE Sistema SHALL preservar el comportamiento funcional existente de cada Formulario_Autenticacion (envío, redirección, autocompletado de cuentas demo) al introducir la asociación `htmlFor`/`id`.

### Requirement 5: Validación de formato y mensajes de error por campo

**User Story:** Como usuario llenando un formulario de autenticación o registro, quiero ver un mensaje de error específico junto al campo que tiene un problema, para poder corregirlo sin adivinar cuál de todos los campos falló.

#### Acceptance Criteria

1. THE Sistema SHALL proveer un mecanismo reutilizable de Regla_Validacion (`required`, `email`, `minLength`, `matches`) aplicable a cualquier Campo_Formulario.
2. WHEN el valor de un Campo_Formulario de tipo correo electrónico no cumple el formato de email válido, THE Sistema SHALL mostrar un Error_Campo específico junto a ese campo.
3. WHEN un Campo_Formulario marcado como obligatorio queda vacío al validar, THE Sistema SHALL mostrar un Error_Campo específico junto a ese campo.
4. WHEN el campo de confirmación de contraseña no coincide con el campo de contraseña, THE Sistema SHALL mostrar un Error_Campo específico junto al campo de confirmación.
5. WHILE un Campo_Formulario no ha sido interactuado (no ha recibido blur ni se ha intentado el envío), THE Sistema SHALL no mostrar su Error_Campo, incluso si el valor actual no es válido.
6. WHEN el usuario envía un Formulario_Autenticacion, THE Sistema SHALL validar todos los Campo_Formulario del formulario y mostrar el Error_Campo de cada uno que falle su validación.
7. IF todos los Campo_Formulario de un Formulario_Autenticacion pasan su validación al enviar, THEN THE Sistema SHALL proceder con la operación de negocio (autenticar, registrar, o enviar enlace de recuperación) exactamente como lo hace hoy.
8. IF la operación de negocio (autenticar, registrar) falla por una razón que no es de formato (credenciales incorrectas, correo duplicado), THEN THE Sistema SHALL mostrar un mensaje de error a nivel de formulario, distinto de los Error_Campo por campo.
9. THE Sistema SHALL aplicar este mecanismo de validación a login, registro (alumno, entrenador, admin) y forgot-password.

### Requirement 6: Estados de carga y error para datos asíncronos en dashboards

**User Story:** Como usuario de un Panel_Dashboard, quiero ver una indicación de carga y un mensaje claro si algo falla, para saber que la página está funcionando mientras espera o cuando algo salió mal, en vez de ver una pantalla vacía o rota.

#### Acceptance Criteria

1. THE Sistema SHALL proveer un mecanismo reutilizable (`useAsyncData` o equivalente) que exponga un Estado_Carga (`idle`, `loading`, `success`, `error`) a partir de una Fuente_Datos_Asincrona.
2. WHEN un Panel_Dashboard invoca su Fuente_Datos_Asincrona, THE Sistema SHALL transicionar su Estado_Carga a `loading` antes de que la promesa se resuelva.
3. WHILE el Estado_Carga de un Panel_Dashboard es `loading`, THE Sistema SHALL mostrar una representación de esqueleto de carga en lugar del contenido final o de una pantalla vacía.
4. WHEN la Fuente_Datos_Asincrona resuelve exitosamente, THE Sistema SHALL transicionar el Estado_Carga a `success` y mostrar el contenido real del Panel_Dashboard.
5. WHEN la Fuente_Datos_Asincrona es rechazada, THE Sistema SHALL transicionar el Estado_Carga a `error` y mostrar un mensaje de error legible junto con una opción de reintentar.
6. WHEN el usuario activa la opción de reintentar tras un `error`, THE Sistema SHALL volver a invocar la Fuente_Datos_Asincrona y transicionar el Estado_Carga a `loading`.
7. THE Sistema SHALL diseñar la interfaz de la Fuente_Datos_Asincrona de forma que hoy pueda envolver una lectura síncrona de `localStorage` (en `Usuario/page.tsx`, `Entrenador/page.tsx`, `Admin/page.tsx`) y en el futuro pueda sustituirse por una consulta a Supabase sin cambiar la interfaz del Panel_Dashboard.
8. IF el componente que usa el mecanismo de Estado_Carga se desmonta antes de que la Fuente_Datos_Asincrona resuelva, THEN THE Sistema SHALL no actualizar estado sobre un componente desmontado.

### Requirement 7: Imágenes con `fill` siempre declaran `sizes`

**User Story:** Como equipo de desarrollo, quiero que ninguna imagen que use la prop `fill` de `next/image` quede sin `sizes`, para evitar que el navegador descargue imágenes a mayor resolución de la necesaria.

#### Acceptance Criteria

1. WHEN un Componente_Imagen_Rellenante se renderiza sin que su llamador provea la prop `sizes`, THE Sistema SHALL aplicar un valor de `sizes` por defecto en lugar de omitirlo.
2. THE Sistema SHALL emitir una advertencia en entorno de desarrollo cuando `ImagenEditable` se use con `fill` activo y sin `sizes` provisto por el llamador.
3. THE Sistema SHALL corregir los usos existentes de `next/image` con `fill` que hoy carecen de `sizes` en `app/blog/page.tsx` (tarjetas de logros y posts de comunidad), `app/components/MisArticulos/MisArticulos.tsx` y `app/Admin/Articulos/page.tsx`.
4. THE Sistema SHALL preservar el comportamiento visual actual (proporciones, recorte) de cada imagen corregida al añadir `sizes`.
