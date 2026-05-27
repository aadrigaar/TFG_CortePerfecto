# Auditoría diseño vs implementación

## Propósito

Este documento aplica una práctica tomada de `pySigHor`: contrastar explícitamente el diseño con el código. La intención es detectar brechas entre lo que dicen los capítulos y lo que realmente implementa la aplicación.

## Resultado general

| Área | Diseño en Capítulo 3 | Código real | Estado |
| --- | --- | --- | --- |
| Arquitectura cliente-servidor | Frontend React/Vite + backend Node/Express | `frontend/`, `backend/` | Correcto |
| MVC backend | Rutas, controladores, servicios, modelos | `routes/`, `controllers/`, `services/`, `models/` | Correcto |
| Persistencia documental | MongoDB + Mongoose | `Appointment.js`, `Admin.js` | Correcto |
| Chatbot local | LM Studio OpenAI-compatible | `lmStudioService.js`, `promptService.js` | Correcto |
| Reglas deterministas | Fecha, hora, servicio, nombre, solapes | `bookingFlowService.js`, `appointmentService.js`, `calendarService.js` | Correcto |
| Panel administrador | Login, dashboard, CRUD de citas | `AdminLogin.jsx`, `AdminDashboard.jsx`, `AdminAppointments.jsx` | Correcto |
| Seguridad básica | JWT + rutas privadas | `authMiddleware.js`, `authRoutes.js`, `appointmentRoutes.js` | Correcto |
| Contingencia IA local | Error controlado si LM Studio cae | `lmStudioService.js`, `chatController.js` | Correcto |
| Pruebas | Reglas críticas verificables | `backend/tests/` | Reforzado |

## Hallazgos y ajustes aplicados

| ID | Observación | Ajuste |
| --- | --- | --- |
| A01 | Faltaba evidencia ejecutable de reglas críticas. | Se añadieron pruebas con `node:test` para calendario, flujo de reserva y agenda. |
| A02 | La trazabilidad UC -> código estaba implícita en los capítulos, pero no viva en el repo. | Se añadió `RUP/99-seguimiento/trazabilidad-casos-uso.md`. |
| A03 | El secreto JWT tenía valor por defecto útil en local, pero peligroso si se desplegara como producción. | `env.js` ahora bloquea `NODE_ENV=production` si no se configura `JWT_SECRET`. |
| A04 | El frontend conservaba token si una ruta privada devolvía 401. | `api.js` ahora limpia token y redirige a login ante 401. |

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

