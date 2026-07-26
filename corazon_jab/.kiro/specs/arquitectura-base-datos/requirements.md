# Requirements Document

## Introduction

Este documento define los requisitos para dos entregables complementarios del proyecto **Corazón Azteca** (repositorio `corazon_jab`), una plataforma web para una academia/gimnasio de boxeo construida con Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4:

1. **Documentación de arquitectura del sistema**: un artefacto que describe la estructura del sistema, sus capas, componentes, roles de usuario, flujos de datos y la estrategia de persistencia objetivo.
2. **Diseño de base de datos y persistencia real**: un modelo de datos relacional (y su plan de migración) que reemplace el almacenamiento actual en `localStorage` del navegador, dando soporte a usuarios, roles, entrenadores, alumnos, gimnasios, clases/horarios, planes de entrenamiento y alimentación, evaluaciones/progreso, peleas/torneos/competencias, mensajería y contenido público.

El estado actual del proyecto no dispone de backend ni base de datos: la persistencia se realiza en `localStorage` (`app/lib/entrenadorStorage.ts`, `app/lib/sesionStorage.ts`) y la autenticación está simulada. El objetivo es formalizar los requisitos que guiarán la fase de diseño técnico y la posterior implementación.

Existen tres roles: `admin`, `entrenador` y `usuario` (alumno). Este documento describe **qué** debe capturar y soportar la arquitectura y el modelo de datos, no **cómo** implementarlo (motor de base de datos concreto, ORM, framework de backend), decisiones que se resolverán en la fase de diseño.

## Glossary

- **Sistema**: La plataforma Corazón Azteca en su conjunto (frontend Next.js más el backend y la capa de persistencia objetivo).
- **Documento_Arquitectura**: Artefacto de documentación que describe la estructura, capas, componentes y decisiones técnicas del Sistema.
- **Modelo_Datos**: El diseño lógico de la base de datos relacional objetivo, incluyendo entidades, atributos, claves y relaciones.
- **Capa_Persistencia**: El componente responsable de almacenar y recuperar datos de forma duradera, que sustituye al almacenamiento actual en localStorage.
- **Almacenamiento_Local**: El mecanismo actual de persistencia basado en `localStorage` del navegador.
- **Plan_Migracion**: La descripción de los pasos para trasladar datos y funcionalidad desde el Almacenamiento_Local hacia la Capa_Persistencia.
- **Usuario**: Persona con una cuenta en el Sistema. Cada Usuario tiene exactamente un Rol.
- **Rol**: Clasificación de permisos de un Usuario; uno de: `admin`, `entrenador`, `usuario` (alumno).
- **Admin**: Usuario con Rol `admin`, con acceso administrativo al directorio y a la gestión global.
- **Entrenador**: Usuario con Rol `entrenador`, que gestiona alumnos, clases, evaluaciones y planes.
- **Alumno**: Usuario con Rol `usuario`, que consume entrenamientos, planes y consulta su progreso.
- **Gimnasio**: Instalación física registrada donde se imparten clases y entrenamientos.
- **Clase**: Actividad de entrenamiento programada, asociada a un Gimnasio y a un Entrenador.
- **Horario**: Franja temporal en la que se programa una Clase.
- **Plan_Entrenamiento**: Conjunto estructurado de actividades de entrenamiento asignado a un Alumno.
- **Plan_Alimenticio**: Conjunto estructurado de pautas de alimentación asignado a un Alumno.
- **Sesion_Entrenamiento**: Registro histórico de una actividad de entrenamiento realizada por un Alumno (fecha, tipo, duración, intensidad, entrenador, rating, notas).
- **Evaluacion**: Registro de una prueba física o técnica de un Alumno, con puntuaciones por categoría (velocidad, potencia, resistencia, técnica, defensa, ring IQ).
- **Pelea**: Combate registrado o programado que involucra a un Alumno y a un contrincante.
- **Torneo**: Evento competitivo que agrupa una o más Peleas.
- **Competencia**: Registro de participación de un Alumno en un evento competitivo.
- **Mensaje**: Comunicación enviada de un Usuario a otro dentro del módulo de mensajería.
- **Contenido_Publico**: Entradas de contenido visibles sin autenticación (blog, historia, leyendas).
- **Perfil_Entrenador**: Datos públicos de un Entrenador (nombre, especialidad, años de trayectoria, foto, biografía, logros, redes sociales, galería).
- **Sesion_Autenticacion**: El estado de identidad del Usuario autenticado actualmente en el Sistema.

## Requirements

### Requirement 1: Documentación de la arquitectura del sistema

**User Story:** Como equipo de desarrollo, quiero una documentación de arquitectura clara, para que cualquier integrante entienda la estructura del sistema y las decisiones técnicas antes de implementar la base de datos.

#### Acceptance Criteria

1. THE Documento_Arquitectura SHALL describir cada una de las capas del Sistema (capa de presentación con Next.js App Router, capa de lógica de aplicación y Capa_Persistencia), indicando para cada capa su responsabilidad y los componentes que la integran.
2. THE Documento_Arquitectura SHALL enumerar todos los módulos funcionales del Sistema, sin omitir ninguno, incluyendo como mínimo los módulos público, de Admin, de Entrenador y de Alumno.
3. THE Documento_Arquitectura SHALL describir los tres Roles del Sistema (`admin`, `entrenador`, `usuario`) y, para cada Rol, el conjunto completo de módulos accesibles.
4. THE Documento_Arquitectura SHALL describir el estado actual de persistencia basado en Almacenamiento_Local y el estado objetivo basado en la Capa_Persistencia, indicando las diferencias entre ambos estados.
5. THE Documento_Arquitectura SHALL incluir un diagrama que represente cada módulo funcional, cada entidad del Modelo_Datos y las relaciones entre los módulos funcionales y dichas entidades.
6. WHERE una decisión técnica quede pendiente de resolver, THE Documento_Arquitectura SHALL registrar dicha decisión pendiente con su descripción, al menos dos opciones consideradas y el estado de la decisión.

### Requirement 2: Modelo de datos de usuarios y roles

**User Story:** Como Admin, quiero que los usuarios y sus roles se almacenen de forma estructurada, para que el sistema controle el acceso según el rol de cada persona.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Usuario con un identificador único, un nombre de 1 a 100 caracteres, un identificador de acceso único de 1 a 255 caracteres, credenciales de acceso y exactamente un Rol asociado.
2. THE Modelo_Datos SHALL restringir el Rol de cada Usuario a uno de los valores: `admin`, `entrenador`, `usuario`.
3. WHEN se registra un nuevo Usuario con un Rol válido, THE Sistema SHALL asignar exactamente un Rol al Usuario y almacenar el Usuario en la Capa_Persistencia.
4. THE Modelo_Datos SHALL relacionar cada Entrenador con su Perfil_Entrenador correspondiente.
5. THE Modelo_Datos SHALL relacionar cada Alumno con los datos específicos de Alumno asociados a su cuenta.
6. IF se intenta crear un Usuario con un identificador de acceso ya existente, THEN THE Sistema SHALL rechazar la creación, no almacenar el nuevo Usuario y retornar un mensaje de error indicando que el identificador de acceso ya está en uso.
7. IF se intenta registrar un Usuario con un Rol distinto de `admin`, `entrenador` o `usuario`, THEN THE Sistema SHALL rechazar la creación, no almacenar el Usuario y retornar un mensaje de error de validación indicando que el Rol no es válido.

### Requirement 3: Autenticación y gestión de sesión

**User Story:** Como Usuario, quiero autenticarme con credenciales reales, para que mi identidad y mis datos estén protegidos.

#### Acceptance Criteria

1. WHEN un Usuario envía un identificador de acceso existente y unas credenciales que coinciden con las credenciales almacenadas para ese identificador, THE Sistema SHALL crear una Sesion_Autenticacion asociada al identificador único del Usuario y a su Rol.
2. IF un Usuario envía un identificador de acceso inexistente o unas credenciales que no coinciden con las credenciales almacenadas, THEN THE Sistema SHALL rechazar el acceso, no crear ninguna Sesion_Autenticacion y retornar un mensaje de error de autenticación que no revele cuál de los dos datos es incorrecto.
3. THE Sistema SHALL almacenar las credenciales de acceso en la Capa_Persistencia de forma cifrada, sin conservar su valor en texto plano.
4. WHILE una Sesion_Autenticacion está activa, THE Sistema SHALL determinar el Rol del Usuario a partir del Rol asociado a esa Sesion_Autenticacion.
5. WHEN un Usuario cierra su sesión, THE Sistema SHALL invalidar la Sesion_Autenticacion correspondiente e impedir su uso posterior para acceder a módulos protegidos.
6. WHILE una Sesion_Autenticacion permanece inactiva durante 30 minutos consecutivos, THE Sistema SHALL invalidar la Sesion_Autenticacion y requerir una nueva autenticación para acceder a módulos protegidos.
7. IF un identificador de acceso acumula 5 intentos de autenticación fallidos consecutivos, THEN THE Sistema SHALL rechazar nuevos intentos de autenticación de ese identificador durante 15 minutos y retornar un mensaje de error indicando el bloqueo temporal.

### Requirement 4: Control de acceso por rol

**User Story:** Como Admin, quiero que cada rol acceda únicamente a los módulos que le corresponden, para que la información sensible quede protegida.

#### Acceptance Criteria

1. WHILE la Sesion_Autenticacion tiene Rol `admin`, THE Sistema SHALL permitir el acceso únicamente al dashboard de administración y al Directorio, y denegar el acceso a los módulos exclusivos de otros Roles.
2. WHILE la Sesion_Autenticacion tiene Rol `entrenador`, THE Sistema SHALL permitir el acceso únicamente a los módulos de gestión de Entrenador (alumnos, evaluaciones, clases, horarios, planes y mensajería) y denegar el acceso a los módulos exclusivos de otros Roles.
3. WHILE la Sesion_Autenticacion tiene Rol `usuario`, THE Sistema SHALL permitir el acceso únicamente a los módulos de Alumno (entrenamientos, alimentación, progreso, historial y mensajería) y denegar el acceso a los módulos exclusivos de otros Roles.
4. IF un Usuario con Sesion_Autenticacion activa solicita un módulo no autorizado para su Rol, THEN THE Sistema SHALL denegar el acceso, no exponer los datos del módulo solicitado, conservar activa la Sesion_Autenticacion y retornar un mensaje de autorización insuficiente.
5. IF se solicita un módulo protegido sin una Sesion_Autenticacion activa, THEN THE Sistema SHALL denegar el acceso y requerir una autenticación válida.

### Requirement 5: Modelo de datos de gimnasios

**User Story:** Como Entrenador, quiero registrar los gimnasios donde imparto clases, para que alumnos y administradores conozcan las instalaciones disponibles.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Gimnasio con identificador único, nombre obligatorio de 1 a 100 caracteres y ubicación obligatoria de 1 a 200 caracteres.
2. THE Modelo_Datos SHALL relacionar cada Clase con exactamente un Gimnasio.
3. WHEN un Entrenador registra un Gimnasio con nombre y ubicación válidos, THE Sistema SHALL almacenar el Gimnasio en la Capa_Persistencia.
4. IF un Entrenador registra un Gimnasio con nombre vacío, con nombre que excede 100 caracteres o con ubicación que excede 200 caracteres, THEN THE Sistema SHALL rechazar el registro, no almacenar el Gimnasio y retornar un mensaje de error de validación indicando el campo inválido.
5. IF un Entrenador registra un Gimnasio con un identificador ya existente, THEN THE Sistema SHALL rechazar el registro y retornar un mensaje de error indicando la duplicidad del identificador.
6. IF se elimina un Gimnasio con una o más Clases asociadas, THEN THE Sistema SHALL rechazar la eliminación, conservar el Gimnasio y sus Clases asociadas en la Capa_Persistencia, y retornar un mensaje de error indicando que existen Clases asociadas.

### Requirement 6: Modelo de datos de clases y horarios

**User Story:** Como Entrenador, quiero programar clases con sus horarios, para que los alumnos sepan cuándo y dónde asistir.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Clase con identificador único, nombre obligatorio de 1 a 100 caracteres, exactamente un Gimnasio asociado y exactamente un Entrenador responsable.
2. THE Modelo_Datos SHALL definir una entidad Horario con identificador único que asocie exactamente una Clase con una fecha, una hora de inicio y una hora de fin.
3. WHEN un Entrenador crea un Horario para una Clase existente con datos válidos, THE Sistema SHALL almacenar la fecha, la hora de inicio y la hora de fin del Horario en la Capa_Persistencia.
4. IF un Horario tiene una hora de fin anterior o igual a su hora de inicio, THEN THE Sistema SHALL rechazar el Horario, no almacenarlo y retornar un mensaje de error de validación indicando el campo inválido.
5. THE Modelo_Datos SHALL permitir asociar de 0 a 100 Alumnos a una Clase.
6. IF un Entrenador crea una Clase con nombre vacío o con nombre que excede 100 caracteres, THEN THE Sistema SHALL rechazar la creación, no almacenar la Clase y retornar un mensaje de error de validación indicando el campo inválido.

### Requirement 7: Modelo de datos de planes de entrenamiento

**User Story:** Como Entrenador, quiero asignar planes de entrenamiento a mis alumnos, para que sigan una rutina estructurada.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Plan_Entrenamiento con identificador único, nombre obligatorio de 1 a 100 caracteres, exactamente un Alumno asignado y exactamente un Entrenador autor.
2. THE Modelo_Datos SHALL relacionar cada Plan_Entrenamiento con un mínimo de 1 y un máximo de 100 actividades de entrenamiento.
3. WHEN un Entrenador asigna un Plan_Entrenamiento a un Alumno existente, THE Sistema SHALL almacenar la relación entre el Plan_Entrenamiento y el Alumno en la Capa_Persistencia.
4. IF un Entrenador intenta asignar un Plan_Entrenamiento a un Alumno inexistente, THEN THE Sistema SHALL rechazar la asignación, no almacenar la relación y retornar un mensaje de error indicando que el Alumno no existe.
5. IF un Entrenador intenta almacenar un Plan_Entrenamiento sin ninguna actividad de entrenamiento asociada, con nombre vacío o con nombre que excede 100 caracteres, THEN THE Sistema SHALL rechazar el almacenamiento, no persistir el Plan_Entrenamiento y retornar un mensaje de error de validación indicando el campo inválido.
6. WHILE un Alumno tiene uno o más Plan_Entrenamiento asignados, THE Sistema SHALL mostrar cada Plan_Entrenamiento asignado al Alumno en su módulo de entrenamientos.

### Requirement 8: Registro de sesiones de entrenamiento

**User Story:** Como Alumno, quiero registrar y consultar mi historial de entrenamientos, para que pueda seguir mi actividad a lo largo del tiempo.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Sesion_Entrenamiento con identificador único, Alumno asociado, fecha, tipo de 1 a 50 caracteres, duración de 1 a 600 minutos, intensidad de 0 a 10 inclusive, Entrenador y calificación de 1 a 5 inclusive.
2. WHEN un Alumno registra una Sesion_Entrenamiento con todos sus campos obligatorios válidos, THE Sistema SHALL almacenar la Sesion_Entrenamiento en la Capa_Persistencia.
3. WHEN un Alumno consulta su historial, THE Sistema SHALL retornar las Sesion_Entrenamiento asociadas al Alumno ordenadas por fecha descendente.
4. WHERE un Alumno aplica un filtro por tipo de entrenamiento, THE Sistema SHALL retornar únicamente las Sesion_Entrenamiento del Alumno cuyo tipo coincide exactamente con el filtro.
5. WHERE un Alumno sin Sesion_Entrenamiento registradas consulta su historial, THE Sistema SHALL retornar un conjunto vacío sin generar error.
6. IF una Sesion_Entrenamiento registra un valor de intensidad fuera del rango de 0 a 10 o un valor de intensidad no numérico, THEN THE Sistema SHALL rechazar el registro, no persistir la Sesion_Entrenamiento y retornar un mensaje de error de validación.
7. IF una Sesion_Entrenamiento registra una fecha inválida, un tipo vacío o que excede 50 caracteres, una duración fuera del rango de 1 a 600 minutos o una calificación fuera del rango de 1 a 5, THEN THE Sistema SHALL rechazar el registro, no almacenar la Sesion_Entrenamiento y retornar un mensaje de error de validación indicando el campo inválido.

### Requirement 9: Modelo de datos de planes de alimentación

**User Story:** Como Entrenador, quiero asignar planes de alimentación a mis alumnos, para que complementen su entrenamiento con una nutrición adecuada.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Plan_Alimenticio con identificador único, nombre obligatorio de 1 a 100 caracteres, exactamente un Alumno asignado y exactamente un Entrenador autor.
2. THE Modelo_Datos SHALL relacionar cada Plan_Alimenticio con un mínimo de 1 y un máximo de 100 pautas de alimentación.
3. WHEN un Entrenador asigna un Plan_Alimenticio a un Alumno existente, THE Sistema SHALL almacenar la relación entre el Plan_Alimenticio y el Alumno en la Capa_Persistencia.
4. IF un Entrenador intenta asignar un Plan_Alimenticio a un Alumno inexistente, THEN THE Sistema SHALL rechazar la asignación, no almacenar la relación y retornar un mensaje de error indicando que el Alumno no existe.
5. IF un Entrenador intenta almacenar un Plan_Alimenticio sin ninguna pauta de alimentación asociada, con nombre vacío o con nombre que excede 100 caracteres, THEN THE Sistema SHALL rechazar el almacenamiento, no persistir el Plan_Alimenticio y retornar un mensaje de error de validación indicando el campo inválido.
6. WHILE un Alumno tiene uno o más Plan_Alimenticio asignados, THE Sistema SHALL mostrar cada Plan_Alimenticio asignado al Alumno en su módulo de alimentación.

### Requirement 10: Modelo de datos de evaluaciones y progreso

**User Story:** Como Entrenador, quiero registrar evaluaciones físicas y técnicas de mis alumnos, para que el progreso pueda medirse de forma objetiva.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Evaluacion con identificador único, exactamente un Alumno asociado, tipo de 1 a 50 caracteres, fecha y una puntuación por categoría de 0 a 100 inclusive.
2. THE Modelo_Datos SHALL incluir en cada Evaluacion las categorías velocidad, potencia, resistencia, técnica, defensa y ring IQ.
3. WHEN un Entrenador registra una Evaluacion para un Alumno existente con todos sus campos obligatorios válidos, THE Sistema SHALL almacenar la Evaluacion en la Capa_Persistencia.
4. IF una puntuación de categoría de una Evaluacion está fuera del rango de 0 a 100 o es un valor no numérico, THEN THE Sistema SHALL rechazar la Evaluacion, no persistirla y retornar un mensaje de error de validación indicando el campo inválido.
5. IF una Evaluacion registra una fecha inválida o un tipo vacío o que excede 50 caracteres, THEN THE Sistema SHALL rechazar la Evaluacion, no almacenarla y retornar un mensaje de error de validación indicando el campo inválido.
6. IF un Entrenador intenta registrar una Evaluacion para un Alumno inexistente, THEN THE Sistema SHALL rechazar el registro, no almacenar la Evaluacion y retornar un mensaje de error indicando que el Alumno no existe.
7. WHEN un Alumno consulta su progreso, THE Sistema SHALL retornar las Evaluacion asociadas al Alumno ordenadas por fecha descendente.
8. WHERE un Alumno sin Evaluacion registradas consulta su progreso, THE Sistema SHALL retornar un conjunto vacío sin generar error.

### Requirement 11: Modelo de datos de peleas, torneos y competencias

**User Story:** Como Entrenador, quiero gestionar las peleas, torneos y competencias de mis alumnos, para que su trayectoria competitiva quede registrada.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Pelea con identificador único, exactamente un Alumno asociado, un contrincante de 1 a 100 caracteres, una fecha, un evento de 1 a 100 caracteres y un lugar de 1 a 200 caracteres.
2. THE Modelo_Datos SHALL definir una entidad Torneo con identificador único, nombre obligatorio de 1 a 100 caracteres y fecha.
3. THE Modelo_Datos SHALL relacionar cada Competencia con exactamente un Alumno y exactamente un Torneo.
4. WHEN un Entrenador registra una Pelea con Alumno existente, contrincante de 1 a 100 caracteres, fecha válida, evento de 1 a 100 caracteres y lugar de 1 a 200 caracteres, THE Sistema SHALL almacenar la Pelea en la Capa_Persistencia.
5. IF un Entrenador registra una Pelea con Alumno inexistente, fecha inválida, contrincante vacío o que excede 100 caracteres, evento vacío o que excede 100 caracteres, o lugar vacío o que excede 200 caracteres, THEN THE Sistema SHALL rechazar el registro, no almacenar la Pelea y retornar un mensaje de error de validación indicando el campo inválido.
6. WHILE una Pelea asociada a un Alumno tiene una fecha posterior a la fecha actual, THE Sistema SHALL mostrar la Pelea al Alumno en su módulo de contrincante.

### Requirement 12: Modelo de datos de mensajería

**User Story:** Como Usuario, quiero enviar y recibir mensajes dentro de la plataforma, para que la comunicación entre entrenadores y alumnos quede registrada.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Mensaje con identificador único, exactamente un Usuario remitente, exactamente un Usuario destinatario, contenido obligatorio de 1 a 2000 caracteres y fecha de envío obligatoria.
2. WHEN un Usuario remitente existente envía un Mensaje con contenido válido a un Usuario destinatario existente, THE Sistema SHALL almacenar el Mensaje junto con su fecha de envío en la Capa_Persistencia.
3. WHEN un Usuario abre su módulo de mensajería, THE Sistema SHALL retornar los Mensaje en los que el Usuario es remitente o destinatario ordenados por fecha de envío descendente.
4. WHERE un Usuario sin Mensaje como remitente ni destinatario abre su módulo de mensajería, THE Sistema SHALL retornar un conjunto vacío sin generar error.
5. IF un Usuario intenta enviar un Mensaje con contenido vacío o con contenido que excede 2000 caracteres, THEN THE Sistema SHALL rechazar el envío, no almacenar el Mensaje y retornar un mensaje de error de validación indicando el campo inválido.
6. IF un Usuario intenta enviar un Mensaje a un Usuario destinatario inexistente, THEN THE Sistema SHALL rechazar el envío, no almacenar el Mensaje y retornar un mensaje de error indicando que el Usuario destinatario no existe.

### Requirement 13: Modelo de datos de perfiles de entrenador y contenido público

**User Story:** Como visitante, quiero consultar los perfiles de entrenadores y el contenido público, para que pueda conocer la academia sin necesidad de iniciar sesión.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir una entidad Perfil_Entrenador con identificador único, nombre de 1 a 100 caracteres, especialidad de 1 a 100 caracteres, años de trayectoria de 0 a 80, foto, biografía de 0 a 2000 caracteres, de 0 a 50 logros, de 0 a 10 redes sociales y de 0 a 50 elementos de galería.
2. THE Modelo_Datos SHALL definir una entidad Contenido_Publico con identificador único, tipo restringido a uno de los valores `blog`, `historia` o `leyenda`, título de 1 a 200 caracteres y cuerpo de 1 a 20000 caracteres.
3. WHEN un visitante solicita el listado de entrenadores, THE Sistema SHALL retornar los Perfil_Entrenador disponibles sin requerir Sesion_Autenticacion.
4. WHEN un visitante solicita un Perfil_Entrenador por su identificador, THE Sistema SHALL retornar el Perfil_Entrenador correspondiente.
5. IF un visitante solicita un Perfil_Entrenador con un identificador inexistente, THEN THE Sistema SHALL retornar un mensaje de recurso no encontrado.
6. WHEN un visitante solicita Contenido_Publico, THE Sistema SHALL retornar el Contenido_Publico disponible sin requerir Sesion_Autenticacion.
7. IF un visitante solicita un Contenido_Publico con un identificador inexistente, THEN THE Sistema SHALL retornar un mensaje de recurso no encontrado.

### Requirement 14: Integridad referencial del modelo de datos

**User Story:** Como equipo de desarrollo, quiero que las relaciones entre entidades mantengan integridad referencial, para que no existan datos huérfanos ni inconsistentes.

#### Acceptance Criteria

1. THE Modelo_Datos SHALL definir para cada entidad exactamente una clave primaria única y no nula.
2. THE Modelo_Datos SHALL definir para cada relación entre entidades una clave foránea que referencie la clave primaria de la entidad relacionada.
3. IF se intenta crear o modificar un registro de forma que referencie una entidad inexistente, THEN THE Sistema SHALL rechazar la operación, no persistir ni modificar el registro afectado y retornar un mensaje de error de integridad.
4. WHEN se elimina un Usuario, THE Sistema SHALL aplicar la política de eliminación definida (eliminación en cascada o rechazo) para todos los registros dependientes del Usuario, de modo que no quede ningún registro dependiente huérfano.
5. IF la política de eliminación de una entidad es de rechazo y se intenta eliminar un registro con registros dependientes, THEN THE Sistema SHALL rechazar la eliminación, conservar el registro y sus dependientes, y retornar un mensaje de error de integridad.
6. THE Modelo_Datos SHALL garantizar que en todo momento ninguna clave foránea referencie una clave primaria inexistente.

### Requirement 15: Migración desde el almacenamiento local

**User Story:** Como Admin, quiero migrar los datos existentes en el almacenamiento local hacia la base de datos, para que la información previa no se pierda al adoptar la nueva persistencia.

#### Acceptance Criteria

1. THE Plan_Migracion SHALL describir la correspondencia entre cada clave de Almacenamiento_Local y su entidad destino en el Modelo_Datos.
2. THE Plan_Migracion SHALL describir los pasos para transferir los datos de Perfil_Entrenador, Sesion_Autenticacion y Pelea desde el Almacenamiento_Local hacia la Capa_Persistencia.
3. WHEN se ejecuta la migración, THE Sistema SHALL transferir cada dato preservando sin alteración su identificador único y las relaciones con otras entidades registradas en el Almacenamiento_Local.
4. IF un dato del Almacenamiento_Local no cumple las validaciones del Modelo_Datos, THEN THE Sistema SHALL registrar en el informe de migración el dato rechazado indicando su clave de origen, su entidad destino y el motivo del rechazo, conservar el dato original en el Almacenamiento_Local y continuar el proceso con los datos restantes sin interrumpirlo.
5. THE Modelo_Datos SHALL almacenar las imágenes de foto y galería como una referencia a su ubicación en un almacenamiento de archivos, en lugar de cadenas base64 embebidas en el registro de la entidad.
6. WHEN la migración finaliza, THE Sistema SHALL generar un informe de migración que indique, por cada entidad, el número de registros migrados correctamente y el número de registros rechazados.
7. IF se ejecuta la migración sobre uno o más datos que ya fueron migrados previamente a la Capa_Persistencia, THEN THE Sistema SHALL identificarlos por su identificador único y omitir su reinserción, evitando la creación de registros duplicados.
