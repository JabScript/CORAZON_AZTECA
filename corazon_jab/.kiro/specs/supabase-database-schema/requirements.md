# Requirements Document

## Introduction

Este documento define los requisitos para migrar la persistencia de datos de **Corazón Azteca** (repositorio `corazon_jab`), una plataforma Next.js para un gimnasio/comunidad de boxeo, desde el prototipo actual basado en `localStorage` del navegador (`app/lib/authStorage.ts`, `sesionStorage.ts`, `alumnoStorage.ts`, `entrenadorStorage.ts`, `blogStorage.ts`, `contenidoStorage.ts`) hacia una base de datos real en Supabase (Postgres + Supabase Auth + Supabase Storage + Row Level Security).

El alcance de este documento es de **modelo de datos y control de acceso**: qué entidades debe soportar el esquema, qué relaciones existen entre ellas, qué reglas de integridad y de negocio deben cumplirse, y qué políticas de acceso por rol y por propiedad de datos (ownership) debe aplicar el sistema. El diseño técnico detallado (DDL de tablas, tipos de columna concretos, índices, definición literal de políticas RLS en SQL) se resuelve en la fase de diseño posterior a este documento.

El proyecto parte de cero para el modelo de datos (diseño greenfield): no existe todavía un esquema SQL, ni configuración de Supabase, ni datos reales en producción que deban preservarse. Los datos actuales en `localStorage` son datos de demostración/prueba.

Existen tres roles de cuenta: `admin`, `entrenador` y `usuario` (alumno/boxeador). Cada rol tiene necesidades de acceso distintas, lo que implica que el modelo de datos debe soportar políticas de Row Level Security basadas en rol y en propiedad de los datos.

## Glossary

- **Sistema**: La plataforma Corazón Azteca, incluyendo el frontend Next.js y la base de datos Supabase objetivo.
- **Base_Datos**: El esquema relacional en Supabase (Postgres) que sustituye al almacenamiento actual en `localStorage`.
- **Autenticacion_Supabase**: El servicio de Supabase Auth responsable de gestionar credenciales, inicio de sesión y sesiones de usuario.
- **Almacenamiento_Archivos**: Supabase Storage, el servicio de almacenamiento de archivos binarios (imágenes) usado en lugar de cadenas base64 embebidas.
- **Politica_RLS**: Una regla de Row Level Security de Postgres que determina qué filas de una tabla puede leer, insertar, actualizar o eliminar una sesión autenticada dada.
- **Cuenta**: Un registro de identidad en el Sistema, vinculado 1:1 a un usuario de Autenticacion_Supabase, con exactamente un Rol.
- **Rol**: Clasificación de una Cuenta; uno de `admin`, `entrenador`, `usuario`.
- **Admin**: Cuenta con Rol `admin`.
- **Entrenador**: Cuenta con Rol `entrenador`.
- **Alumno**: Cuenta con Rol `usuario` (boxeador/alumno).
- **Cuenta_Pendiente**: Estado de una Cuenta de Rol `admin` que fue solicitada pero aún no fue aprobada por un Admin existente, y que no puede autenticarse mientras permanezca en ese estado.
- **Perfil_Deportivo**: Los datos deportivos de un Alumno (nombre, apodo, fecha de nacimiento, peso, nivel, objetivo, ciudad, relación con Entrenador), vinculados 1:1 a una Cuenta de Rol `usuario`.
- **Origen_Entrenador**: La forma en que un Perfil_Deportivo queda asociado a un entrenador; uno de `directorio` (referencia a un Perfil_Publico_Entrenador existente), `manual` (nombre de texto libre de un entrenador no registrado en el Sistema) o `independiente` (sin entrenador asociado).
- **Perfil_Publico_Entrenador**: El perfil público de un Entrenador (especialidad, años de trayectoria, foto, biografía, logros, redes sociales, galería), visible en el directorio `/entrenadores`.
- **Publicacion**: Un contenido enviado por un Entrenador o Alumno para revisión editorial; de Tipo_Publicacion `articulo` o `logro`.
- **Tipo_Publicacion**: Clasificación de una Publicacion; uno de `articulo` (contenido de blog) o `logro` (logro deportivo compartido por un Alumno, visible en su historial).
- **Estado_Publicacion**: Estado de moderación de una Publicacion; uno de `pendiente`, `aprobado`, `rechazado`.
- **Contenido_Editorial**: Un registro clave-imagen que permite a un Admin sustituir la imagen de una sección estática del sitio (ej. Leyendas del boxeo, Historia del boxeo) identificada por una clave estable (slug).
- **Pelea_Proxima**: Un combate programado y no disputado todavía, asociado a un Alumno y a un contrincante.
- **Registro_Pelea**: Un combate ya disputado, con resultado, que forma parte del historial/récord profesional de un Alumno.
- **Resultado_Pelea**: El desenlace de un Registro_Pelea; uno de victoria, derrota o empate.
- **Gimnasio**: Una instalación física con nombre, dirección y coordenadas geográficas.
- **Relacion_Gimnasio_Entrenador**: La relación entre un Gimnasio y un Entrenador; de Tipo_Relacion_Gimnasio `cliente` (labora ahí desde una fecha) o `vacante` (el Gimnasio busca entrenador, sin Entrenador asignado).
- **Horario_Clase**: Una franja de clase recurrente, con día de la semana, rango de hora, un Gimnasio y un Entrenador que la imparte.
- **Plantilla_Plan**: Una plantilla reutilizable de plan de entrenamiento (nombre, descripción, sesiones por semana, enfoque), definida por un Entrenador.
- **Asignacion_Plan**: La asignación de una Plantilla_Plan a un Alumno específico, con un porcentaje de adherencia asociado.
- **Pelea_Programada**: Un combate planificado dentro del módulo de competencias, con Alumno, rival, categoría, lugar y Estado_Pelea_Programada.
- **Estado_Pelea_Programada**: Estado de una Pelea_Programada; uno de `programada`, `ganada` o `perdida`, con un método cuando el estado no es `programada`.
- **Torneo**: Un evento competitivo con nombre, fecha, categorías y Estado_Torneo, al que se inscriben uno o más Alumno.
- **Estado_Torneo**: Estado de un Torneo; uno de `pre-inscripcion`, `inscritos` o `completado`.
- **Ficha_Salud**: El estado médico vigente de un Alumno (si está lesionado, tipo de lesión, fecha de lesión, si tiene alta médica, observaciones médicas).
- **Titulo_Division**: El estado de campeonato de un Alumno en una división (si es campeón, federación, fecha desde la que ostenta el título).
- **Evaluacion_Habilidades**: Una medición puntual de las habilidades de un Alumno (velocidad, potencia, resistencia, técnica, defensa, ring IQ), cada una en una escala de 0 a 100, tomada en una fecha determinada, para permitir seguimiento evolutivo.
- **Objetivo_Alumno**: Una meta de un Alumno, con descripción, Tipo_Objetivo (`carrera` o `fisico`), porcentaje de progreso y fecha límite.
- **Registro_Entrenamiento**: Una sesión de entrenamiento realizada por un Alumno (fecha, tipo, duración, intensidad, Entrenador que la impartió, calificación dada por el Alumno, notas, frecuencia cardíaca).
- **Plan_Alimentacion**: El conjunto de comidas planificadas de un Alumno para un día (nombre, hora, alimentos, calorías, proteína) y sus metas diarias de macronutrientes y agua.
- **Registro_Macros**: Los valores de macronutrientes y agua efectivamente consumidos por un Alumno en un día, para comparar contra las metas de su Plan_Alimentacion.
- **Modo_Campamento**: El seguimiento de preparación pre-pelea de un Alumno: datos de la próxima pelea (oponente, fecha, categoría de peso, rounds), serie temporal de control de peso, plan semanal de sesiones del campamento y conteo de sesiones/sparrings planeados.
- **Control_Peso**: Un registro puntual de peso de un Alumno dentro de un Modo_Campamento (peso inicial, peso actual, peso objetivo, fecha de la medición).

## Requirements

### Requirement 1: Cuentas de usuario delegadas a Supabase Auth

**User Story:** Como equipo de desarrollo, quiero que la identidad y las credenciales de cada Cuenta se gestionen con Autenticacion_Supabase, para que el Sistema deje de almacenar contraseñas en texto plano.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir una tabla de perfil de Cuenta vinculada uno a uno con un usuario de Autenticacion_Supabase, sin incluir ninguna columna de contraseña ni de credencial de acceso.
2. THE Base_Datos SHALL almacenar para cada Cuenta un nombre, exactamente un Rol de valor `admin`, `entrenador` o `usuario`, y una referencia a su foto de perfil en Almacenamiento_Archivos.
3. WHEN Autenticacion_Supabase crea un nuevo usuario, THE Sistema SHALL crear el registro de perfil de Cuenta correspondiente con exactamente un Rol asignado.
4. IF se intenta crear un perfil de Cuenta con un Rol distinto de `admin`, `entrenador` o `usuario`, THEN THE Base_Datos SHALL rechazar el registro.
5. THE Base_Datos SHALL garantizar que el identificador de perfil de Cuenta sea el mismo identificador que el usuario de Autenticacion_Supabase al que corresponde.
6. WHERE una Cuenta almacena una foto de perfil, THE Base_Datos SHALL almacenar dicha foto como una referencia a un objeto en Almacenamiento_Archivos, no como una cadena base64 embebida.

### Requirement 2: Aprobación de cuentas administrativas pendientes

**User Story:** Como Admin existente, quiero que las nuevas solicitudes de cuenta admin queden pendientes de aprobación, para que ninguna cuenta administrativa nueva obtenga acceso sin revisión.

#### Acceptance Criteria

1. THE Base_Datos SHALL registrar para cada Cuenta de Rol `admin` un estado que indique si es una Cuenta_Pendiente o una cuenta aprobada.
2. WHEN se registra una nueva Cuenta con Rol `admin`, THE Sistema SHALL crear dicha Cuenta con estado Cuenta_Pendiente.
3. WHILE una Cuenta de Rol `admin` tiene estado Cuenta_Pendiente, THE Sistema SHALL impedir que dicha Cuenta acceda a cualquier dato o funcionalidad reservada al Rol `admin`.
4. WHEN un Admin con estado aprobado aprueba una Cuenta_Pendiente, THE Sistema SHALL cambiar su estado a aprobado y permitir su acceso a partir de ese momento.
5. THE Base_Datos SHALL registrar, para cada Cuenta de Rol `admin` aprobada, la referencia del Admin que otorgó la aprobación y la fecha en que se otorgó.
6. THE Base_Datos SHALL permitir que Cuentas de Rol `entrenador` y `usuario` accedan al Sistema inmediatamente después de su creación, sin pasar por un estado de Cuenta_Pendiente.

### Requirement 3: Perfil deportivo del Alumno y su relación con un Entrenador

**User Story:** Como Alumno, quiero que mis datos deportivos y mi relación con un entrenador queden almacenados de forma estructurada, para que mi progreso y mi red de entrenamiento se mantengan asociados a mi cuenta.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Perfil_Deportivo vinculado a exactamente una Cuenta de Rol `usuario`, con nombre, apellido, apodo opcional, fecha de nacimiento, peso, nivel, objetivo, ciudad y fecha de registro.
2. THE Base_Datos SHALL restringir el nivel de un Perfil_Deportivo a uno de los valores `Principiante`, `Amateur`, `Semi-profesional` o `Profesional`.
3. THE Base_Datos SHALL registrar para cada Perfil_Deportivo exactamente un Origen_Entrenador de valor `directorio`, `manual` o `independiente`.
4. WHERE el Origen_Entrenador de un Perfil_Deportivo es `directorio`, THE Base_Datos SHALL asociar el Perfil_Deportivo a exactamente un Perfil_Publico_Entrenador existente mediante una relación de clave foránea.
5. WHERE el Origen_Entrenador de un Perfil_Deportivo es `manual`, THE Base_Datos SHALL almacenar el nombre del entrenador como texto libre, sin exigir una relación de clave foránea a ningún Perfil_Publico_Entrenador.
6. WHERE el Origen_Entrenador de un Perfil_Deportivo es `independiente`, THE Base_Datos SHALL permitir que el Perfil_Deportivo no tenga ninguna referencia de entrenador ni de directorio ni de texto libre.
7. WHEN un Alumno cambia el Origen_Entrenador de su Perfil_Deportivo, THE Sistema SHALL limpiar los campos correspondientes a los demás Origen_Entrenador que ya no aplican.
8. THE Base_Datos SHALL permitir un único Perfil_Deportivo por Cuenta de Rol `usuario`.

### Requirement 4: Perfil público de Entrenador

**User Story:** Como Entrenador, quiero mantener un perfil público con mi trayectoria y galería, para que alumnos y visitantes conozcan mi experiencia antes de elegirme.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Perfil_Publico_Entrenador vinculado a exactamente una Cuenta de Rol `entrenador`, con especialidad, años de trayectoria, referencia de foto en Almacenamiento_Archivos y biografía.
2. THE Base_Datos SHALL permitir asociar a cada Perfil_Publico_Entrenador una colección de cero o más logros de texto.
3. THE Base_Datos SHALL permitir asociar a cada Perfil_Publico_Entrenador una colección de cero o más redes sociales, cada una con nombre de red, usuario y URL.
4. THE Base_Datos SHALL permitir asociar a cada Perfil_Publico_Entrenador una colección de cero o más fotos de galería, cada una con una referencia a Almacenamiento_Archivos y un texto alternativo.
5. THE Sistema SHALL permitir que cualquier visitante, sin sesión autenticada, consulte los Perfil_Publico_Entrenador existentes.
6. THE Base_Datos SHALL permitir un único Perfil_Publico_Entrenador por Cuenta de Rol `entrenador`.

### Requirement 5: Publicaciones de blog y logros con moderación editorial

**User Story:** Como Admin, quiero moderar las publicaciones enviadas por entrenadores y alumnos, para que solo el contenido aprobado sea visible públicamente.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir una Publicacion con Tipo_Publicacion, título, extracto, contenido, categoría, referencia de imagen opcional en Almacenamiento_Archivos, autor, Estado_Publicacion y fecha de envío.
2. THE Base_Datos SHALL asociar cada Publicacion a exactamente una Cuenta autora de Rol `entrenador` o `usuario`.
3. WHEN un Entrenador o un Alumno envía una nueva Publicacion, THE Sistema SHALL almacenarla con Estado_Publicacion `pendiente`.
4. WHERE una Publicacion es de Tipo_Publicacion `logro`, THE Base_Datos SHALL permitir almacenar un ícono asociado a la Publicacion.
5. WHEN un Admin aprueba una Publicacion pendiente, THE Sistema SHALL cambiar su Estado_Publicacion a `aprobado`.
6. WHEN un Admin rechaza una Publicacion pendiente, THE Sistema SHALL cambiar su Estado_Publicacion a `rechazado` y THE Base_Datos SHALL permitir almacenar un motivo de rechazo asociado.
7. THE Sistema SHALL permitir que cualquier visitante, sin sesión autenticada, consulte únicamente las Publicacion con Estado_Publicacion `aprobado`.
8. WHILE una Publicacion de Tipo_Publicacion `logro` tiene Estado_Publicacion `aprobado`, THE Sistema SHALL incluirla en el historial del Alumno autor.
9. THE Sistema SHALL permitir que el autor de una Publicacion o un Admin la eliminen, y SHALL impedir su eliminación a cualquier otra Cuenta.

### Requirement 6: Contenido editorial estático personalizable

**User Story:** Como Admin, quiero reemplazar las imágenes de secciones estáticas del sitio, para que el contenido editorial se mantenga actualizado sin modificar código.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Contenido_Editorial identificado por una clave única de texto (slug) y una referencia a una imagen en Almacenamiento_Archivos.
2. WHEN un Admin guarda una imagen para una clave de Contenido_Editorial, THE Sistema SHALL crear o reemplazar la referencia de imagen asociada a esa clave.
3. WHEN un Admin elimina la imagen personalizada de una clave de Contenido_Editorial, THE Sistema SHALL eliminar el registro asociado a esa clave sin afectar otras claves.
4. THE Sistema SHALL permitir que cualquier visitante, sin sesión autenticada, consulte la imagen de Contenido_Editorial asociada a una clave.

### Requirement 7: Peleas próximas y visibilidad de contrincantes

**User Story:** Como Alumno, quiero ver mis peleas próximas y a mi contrincante, para prepararme para mi siguiente combate.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir una Pelea_Proxima con exactamente un Alumno, exactamente un contrincante referenciado a otra Cuenta, fecha, evento y lugar.
2. THE Sistema SHALL permitir que un Alumno consulte únicamente sus propias Pelea_Proxima.
3. WHILE una Pelea_Proxima de un Alumno tiene fecha futura, THE Sistema SHALL permitir que dicho Alumno consulte el perfil básico de su contrincante asociado.
4. THE Sistema SHALL permitir que un Admin consulte todas las Pelea_Proxima existentes.

### Requirement 8: Historial de peleas y récord profesional

**User Story:** Como Alumno, quiero un historial de mis peleas disputadas, para que mi récord profesional quede documentado y visible.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Registro_Pelea con exactamente un Alumno, fecha, lugar, rival, Resultado_Pelea, método, categoría de peso y peso.
2. THE Base_Datos SHALL restringir el Resultado_Pelea a uno de los valores victoria, derrota o empate.
3. THE Base_Datos SHALL permitir que el rival de un Registro_Pelea se almacene como texto libre o, cuando el rival es otra Cuenta registrada en el Sistema, como una referencia a dicha Cuenta.
4. WHEN se consulta el historial de un Alumno, THE Sistema SHALL permitir calcular a partir de sus Registro_Pelea estadísticas derivadas de número de peleas, victorias, derrotas, empates, nocauts/nocauts técnicos, efectividad porcentual, rounds y categorías de peso.
5. THE Sistema SHALL permitir que cualquier visitante, sin sesión autenticada, consulte el historial de Registro_Pelea de un Alumno cuyo Perfil_Deportivo es público.

### Requirement 9: Gimnasios y su relación con entrenadores

**User Story:** Como Admin o Entrenador, quiero registrar los gimnasios y qué entrenadores laboran o buscan trabajar en ellos, para que la comunidad conozca las instalaciones disponibles.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Gimnasio con nombre, dirección y coordenadas geográficas de latitud y longitud.
2. THE Base_Datos SHALL definir una Relacion_Gimnasio_Entrenador con exactamente un Gimnasio y un Tipo_Relacion_Gimnasio de valor `cliente` o `vacante`.
3. WHERE el Tipo_Relacion_Gimnasio es `cliente`, THE Base_Datos SHALL asociar la Relacion_Gimnasio_Entrenador a exactamente un Entrenador y una fecha desde la que labora ahí.
4. WHERE el Tipo_Relacion_Gimnasio es `vacante`, THE Base_Datos SHALL permitir que la Relacion_Gimnasio_Entrenador no tenga ningún Entrenador asociado.
5. THE Sistema SHALL permitir que cualquier visitante, sin sesión autenticada, consulte los Gimnasio existentes y sus Relacion_Gimnasio_Entrenador.

### Requirement 10: Horarios de clases

**User Story:** Como Entrenador, quiero programar horarios de clases recurrentes, para que los alumnos sepan cuándo y dónde asistir.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Horario_Clase con día de la semana, hora de inicio, hora de fin, exactamente un Gimnasio y exactamente un Entrenador.
2. IF un Horario_Clase tiene una hora de fin anterior o igual a su hora de inicio, THEN THE Base_Datos SHALL rechazar su almacenamiento.
3. THE Sistema SHALL permitir que un Entrenador gestione únicamente los Horario_Clase en los que él mismo es el Entrenador asociado.
4. THE Sistema SHALL permitir que cualquier Cuenta autenticada consulte los Horario_Clase existentes.

### Requirement 11: Planes de entrenamiento y su asignación

**User Story:** Como Entrenador, quiero mantener una biblioteca de plantillas de plan y asignarlas a mis alumnos, para que cada alumno siga una rutina estructurada con seguimiento de adherencia.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir una Plantilla_Plan con nombre, descripción, número de sesiones por semana, enfoque y exactamente un Entrenador autor.
2. THE Base_Datos SHALL definir una Asignacion_Plan que relacione exactamente una Plantilla_Plan con exactamente un Alumno, junto con un porcentaje de adherencia.
3. THE Sistema SHALL permitir que un Entrenador gestione únicamente las Plantilla_Plan de las que él mismo es autor y las Asignacion_Plan derivadas de ellas.
4. THE Sistema SHALL permitir que un Alumno consulte únicamente las Asignacion_Plan en las que él mismo es el Alumno asignado.
5. IF se intenta crear una Asignacion_Plan hacia un Alumno que no tiene Perfil_Deportivo registrado, THEN THE Base_Datos SHALL rechazar la creación.

### Requirement 12: Competencias — peleas programadas y torneos

**User Story:** Como Entrenador, quiero gestionar las peleas programadas y torneos de mis alumnos, para dar seguimiento a su calendario competitivo.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir una Pelea_Programada con fecha, exactamente un Alumno, rival, categoría, lugar y Estado_Pelea_Programada.
2. THE Base_Datos SHALL restringir el Estado_Pelea_Programada a uno de los valores `programada`, `ganada` o `perdida`.
3. WHERE el Estado_Pelea_Programada de una Pelea_Programada no es `programada`, THE Base_Datos SHALL almacenar el método del resultado asociado.
4. THE Base_Datos SHALL definir un Torneo con nombre, fecha, categorías, Estado_Torneo y una colección de cero o más Alumno participantes.
5. THE Base_Datos SHALL restringir el Estado_Torneo a uno de los valores `pre-inscripcion`, `inscritos` o `completado`.
6. THE Sistema SHALL permitir que un Entrenador gestione únicamente las Pelea_Programada y Torneo de los Alumno que él mismo entrena.
7. THE Sistema SHALL permitir que un Alumno consulte únicamente las Pelea_Programada y Torneo en los que él mismo participa.

### Requirement 13: Ficha de salud del alumno y restricción de participación en contacto

**User Story:** Como Entrenador, quiero registrar el estado médico de mis alumnos, para evitar que un alumno lesionado participe en actividades de contacto sin alta médica.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir una Ficha_Salud vinculada a exactamente un Perfil_Deportivo, con indicador de lesión, tipo de lesión, fecha de lesión, indicador de alta médica y observaciones médicas.
2. WHERE el indicador de lesión de una Ficha_Salud es verdadero, THE Base_Datos SHALL permitir almacenar el tipo de lesión y la fecha de lesión asociados.
3. WHILE una Ficha_Salud tiene el indicador de lesión verdadero y el indicador de alta médica falso, THE Sistema SHALL marcar al Alumno correspondiente como no apto para participar en Pelea_Programada, Torneo, ni actividades de sparring o contacto.
4. THE Sistema SHALL permitir que un Entrenador consulte y edite únicamente la Ficha_Salud de los Alumno que él mismo entrena.
5. THE Sistema SHALL permitir que un Alumno consulte, sin poder editar, su propia Ficha_Salud.

### Requirement 14: Título de campeón de división

**User Story:** Como Entrenador, quiero registrar si un alumno es campeón de una división, para reconocer su logro y mostrarlo en su perfil.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Titulo_Division vinculado a exactamente un Perfil_Deportivo, con indicador de campeón, federación y fecha desde la que ostenta el título.
2. WHERE el indicador de campeón de un Titulo_Division es verdadero, THE Base_Datos SHALL requerir que la federación asociada no esté vacía.
3. THE Sistema SHALL permitir que un Entrenador edite únicamente el Titulo_Division de los Alumno que él mismo entrena.
4. THE Sistema SHALL permitir que cualquier visitante, sin sesión autenticada, consulte el Titulo_Division de un Alumno cuyo Perfil_Deportivo es público.

### Requirement 15: Evaluaciones evolutivas de habilidades

**User Story:** Como Entrenador, quiero registrar evaluaciones periódicas de las habilidades de mis alumnos, para graficar su progreso en el tiempo.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir una Evaluacion_Habilidades vinculada a exactamente un Perfil_Deportivo y una fecha, con un valor de 0 a 100 para cada una de velocidad, potencia, resistencia, técnica, defensa y ring IQ.
2. THE Base_Datos SHALL permitir asociar múltiples Evaluacion_Habilidades a un mismo Perfil_Deportivo, una por cada fecha de evaluación.
3. WHEN un Alumno o un Entrenador consulta el progreso de habilidades de un Alumno, THE Sistema SHALL retornar sus Evaluacion_Habilidades ordenadas por fecha.
4. THE Sistema SHALL permitir que un Entrenador registre Evaluacion_Habilidades únicamente para los Alumno que él mismo entrena.
5. THE Sistema SHALL permitir que un Alumno consulte, sin poder editar, únicamente sus propias Evaluacion_Habilidades.

### Requirement 16: Objetivos del alumno

**User Story:** Como Alumno, quiero definir y dar seguimiento a mis objetivos, para medir mi avance hacia mis metas deportivas y físicas.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Objetivo_Alumno vinculado a exactamente un Perfil_Deportivo, con descripción, Tipo_Objetivo, porcentaje de progreso y fecha límite.
2. THE Base_Datos SHALL restringir el Tipo_Objetivo a uno de los valores `carrera` o `fisico`.
3. THE Sistema SHALL permitir que un Alumno gestione únicamente sus propios Objetivo_Alumno.
4. THE Sistema SHALL permitir que un Entrenador consulte, sin poder editar, los Objetivo_Alumno de los Alumno que él mismo entrena.

### Requirement 17: Registro de entrenamientos realizados

**User Story:** Como Alumno, quiero registrar cada sesión de entrenamiento que realizo, para llevar un historial de mi actividad y de mi frecuencia cardíaca.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Registro_Entrenamiento vinculado a exactamente un Perfil_Deportivo, con fecha, tipo, duración, intensidad de 1 a 10, Entrenador asociado opcional, calificación dada por el Alumno, notas y frecuencia cardíaca.
2. THE Base_Datos SHALL restringir el tipo de un Registro_Entrenamiento a uno de los valores `Sparring`, `Técnica`, `Preparación Física`, `Saco`, `Boxeo Avanzado`, `Cardio Box` o `Defensa Personal`.
3. THE Sistema SHALL permitir que un Alumno gestione únicamente sus propios Registro_Entrenamiento.
4. THE Sistema SHALL permitir que un Entrenador consulte, sin poder editar, los Registro_Entrenamiento de los Alumno que él mismo entrena.

### Requirement 18: Plan de alimentación y metas de macronutrientes

**User Story:** Como Alumno, quiero llevar un plan de alimentación con metas de macronutrientes, para complementar mi entrenamiento con una nutrición adecuada.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Plan_Alimentacion vinculado a exactamente un Perfil_Deportivo, con una colección de comidas del día, cada una con nombre, hora, alimentos, calorías y proteína.
2. THE Base_Datos SHALL definir para cada Plan_Alimentacion metas diarias de calorías, proteína, carbohidratos, grasas y agua.
3. THE Base_Datos SHALL definir un Registro_Macros vinculado a exactamente un Perfil_Deportivo y una fecha, con los valores de calorías, proteína, carbohidratos, grasas y agua efectivamente consumidos.
4. THE Sistema SHALL permitir que un Alumno gestione únicamente su propio Plan_Alimentacion y sus propios Registro_Macros.

### Requirement 19: Modo Campamento — preparación pre-pelea

**User Story:** Como Alumno, quiero activar un modo de preparación previo a una pelea, para controlar mi peso y mi plan de sesiones hasta el día del combate.

#### Acceptance Criteria

1. THE Base_Datos SHALL definir un Modo_Campamento vinculado a exactamente un Perfil_Deportivo, con oponente, fecha de la pelea, categoría de peso, número de rounds, peso objetivo y conteo de sesiones y sparrings planeados.
2. THE Base_Datos SHALL definir un Control_Peso vinculado a exactamente un Modo_Campamento, con fecha de medición y valor de peso, permitiendo múltiples Control_Peso por Modo_Campamento para formar una serie temporal.
3. THE Base_Datos SHALL relacionar cada Modo_Campamento con un plan semanal de sesiones propio del campamento.
4. THE Sistema SHALL permitir que un Alumno gestione únicamente su propio Modo_Campamento y sus propios Control_Peso.
5. THE Sistema SHALL permitir que un Entrenador consulte, sin poder editar, el Modo_Campamento de los Alumno que él mismo entrena.

### Requirement 20: Control de acceso por rol y por propiedad de datos

**User Story:** Como equipo de desarrollo, quiero que cada tabla del esquema aplique Row Level Security según el rol de la Cuenta y la propiedad de los datos, para que ningún usuario acceda a información que no le corresponde.

#### Acceptance Criteria

1. THE Base_Datos SHALL aplicar al menos una Politica_RLS a cada tabla que contenga datos específicos de una Cuenta, un Perfil_Deportivo o un Perfil_Publico_Entrenador.
2. WHILE la sesión autenticada corresponde a una Cuenta de Rol `admin` aprobada, THE Sistema SHALL permitir a dicha sesión leer y modificar los datos de todas las Cuenta, Perfil_Deportivo y Perfil_Publico_Entrenador.
3. WHILE la sesión autenticada corresponde a una Cuenta de Rol `entrenador`, THE Sistema SHALL permitir a dicha sesión leer y modificar únicamente los datos de los Alumno cuyo Perfil_Deportivo tiene Origen_Entrenador `directorio` con referencia a dicho Entrenador.
4. IF una sesión de Rol `entrenador` intenta leer o modificar los datos de un Alumno que no entrena, THEN THE Base_Datos SHALL denegar la operación.
5. WHILE la sesión autenticada corresponde a una Cuenta de Rol `usuario`, THE Sistema SHALL permitir a dicha sesión leer y modificar únicamente los datos vinculados a su propio Perfil_Deportivo.
6. IF una sesión de Rol `usuario` intenta leer o modificar los datos vinculados al Perfil_Deportivo de otro Alumno, THEN THE Base_Datos SHALL denegar la operación.
7. THE Sistema SHALL permitir el acceso sin sesión autenticada únicamente a los datos explícitamente marcados como públicos en este documento (Perfil_Publico_Entrenador, Publicacion aprobada, Contenido_Editorial, Gimnasio, Titulo_Division y Registro_Pelea de perfil público).

### Requirement 21: Fuera de alcance — emparejamiento de sparring e insights de IA

**User Story:** Como equipo de desarrollo, quiero delimitar qué funcionalidad de análisis no requiere persistencia propia en esta fase, para evitar diseñar tablas innecesarias.

#### Acceptance Criteria

1. THE Base_Datos SHALL derivar cualquier emparejamiento de sparring o insight generado dinámicamente a partir de los datos existentes de Perfil_Deportivo, Registro_Entrenamiento y Evaluacion_Habilidades, sin requerir una tabla de persistencia propia para dicho contenido.
2. WHERE en una fase posterior se decida persistir el resultado de un emparejamiento o insight generado, THE Sistema SHALL tratar dicha persistencia como una extensión fuera del alcance de este documento.
