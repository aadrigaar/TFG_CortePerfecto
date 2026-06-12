# Proyecto y objetivos

## 1. Punto de partida

La gestión de una peluquería pequeña suele depender de llamadas, mensajes y una agenda manual. Este modelo funciona con poco volumen, pero introduce interrupciones, duplicidad de información, errores de transcripción y dificultad para atender fuera del horario laboral.

Las alternativas existentes tampoco resuelven siempre el problema:

- Una agenda en papel no ofrece disponibilidad remota ni validación automática.
- WhatsApp simplifica el contacto, pero mantiene el trabajo manual de interpretar y registrar cada petición.
- Una plataforma SaaS aporta funciones, aunque introduce coste recurrente, dependencia de un proveedor y tratamiento externo de datos.
- Un chatbot puramente generativo conversa bien, pero no garantiza por sí solo la integridad de una agenda.

Corte Perfecto plantea una solución local y controlada: una web pública, un asistente conversacional y un panel de gestión conectados a una única fuente de datos.

## 2. Hipótesis

Es posible automatizar la atención básica y la reserva de citas de una peluquería mediante un chatbot local sin delegar las reglas críticas en el modelo de lenguaje.

La hipótesis se concreta en una arquitectura híbrida:

- El modelo local aporta flexibilidad lingüística.
- El backend interpreta los flujos críticos.
- MongoDB conserva el estado real.
- El panel permite la supervisión humana.

## 3. Objetivo general

Diseñar e implementar una aplicación web full-stack que permita consultar información, reservar citas mediante lenguaje natural y administrar la agenda, manteniendo privacidad local, trazabilidad técnica y reglas de negocio verificables.

## 4. Objetivos específicos

| Objetivo | Evidencia |
| --- | --- |
| Publicar un escaparate web usable | `frontend/src/pages/HomePage.jsx` |
| Exponer un catálogo único de siete opciones | `serviceCatalog.js`, `GET /api/services` |
| Mantener una conversación asistida por IA local | `ChatWidget.jsx`, `lmStudioService.js` |
| Crear y modificar reservas desde el chat | `bookingFlowService.js`, `appointmentService.js` |
| Proteger la integridad temporal de la agenda | `calendarService.js`, pruebas de solape |
| Proporcionar administración autenticada | rutas `/admin`, JWT y bcrypt |
| Centralizar la persistencia | modelos Mongoose y MongoDB |
| Mantener coherencia entre memoria y producto | `RUP/99-seguimiento/` |
| Verificar reglas críticas automáticamente | 44 pruebas en `backend/tests/` |

## 5. Actores

### Cliente

Consulta la web, pregunta por servicios, inicia una reserva, aporta sus datos, recibe una confirmación y puede modificar o cancelar la cita activa de su conversación.

### Administrador

Se autentica, revisa el dashboard, filtra la agenda y crea, edita, completa o elimina citas.

### LM Studio

Es un sistema colaborador, no una autoridad de negocio. Genera respuestas cuando las reglas deterministas no resuelven directamente la consulta.

### MongoDB

Actúa como fuente persistente de citas, administradores y catálogo sincronizado.

## 6. Alcance implementado

- Web pública responsive.
- Catálogo, precios y duración de servicios.
- Chatbot con historial acotado y contexto por conversación.
- Reserva, modificación y cancelación.
- Interpretación de fechas y horas en español.
- Panel privado con dashboard y CRUD.
- Reglas de calendario, duración y solape.
- Contingencia cuando la IA local no responde.
- Documentación RUP, diagramas y pruebas.

## 7. Fuera de alcance

- Pagos en línea.
- Notificaciones por SMS, correo o WhatsApp.
- Gestión de varios empleados o recursos simultáneos.
- Despliegue multiempresa.
- Alta disponibilidad distribuida.
- Entrenamiento de un modelo propio.

Estas exclusiones mantienen el TFG centrado en el problema principal y evitan presentar como terminado aquello que corresponde a una evolución posterior.

## 8. Metodología

El proyecto combina una organización inspirada en RUP con desarrollo incremental:

1. Definición del dominio y de los actores.
2. Especificación y priorización de casos de uso.
3. Análisis y diseño por capas.
4. Implementación vertical de cada flujo.
5. Verificación y trazabilidad contra el código.
6. Revisión del producto y documentación final.

Cada funcionalidad se cierra cuando existe interfaz, endpoint, servicio, persistencia y validación suficiente para su riesgo.

## 9. Resultado

El objetivo general se considera alcanzado porque un cliente puede completar una reserva de extremo a extremo y el administrador puede gestionarla desde la misma fuente de datos. La solución demuestra además que una IA local puede integrarse sin convertirla en responsable de reglas que deben ser exactas.

[Siguiente: arquitectura y decisiones](02-arquitectura-y-decisiones.md) · [Volver al índice](README.md)
