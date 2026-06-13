# Memoria y trazabilidad

## 1. Propósito

La memoria explica el proceso académico; el repositorio demuestra el resultado ejecutable. Esta guía relaciona los cinco capítulos con artefactos concretos para que cualquier afirmación importante pueda seguirse hasta código, diagrama o prueba.

[Abrir los cinco capítulos completos en GitHub](capitulos/README.md)

## 2. Capítulo 1: introducción, estado del arte, objetivos y metodología

### Contenido

- Contexto de la peluquería y gestión manual.
- Oportunidad de la IA conversacional.
- Actores.
- Estado del arte: agenda, WhatsApp, SaaS y modelos locales.
- Hipótesis, objetivos y metodología.
- Privacidad, alcance y limitaciones.

### Evidencia en el repositorio

| Tema | Evidencia |
| --- | --- |
| Producto construido | [README principal](../README.md) |
| Objetivos | [Proyecto y objetivos](01-proyecto-y-objetivos.md) |
| IA local | [Chatbot y reglas](05-chatbot-y-reglas.md) |
| Privacidad | [Calidad y seguridad](06-calidad-seguridad-y-pruebas.md) |
| Alcance crítico | [Limitaciones y futuro](11-limitaciones-y-lineas-futuras.md) |

[Leer Capítulo 1 completo](capitulos/01-introduccion-estado-arte-objetivos-metodologia.md) · [Documento académico](../entregas/Capitulo1.docx)

## 3. Capítulo 2: disciplina de requisitos

### Contenido

- Modelo del dominio.
- Clases, objetos y estados.
- Requisitos suplementarios.
- Contexto y actores.
- Casos de uso y priorización.
- Diagramas de actividad y secuencia.
- Matrices y criterios de aceptación.

### Evidencia en el repositorio

| Tema | Evidencia |
| --- | --- |
| Clases del dominio | [Diagrama](../diagramas/capitulo2/imagenes/01_diagrama_clases_dominio.png) |
| Objetos de reserva | [Diagrama](../diagramas/capitulo2/imagenes/02_diagrama_objetos_reserva_chat.png) |
| Estados de cita | [Diagrama](../diagramas/capitulo2/imagenes/03_diagrama_estados_cita.png) |
| Contexto | [Diagrama](../diagramas/capitulo2/imagenes/04_diagrama_contexto.png) |
| Casos de uso cliente | [Diagrama](../diagramas/capitulo2/imagenes/05a_diagrama_casos_uso_cliente.png) |
| Casos de uso administrador | [Diagrama](../diagramas/capitulo2/imagenes/05b_diagrama_casos_uso_administrador.png) |
| Fichas UC-01 a UC-17 | [Especificación completa](../RUP/02-requisitos/especificacion-casos-uso.md) |
| Trazabilidad | [Matriz UC -> código -> prueba](../RUP/99-seguimiento/trazabilidad-casos-uso.md) |

[Leer Capítulo 2 completo](capitulos/02-requisitos-modelo-dominio.md) · [Documento académico](../entregas/Capitulo2.docx)

## 4. Capítulo 3: análisis y diseño

### Contenido

- Arquitectura de análisis.
- Realización de casos de uso.
- Clases y paquetes.
- Arquitectura técnica.
- Modelo de datos.
- Módulos e interfaces.
- Integración con LM Studio.
- Auditoría y plan de pruebas.

### Evidencia en el repositorio

| Tema | Evidencia |
| --- | --- |
| Arquitectura por capas | [Diagrama](../diagramas/capitulo3/imagenes/01_arquitectura_capas.png) |
| Clases MVC | [Diagrama](../diagramas/capitulo3/imagenes/07_clases_analisis_mvc.png) |
| Paquetes | [Diagrama](../diagramas/capitulo3/imagenes/08_paquetes_analisis.png) |
| Arquitectura técnica | [Diagrama](../diagramas/capitulo3/imagenes/09_arquitectura_tecnica.png) |
| Despliegue local | [Diagrama](../diagramas/capitulo3/imagenes/10_despliegue_local.png) |
| MongoDB | [Diagrama](../diagramas/capitulo3/imagenes/11_modelo_datos_mongodb.png) |
| Módulos backend | [Diagrama](../diagramas/capitulo3/imagenes/12_modulos_backend.png) |
| Integración IA | [Diagrama](../diagramas/capitulo3/imagenes/13_integracion_chat_lmstudio.png) |
| Diseño explicado | [Arquitectura](02-arquitectura-y-decisiones.md) |
| Diseño contrastado | [Auditoría diseño-implementación](../RUP/99-seguimiento/auditoria-diseno-implementacion.md) |

[Leer Capítulo 3 completo](capitulos/03-analisis-diseno.md) · [Documento académico](../entregas/Capitulo3.docx)

## 5. Capítulo 4: implementación y mapa de la solución

### Contenido

- Estado técnico y organización del código.
- Navegación.
- Web pública y chatbot.
- Panel de administración.
- Casos de uso en interfaz.
- Persistencia y verificación.
- Recorrido de una reserva.
- Revisión MVC.

### Evidencia en el repositorio

| Funcionalidad | Código o evidencia |
| --- | --- |
| Web pública | `frontend/src/pages/HomePage.jsx` |
| Chat | `frontend/src/components/ChatWidget.jsx` |
| Administración | `frontend/src/pages/admin/` |
| API | `backend/src/routes/`, `controllers/`, `services/` |
| Persistencia | `backend/src/models/` |
| Navegación | [Diagrama](../diagramas/capitulo4/imagenes/figura_4_1_mapa_navegacion.png) |
| Capturas | [Galería](diagramas-y-capturas.md) |
| API detallada | [Referencia API](04-api-y-datos.md) |
| Pruebas | [Calidad y seguridad](06-calidad-seguridad-y-pruebas.md) |

[Leer Capítulo 4 completo](capitulos/04-implementacion-mapa-solucion.md)

## 6. Capítulo 5: conclusiones y líneas futuras

### Contenido

- Cumplimiento de objetivos.
- Eficiencia e integridad.
- Resultados.
- Limitaciones.
- Recomendaciones.
- Evolución.
- Valoración del proceso.

### Evidencia en el repositorio

| Tema | Evidencia |
| --- | --- |
| Objetivos alcanzados | [Proyecto y objetivos](01-proyecto-y-objetivos.md) |
| Integridad | [Pruebas y reglas](06-calidad-seguridad-y-pruebas.md) |
| Resultados de implementación | [README](../README.md) |
| Límites reales | [Limitaciones y futuro](11-limitaciones-y-lineas-futuras.md) |
| Demostración reproducible | [Demo de defensa](08-demo-defensa.md) |

[Leer Capítulo 5 completo](capitulos/05-conclusiones-lineas-futuras.md) · [Documento académico de los Capítulos 4 y 5](../entregas/Capitulos4y5.docx)

## 7. Matriz resumida objetivo -> caso de uso -> código -> prueba

| Objetivo | Casos de uso | Implementación | Prueba |
| --- | --- | --- | --- |
| Informar al cliente | UC-01 a UC-04 | Home, catálogo y reglas de chat | Build y `chatHardening` |
| Reservar | UC-05 a UC-08 | BookingFlow + AppointmentService | BookingFlow + Appointment |
| Modificar por chat | UC-09 | Conversation ID + update | Appointment + BookingFlow |
| Autenticar administrador | UC-10 | Auth + JWT + bcrypt | Build y verificación manual |
| Gestionar agenda | UC-11 a UC-16 | Dashboard + CRUD | Appointment tests |
| Cerrar sesión | UC-17 | AuthContext + interceptor | Build frontend |

La [matriz completa](../RUP/99-seguimiento/trazabilidad-casos-uso.md) enlaza individualmente los 17 casos.

## 8. Cómo usar esta trazabilidad en la defensa

Cuando el tribunal pregunte “¿dónde está implementado?”, responde con la cadena:

```text
Necesidad -> caso de uso -> interfaz/endpoint -> servicio -> modelo -> prueba
```

Ejemplo:

```text
Evitar solapes
-> requisito suplementario de integridad
-> UC-05 y UC-13/14
-> POST/PATCH de citas
-> appointmentService.assertSlotAvailable
-> Appointment.startsAt/endsAt
-> appointmentService.test.js
```

Eso demuestra que la memoria no es una descripción aislada, sino una representación del sistema construido.

[Siguiente: demostración](08-demo-defensa.md) · [Volver al índice](README.md)
