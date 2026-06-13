# Auditoría de la entrega final

## 1. Referencia oficial

La memoria académica oficial es:

- Archivo: [`entregas/TFG_AdriánGarcíaArranz.pdf`](../entregas/TFG_AdriánGarcíaArranz.pdf).
- Exportación: 12 de junio de 2026.
- Extensión: **100 páginas exactas**.
- SHA-256: `C936CA7C70823DFE63AA0836FD5E1C07E9F7A7AD36CF8C33614AF50BE5E53CA2`.

Un requisito expresado como “máximo 100 páginas” queda satisfecho. No equivaldría a “menos de 100 páginas”.

El PDF no se modifica desde el repositorio. Ante cualquier diferencia de redacción con documentación auxiliar, prevalece siempre esta versión.

## 2. Relación con los DOCX por capítulos

Los archivos `Capitulo1.docx`, `Capitulo2.docx`, `Capitulo3.docx` y `Capitulos4y5.docx` son entregas intermedias utilizadas para construir la memoria. El PDF final:

- Integra los cinco capítulos.
- Reordena y homogeneiza la estructura.
- Corrige y amplía análisis, tablas y diagramas.
- Incorpora índices, resumen, abstract y referencias.
- Actualiza evidencias técnicas, incluida la cifra de 44 pruebas.

Por tanto, el contenido conceptual coincide, pero los DOCX no son copias literales del PDF definitivo. Esta distinción evita presentar una versión intermedia como fuente oficial.

## 3. Correspondencia por capítulos

| Memoria final | Evidencia principal en el repositorio | Estado |
| --- | --- | --- |
| Capítulo 1. Introducción, estado del arte, objetivos y metodología | [`docs/01-proyecto-y-objetivos.md`](01-proyecto-y-objetivos.md), [`docs/capitulos/01-...`](capitulos/01-introduccion-estado-arte-objetivos-metodologia.md) | Coherente |
| Capítulo 2. Requisitos y dominio | [`RUP/02-requisitos/`](../RUP/02-requisitos/), diagramas de Capítulo 2 y especificación UC-01 a UC-17 | Coherente |
| Capítulo 3. Análisis y diseño | [`docs/02-arquitectura-y-decisiones.md`](02-arquitectura-y-decisiones.md), diagramas de Capítulo 3 y auditoría RUP | Coherente |
| Capítulo 4. Implementación | `frontend/src/`, `backend/src/`, capturas y mapa de navegación | Coherente |
| Capítulo 5. Evaluación, conclusiones y futuro | [`docs/06-calidad-seguridad-y-pruebas.md`](06-calidad-seguridad-y-pruebas.md), [`docs/11-limitaciones-y-lineas-futuras.md`](11-limitaciones-y-lineas-futuras.md) | Coherente |
| Referencias | [`docs/capitulos/06-referencias.md`](capitulos/06-referencias.md) y PDF oficial | Coherente |

## 4. Correspondencia funcional

| Afirmación de la memoria | Código actual | Evidencia |
| --- | --- | --- |
| Web pública en React/Vite | `frontend/src/pages/HomePage.jsx` | Build de producción |
| Chatbot de consulta y reserva | `ChatWidget.jsx`, `chatController.js`, `bookingFlowService.js` | Pruebas de flujo |
| API Node.js/Express | `backend/src/app.js`, rutas y controladores | Comprobación sintáctica |
| Persistencia MongoDB/Mongoose | Modelos `Appointment`, `Admin` y `Service` | Pruebas de servicios |
| Login administrativo | `authController.js`, `adminService.js`, `authMiddleware.js` | Ruta JWT y build |
| CRUD de citas | Rutas, controlador y `appointmentService.js` | Pruebas de citas |
| IA local con LM Studio | `lmStudioService.js`, `promptService.js` | Endpoint de salud y contingencia |
| Catálogo de siete servicios | `serviceCatalog.js`, `serviceCatalogService.js` | Pruebas y endpoint `/services` |
| Prevención de solapes | `assertSlotAvailable` y cola local de escritura | Pruebas de solape y concurrencia |
| Propiedad conversacional | `conversationId` y `expectedConversationId` | Prueba de conversación ajena |
| 44 pruebas automatizadas | Cuatro archivos en `backend/tests/` | `npm run test --prefix backend` |

La [matriz UC -> implementación](../RUP/99-seguimiento/trazabilidad-casos-uso.md) documenta individualmente UC-01 a UC-17.

## 5. Refuerzos posteriores al cierre del PDF

Después de exportar la memoria se reforzó el repositorio sin cambiar el alcance funcional descrito:

- `chatRequestService.js` centraliza límites, saneamiento e identificadores.
- El flujo conversacional cubre más entradas adversas y correcciones.
- Se amplió la documentación navegable y la preparación de defensa.
- Se hizo explícita la trazabilidad entre casos de uso, código y pruebas.

Estos cambios son compatibles con la arquitectura de la memoria. Son endurecimiento y evidencia adicional, no una sustitución del sistema presentado.

Si el tribunal pregunta por `chatRequestService.js`, la respuesta correcta es:

> “Es una extracción posterior de responsabilidades de entrada que refuerza el pipeline descrito en la memoria. No modifica el caso de uso; hace explícitos el saneamiento y los límites antes de orquestar el mensaje.”

## 6. Contenido comercial del prototipo

La portada contiene dirección, teléfono, testimonios y valoración de demostración. Sirven para completar la interfaz del prototipo, pero no son resultados medidos ni evidencia de validación comercial.

En la defensa:

- No presentes “4,9 estrellas” como dato real.
- No presentes los testimonios como entrevistas verificadas.
- No uses esos textos para justificar el éxito del sistema.
- Centra los resultados en flujo funcional, integridad, trazabilidad y pruebas.

## 7. Alcance que sí puede defenderse

Puede afirmarse:

- Existe un recorrido completo desde cliente hasta administración.
- Las reglas críticas se validan en backend.
- La inferencia puede ejecutarse en local.
- La caída de LM Studio tiene respuesta controlada.
- Los 17 casos de uso están trazados.
- Hay 44 pruebas automatizadas, comprobación sintáctica y build.

No debe afirmarse:

- Que el chatbot sea infalible para cualquier entrada.
- Que el sistema esté certificado para producción.
- Que la ejecución local garantice por sí sola el RGPD.
- Que exista alta disponibilidad o concurrencia distribuida.
- Que haya pagos, avisos, multiempleado o varias sedes.

## 8. Limpieza del repositorio

Se conservan:

- PDF final oficial.
- DOCX de los capítulos como evidencia intermedia.
- Código fuente y pruebas.
- Diagramas fuente e imágenes.
- Artefactos RUP.
- Documentación y material de defensa.

Se retiran de la versión pública:

- D0 y D1, porque son propuestas administrativas históricas, duplican información ya consolidada y contienen datos personales innecesarios para la defensa.
- Copias personales del DOCX final y respaldos, que permanecen ignorados localmente.
- Entornos, dependencias, secretos, temporales y material externo de ejemplo.

## 9. Resultado de la revisión

El repositorio representa correctamente el producto descrito en la memoria y añade evidencias técnicas más precisas. La correspondencia es funcional y arquitectónica, no una identidad literal entre todos los documentos intermedios.

La formulación más rigurosa para la defensa es:

> “El PDF entregado es la memoria oficial. El repositorio implementa el mismo alcance, mantiene trazabilidad de los 17 casos de uso y añade refuerzos posteriores de validación, pruebas y documentación sin cambiar la arquitectura ni las funcionalidades defendidas.”

[Empezar la defensa](00-defensa-paso-a-paso.md) · [Ver trazabilidad completa](07-memoria-y-trazabilidad.md) · [Abrir PDF oficial](../entregas/TFG_AdriánGarcíaArranz.pdf)
