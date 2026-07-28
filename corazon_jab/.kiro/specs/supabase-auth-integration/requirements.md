# Requirements Document

## Introduction

Este spec reemplaza el sistema de autenticación de prototipo de `corazon_jab` (cuentas y sesión en `localStorage`, contraseñas en texto plano) por autenticación real contra Supabase Auth, aprovechando el esquema ya implementado en `.kiro/specs/supabase-database-schema/` (tabla `accounts`, trigger `handle_new_user`, funciones `es_admin_aprobado`/`rol_actual`, RPC `aprobar_cuenta_admin`, políticas RLS, tablas `perfiles_deportivos`, `perfiles_publicos_entrenador` + hijas, `publicaciones`, `peleas_proximas`, y el bucket de Storage `avatars`).

El trabajo incluye: middleware de refresco de sesión, una capa de sesión basada en React Context que expone el estado async de Supabase de forma síncrona a los componentes cliente existentes, el reemplazo completo de `authStorage.ts`/`sesionStorage.ts` por llamadas reales a Supabase Auth, la migración de `alumnoStorage`, `entrenadorStorage` (incluidas sus tablas hijas de logros/redes/galería), `blogStorage` y `PeleaProxima` de `usuarioId: number` a `cuentaId: string` (UUID) conectándose a las tablas Supabase ya existentes, la conexión de `Admin/Directorio` a cuentas reales, la migración de fotos de perfil a Supabase Storage, un script de siembra de las 15 cuentas de prueba como usuarios reales de Supabase Auth, un flujo completo de recuperación de contraseña (incluyendo la pantalla de nueva contraseña), una pantalla de espera para administradores pendientes de aprobación, y un endpoint server-side para eliminación de cuentas mediante `service_role`.

Este spec asume como firmes las siguientes decisiones de producto, ya confirmadas por el usuario y no sujetas a nueva discusión:

1. Alcance completo: autenticación real + migración de todos los almacenes dependientes de `usuarioId` numérico a `cuentaId` (UUID), sin mapeos temporales UUID↔número.
2. `Admin/Directorio` se conecta a cuentas reales de Supabase en este mismo trabajo.
3. Las 15 cuentas semilla se recrean como usuarios reales de Supabase Auth vía script con `service_role`.
4. El flujo de "olvidé mi contraseña" incluye la pantalla de callback donde el usuario define su nueva contraseña.
5. Un administrador con `estado_cuenta = 'pendiente'` puede iniciar sesión en Supabase Auth, pero ve una pantalla de espera y no accede al panel de Admin hasta ser aprobado.
6. `alumnoStorage`, `entrenadorStorage` (incluidas las tablas hijas `logros_entrenador`, `redes_sociales_entrenador`, `galeria_entrenador`), `blogStorage` (`publicaciones`) y `PeleaProxima` se conectan a las tablas Supabase ya existentes, no permanecen en `localStorage`.
7. La eliminación de cuentas reales desde `Admin/Directorio` se implementa mediante un Route Handler server-side que usa `service_role`, nunca expuesto al navegador.

## Glossary

- **Sistema_Auth**: El conjunto de código de la aplicación `corazon_jab` responsable de autenticación, sesión y autorización basado en Supabase Auth (clientes `@supabase/ssr`, middleware, `SessionProvider`, hooks y Route Handlers de este spec).
- **Middleware_Sesion**: El archivo `middleware.ts` de Next.js que refresca la sesión de Supabase en cada petición usando `@supabase/ssr`.
- **Proveedor_Sesion**: El componente `SessionProvider` (contexto de React) que expone de forma síncrona a los Client Components el estado de sesión obtenido de forma asíncrona desde Supabase Auth.
- **Cuenta_Supabase**: Un registro en la tabla `accounts`, vinculado 1:1 a un usuario de `auth.users`, con columnas `id` (UUID), `nombre`, `rol`, `foto_ref`, `estado_cuenta`, `aprobado_por`, `aprobado_en`.
- **Sesion_Activa**: El estado expuesto por el Proveedor_Sesion: nula (sin sesión), cargando, o con los datos de la Cuenta_Supabase autenticada (incluyendo `id`, `nombre`, `rol`, `estado_cuenta`, `foto_ref`).
- **Guarda_Rol**: El componente `RequireRole` que restringe el acceso a una ruta según el rol de la Sesion_Activa.
- **Pantalla_Espera_Aprobacion**: La pantalla que se muestra a un administrador autenticado cuya Cuenta_Supabase tiene `estado_cuenta = 'pendiente'`, informando que su acceso está en revisión.
- **Endpoint_Eliminacion_Cuenta**: El Route Handler server-side (`app/api/admin/cuentas/[id]/route.ts`) que elimina una Cuenta_Supabase (y su usuario de `auth.users`) usando la `service_role` key de Supabase.
- **Script_Siembra**: El script Node/TypeScript que crea las 15 cuentas de prueba como usuarios reales de Supabase Auth usando `service_role`, disparando `handle_new_user()` para poblar `accounts`.
- **Almacen_Alumno**: La capa de acceso a datos (antes `alumnoStorage.ts`) que ahora lee/escribe la tabla `perfiles_deportivos` de Supabase, identificando al alumno por `cuenta_id` (UUID).
- **Almacen_Entrenador**: La capa de acceso a datos (antes `entrenadorStorage.ts`) que ahora lee/escribe `perfiles_publicos_entrenador` y sus tablas hijas (`logros_entrenador`, `redes_sociales_entrenador`, `galeria_entrenador`) en Supabase, identificando al entrenador por `cuenta_id` (UUID).
- **Almacen_Blog**: La capa de acceso a datos (antes `blogStorage.ts`) que ahora lee/escribe la tabla `publicaciones` de Supabase, identificando al autor por `autor_id` (UUID).
- **Almacen_Peleas_Proximas**: La capa de acceso a datos (antes parte de `sesionStorage.ts`) que ahora lee/escribe la tabla `peleas_proximas` de Supabase.
- **Bucket_Avatars**: El bucket de Supabase Storage `avatars`, ya configurado con lectura pública y escritura restringida por prefijo `auth.uid()`.
- **Formulario_Nueva_Contrasena**: La pantalla de callback (`/reset-password`) a la que Supabase redirige tras `resetPasswordForEmail`, donde el usuario define una nueva contraseña.

## Requirements

### Requirement 1: Middleware de refresco de sesión

**User Story:** Como usuario autenticado, quiero que mi sesión se mantenga vigente mientras navego por la aplicación, para no ser desconectado inesperadamente.

#### Acceptance Criteria

1. THE Middleware_Sesion SHALL refrescar el token de sesión de Supabase en cada petición HTTP que coincida con su `matcher`, usando `createServerClient` de `@supabase/ssr`.
2. WHEN el Middleware_Sesion refresca la sesión, THE Middleware_Sesion SHALL propagar las cookies actualizadas tanto a la petición como a la respuesta.
3. THE Middleware_Sesion SHALL excluir del `matcher` las rutas de archivos estáticos (`_next/static`, `_next/image`, `favicon.ico`) y archivos con extensión de imagen, de modo que esas rutas continúen siempre sin pasar por la verificación de sesión, independientemente del estado de la sesión.
4. IF no existe una sesión de Supabase válida en las cookies de la petición, THEN THE Middleware_Sesion SHALL continuar la petición sin sesión, sin bloquear el acceso a rutas públicas.

### Requirement 2: Proveedor de sesión para componentes cliente

**User Story:** Como desarrollador, quiero un único punto de acceso a la sesión actual desde Client Components, para no duplicar lógica de obtención de sesión en cada componente.

#### Acceptance Criteria

1. THE Proveedor_Sesion SHALL suscribirse a los cambios de autenticación de Supabase mediante `onAuthStateChange` y actualizar la Sesion_Activa cuando ocurra un evento de inicio o cierre de sesión.
2. WHEN el Proveedor_Sesion se monta por primera vez, THE Proveedor_Sesion SHALL consultar la sesión actual de Supabase Auth y los datos de la Cuenta_Supabase correspondiente antes de exponer un valor distinto de "cargando".
3. THE Proveedor_Sesion SHALL exponer un hook `useSesion()` que retorna el estado de la Sesion_Activa (`cargando`, `sin_sesion`, o los datos de la Cuenta_Supabase) de forma síncrona a cualquier Client Component descendiente.
4. WHEN un usuario cierra sesión mediante el Proveedor_Sesion, THE Proveedor_Sesion SHALL invocar `signOut()` de Supabase Auth y actualizar la Sesion_Activa a `sin_sesion`.
5. IF se solicita cerrar sesión antes de que el Proveedor_Sesion termine de montarse, THEN THE Proveedor_Sesion SHALL encolar esa solicitud y ejecutarla en cuanto termine de montarse.
6. IF la consulta a la tabla `accounts` para el usuario autenticado no retorna ninguna fila, THEN THE Proveedor_Sesion SHALL exponer la Sesion_Activa como `sin_sesion`.

### Requirement 3: Registro de cuentas contra Supabase Auth

**User Story:** Como visitante, quiero crear una cuenta real de alumno, entrenador o administrador, para acceder a la plataforma con mis propias credenciales.

#### Acceptance Criteria

1. WHEN un visitante envía el formulario de registro de alumno o entrenador con datos válidos, THE Sistema_Auth SHALL invocar `signUp` de Supabase Auth incluyendo `rol` en la metadata del usuario (`usuario` o `entrenador` respectivamente).
2. WHEN un visitante envía el formulario de registro de administrador con datos válidos, THE Sistema_Auth SHALL invocar `signUp` de Supabase Auth incluyendo `rol: 'admin'` en la metadata del usuario.
3. WHEN `signUp` se completa exitosamente para un rol distinto de `admin`, THE Sistema_Auth SHALL iniciar sesión automáticamente y redirigir al panel correspondiente al rol.
4. WHEN `signUp` se completa exitosamente para el rol `admin`, THE Sistema_Auth SHALL mostrar una confirmación de solicitud enviada sin redirigir a ningún panel protegido.
5. IF `signUp` retorna un error porque el correo ya está registrado, THEN THE Sistema_Auth SHALL mostrar un mensaje indicando que ya existe una cuenta con ese correo.
6. WHEN un alumno completa su registro, THE Sistema_Auth SHALL crear un registro en `perfiles_deportivos` asociado al `cuenta_id` de la Cuenta_Supabase recién creada, con la relación de entrenador (`directorio`, `manual` o `independiente`) indicada en el formulario.
7. WHEN un entrenador completa su registro, THE Sistema_Auth SHALL crear un registro en `perfiles_publicos_entrenador` asociado al `cuenta_id` de la Cuenta_Supabase recién creada.

### Requirement 4: Inicio y cierre de sesión

**User Story:** Como usuario registrado, quiero iniciar y cerrar sesión con mis credenciales reales, para acceder de forma segura a mi panel correspondiente.

#### Acceptance Criteria

1. WHEN un usuario envía el formulario de login con correo y contraseña válidos, THE Sistema_Auth SHALL invocar `signInWithPassword` de Supabase Auth.
2. IF `signInWithPassword` retorna un error de credenciales inválidas, THEN THE Sistema_Auth SHALL mostrar un mensaje de correo o contraseña incorrectos, sin distinguir cuál de los dos campos falló.
3. WHEN el inicio de sesión es exitoso y la Cuenta_Supabase tiene `rol` distinto de `admin`, THE Sistema_Auth SHALL redirigir al panel correspondiente al rol de la Cuenta_Supabase.
4. WHEN el inicio de sesión es exitoso y la Cuenta_Supabase tiene `rol = 'admin'` y `estado_cuenta = 'aprobado'`, THE Sistema_Auth SHALL redirigir al panel de Admin.
5. WHEN el inicio de sesión es exitoso y la Cuenta_Supabase tiene `rol = 'admin'` y `estado_cuenta = 'pendiente'`, THE Sistema_Auth SHALL redirigir a la Pantalla_Espera_Aprobacion.
6. WHEN un usuario autenticado solicita cerrar sesión, THE Sistema_Auth SHALL invocar `signOut` de Supabase Auth y redirigir a una ruta pública.
7. WHEN un usuario con Sesion_Activa visita `/login`, THE Sistema_Auth SHALL redirigir automáticamente al panel correspondiente a su rol y estado de aprobación, sin mostrar el formulario de login.

### Requirement 5: Pantalla de espera para administradores pendientes

**User Story:** Como administrador que solicitó una cuenta, quiero saber que mi solicitud está en revisión al iniciar sesión, para entender por qué no puedo acceder al panel todavía.

#### Acceptance Criteria

1. WHILE la Sesion_Activa corresponde a una Cuenta_Supabase con `rol = 'admin'` y `estado_cuenta = 'pendiente'`, THE Guarda_Rol SHALL impedir el acceso a cualquier ruta bajo `/Admin` distinta de la Pantalla_Espera_Aprobacion.
2. WHEN un administrador con `estado_cuenta = 'pendiente'` visita una ruta bajo `/Admin`, THE Sistema_Auth SHALL redirigir a la Pantalla_Espera_Aprobacion.
3. THE Pantalla_Espera_Aprobacion SHALL ofrecer una acción para cerrar sesión.
4. WHEN un administrador aprobado ejecuta la RPC `aprobar_cuenta_admin` sobre una Cuenta_Supabase pendiente, THE Sistema_Auth SHALL permitir que esa cuenta acceda al panel de Admin en su siguiente verificación de sesión, sin requerir que cierre e inicie sesión de nuevo manualmente.

### Requirement 6: Recuperación de contraseña

**User Story:** Como usuario que olvidó su contraseña, quiero solicitar un enlace de recuperación y definir una nueva contraseña, para poder volver a acceder a mi cuenta.

#### Acceptance Criteria

1. WHEN un usuario envía el formulario de `/forgot-password` con un correo con formato válido, THE Sistema_Auth SHALL invocar `resetPasswordForEmail` de Supabase Auth con una URL de redirección hacia el Formulario_Nueva_Contrasena.
2. WHEN `resetPasswordForEmail` se completa (exitosa o silenciosamente, para no revelar si el correo existe), THE Sistema_Auth SHALL mostrar el mismo mensaje de confirmación de envío, independientemente de si el correo está registrado.
3. WHEN un usuario llega al Formulario_Nueva_Contrasena a través de un enlace de recuperación válido, THE Formulario_Nueva_Contrasena SHALL permitir capturar y confirmar una nueva contraseña.
4. WHEN el usuario envía una nueva contraseña válida desde el Formulario_Nueva_Contrasena, THE Sistema_Auth SHALL invocar `updateUser` de Supabase Auth con la nueva contraseña y redirigir al login con una confirmación.
5. IF el enlace de recuperación es inválido o expiró, THEN THE Formulario_Nueva_Contrasena SHALL mostrar un mensaje de enlace inválido y un enlace para solicitar uno nuevo.
6. IF la nueva contraseña no cumple la longitud mínima exigida por el formulario, THEN THE Formulario_Nueva_Contrasena SHALL rechazar el envío y mostrar el error de validación correspondiente.

### Requirement 7: Guarda de rutas por rol y estado de aprobación

**User Story:** Como sistema, quiero restringir el acceso a cada panel según el rol y estado de aprobación de la sesión, para que ningún usuario acceda a un panel que no le corresponde.

#### Acceptance Criteria

1. WHILE el Proveedor_Sesion está en estado "cargando", THE Guarda_Rol SHALL mostrar un estado de verificación sin renderizar el contenido protegido ni redirigir.
2. IF la Sesion_Activa es `sin_sesion` al terminar de cargar, THEN THE Guarda_Rol SHALL redirigir a `/login`.
3. IF la Sesion_Activa tiene un `rol` distinto al rol requerido por la ruta, THEN THE Guarda_Rol SHALL redirigir al panel correspondiente al rol de la Sesion_Activa (o a la Pantalla_Espera_Aprobacion si es un admin pendiente).
4. WHEN la Sesion_Activa cumple el rol requerido y (para administradores) tiene `estado_cuenta = 'aprobado'`, THE Guarda_Rol SHALL renderizar el contenido protegido.

### Requirement 8: Migración de perfil deportivo del alumno a Supabase

**User Story:** Como alumno, quiero que mis datos deportivos y de entrenador se guarden de forma persistente y ligados a mi cuenta real, para no perderlos al cambiar de dispositivo.

#### Acceptance Criteria

1. THE Almacen_Alumno SHALL leer y escribir el registro de `perfiles_deportivos` usando `cuenta_id` (UUID de la Sesion_Activa) en lugar de un `usuarioId` numérico.
2. WHEN un alumno actualiza su relación de entrenador (`directorio`, `manual` o `independiente`), THE Almacen_Alumno SHALL actualizar las columnas correspondientes de `perfiles_deportivos` (`origen_entrenador`, `entrenador_directorio_id`, `entrenador_manual_nombre`) respetando el `CHECK` compuesto ya definido en el esquema.
3. WHEN un alumno actualiza su perfil general (apodo, peso, nivel, objetivo, ciudad, fecha de nacimiento), THE Almacen_Alumno SHALL persistir esos campos en `perfiles_deportivos` mediante una operación de actualización sobre Supabase.
4. IF un alumno autenticado no tiene todavía un registro en `perfiles_deportivos`, THEN THE Almacen_Alumno SHALL crear uno nuevo asociado a su `cuenta_id` con los valores proporcionados y valores por defecto para el resto.
5. IF la creación o actualización de `perfiles_deportivos` falla por un error de red o de la base de datos, THEN THE Almacen_Alumno SHALL propagar el error sin persistir un estado parcial, dejando al alumno sin perfil o con el perfil previo hasta un nuevo intento.

### Requirement 9: Migración de perfil público de entrenador a Supabase

**User Story:** Como entrenador, quiero que mi perfil público (biografía, logros, redes sociales, galería) se guarde en la base de datos real, para que aparezca de forma consistente en el directorio público.

#### Acceptance Criteria

1. THE Almacen_Entrenador SHALL leer y escribir el registro de `perfiles_publicos_entrenador` usando `cuenta_id` (UUID de la Sesion_Activa) en lugar de un identificador `entrenador-<usuarioId>`.
2. WHEN un entrenador guarda cambios a sus logros, THE Almacen_Entrenador SHALL sincronizar las filas de la tabla `logros_entrenador` asociadas a su `perfil_entrenador_id`.
3. WHEN un entrenador guarda cambios a sus redes sociales, THE Almacen_Entrenador SHALL sincronizar las filas de la tabla `redes_sociales_entrenador` asociadas a su `perfil_entrenador_id`.
4. WHEN un entrenador guarda cambios a su galería de fotos, THE Almacen_Entrenador SHALL sincronizar las filas de la tabla `galeria_entrenador` asociadas a su `perfil_entrenador_id`.
5. IF la sincronización de logros, redes sociales o galería falla tras guardar cambios de perfil, THEN THE Almacen_Entrenador SHALL revertir la operación de guardado completa, de modo que ninguna de las tablas quede con datos parcialmente actualizados.
6. THE Almacen_Entrenador SHALL exponer una función para obtener la lista pública de entrenadores consultando `perfiles_publicos_entrenador` y sus tablas hijas directamente desde Supabase, sin depender de `localStorage`.
7. WHEN se muestra el selector de entrenador del directorio en el registro o edición de un alumno, THE Almacen_Entrenador SHALL poblar las opciones a partir de esa misma consulta a Supabase.

### Requirement 10: Migración de publicaciones (blog y logros) a Supabase

**User Story:** Como alumno o entrenador, quiero que mis artículos y logros enviados a revisión persistan en la base de datos real, para que el flujo de moderación de administradores sea consistente.

#### Acceptance Criteria

1. THE Almacen_Blog SHALL crear una fila en `publicaciones` con `autor_id` igual al `cuenta_id` de la Sesion_Activa al enviar un artículo o logro a revisión.
2. THE Almacen_Blog SHALL consultar `publicaciones` filtrando por `estado_publicacion = 'aprobado'` y `tipo = 'articulo'` para poblar el blog público.
3. THE Almacen_Blog SHALL consultar `publicaciones` filtrando por `estado_publicacion = 'aprobado'` y `tipo = 'logro'` para poblar los logros aprobados visibles públicamente y en el historial del alumno autor.
4. THE Almacen_Blog SHALL consultar `publicaciones` filtrando por `estado_publicacion = 'pendiente'` para poblar el panel de revisión de administradores.
5. WHEN un administrador aprueba o rechaza una publicación pendiente, THE Almacen_Blog SHALL actualizar la columna `estado_publicacion` (y `motivo_rechazo` cuando aplique) de la fila correspondiente en Supabase.
6. WHEN el autor de una publicación o un administrador solicita eliminarla, THE Almacen_Blog SHALL eliminar la fila correspondiente de `publicaciones` en Supabase, delegando la verificación de permiso a las políticas RLS ya existentes.

### Requirement 11: Migración de peleas próximas a Supabase

**User Story:** Como alumno, quiero que mi información de próxima pelea y la de mi contrincante se consulten desde la base de datos real, para que sea consistente entre dispositivos.

#### Acceptance Criteria

1. THE Almacen_Peleas_Proximas SHALL leer y escribir la tabla `peleas_proximas` de Supabase usando `usuario_id` y `contrincante_id` como UUID de `accounts`, en lugar de IDs numéricos.
2. WHEN se solicitan las peleas próximas del usuario autenticado, THE Almacen_Peleas_Proximas SHALL filtrar por el `cuenta_id` de la Sesion_Activa delegando el resto de la restricción de visibilidad a las políticas RLS ya existentes.

### Requirement 12: Directorio de administración conectado a datos reales

**User Story:** Como administrador, quiero ver y gestionar alumnos y entrenadores reales en el Directorio, para administrar la plataforma con información verídica en lugar de datos de ejemplo.

#### Acceptance Criteria

1. WHEN un administrador visita `Admin/Directorio`, THE Sistema_Auth SHALL listar los alumnos consultando `accounts` unida con `perfiles_deportivos` para `rol = 'usuario'`.
2. WHEN un administrador visita `Admin/Directorio`, THE Sistema_Auth SHALL listar los entrenadores consultando `accounts` unida con `perfiles_publicos_entrenador` para `rol = 'entrenador'`.
3. WHEN un administrador confirma la eliminación de un alumno o entrenador desde `Admin/Directorio`, THE Sistema_Auth SHALL invocar el Endpoint_Eliminacion_Cuenta con el `id` de la Cuenta_Supabase a eliminar.
4. THE Endpoint_Eliminacion_Cuenta SHALL verificar, usando la sesión del solicitante, que quien invoca la eliminación es una Cuenta_Supabase con `rol = 'admin'` y `estado_cuenta = 'aprobado'` antes de eliminar cualquier cuenta.
5. IF quien invoca el Endpoint_Eliminacion_Cuenta no es un administrador aprobado, THEN THE Endpoint_Eliminacion_Cuenta SHALL rechazar la solicitud sin eliminar ninguna cuenta.
6. WHEN el Endpoint_Eliminacion_Cuenta elimina exitosamente un usuario de `auth.users` mediante `service_role`, THE Endpoint_Eliminacion_Cuenta SHALL confiar en el borrado en cascada ya configurado para eliminar la Cuenta_Supabase y sus datos dependientes.
7. THE Endpoint_Eliminacion_Cuenta SHALL ejecutarse exclusivamente en un contexto de servidor (Route Handler), sin exponer la `service_role` key al código de cliente en ningún momento.

### Requirement 13: Migración de foto de perfil a Supabase Storage

**User Story:** Como usuario, quiero subir mi foto de perfil a un almacenamiento persistente, para que se muestre de forma consistente sin depender de `localStorage`.

#### Acceptance Criteria

1. WHEN un usuario sube una foto de perfil durante el registro o la edición de su perfil, THE Sistema_Auth SHALL subir el archivo al Bucket_Avatars bajo un prefijo que incluya el `cuenta_id` del usuario.
2. WHEN la subida al Bucket_Avatars se completa exitosamente, THE Sistema_Auth SHALL almacenar la ruta del objeto (no una cadena base64) en la columna `foto_ref` de la Cuenta_Supabase.
3. WHEN se necesita mostrar la foto de perfil de una Cuenta_Supabase, THE Sistema_Auth SHALL resolver `foto_ref` a una URL pública del Bucket_Avatars antes de renderizarla.
4. IF la Cuenta_Supabase no tiene `foto_ref` definido, THEN THE Sistema_Auth SHALL mostrar el mismo respaldo visual (inicial del nombre) que se usa actualmente.

### Requirement 14: Script de siembra de cuentas de prueba

**User Story:** Como desarrollador, quiero recrear las 15 cuentas de prueba como usuarios reales de Supabase Auth, para poder probar cada rol sin crear cuentas manualmente.

#### Acceptance Criteria

1. THE Script_Siembra SHALL ejecutar activamente, usando `service_role`, la creación de un usuario de Supabase Auth por cada una de las 15 cuentas de prueba (5 admin, 5 entrenador, 5 alumno) con el correo y contraseña ya definidos en `authStorage.ts`, en lugar de asumir que ya existen.
2. WHEN el Script_Siembra crea cada usuario, THE Script_Siembra SHALL incluir `nombre` y `rol` en la metadata para que el trigger `handle_new_user()` genere la fila de `accounts` correspondiente.
3. WHEN el Script_Siembra termina de crear las cuentas de administrador, THE Script_Siembra SHALL aprobar automáticamente al menos una de ellas mediante `aprobar_cuenta_admin` o una actualización directa, para permitir aprobar al resto desde la aplicación.
4. WHEN el Script_Siembra crea una cuenta de alumno, THE Script_Siembra SHALL crear su registro correspondiente en `perfiles_deportivos`; WHEN crea una cuenta de entrenador, THE Script_Siembra SHALL crear su registro correspondiente en `perfiles_publicos_entrenador`; con datos representativos equivalentes a los actualmente hardcodeados en `alumnoStorage.ts`/`entrenadorStorage.ts`.
5. IF una cuenta de prueba con el mismo correo ya existe en Supabase Auth, THEN THE Script_Siembra SHALL omitir su creación sin detener la siembra del resto de las cuentas.

### Requirement 15: Componentes consumidores actualizados

**User Story:** Como desarrollador, quiero que todos los componentes que hoy leen sesión o cuentas de `localStorage` usen el nuevo Proveedor_Sesion, para que la aplicación funcione de forma consistente con Supabase Auth.

#### Acceptance Criteria

1. THE Guarda_Rol (`RequireRole`) SHALL obtener la Sesion_Activa del Proveedor_Sesion en lugar de `sesionStorage.obtenerSesion()`.
2. THE componente `DashboardLayout` SHALL obtener el nombre y foto del usuario, y ejecutar el cierre de sesión, a través del Proveedor_Sesion.
3. THE componente `Header` SHALL mostrar el estado de sesión (iniciar sesión/cerrar sesión, nombre de usuario) a través del Proveedor_Sesion.
4. THE componente `ImagenEditable` SHALL determinar si el usuario actual es administrador consultando el `rol` expuesto por el Proveedor_Sesion.
5. THE páginas `Usuario/page.tsx`, `Usuario/Perfil/page.tsx` y `Usuario/contrincante/page.tsx` SHALL usar el `cuenta_id` de la Sesion_Activa para leer y escribir el Almacen_Alumno y el Almacen_Peleas_Proximas.
6. THE página `Entrenador/page.tsx` SHALL usar el `cuenta_id` de la Sesion_Activa para leer el Almacen_Entrenador.
7. THE páginas `blog/escribir/page.tsx`, `MisArticulos` y `Admin/Articulos/page.tsx` SHALL usar el `cuenta_id` de la Sesion_Activa y el Almacen_Blog en lugar de `autorId` numérico y `blogStorage.ts` basado en `localStorage`.
