# Implementation Plan: Arquitectura y base de datos (Corazón Azteca)

## Overview

Este plan convierte el diseño aprobado en una serie de pasos de codificación incrementales para TypeScript (Next.js 16 Route Handlers + Prisma ORM + PostgreSQL/SQLite). Cada paso se construye sobre los anteriores y termina cableando los componentes, de modo que no quede código huérfano. El orden es: tooling y esquema Prisma → validación Zod y manejo de errores → capa de persistencia y servicios de dominio base → autenticación y sesión → autorización por rol → servicios de dominio funcionales → Route Handlers/API → migración desde `localStorage` → cableado final.

Las pruebas basadas en propiedades usan `fast-check` (mínimo 100 iteraciones) y cada prueba implementa exactamente una de las Properties 1–26 del diseño, etiquetada con `Feature: arquitectura-base-datos, Property {n}`.

## Tasks

- [ ] 1. Configurar tooling, esquema Prisma e infraestructura de pruebas
  - [ ] 1.1 Instalar y configurar dependencias de backend y pruebas
    - Añadir Prisma (`prisma`, `@prisma/client`), `zod`, `argon2`, `fast-check` y el runner (`vitest`) al proyecto
    - Configurar `prisma/schema.prisma` con `datasource` PostgreSQL (producción) y perfil SQLite para pruebas; añadir variables de entorno `DATABASE_URL`
    - Añadir scripts de `package.json`: `prisma:generate`, `prisma:migrate`, `test` (usar `vitest --run` para ejecución única)
    - _Requirements: 1.4_

  - [ ] 1.2 Definir el esquema Prisma completo con claves, relaciones y políticas de eliminación
    - Modelar todas las entidades del diseño: `Usuario`, `DatosAlumno`, `PerfilEntrenador` (+ `Logro`, `RedSocial`, `ElementoGaleria`), `Gimnasio`, `Clase`, `Horario`, `ClaseAlumno`, `PlanEntrenamiento` (+ `ActividadEntrenamiento`), `PlanAlimenticio` (+ `PautaAlimenticia`), `SesionEntrenamiento`, `Evaluacion`, `Pelea`, `Torneo`, `Competencia`, `Mensaje`, `ContenidoPublico`, `Session`, `IntentosAcceso`
    - Definir para cada entidad una PK `id` única y no nula; expresar cada relación con FK a la PK referenciada; declarar enums de `rol` y `tipo` de contenido; referencias de imagen (`fotoRef`, `imagenRef`) como string, no base64
    - Configurar políticas de borrado: `Gimnasio→Clase` y `Torneo→Competencia` con `RESTRICT`; `Clase→Horario` y `Plan→Actividad/Pauta` con `CASCADE`; `deletedAt` en `Usuario` para soft-delete
    - Ejecutar `prisma migrate` para materializar el esquema
    - _Requirements: 2.1, 2.2, 5.1, 5.2, 6.1, 6.2, 6.5, 7.1, 7.2, 9.1, 9.2, 11.3, 12.1, 13.1, 13.2, 14.1, 14.2, 15.5_

  - [ ] 1.3 Montar la infraestructura de pruebas
    - Crear utilidades de test que migren una base efímera (SQLite en archivo temporal) con el esquema Prisma antes de cada suite y la limpien al final
    - Implementar un reloj inyectable/simulable para las propiedades temporales y un mock de almacenamiento de objetos para las de migración de imágenes
    - Crear el módulo de generadores `fast-check` por entidad que produzca valores válidos e inválidos (longitudes dentro/fuera de rango, whitespace, fechas inválidas, no numéricos, límites 0/100/600/2000/20000, Unicode)
    - _Requirements: 1.4_

- [ ] 2. Implementar validación Zod y manejo uniforme de errores
  - [ ] 2.1 Implementar la envoltura de error y los tipos de error de dominio
    - Definir el formato uniforme `{ error: { code, message, field? } }` y los códigos `VALIDATION_ERROR | DUPLICATE | NOT_FOUND | UNAUTHENTICATED | FORBIDDEN | REFERENTIAL_INTEGRITY | AUTH_FAILED | RATE_LIMITED`
    - Implementar el mapeo de errores de dominio a estados HTTP y un helper para respuestas de error de Route Handlers
    - _Requirements: 2.7, 5.4, 6.4, 6.6, 7.5, 8.6, 8.7, 9.5, 10.4, 10.5, 11.5, 12.5_

  - [ ] 2.2 Implementar los esquemas Zod de todas las entidades
    - Escribir un esquema Zod por entidad aplicando longitudes, rangos y dominios (nombres 1..100, ubicación 1..200, intensidad 0..10, duración 1..600, calificación 1..5, categorías de evaluación 0..100, contenido 1..2000, cuerpo 1..20000, `anosTrayectoria` 0..80, enum de rol y de tipo de contenido)
    - Incluir validación cruzada de `Horario` (`horaFin > horaInicio`) y de cardinalidad de colecciones hijas (1..100 actividades/pautas; 0..100 alumnos por clase)
    - Cada esquema devuelve el nombre del campo inválido para el mensaje de error
    - _Requirements: 2.1, 2.2, 2.7, 5.1, 5.4, 6.1, 6.4, 6.6, 7.1, 7.5, 8.1, 8.6, 8.7, 9.1, 9.5, 10.1, 10.4, 10.5, 11.1, 11.2, 11.5, 12.1, 12.5, 13.1, 13.2_

  - [ ]* 2.3 Escribir prueba de propiedad de validación de campos
    - **Property 1: Validación de campos de entidad**
    - **Validates: Requirements 2.1, 2.2, 2.7, 5.1, 5.4, 6.1, 6.6, 7.1, 7.5, 8.1, 8.6, 8.7, 9.1, 9.5, 10.1, 10.4, 10.5, 11.1, 11.2, 11.5, 12.1, 12.5, 13.1, 13.2**

  - [ ]* 2.4 Escribir prueba de propiedad de orden cronológico de horarios
    - **Property 3: Orden cronológico de horarios**
    - **Validates: Requirements 6.4**

  - [ ]* 2.5 Escribir prueba de propiedad de cardinalidad de colecciones hijas
    - **Property 2: Cardinalidad de colecciones hijas**
    - **Validates: Requirements 6.5, 7.2, 9.2**

  - [ ]* 2.6 Escribir prueba de propiedad de estructura completa de evaluaciones
    - **Property 25: Estructura completa de evaluaciones**
    - **Validates: Requirements 10.2**

- [ ] 3. Implementar la capa de persistencia y los servicios de dominio base
  - [ ] 3.1 Crear el cliente Prisma y los helpers de repositorio base
    - Implementar el singleton de `PrismaClient` y utilidades transaccionales que combinen validación + escritura para preservar la invariancia del estado ante rechazos
    - Implementar helpers de recuperación por identificador reutilizables por todos los servicios
    - _Requirements: 14.6_

  - [ ] 3.2 Implementar `UserService` con unicidad de identificador y asignación de rol
    - Crear usuarios validados por Zod, asignar exactamente un rol, crear `PerfilEntrenador`/`DatosAlumno` según el rol, y rechazar identificadores de acceso duplicados sin alterar el estado
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

  - [ ]* 3.3 Escribir prueba de propiedad de unicidad de claves lógicas
    - **Property 5: Unicidad de claves lógicas**
    - **Validates: Requirements 2.6, 5.5**

  - [ ] 3.4 Implementar la verificación de integridad referencial en escrituras
    - Antes de persistir, comprobar la existencia de toda entidad referenciada (alumno, entrenador, gimnasio, clase, torneo, destinatario); rechazar con `REFERENTIAL_INTEGRITY` sin persistir ni modificar
    - _Requirements: 7.4, 10.6, 11.5, 12.6, 14.3_

  - [ ]* 3.5 Escribir prueba de propiedad de integridad referencial en escrituras
    - **Property 13: Integridad referencial en escrituras**
    - **Validates: Requirements 7.4, 10.6, 11.5, 12.6, 14.3**

  - [ ]* 3.6 Escribir prueba de propiedad de ausencia de referencias colgantes
    - **Property 14: Ausencia de referencias colgantes**
    - **Validates: Requirements 14.6**

  - [ ] 3.7 Implementar la recuperación de entidades por identificador (round-trip)
    - Exponer operaciones de lectura por `id` que devuelvan la entidad equivalente preservando identificador y campos
    - _Requirements: 2.3, 5.3, 6.3, 7.3, 8.2, 9.3, 10.3, 11.4, 12.2, 13.4_

  - [ ]* 3.8 Escribir prueba de propiedad de round-trip de persistencia
    - **Property 4: Round-trip de persistencia**
    - **Validates: Requirements 2.3, 5.3, 6.3, 7.3, 8.2, 9.3, 10.3, 11.4, 12.2, 13.4**

  - [ ]* 3.9 Escribir prueba de propiedad de relaciones obligatorias por rol y agregado
    - **Property 26: Relaciones obligatorias por rol y agregado**
    - **Validates: Requirements 2.4, 2.5, 5.2, 6.1, 11.3**

- [ ] 4. Checkpoint - Validar núcleo de persistencia y validación
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implementar autenticación y gestión de sesión
  - [ ] 5.1 Implementar el cifrado de credenciales con Argon2id
    - Implementar `hash` y `verify` de credenciales; almacenar solo el hash, nunca el texto plano
    - _Requirements: 3.3_

  - [ ]* 5.2 Escribir prueba de propiedad de hashing de credenciales
    - **Property 6: Hashing de credenciales**
    - **Validates: Requirements 3.3**

  - [ ] 5.3 Implementar `AuthService.login` con creación de sesión y control de intentos
    - Autenticar por identificador + credencial, crear `Session` con `usuarioId` y `rol` copiados; rechazar con mensaje genérico idéntico ante identificador inexistente o credencial incorrecta; contabilizar fallos en `IntentosAcceso` y bloquear 15 min tras 5 fallos consecutivos
    - _Requirements: 3.1, 3.2, 3.4, 3.7_

  - [ ]* 5.4 Escribir prueba de propiedad de autenticación exitosa crea sesión coherente
    - **Property 7: Autenticación exitosa crea sesión coherente**
    - **Validates: Requirements 3.1, 3.4**

  - [ ]* 5.5 Escribir prueba de propiedad de rechazo de autenticación indistinguible
    - **Property 8: Rechazo de autenticación indistinguible**
    - **Validates: Requirements 3.2**

  - [ ] 5.6 Implementar `logout`, `resolveSession` y expiración por inactividad
    - Invalidar sesión en logout (`revokedAt`); resolver sesión desde la cookie validando no-revocada y no-expirada; invalidar tras 30 min de inactividad usando el reloj inyectable y actualizar `lastActivityAt`
    - _Requirements: 3.5, 3.6_

  - [ ]* 5.7 Escribir prueba de propiedad de invalidación de sesión por cierre
    - **Property 9: Invalidación de sesión por cierre**
    - **Validates: Requirements 3.5**

  - [ ]* 5.8 Escribir prueba de propiedad de expiración por inactividad
    - **Property 10: Expiración por inactividad**
    - **Validates: Requirements 3.6**

  - [ ]* 5.9 Escribir prueba de propiedad de bloqueo por intentos fallidos
    - **Property 11: Bloqueo por intentos fallidos**
    - **Validates: Requirements 3.7**

- [ ] 6. Implementar control de acceso por rol
  - [ ] 6.1 Implementar el mapa rol→módulos, la función de autorización y el middleware de sesión
    - Definir los conjuntos de módulos por rol; conceder acceso solo si el módulo pertenece al rol de la sesión; denegar módulo no autorizado (`FORBIDDEN`) conservando la sesión activa; exigir autenticación (`UNAUTHENTICATED`) ante módulos protegidos sin sesión; excluir rutas públicas
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.2 Escribir prueba de propiedad de autorización por rol
    - **Property 12: Autorización por rol**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 7. Checkpoint - Validar autenticación y autorización
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implementar los servicios de dominio funcionales
  - [ ] 8.1 Implementar `GymService` con política de eliminación RESTRICT
    - Registrar gimnasios validados y rechazar la eliminación cuando existan clases asociadas, conservando gimnasio y clases; extender la política de rechazo a `Torneo→Competencia` y aplicar soft-delete de `Usuario` sin dejar dependientes huérfanos
    - _Requirements: 5.3, 5.6, 14.4, 14.5_

  - [ ]* 8.2 Escribir prueba de propiedad de políticas de eliminación sin huérfanos
    - **Property 15: Políticas de eliminación sin huérfanos**
    - **Validates: Requirements 5.6, 14.4, 14.5**

  - [ ] 8.3 Implementar `ClassService`, `ScheduleService` e inscripción de alumnos
    - Crear clases (gimnasio + entrenador existentes), horarios validados por `horaFin > horaInicio`, e inscripción 0..100 alumnos vía `ClaseAlumno`
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_

  - [ ] 8.4 Implementar `TrainingPlanService` y `NutritionPlanService`
    - Asignar planes a alumnos existentes con 1..100 hijos, autor entrenador; exponer los planes asignados de cada alumno en sus módulos de entrenamientos y alimentación
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.6, 9.1, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 8.5 Escribir prueba de propiedad de visibilidad de planes asignados
    - **Property 18: Visibilidad de planes asignados**
    - **Validates: Requirements 7.6, 9.6**

  - [ ] 8.6 Implementar `TrainingSessionService` con historial ordenado y filtrado
    - Registrar sesiones validadas; consultar historial del alumno ordenado por fecha descendente; filtrar exactamente por tipo; devolver conjunto vacío sin error cuando no hay registros
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [ ]* 8.7 Escribir prueba de propiedad de consultas históricas ordenadas y filtradas por pertenencia
    - **Property 16: Consultas históricas ordenadas y filtradas por pertenencia**
    - **Validates: Requirements 8.3, 8.5, 10.7, 10.8, 12.3, 12.4**

  - [ ]* 8.8 Escribir prueba de propiedad de filtrado exacto por tipo de entrenamiento
    - **Property 17: Filtrado exacto por tipo de entrenamiento**
    - **Validates: Requirements 8.4**

  - [ ] 8.9 Implementar `EvaluationService` con progreso ordenado
    - Registrar evaluaciones para alumnos existentes con las seis categorías 0..100; consultar progreso ordenado por fecha descendente; devolver vacío sin error cuando no hay registros
    - _Requirements: 10.3, 10.7, 10.8_

  - [ ] 8.10 Implementar `FightService`, `TournamentService` y `CompetitionService`
    - Registrar peleas para alumnos existentes; crear torneos; asociar competencias a exactamente un alumno y un torneo; exponer peleas futuras del alumno en su módulo de contrincante
    - _Requirements: 11.3, 11.4, 11.6_

  - [ ]* 8.11 Escribir prueba de propiedad de visibilidad de peleas futuras
    - **Property 19: Visibilidad de peleas futuras**
    - **Validates: Requirements 11.6**

  - [ ] 8.12 Implementar `MessageService` con bandeja ordenada por pertenencia
    - Enviar mensajes validados a destinatarios existentes con fecha de envío; devolver los mensajes donde el usuario es remitente o destinatario ordenados por fecha descendente; devolver vacío sin error
    - _Requirements: 12.2, 12.3, 12.4_

- [ ] 9. Implementar los Route Handlers (API)
  - [ ] 9.1 Implementar rutas de autenticación y usuarios
    - `POST /api/auth/login`, `POST /api/auth/logout` (cookie HttpOnly, Secure, SameSite=Lax), `POST /api/users` (rol admin), cableando `AuthService` y `UserService` con el middleware de sesión y el manejo uniforme de errores
    - _Requirements: 3.1, 3.5, 2.3_

  - [ ] 9.2 Implementar rutas de gimnasios, clases y horarios
    - `POST/DELETE /api/gyms`, `POST /api/classes`, `POST /api/schedules` protegidas por rol entrenador, cableando los servicios y validadores
    - _Requirements: 5.3, 5.6, 6.3_

  - [ ] 9.3 Implementar rutas de planes, sesiones de entrenamiento y evaluaciones
    - `POST /api/training-plans`, `POST /api/nutrition-plans`, `POST /api/training-sessions`, `GET /api/training-sessions?tipo=`, `POST /api/evaluations`, `GET /api/evaluations?alumnoId=` con autorización por rol
    - _Requirements: 7.3, 8.2, 8.3, 8.4, 9.3, 10.3, 10.7_

  - [ ] 9.4 Implementar rutas de peleas, competencias y mensajería
    - `POST /api/fights`, rutas de torneos/competencias, `POST /api/messages`, `GET /api/messages` con autorización y errores uniformes
    - _Requirements: 11.4, 12.2, 12.3_

  - [ ] 9.5 Implementar rutas públicas de perfiles y contenido
    - `GET /api/public/trainers`, `GET /api/public/trainers/:id`, `GET /api/public/content` sin requerir sesión; devolver `NOT_FOUND` ante identificadores inexistentes
    - _Requirements: 13.3, 13.4, 13.5, 13.6, 13.7_

  - [ ]* 9.6 Escribir pruebas de integración del cableado de la API
    - Verificar 1–3 flujos representativos por capa: middleware de sesión, autorización por rol, respuestas de error uniformes y accesos públicos/`NOT_FOUND`
    - _Requirements: 4.4, 4.5, 13.3, 13.5, 13.6, 13.7_

- [ ] 10. Checkpoint - Validar servicios de dominio y API
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implementar la migración desde `localStorage`
  - [ ] 11.1 Implementar extracción, normalización y subida de imágenes por referencia
    - Leer las claves `corazon_azteca_*`, deserializar JSON, mapear campos al esquema destino y subir binarios `foto`/`galeria` en base64 al almacenamiento de objetos, sustituyéndolos por su referencia
    - _Requirements: 15.1, 15.2, 15.5_

  - [ ]* 11.2 Escribir prueba de propiedad de migración de imágenes por referencia
    - **Property 22: Migración de imágenes por referencia**
    - **Validates: Requirements 15.5**

  - [ ] 11.3 Implementar validación, inserción idempotente e informe de migración
    - Validar cada dato con Zod (conservar en origen y reportar los inválidos con clave/entidad/motivo, sin abortar); insertar solo si el `id` no existe ya; preservar identificadores y relaciones; acumular por entidad los conteos de migrados y rechazados
    - _Requirements: 15.3, 15.4, 15.6, 15.7_

  - [ ]* 11.4 Escribir prueba de propiedad de migración preserva identidad y relaciones
    - **Property 20: Migración preserva identidad y relaciones**
    - **Validates: Requirements 15.3**

  - [ ]* 11.5 Escribir prueba de propiedad de migración resiliente ante datos inválidos
    - **Property 21: Migración resiliente ante datos inválidos**
    - **Validates: Requirements 15.4**

  - [ ]* 11.6 Escribir prueba de propiedad de informe de migración consistente
    - **Property 23: Informe de migración consistente**
    - **Validates: Requirements 15.6**

  - [ ]* 11.7 Escribir prueba de propiedad de idempotencia de la migración
    - **Property 24: Idempotencia de la migración**
    - **Validates: Requirements 15.7**

- [ ] 12. Cableado final y semilla
  - [ ] 12.1 Cablear el punto de entrada de migración y la semilla de datos
    - Exponer la ejecución de `MigrationService` (endpoint admin o script) e integrar el cliente Prisma, el almacenamiento de objetos y los servicios; añadir semilla mínima para desarrollo
    - _Requirements: 15.2, 15.6_

  - [ ]* 12.2 Escribir prueba de integración de migración de extremo a extremo
    - Ejecutar la migración sobre un conjunto mixto contra la base de pruebas y verificar el informe, la idempotencia en segunda ejecución y las referencias de imagen
    - _Requirements: 15.3, 15.4, 15.6, 15.7_

- [ ] 13. Checkpoint final - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales (pruebas) y pueden omitirse para un MVP más rápido.
- Cada tarea referencia cláusulas de requisito específicas para trazabilidad.
- Las pruebas de propiedad usan `fast-check` con mínimo 100 iteraciones y una prueba por Property del diseño.
- Los checkpoints aseguran validación incremental.
- Las Properties 1–26 quedan cubiertas: P1 (2.3), P2 (2.5), P3 (2.4), P4 (3.8), P5 (3.3), P6 (5.2), P7 (5.4), P8 (5.5), P9 (5.7), P10 (5.8), P11 (5.9), P12 (6.2), P13 (3.5), P14 (3.6), P15 (8.2), P16 (8.7), P17 (8.8), P18 (8.5), P19 (8.11), P20 (11.4), P21 (11.5), P22 (11.2), P23 (11.6), P24 (11.7), P25 (2.6), P26 (3.9).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2", "3.1"] },
    { "id": 3, "tasks": ["2.3", "2.4", "2.5", "2.6", "3.2", "3.4", "3.7"] },
    { "id": 4, "tasks": ["3.3", "3.5", "3.6", "3.8", "3.9", "5.1", "5.3"] },
    { "id": 5, "tasks": ["5.2", "5.4", "5.5", "5.6", "6.1"] },
    { "id": 6, "tasks": ["5.7", "5.8", "5.9", "6.2", "8.1", "8.3", "8.4", "8.6", "8.9", "8.10", "8.12"] },
    { "id": 7, "tasks": ["8.2", "8.5", "8.7", "8.8", "8.11", "9.1", "9.2", "9.3", "9.4", "9.5", "11.1", "11.3"] },
    { "id": 8, "tasks": ["9.6", "11.2", "11.4", "11.5", "11.6", "11.7", "12.1"] },
    { "id": 9, "tasks": ["12.2"] }
  ]
}
```
