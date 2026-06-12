# Guion de defensa de 20 minutos

## Distribución

| Tiempo | Bloque | Resultado |
| ---: | --- | --- |
| 0:00-1:00 | Apertura | Presentar problema y propuesta |
| 1:00-3:00 | Contexto y estado del arte | Justificar la necesidad |
| 3:00-4:30 | Objetivos y alcance | Delimitar qué se ha construido |
| 4:30-6:30 | Requisitos y dominio | Explicar actores y casos críticos |
| 6:30-9:30 | Arquitectura y decisiones | Defender la ingeniería |
| 9:30-13:30 | Demostración | Probar el recorrido completo |
| 13:30-15:30 | Chatbot | Explicar el diseño híbrido |
| 15:30-17:30 | Calidad y seguridad | Mostrar evidencias |
| 17:30-19:00 | Resultados y limitaciones | Evaluación crítica |
| 19:00-20:00 | Conclusión | Cerrar con aportación y futuro |

## 0:00-1:00. Apertura

> “Buenos días. Soy Adrián García Arranz y presento Corte Perfecto, una aplicación web para automatizar la atención y la gestión de citas de una peluquería mediante un chatbot con inteligencia artificial local.”

> “El problema no era solo crear un chat. El reto era que la conversación terminara en una agenda consistente: sin citas pasadas, fuera de horario o solapadas, y manteniendo el control del profesional.”

Idea que debe quedar clara: **conversación flexible e integridad determinista**.

## 1:00-3:00. Contexto y estado del arte

> “En un negocio pequeño, una llamada o un mensaje interrumpe el trabajo. Después hay que interpretar la petición, comprobar disponibilidad y transcribirla. Ese proceso es repetitivo y propenso a errores.”

Explica brevemente:

- Papel y llamadas: simples, pero sin automatización.
- WhatsApp: mejora el canal, no elimina el trabajo manual.
- SaaS: completo, pero con coste y dependencia externa.
- Chatbot generativo: flexible, pero insuficiente para garantizar reglas.

> “Mi propuesta combina lo mejor de dos enfoques: lenguaje natural mediante un modelo local y reglas de negocio implementadas en código.”

## 3:00-4:30. Objetivos y alcance

> “El objetivo general ha sido construir una solución full-stack que permita consultar información, reservar por conversación y administrar la agenda desde una única fuente de datos.”

Enumera solo cuatro objetivos:

1. Web pública accesible.
2. Chatbot local para consulta y reserva.
3. Panel autenticado.
4. Integridad y pruebas.

Aclara alcance:

> “El proyecto no incluye pagos ni notificaciones externas. He preferido cerrar correctamente el flujo principal antes que añadir integraciones superficiales.”

## 4:30-6:30. Requisitos y dominio

Muestra casos de uso o dominio.

> “Existen dos actores humanos: cliente y administrador. El cliente consulta y reserva; el administrador supervisa y gestiona.”

Casos críticos:

- UC-05: reservar por chatbot.
- UC-09: modificar reserva activa.
- UC-10: iniciar sesión.
- UC-12 a UC-16: gestión administrativa.

> “La entidad central es la cita. Guarda no solo fecha y hora, sino inicio y fin, porque la duración de cada servicio cambia el intervalo que debe quedar libre.”

Explica estados: pending, confirmed, completed y cancelled.

## 6:30-9:30. Arquitectura y decisiones

Muestra la arquitectura por capas.

> “El frontend está desarrollado en React y consume una API Express. El backend mantiene rutas, controladores, servicios y modelos Mongoose. MongoDB persiste la agenda y LM Studio ejecuta el modelo en local.”

Defiende tres decisiones:

### IA local

> “Evita enviar la conversación a una API externa, elimina coste por uso y permite una demostración autónoma.”

### Backend determinista

> “La IA no calcula disponibilidad. El servicio de citas valida calendario, duración, solapes y propiedad de conversación.”

### Monolito modular

> “Para este alcance, los microservicios añadirían despliegue y coordinación sin aportar una ventaja real. La modularidad interna ya separa responsabilidades.”

## 9:30-13:30. Demostración

Sigue [el recorrido preparado](08-demo-defensa.md):

1. Web y catálogo.
2. Pregunta informativa.
3. Reserva.
4. Panel y persistencia.

No narres cada clic. Explica el valor técnico de lo que aparece.

Frases útiles:

> “El catálogo es único: interfaz, chat y backend comparten precio y duración.”

> “La hora natural se normaliza antes de validar.”

> “La confirmación se genera después de persistir.”

> “La misma cita aparece en administración porque ambos canales comparten MongoDB.”

## 13:30-15:30. Diseño del chatbot

Muestra el pipeline.

> “Cada mensaje pasa primero por saneamiento. Después, el flujo de reservas y las preguntas frecuentes intentan resolverlo de forma determinista. Solo las consultas abiertas llegan a LM Studio.”

Explica:

- Historial limitado.
- Mensajes limitados.
- Negaciones y cambios de servicio.
- Fechas y horas en español.
- Conversación propietaria.
- Contingencia sin LM Studio.

> “Esto reduce alucinaciones y mantiene disponible la función principal incluso si la parte generativa falla.”

## 15:30-17:30. Calidad y seguridad

> “El proyecto dispone de 44 pruebas automatizadas y un comando único que valida sintaxis, tests y build.”

Destaca:

- Fines de semana.
- Horas pasadas.
- Solapes.
- Concurrencia local.
- Modificación desde otra conversación.
- Prompt injection.
- Caída de LM Studio.

Seguridad:

- bcrypt.
- JWT.
- Rutas privadas.
- Helmet y CORS.
- Rate limiting.
- Secretos fuera de Git.

> “No presento la IA como una barrera de seguridad. La seguridad y las reglas están en el servidor.”

## 17:30-19:00. Resultados y limitaciones

Resultados:

- Recorrido completo cliente-administrador.
- Una única agenda.
- Menos intervención manual.
- Privacidad local.
- Trazabilidad desde requisitos a pruebas.

Limitaciones:

- Una peluquería y un recurso de agenda.
- Ejecución local.
- Sin recordatorios ni pagos.
- Cola de concurrencia válida para una instancia.

> “Reconocer estas limitaciones no resta valor; marca qué está validado y qué requeriría otra iteración.”

## 19:00-20:00. Conclusión

> “Corte Perfecto demuestra que se puede incorporar inteligencia artificial a un proceso real sin delegarle aquello que exige exactitud.”

> “La aportación principal es la combinación de conversación local, reglas verificables y administración integrada. El cliente obtiene atención inmediata y el profesional mantiene el control de la agenda.”

> “Como evolución, priorizaría notificaciones, gestión multiempleado y un despliegue con concurrencia distribuida. Muchas gracias.”

Detente. No añadas nuevas explicaciones después de “Muchas gracias”.

## Reglas de exposición

- Habla de decisiones, no de listas de tecnologías.
- Cada diagrama debe responder una pregunta.
- No leas texto largo de la pantalla.
- No afirmes que “nunca falla”.
- Si no conoces una respuesta, separa lo implementado de una posible evolución.
- Mantén 4 minutos de margen mental para la demo; es el bloque más variable.
- Ensaya hasta quedar entre 18:30 y 19:30.

## Tarjeta de memoria

```text
Problema -> interrupciones y errores manuales
Propuesta -> web + chat local + panel
Clave -> IA conversa, backend decide
Prueba -> reserva visible en administración
Calidad -> 44 tests + seguridad
Límite -> local, un recurso, sin pagos
Aportación -> flexibilidad con integridad
```

[Siguiente: preguntas del tribunal](10-preguntas-del-tribunal.md) · [Volver al índice](README.md)
