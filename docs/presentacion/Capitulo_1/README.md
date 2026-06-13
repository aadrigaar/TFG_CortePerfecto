[Inicio](../../../README.md) · [Presentación completa](../README.md) · [Capítulo 2](../Capitulo_2/README.md)

# Capítulo 1. Introducción, estado del arte y objetivos

## Contexto

Corte Perfecto nace de una necesidad habitual en pequeños negocios: la gestión de citas interrumpe la actividad principal. Las llamadas y los mensajes requieren responder, interpretar la solicitud, comprobar la agenda y transcribir manualmente la reserva.

En una peluquería con una plantilla reducida, esta tarea recae sobre el propio profesional. El problema no es únicamente disponer de un canal de contacto, sino convertir la petición del cliente en una cita válida, persistida y visible desde una agenda común.

## Problema identificado

La gestión manual presenta cuatro limitaciones:

1. La atención depende de que el profesional esté disponible.
2. La información sobre precios y horarios se repite constantemente.
3. La transcripción manual facilita errores y olvidos.
4. No existe una única fuente de datos para cliente y administrador.

## Estado del arte

| Alternativa | Ventaja | Limitación |
| --- | --- | --- |
| Agenda en papel | Sencillez inmediata | Sin acceso remoto, validación ni automatización |
| Llamadas y mensajería | Canal conocido por el cliente | Mantienen la interpretación y transcripción manual |
| Plataformas SaaS | Producto completo y disponible | Coste recurrente y dependencia de terceros |
| Chatbot generativo | Lenguaje natural y flexibilidad | No garantiza horario, disponibilidad ni integridad |
| Solución híbrida local | Conversación flexible y reglas verificables | Requiere diseñar aplicación, dominio y contingencias |

## Solución propuesta

La solución combina:

- Una web pública con información, catálogo y acceso al chatbot.
- Un asistente conversacional conectado a LM Studio.
- Un backend que aplica las reglas críticas de la agenda.
- MongoDB como fuente común de persistencia.
- Un panel privado para el profesional.

```text
Lenguaje natural
-> reglas deterministas
-> persistencia
-> control administrativo
```

La aportación principal no es solamente incorporar un modelo de lenguaje, sino limitar correctamente su responsabilidad:

> La IA conversa y ayuda a interpretar; el backend decide si la operación es válida.

## Objetivo general

Diseñar e implementar una plataforma web integral para consultar servicios, gestionar reservas mediante lenguaje natural y administrar la agenda de Corte Perfecto, utilizando un modelo de lenguaje ejecutado localmente.

## Objetivos específicos

| Objetivo | Resultado esperado |
| --- | --- |
| OE1. Requisitos | Identificar actores, dominio, reglas y casos de uso |
| OE2. Análisis y diseño | Definir arquitectura, datos, módulos e integración con IA |
| OE3. Implementación | Construir web, chatbot, API, persistencia y panel |
| OE4. Evaluación | Verificar integridad, seguridad y comportamiento |

## Alcance

El alcance incluye:

- Consulta de información, servicios, precios y horarios.
- Reserva, modificación y cancelación mediante chat.
- Autenticación y gestión administrativa.
- Validación de fechas, horarios, duración y solapes.
- Ejecución local de MongoDB y LM Studio.

Quedan fuera del alcance:

- Pagos.
- Notificaciones por correo o SMS.
- Varias sucursales.
- Agenda multiempleado.
- Alta disponibilidad en producción.

## Hipótesis

Una peluquería pequeña puede automatizar parte de la atención y la gestión de citas mediante IA local, siempre que las decisiones críticas permanezcan en una capa de negocio determinista y verificable.

## Resultado del capítulo

El problema queda delimitado, la propuesta se diferencia de las alternativas existentes y los objetivos establecen un alcance concreto para el resto del proyecto.

**Documentación relacionada**

- [Capítulo 1 completo](../../capitulos/01-introduccion-estado-arte-objetivos-metodologia.md)
- [Resumen del proyecto y objetivos](../../01-proyecto-y-objetivos.md)
- [Memoria oficial](../../../entregas/TFG_AdriánGarcíaArranz.pdf)

[Inicio](../../../README.md) · [Capítulo 2](../Capitulo_2/README.md)
