[Capítulo 3](../Capitulo_3/README.md) · [Inicio](../../../README.md) · [Capítulo 5](../Capitulo_5/README.md)

# Capítulo 4. Implementación y solución

## Solución implementada

La aplicación materializa los requisitos en dos recorridos conectados por una única API y una única base de datos.

![Navegación por casos de uso](../../../diagramas/capitulo4/imagenes/02_contexto_navegacion_casos_uso.png)

Las flechas bidireccionales representan el retorno a la web pública, el cierre del chat, la cancelación de formularios, la vuelta al panel y el cierre de sesión.

## Vista del producto

| Web pública | Chatbot | Administración |
| --- | --- | --- |
| [![Web pública](../../../diagramas/capitulo4/capturas/01_home.png)](../../../diagramas/capitulo4/capturas/01_home.png) | [![Chatbot](../../../diagramas/capitulo4/capturas/03_chat_abierto.png)](../../../diagramas/capitulo4/capturas/03_chat_abierto.png) | [![Panel](../../../diagramas/capitulo4/capturas/05_admin_dashboard.png)](../../../diagramas/capitulo4/capturas/05_admin_dashboard.png) |

## Funcionalidad del cliente

- Consulta de catálogo, precios, duración y horario.
- Apertura del chatbot desde cualquier sección pública.
- Selección del servicio por número, nombre o sinónimo.
- Comprensión de fechas relativas y horas en español.
- Reserva, modificación y cancelación.
- Tarjeta visual de confirmación.
- Respuesta controlada si LM Studio no está disponible.

## Funcionalidad administrativa

- Login protegido.
- Dashboard con próximas citas y estadísticas.
- Listado, filtrado y ordenación.
- Creación manual.
- Edición.
- Marcado como completada.
- Eliminación.
- Cierre de sesión.

## Recorrido completo de una reserva

```text
1. El cliente elige un servicio.
2. El chatbot reúne nombre, fecha y hora.
3. El backend normaliza la entrada.
4. Se calcula precio, duración, startsAt y endsAt.
5. Se comprueban calendario, horario y solapes.
6. MongoDB persiste la cita.
7. El cliente recibe la confirmación.
8. La misma cita aparece en administración.
```

La confirmación se devuelve después de persistir. Si MongoDB rechaza la operación, la interfaz no presenta la cita como confirmada.

## Comportamiento del chatbot

### Resolución determinista

Se resuelven sin modelo:

- Servicios, precios y duración.
- Horario.
- Ubicación y contacto.
- Fechas pasadas y fines de semana.
- Selecciones numéricas.
- Reserva, modificación y cancelación.
- Intentos de revelar o sustituir el prompt.

### Resolución generativa

Las consultas abiertas restantes se envían a LM Studio con:

- Prompt limitado al dominio.
- Fecha y hora de Madrid.
- Catálogo oficial.
- Historial acotado.
- Temperatura baja.
- Filtrado posterior.

### Modo degradado

Si LM Studio falla, las funciones deterministas continúan disponibles. La API devuelve una respuesta útil y no expone el error técnico al cliente.

## API principal

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/api/health` | Estado de API y MongoDB |
| GET | `/api/health/lmstudio` | Estado del modelo local |
| POST | `/api/auth/login` | Autenticación |
| GET | `/api/services` | Catálogo oficial |
| POST | `/api/chat` | Conversación y reserva |
| GET | `/api/appointments` | Listado privado |
| POST | `/api/appointments` | Alta administrativa |
| PATCH | `/api/appointments/:id` | Edición o cambio de estado |
| DELETE | `/api/appointments/:id` | Eliminación |

## Correspondencia con el código

| Función | Implementación |
| --- | --- |
| Web pública | [`HomePage.jsx`](../../../frontend/src/pages/HomePage.jsx) |
| Chat | [`ChatWidget.jsx`](../../../frontend/src/components/ChatWidget.jsx) |
| Orquestación | [`chatController.js`](../../../backend/src/controllers/chatController.js) |
| Flujo de reserva | [`bookingFlowService.js`](../../../backend/src/services/bookingFlowService.js) |
| Integridad | [`appointmentService.js`](../../../backend/src/services/appointmentService.js) |
| Modelo de cita | [`Appointment.js`](../../../backend/src/models/Appointment.js) |
| Agenda | [`AdminAppointments.jsx`](../../../frontend/src/pages/admin/AdminAppointments.jsx) |

## Resultado del capítulo

La implementación cubre la historia completa cliente-administrador. La conversación termina en una operación verificable y la agenda mantiene una única fuente de datos.

**Documentación relacionada**

- [Capítulo 4 completo](../../capitulos/04-implementacion-mapa-solucion.md)
- [API y datos](../../04-api-y-datos.md)
- [Chatbot y reglas](../../05-chatbot-y-reglas.md)
- [Capturas y diagramas](../../diagramas-y-capturas.md)

[Capítulo 3](../Capitulo_3/README.md) · [Inicio](../../../README.md) · [Capítulo 5](../Capitulo_5/README.md)
