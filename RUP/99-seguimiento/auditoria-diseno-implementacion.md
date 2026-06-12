# Auditoría diseño vs implementación

## Propósito

Este documento aplica una práctica tomada de `pySigHor`: contrastar explícitamente el diseño con el código. La intención es detectar brechas entre lo que dicen los capítulos y lo que realmente implementa la aplicación.

## Resultado general

| Área | Diseño en Capítulo 3 | Código real | Estado |
| --- | --- | --- | --- |
| Arquitectura cliente-servidor | Frontend React/Vite + backend Node/Express | `frontend/`, `backend/` | Correcto |
| MVC backend | Rutas, controladores, servicios, modelos | `routes/`, `controllers/`, `services/`, `models/` | Correcto |
| Persistencia documental | MongoDB + Mongoose | `Appointment.js`, `Admin.js`, `Service.js` | Correcto |
| Chatbot local | LM Studio OpenAI-compatible | `promptService.js`, `lmStudioService.js`, `responseParserService.js` | Correcto |
| Reglas deterministas | Fecha, hora, servicio, nombre, solapes | `chatRuleService.js`, `bookingFlowService.js`, `appointmentService.js`, `calendarService.js`, `serviceCatalog.js` | Correcto |
| Panel administrador | Login, dashboard, CRUD de citas | `AdminLogin.jsx`, `AdminDashboard.jsx`, `AdminAppointments.jsx` | Correcto |
| Seguridad básica | JWT + rutas privadas | `authMiddleware.js`, `authRoutes.js`, `appointmentRoutes.js` | Correcto |
| Contingencia IA local | Error controlado si LM Studio cae | `lmStudioService.js`, `chatController.js`, `AppError.js`, `errorMiddleware.js` | Correcto |
| Pruebas | Reglas críticas verificables | `backend/tests/` | Reforzado |

## Hallazgos y ajustes aplicados

| ID | Observación | Ajuste |
| --- | --- | --- |
| A01 | Faltaba evidencia ejecutable de reglas críticas. | Se añadieron pruebas con `node:test` para calendario, flujo de reserva y agenda. |
| A02 | La trazabilidad UC -> código estaba implícita en los capítulos, pero no viva en el repo. | Se añadió `RUP/99-seguimiento/trazabilidad-casos-uso.md`. |
| A03 | El secreto JWT tenía valor por defecto útil en local, pero peligroso si se desplegara como producción. | `env.js` ahora bloquea `NODE_ENV=production` si no se configura `JWT_SECRET`. |
| A04 | El frontend conservaba token si una ruta privada devolvía 401. | `api.js` ahora limpia token y redirige a login ante 401. |
| A05 | La web pública y el formulario administrativo duplicaban precios y opciones del catálogo. | Ambos consumen `GET /api/services`; los datos estáticos quedan únicamente como contingencia visual si la API no está disponible. |
| A06 | El flujo conversacional aceptaba algunas negaciones, fechas numéricas y respuestas compuestas de forma ambigua. | Se reforzaron extracción de nombre, preferencia de servicio, fechas, horas, cancelación y validación del turno actual en `bookingFlowService.js`. |
| A07 | Las preguntas básicas dependían de LM Studio y podían fallar si el servidor local no estaba disponible. | `chatRuleService.js` responde de forma determinista a información del negocio y `chatController.js` ofrece una contingencia segura sin exponer errores técnicos. |
| A08 | Un identificador de cita activa no estaba ligado explícitamente a su conversación. | Las modificaciones y cancelaciones del chat validan `conversationId`; las escrituras se serializan para evitar solapes simultáneos. |

## Decisiones conservadas

- No se sustituye MongoDB por SQL ni se cambia el stack: el diseño del proyecto ya está alineado con la privacidad local y LM Studio.
- No se convierte el backend en microservicios: el alcance del TFG encaja mejor con una API Express modular en MVC.
- No se delega la validación de citas en la IA: la IA conversa, pero las reglas de negocio se mantienen en servicios deterministas.

## Criterio de cierre

El estado se considera coherente cuando se cumplen estas tres comprobaciones:

```bash
npm run check --prefix backend
npm run test --prefix backend
npm run build --prefix frontend
```
