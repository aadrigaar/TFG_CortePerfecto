# Trazabilidad de casos de uso

## Propósito

Este artefacto enlaza los casos de uso definidos en el Capítulo 2 con las piezas reales de diseño e implementación. Sigue la filosofía de `pySigHor`: cada caso de uso debe poder seguirse desde la especificación hasta el código y, cuando procede, hasta una prueba.

## Matriz UC -> implementación

| UC | Caso de uso | Entrada | Controlador / vista | Servicio o módulo principal | Modelo / datos | Prueba |
| --- | --- | --- | --- | --- | --- | --- |
| UC-01 | Consultar web pública | `/` | `HomePage.jsx` | `siteData.js` | Datos estáticos | Build frontend |
| UC-02 | Consultar servicios y precios | `/api/services` | `serviceController.js`, `ServiceCard.jsx` | `serviceCatalog.js` | Colección `servicios` sincronizada desde catálogo | Build frontend |
| UC-03 | Pedir detalle de una opción | Chat | `ChatWidget.jsx`, `chatController.js` | `bookingFlowService.js`, `serviceCatalog.js` | Catálogo 1..7 | `bookingFlowService.test.js` |
| UC-04 | Abrir chat y enviar mensaje | Chat widget | `ChatWidget.jsx`, `chatController.js` | `chatRuleService.js`, `lmStudioService.js` | Historial en cliente | Build frontend |
| UC-05 | Reservar cita por chatbot | `POST /api/chat` | `chatController.js` | `bookingFlowService.js`, `appointmentService.js`, `calendarService.js` | `appointments` | `bookingFlowService.test.js`, `appointmentService.test.js` |
| UC-06 | Elegir servicio por número | Chat | `chatController.js` | `serviceCatalog.js`, `chatRuleService.js` | Catálogo 1..7 | `bookingFlowService.test.js` |
| UC-07 | Aportar nombre, día y hora | Chat | `chatController.js` | `bookingFlowService.js`, `calendarService.js` | `appointments` | `appointmentService.test.js` |
| UC-08 | Recibir confirmación y tarjeta | Chat | `ChatWidget.jsx` | `format.js` | Documento `Appointment` devuelto por API | Build frontend |
| UC-09 | Modificar reserva activa por chat | `POST /api/chat` | `chatController.js` | `bookingFlowService.js`, `appointmentService.js` | `appointments` | `appointmentService.test.js` |
| UC-10 | Iniciar sesión administrador | `POST /api/auth/login` | `authController.js`, `AdminLogin.jsx` | `bcryptjs`, `jsonwebtoken` | `admins` | Verificación manual / build |
| UC-11 | Ver dashboard | `/admin` | `AdminDashboard.jsx` | `appointmentApi.stats()` | `appointments` | Build frontend |
| UC-12 | Listar, filtrar y ordenar citas | `GET /api/appointments` | `appointmentController.js`, `AdminAppointments.jsx` | `appointmentService.listAppointments()` | `appointments` | `appointmentService.test.js` |
| UC-13 | Crear cita manual | `POST /api/appointments` | `appointmentController.js`, `AppointmentForm.jsx` | `appointmentService.createAppointment()` | `appointments` | `appointmentService.test.js` |
| UC-14 | Editar cita | `PATCH /api/appointments/:id` | `appointmentController.js`, `AppointmentForm.jsx` | `appointmentService.updateAppointment()` | `appointments` | `appointmentService.test.js` |
| UC-15 | Marcar cita completada | `PATCH /api/appointments/:id` | `AdminAppointments.jsx` | `appointmentService.updateAppointment()` | `appointments.status` | `appointmentService.test.js` |
| UC-16 | Eliminar cita | `DELETE /api/appointments/:id` | `appointmentController.js` | `appointmentService.deleteAppointment()` | `appointments` | `appointmentService.test.js` |
| UC-17 | Cerrar sesión | Botón panel admin | `AuthContext.jsx`, `AdminLayout.jsx` | `setToken(null)` | LocalStorage | Build frontend |

## Reglas críticas cubiertas por pruebas

| Regla | Módulo | Evidencia |
| --- | --- | --- |
| No reservar en sábado o domingo. | `calendarService.js`, `appointmentService.js` | `calendarService.test.js`, `appointmentService.test.js` |
| No aceptar horas fuera de 10:00 a 20:00. | `appointmentService.js` | `appointmentService.test.js` |
| No aceptar nombres falsos o vacíos. | `appointmentService.js`, `bookingFlowService.js` | `appointmentService.test.js`, `bookingFlowService.test.js` |
| No solapar citas activas. | `appointmentService.js` | `appointmentService.test.js` |
| Aceptar catálogo numerado 1..7. | `serviceCatalog.js`, `bookingFlowService.js` | `bookingFlowService.test.js` |
| Permitir completar y eliminar citas desde el panel. | `appointmentService.js` | `appointmentService.test.js` |

## Comandos de verificación

```bash
npm run check --prefix backend
npm run test --prefix backend
npm run build --prefix frontend
```

O todo junto:

```bash
npm run verify
```

