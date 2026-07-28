# Implementation Plan: Supabase Auth Integration

## Overview

Este plan reemplaza `authStorage.ts`/`sesionStorage.ts` por autenticación real contra Supabase Auth de forma incremental: primero la infraestructura de sesión (`middleware.ts`, `SessionProvider`/`useSesion()`, `rutaDestino`, `authService`, `fotoPerfil`), luego los componentes consumidores base (`RequireRole`, `DashboardLayout`, `Header`, `ImagenEditable`), después las páginas de autenticación (`login`, `registro/*`, `forgot-password`, `reset-password`, `Admin/esperando-aprobacion`), luego la migración de cada almacén (`alumnoStorage`, `entrenadorStorage` + RPC de sincronización, `blogStorage`, `peleasProximasStorage`) junto con las páginas que los consumen, y cierra con `Admin/Directorio` conectado a datos reales, el endpoint de eliminación de cuentas con `service_role`, y el script de siembra.

Las 21 Correctness Properties del diseño se implementan como sub-tareas de prueba individuales (`fast-check`, mínimo 100 iteraciones), ubicadas junto a la implementación que validan. El proyecto ya tiene `vitest`, `fast-check`, `@testing-library/react` y `jsdom` configurados (spec `design-system-unification`), así que no se requiere infraestructura de pruebas nueva.

**Nota de alcance heredada del diseño**: este spec no introduce tablas nuevas. El único objeto de base de datos nuevo es la función RPC `sincronizar_perfil_entrenador`, agregada en una migración SQL nueva (`00000000000002_sincronizar_perfil_entrenador.sql`). El resto del esquema (`accounts`, `perfiles_deportivos`, `perfiles_publicos_entrenador` + hijas, `publicaciones`, `peleas_proximas`, bucket `avatars`) ya existe en la base remota.

## Tasks

- [x] 1. Middleware de refresco de sesión
  - Crear `middleware.ts` en la raíz del proyecto usando `createServerClient` de `@supabase/ssr`, propagando cookies actualizadas a la petición y a la respuesta, con `matcher` que excluye `_next/static`, `_next/image`, `favicon.ico` y archivos de imagen
  - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 1.1 Escribir prueba de integración del middleware (1-3 ejemplos): con cookie de sesión válida refresca y propaga cookies; sin cookie continúa sin bloquear; una ruta excluida por el `matcher` no invoca `getUser()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Crear la capa de sesión: `rutaDestino`, `SessionProvider` y `useSesion()`
  - [x] 2.1 Crear `app/lib/auth/rutaDestino.ts` con la función pura `rutaDestino(rol, estadoCuenta)` según la tabla de decisión del diseño
    - _Requirements: 4.3, 4.4, 4.5_
  - [ ]* 2.2 Escribir prueba de propiedad para `rutaDestino`
    - **Property 4: Redirección determinista tras registro exitoso** (aplicada también como base de Property 12)
    - **Validates: Requirements 3.3**
  - [x] 2.3 Crear `app/lib/auth/SessionProvider.tsx` con los tipos `Rol`, `CuentaSesion`, `EstadoSesion`, el contexto, `resolverCuenta()`, la suscripción a `onAuthStateChange`, la resolución inicial con `getSession()`, y `cerrarSesion()` con cola de solicitudes pendientes de montaje
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [x] 2.4 Exportar el hook `useSesion()` desde `SessionProvider.tsx` y montar `<SessionProvider>` en `app/layout.tsx` (root) envolviendo a `children`
    - _Requirements: 2.3_
  - [ ]* 2.5 Escribir prueba de propiedad para transición de estado según eventos de autenticación
    - **Property 1: Transición de estado del Proveedor_Sesion según eventos de autenticación**
    - **Validates: Requirements 2.1**
  - [ ]* 2.6 Escribir prueba de propiedad para `signOut` desde cualquier estado previo
    - **Property 2: `signOut` siempre deja la sesión en `sin_sesion`**
    - **Validates: Requirements 2.4**
  - [ ]* 2.7 Escribir prueba unitaria: cerrar sesión antes de montar se encola y se ejecuta al montar; consulta a `accounts` sin filas resulta en `sin_sesion`
    - _Requirements: 2.5, 2.6_

- [ ] 3. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Crear `authService.ts` y `fotoPerfil.ts`
  - [x] 4.1 Crear `app/lib/auth/authService.ts` con `registrarCuenta` (`signUp` + metadata `nombre`/`rol`), `iniciarSesion` (`signInWithPassword`), `solicitarRecuperacion` (`resetPasswordForEmail` con `redirectTo` a `/reset-password`) y `actualizarContrasena` (`updateUser`)
    - _Requirements: 3.1, 3.2, 4.1, 6.1, 6.4_
  - [ ]* 4.2 Escribir prueba de propiedad para metadata de rol en `signUp`
    - **Property 3: Metadata de rol en `signUp`**
    - **Validates: Requirements 3.1, 3.2**
  - [x] 4.3 Crear `app/lib/auth/fotoPerfil.ts` con `subirFotoPerfil(cuentaId, archivo)` (ruta `${cuentaId}/<uuid>.<ext>`, `upload` con `upsert`, actualización de `foto_ref`) y `resolverUrlFoto(fotoRef)` (retorna `null` si `fotoRef` es nulo, o la URL pública en otro caso)
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  - [ ]* 4.4 Escribir prueba de propiedad para el prefijo de ruta de subida
    - **Property 18: Prefijo de ruta de subida de foto de perfil**
    - **Validates: Requirements 13.1**
  - [ ]* 4.5 Escribir prueba de propiedad para ausencia de base64 en `foto_ref` y resolución de URL
    - **Property 19: `foto_ref` nunca contiene una cadena base64**
    - **Validates: Requirements 13.2, 13.3**
  - [ ]* 4.6 Escribir prueba de propiedad para el respaldo visual sin `foto_ref`
    - **Property 20: Respaldo visual consistente sin `foto_ref`**
    - **Validates: Requirements 13.4**

- [x] 5. Actualizar componentes consumidores base
  - [x] 5.1 Reescribir `app/components/RequireRole/RequireRole.tsx` para usar `useSesion()` en lugar de `sesionStorage.obtenerSesion()`: estado de verificación mientras `cargando`, redirección a `/login` si `sin_sesion`, redirección vía `rutaDestino()` si el rol no coincide o es admin pendiente, y renderizado del contenido en el resto de los casos
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 15.1_
  - [ ]* 5.2 Escribir prueba de propiedad para el comportamiento determinista de la Guarda_Rol
    - **Property 12: Comportamiento determinista de la Guarda_Rol según (rol requerido, estado de sesión)**
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.7, 5.1, 5.2, 5.4, 7.1, 7.2, 7.3, 7.4**
  - [x] 5.3 Actualizar `app/components/DashboardLayout/DashboardLayout.tsx` para obtener nombre y foto (vía `resolverUrlFoto`) y ejecutar `cerrarSesion()` a través de `useSesion()` en lugar de `sesionStorage`
    - _Requirements: 15.2_
  - [x] 5.4 Actualizar `app/components/Header/Header.tsx` para mostrar estado de sesión (iniciar/cerrar sesión, nombre) a través de `useSesion()` en lugar de `haySesion()`/`obtenerSesion()`/`cerrarSesion()`
    - _Requirements: 15.3_
  - [x] 5.5 Actualizar `app/components/ImagenEditable/ImagenEditable.tsx` para determinar administrador comparando `sesion.estado === "con_sesion" && sesion.cuenta.rol === "admin"` en lugar de `esAdmin()`
    - _Requirements: 15.4_
  - [ ]* 5.6 Escribir pruebas unitarias para `DashboardLayout`, `Header` e `ImagenEditable` con `useSesion()` mockeado (con/sin sesión, admin/no admin)
    - _Requirements: 15.2, 15.3, 15.4_

- [ ] 6. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Migrar el flujo de login y registro a Supabase Auth
  - [-] 7.1 Reescribir `app/login/page.tsx` para usar `authService.iniciarSesion` + `rutaDestino`, redirigiendo de inmediato sin mostrar el formulario si `useSesion()` ya expone `con_sesion`, y mostrando el mensaje único de "correo o contraseña incorrectos" en error de credenciales
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_
  - [-] 7.2 Reescribir `app/registro/alumno/page.tsx` para usar `authService.registrarCuenta` (rol `usuario`), crear el registro en `perfiles_deportivos` tras el `signUp` exitoso, iniciar sesión automáticamente y redirigir vía `rutaDestino`
    - _Requirements: 3.1, 3.3, 3.5, 3.6_
  - [-] 7.3 Reescribir `app/registro/entrenador/page.tsx` para usar `authService.registrarCuenta` (rol `entrenador`), crear el registro en `perfiles_publicos_entrenador` tras el `signUp` exitoso, iniciar sesión automáticamente y redirigir vía `rutaDestino`
    - _Requirements: 3.1, 3.3, 3.5, 3.7_
  - [ ] 7.4 Reescribir `app/registro/admin/page.tsx` para usar `authService.registrarCuenta` (rol `admin`), mostrando una confirmación de solicitud enviada sin redirigir a ningún panel protegido
    - _Requirements: 3.2, 3.4, 3.5_
  - [ ]* 7.5 Escribir prueba de propiedad para creación coherente de `perfiles_deportivos` al registrar un alumno
    - **Property 5: Creación coherente de `perfiles_deportivos` al registrar un alumno**
    - **Validates: Requirements 3.6**
  - [ ]* 7.6 Escribir pruebas de integración para login y los tres formularios de registro (correo duplicado muestra el mensaje esperado; admin no redirige a panel protegido)
    - _Requirements: 3.4, 3.5, 4.2_

- [ ] 8. Implementar recuperación de contraseña
  - [ ] 8.1 Reescribir `app/forgot-password/page.tsx` para usar `authService.solicitarRecuperacion`, mostrando siempre el mismo mensaje de confirmación sin importar si el correo existe
    - _Requirements: 6.1, 6.2_
  - [ ] 8.2 Crear `app/reset-password/page.tsx` (nuevo) que detecte la sesión de recuperación tras el redirect de Supabase, muestre error con enlace a `/forgot-password` si es inválida/expiró, y permita capturar/confirmar una nueva contraseña llamando `authService.actualizarContrasena` con redirección a `/login` al terminar
    - _Requirements: 6.3, 6.4, 6.5, 6.6_
  - [ ]* 8.3 Escribir prueba de propiedad para el invariante del mensaje de recuperación
    - **Property 10: Invariante del mensaje de recuperación de contraseña**
    - **Validates: Requirements 6.2**
  - [ ]* 8.4 Escribir prueba de propiedad para la validación de longitud mínima de la nueva contraseña
    - **Property 11: Validación de longitud mínima de nueva contraseña**
    - **Validates: Requirements 6.6**

- [ ] 9. Implementar la pantalla de espera para administradores pendientes
  - [ ] 9.1 Crear `app/Admin/esperando-aprobacion/page.tsx` (nuevo) mostrando el estado de revisión y una acción para cerrar sesión vía `useSesion().cerrarSesion()`
    - _Requirements: 5.3_
  - [ ]* 9.2 Escribir prueba unitaria: la Pantalla_Espera_Aprobacion invoca `cerrarSesion()` al activar su acción de logout
    - _Requirements: 5.3_

- [ ] 10. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Migrar `alumnoStorage.ts` a Supabase
  - [ ] 11.1 Reescribir `app/lib/alumnoStorage.ts` sobre `perfiles_deportivos` usando `cuentaId` (UUID): `obtenerAlumnoPorCuentaId`, `actualizarEntrenadorAlumno` (con `limpiarCamposEntrenador` respetando el `CHECK` compuesto) y `actualizarPerfilAlumno` (upsert por `cuenta_id`), propagando el error sin persistir estado parcial si falla
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 11.2 Escribir prueba de propiedad para coherencia de campos de entrenador tras actualización
    - **Property 6: Coherencia de campos de entrenador tras actualización**
    - **Validates: Requirements 8.2**
  - [ ]* 11.3 Escribir prueba de propiedad para el round-trip de actualización de perfil de alumno
    - **Property 7: Round-trip de actualización de perfil de alumno**
    - **Validates: Requirements 8.3, 8.4**
  - [ ]* 11.4 Escribir prueba unitaria: creación de un nuevo `perfiles_deportivos` cuando el alumno autenticado no tiene registro previo, y propagación del error sin persistencia parcial ante fallo simulado
    - _Requirements: 8.4, 8.5_

- [ ] 12. Migrar `entrenadorStorage.ts` a Supabase y crear la RPC de sincronización
  - [ ] 12.1 Crear la migración `supabase/migrations/00000000000002_sincronizar_perfil_entrenador.sql` con la función `sincronizar_perfil_entrenador(p_perfil_id, p_logros, p_redes, p_galeria)` (`SECURITY INVOKER`, `delete + insert` transaccional de las tres tablas hijas)
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  - [ ] 12.2 Reescribir `app/lib/entrenadorStorage.ts` sobre `perfiles_publicos_entrenador` usando `cuentaId` (UUID), incluyendo la función pública para listar entrenadores (consultando la tabla y sus hijas directamente desde Supabase) y la función para poblar el selector de entrenador del directorio
    - _Requirements: 9.1, 9.6, 9.7_
  - [ ] 12.3 Conectar el guardado de logros/redes/galería de `entrenadorStorage.ts` a la RPC `sincronizar_perfil_entrenador`, invocándola vía `supabase.rpc(...)`
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  - [ ]* 12.4 Escribir prueba de propiedad para la sincronización exacta de colecciones hijas de entrenador
    - **Property 8: Sincronización exacta de colecciones hijas de entrenador**
    - **Validates: Requirements 9.2, 9.3, 9.4**
  - [ ]* 12.5 Escribir prueba de propiedad para la atomicidad de la sincronización de perfil de entrenador
    - **Property 9: Atomicidad de la sincronización de perfil de entrenador**
    - **Validates: Requirements 9.5**

- [ ] 13. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Migrar `blogStorage.ts` a Supabase
  - [ ] 14.1 Reescribir `app/lib/blogStorage.ts` sobre `publicaciones` recibiendo `cuentaId`/`rol` como parámetros (no leyendo sesión internamente): `obtenerArticulosAprobados`, `obtenerLogrosAprobados`, `obtenerArticulosPendientes`, `obtenerMisArticulos`, `enviarArticulo` (`autor_id = cuentaId`), `aprobarArticulo`/`rechazarArticulo` (actualizan `estado_publicacion`/`motivo_rechazo`) y `eliminarArticulo`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  - [ ]* 14.2 Escribir prueba de propiedad para el mapeo de `autor_id` al crear una publicación
    - **Property 13: Mapeo de `autor_id` al crear una publicación**
    - **Validates: Requirements 10.1**
  - [ ]* 14.3 Escribir prueba de propiedad para el filtrado correcto de publicaciones por estado y tipo
    - **Property 14: Filtrado correcto de publicaciones por estado y tipo**
    - **Validates: Requirements 10.2, 10.3, 10.4**
  - [ ]* 14.4 Escribir prueba de propiedad para la coherencia de moderación (estado y motivo)
    - **Property 15: Moderación actualiza estado y motivo de forma coherente**
    - **Validates: Requirements 10.5**
  - [ ]* 14.5 Escribir prueba unitaria: eliminación de una publicación delega en las políticas RLS existentes (verificar que la llamada de eliminación se ejecuta contra Supabase sin lógica de permiso adicional en el cliente)
    - _Requirements: 10.6_

- [ ] 15. Extraer y migrar `peleasProximasStorage.ts`
  - [ ] 15.1 Crear `app/lib/peleasProximasStorage.ts` extrayendo la lógica de `PeleaProxima` de `sesionStorage.ts`, leyendo/escribiendo `peleas_proximas` con `usuario_id`/`contrincante_id` como UUID, filtrando por el `cuentaId` de la Sesion_Activa
    - _Requirements: 11.1, 11.2_
  - [ ] 15.2 Eliminar la porción de `PeleaProxima` de `app/lib/sesionStorage.ts` (o el archivo completo si queda vacío tras esta y las migraciones anteriores)
    - _Requirements: 11.1_
  - [ ]* 15.3 Escribir prueba unitaria: consulta de peleas próximas filtra exclusivamente por el `cuentaId` provisto
    - _Requirements: 11.2_

- [ ] 16. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Conectar páginas de `Usuario` y `Entrenador` a los almacenes migrados
  - [ ] 17.1 Actualizar `app/Usuario/page.tsx` para obtener `cuentaId` de `useSesion()` y usarlo con `alumnoStorage`/`peleasProximasStorage` migrados
    - _Requirements: 15.5_
  - [ ] 17.2 Actualizar `app/Usuario/Perfil/page.tsx` para usar `cuentaId` de `useSesion()` con `alumnoStorage` (incluyendo subida de foto vía `fotoPerfil.ts`)
    - _Requirements: 15.5, 13.1, 13.2, 13.3_
  - [ ] 17.3 Actualizar `app/Usuario/contrincante/page.tsx` para usar `cuentaId` de `useSesion()` con `peleasProximasStorage`
    - _Requirements: 15.5_
  - [ ] 17.4 Actualizar `app/Entrenador/page.tsx` para usar `cuentaId` de `useSesion()` con `entrenadorStorage`
    - _Requirements: 15.6_
  - [ ]* 17.5 Escribir pruebas de integración: `Usuario/page.tsx` y `Entrenador/page.tsx` renderizan datos obtenidos de los almacenes migrados usando el `cuentaId` de una sesión mockeada
    - _Requirements: 15.5, 15.6_

- [ ] 18. Conectar páginas de blog a `blogStorage` migrado
  - [ ] 18.1 Actualizar `app/blog/escribir/page.tsx` para usar `cuentaId` de `useSesion()` con `enviarArticulo` del `blogStorage` migrado
    - _Requirements: 15.7_
  - [ ] 18.2 Actualizar `app/components/MisArticulos/MisArticulos.tsx` para usar `cuentaId` de `useSesion()` con `obtenerMisArticulos`/`eliminarArticulo` del `blogStorage` migrado
    - _Requirements: 15.7_
  - [ ] 18.3 Actualizar `app/Admin/Articulos/page.tsx` para usar `obtenerArticulosPendientes`/`aprobarArticulo`/`rechazarArticulo` del `blogStorage` migrado
    - _Requirements: 15.7_
  - [ ]* 18.4 Escribir pruebas de integración: envío de artículo desde `blog/escribir`, listado en `MisArticulos`, y ciclo de aprobación/rechazo desde `Admin/Articulos`, todo contra el `blogStorage` migrado con cliente Supabase mockeado
    - _Requirements: 15.7_

- [ ] 19. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Conectar `Admin/Directorio` a datos reales
  - [ ] 20.1 Reescribir `app/Admin/Directorio/page.tsx` reemplazando los arrays hardcodeados por las consultas a `accounts` unida con `perfiles_deportivos` (rol `usuario`) y `perfiles_publicos_entrenador` (rol `entrenador`) descritas en el diseño
    - _Requirements: 12.1, 12.2_
  - [ ]* 20.2 Escribir prueba de propiedad para el filtrado por rol en el listado del Directorio
    - **Property 16: Filtrado por rol en el listado del Directorio de administración**
    - **Validates: Requirements 12.1, 12.2**

- [ ] 21. Implementar el endpoint de eliminación de cuentas con `service_role`
  - [ ] 21.1 Crear `app/lib/supabase/admin.ts` con `crearClienteSupabaseAdmin()` usando `SUPABASE_SERVICE_ROLE_KEY` (sin prefijo `NEXT_PUBLIC_`), importable únicamente desde contexto server-side
    - _Requirements: 12.7_
  - [ ] 21.2 Crear `app/api/admin/cuentas/[id]/route.ts` con el handler `DELETE`: verifica sesión y rol/estado del solicitante vía el cliente server (`crearClienteSupabaseServidor`), responde `401` sin sesión y `403` si no es admin aprobado, y solo entonces invoca `crearClienteSupabaseAdmin().auth.admin.deleteUser(id)`
    - _Requirements: 12.3, 12.4, 12.5, 12.6, 12.7_
  - [ ] 21.3 Conectar el botón de eliminación de `app/Admin/Directorio/page.tsx` para invocar `fetch("/api/admin/cuentas/${id}", { method: "DELETE" })` tras la confirmación
    - _Requirements: 12.3_
  - [ ]* 21.4 Escribir prueba de propiedad para la autorización binaria del Endpoint_Eliminacion_Cuenta
    - **Property 17: Autorización binaria del Endpoint_Eliminacion_Cuenta**
    - **Validates: Requirements 12.4, 12.5**
  - [ ]* 21.5 Escribir prueba de integración: solicitud sin sesión responde `401`; eliminación exitosa por admin aprobado invoca `deleteUser` exactamente una vez con el `id` correcto
    - _Requirements: 12.6_

- [ ] 22. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Crear el script de siembra de cuentas de prueba
  - [ ] 23.1 Crear `scripts/seed-cuentas-prueba.ts` que, usando `crearClienteSupabaseAdmin()`, cree las 15 cuentas de prueba (5 admin, 5 entrenador, 5 alumno) con `auth.admin.createUser` incluyendo `nombre`/`rol` en la metadata, omitiendo sin abortar las que ya existan
    - _Requirements: 14.1, 14.2, 14.5_
  - [ ] 23.2 Extender el script para aprobar automáticamente la primera cuenta admin (`estado_cuenta = 'aprobado'`) y crear los registros representativos en `perfiles_deportivos`/`perfiles_publicos_entrenador` para las cuentas de alumno/entrenador, replicando los datos hoy hardcodeados en `alumnoStorage.ts`/`entrenadorStorage.ts`
    - _Requirements: 14.3, 14.4_
  - [ ]* 23.3 Escribir prueba de propiedad para la continuidad de la siembra ante correos duplicados
    - **Property 21: Continuidad de la siembra ante correos duplicados**
    - **Validates: Requirements 14.5**
  - [ ]* 23.4 Escribir prueba de integración: ejecutar el script contra Supabase local y verificar que las 15 cuentas quedan creadas con sus perfiles asociados
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 24. Checkpoint final - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son de prueba (unitaria, integración o propiedad con `fast-check`) y son opcionales: pueden omitirse para un MVP más rápido, pero se recomienda no omitir las de las tareas 5.2, 11.2/11.3, 12.4/12.5, 14.3, 20.2 y 21.4 por cubrir las reglas de autorización y consistencia de datos más sensibles.
- Cada prueba de propiedad debe configurarse con mínimo 100 iteraciones y etiquetarse **Feature: supabase-auth-integration, Property {n}: {texto de la propiedad}**.
- Las pruebas de propiedad usan un cliente Supabase mockeado en memoria por defecto; las que involucran la RPC `sincronizar_perfil_entrenador` (Property 8, 9) o RLS del endpoint de eliminación (Property 17) requieren al menos una corrida adicional contra Supabase local/remoto.
- `SUPABASE_SERVICE_ROLE_KEY` debe añadirse a `.env.local` (no versionado); `app/lib/supabase/admin.ts` es el único punto de importación permitido para Route Handlers y `scripts/seed-cuentas-prueba.ts`.
- Este plan no incluye tareas de despliegue, siembra en producción, ni pruebas manuales de aceptación: cubre exclusivamente la implementación de código y sus pruebas automatizadas.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4"] },
    { "id": 4, "tasks": ["2.5", "2.6", "2.7"] },
    { "id": 5, "tasks": ["3"] },
    { "id": 6, "tasks": ["4.1", "4.3"] },
    { "id": 7, "tasks": ["4.2", "4.4", "4.5", "4.6"] },
    { "id": 8, "tasks": ["5.1", "5.3", "5.4", "5.5"] },
    { "id": 9, "tasks": ["5.2", "5.6"] },
    { "id": 10, "tasks": ["6"] },
    { "id": 11, "tasks": ["7.1", "7.2", "7.3", "7.4"] },
    { "id": 12, "tasks": ["7.5", "7.6"] },
    { "id": 13, "tasks": ["8.1", "8.2"] },
    { "id": 14, "tasks": ["8.3", "8.4"] },
    { "id": 15, "tasks": ["9.1"] },
    { "id": 16, "tasks": ["9.2"] },
    { "id": 17, "tasks": ["10"] },
    { "id": 18, "tasks": ["11.1"] },
    { "id": 19, "tasks": ["11.2", "11.3", "11.4"] },
    { "id": 20, "tasks": ["12.1"] },
    { "id": 21, "tasks": ["12.2"] },
    { "id": 22, "tasks": ["12.3"] },
    { "id": 23, "tasks": ["12.4", "12.5"] },
    { "id": 24, "tasks": ["13"] },
    { "id": 25, "tasks": ["14.1"] },
    { "id": 26, "tasks": ["14.2", "14.3", "14.4", "14.5"] },
    { "id": 27, "tasks": ["15.1"] },
    { "id": 28, "tasks": ["15.2", "15.3"] },
    { "id": 29, "tasks": ["16"] },
    { "id": 30, "tasks": ["17.1", "17.2", "17.3", "17.4"] },
    { "id": 31, "tasks": ["17.5", "18.1", "18.2", "18.3"] },
    { "id": 32, "tasks": ["18.4"] },
    { "id": 33, "tasks": ["19"] },
    { "id": 34, "tasks": ["20.1"] },
    { "id": 35, "tasks": ["20.2", "21.1"] },
    { "id": 36, "tasks": ["21.2"] },
    { "id": 37, "tasks": ["21.3"] },
    { "id": 38, "tasks": ["21.4", "21.5"] },
    { "id": 39, "tasks": ["22"] },
    { "id": 40, "tasks": ["23.1"] },
    { "id": 41, "tasks": ["23.2"] },
    { "id": 42, "tasks": ["23.3", "23.4"] },
    { "id": 43, "tasks": ["24"] }
  ]
}
```
