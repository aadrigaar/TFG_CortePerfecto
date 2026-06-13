# Especificación de casos de uso

## Propósito

Este artefacto contiene la especificación funcional completa de los casos de uso de Corte Perfecto. Complementa la memoria del TFG y la matriz de trazabilidad de `RUP/99-seguimiento/trazabilidad-casos-uso.md` sin sustituir los diagramas, criterios de aceptación ni pruebas.

## UC-01 Consultar web pública

- **Actor principal:** Cliente.
- **Precondiciones:** La aplicación web está disponible.
- **Flujo principal:** El cliente abre `/`; el frontend carga la portada, la información del negocio y los accesos a servicios y chatbot.
- **Alternativas:** Si una ruta pública no existe, React redirige a `/`.
- **Postcondición:** El cliente visualiza la información pública y puede iniciar una consulta o reserva.
- **Implementación:** `HomePage.jsx`, `siteData.js`.

## UC-02 Consultar servicios y precios

- **Actor principal:** Cliente.
- **Precondiciones:** El cliente se encuentra en la web pública.
- **Flujo principal:** La interfaz solicita el catálogo; la API devuelve los servicios sincronizados; la web muestra nombre, precio y descripción.
- **Alternativas:** Si la API no responde, la interfaz comunica el error sin crear ninguna cita.
- **Postcondición:** El cliente conoce las opciones disponibles y sus precios.
- **Implementación:** `GET /api/services`, `serviceController.js`, `serviceCatalogService.js`, `serviceApi`, `HomePage.jsx`, `ServiceCard.jsx`.

## UC-03 Pedir el detalle de una opción

- **Actor principal:** Cliente.
- **Precondiciones:** El chatbot está abierto y existe un catálogo numerado del 1 al 7.
- **Flujo principal:** El cliente pregunta por una opción; el backend resuelve el número o nombre; el chatbot devuelve contenido, precio y duración.
- **Alternativas:** Si la opción no existe, se vuelve a mostrar el catálogo válido.
- **Postcondición:** El cliente recibe información precisa sin iniciar todavía una reserva.
- **Implementación:** `ChatWidget.jsx`, `chatController.js`, `bookingFlowService.js`, `serviceCatalog.js`.

## UC-04 Abrir chat y enviar mensaje

- **Actor principal:** Cliente.
- **Precondiciones:** La web pública está cargada.
- **Flujo principal:** El cliente abre el widget, escribe un mensaje y el frontend lo envía a `POST /api/chat`; el backend aplica reglas rápidas o consulta LM Studio; la respuesta se incorpora al historial.
- **Alternativas:** Si LM Studio no está disponible, la API devuelve un error controlado; las reglas deterministas siguen atendiendo los mensajes que pueden resolver.
- **Postcondición:** La conversación queda actualizada en el cliente.
- **Implementación:** `ChatWidget.jsx`, `chatController.js`, `chatRuleService.js`, `lmStudioService.js`.

## UC-05 Reservar cita mediante chatbot

- **Actor principal:** Cliente.
- **Precondiciones:** El chatbot está abierto y MongoDB está disponible.
- **Flujo principal:** El cliente manifiesta intención de reservar; el sistema solicita los datos que faltan; se resuelven servicio, fecha y hora; el backend valida la agenda y crea la cita.
- **Alternativas:** Se rechazan nombres no válidos, fines de semana, horas fuera de 10:00 a 20:00, fechas pasadas y huecos solapados; el chatbot solicita una alternativa.
- **Postcondición:** Se persiste una cita confirmada con origen `chat`.
- **Implementación:** `POST /api/chat`, `bookingFlowService.js`, `appointmentService.js`, `calendarService.js`.

## UC-06 Elegir servicio por número

- **Actor principal:** Cliente.
- **Precondiciones:** El chatbot ha mostrado las siete opciones.
- **Flujo principal:** El cliente responde con un número del 1 al 7; el sistema lo traduce al servicio oficial, con precio y duración.
- **Alternativas:** Un número fuera del rango vuelve a mostrar el catálogo.
- **Postcondición:** El servicio elegido se incorpora al contexto de reserva.
- **Implementación:** `getServiceByOption()`, `formatNumberedServices()`, `bookingFlowService.js`.

## UC-07 Aportar nombre, día y hora

- **Actor principal:** Cliente.
- **Precondiciones:** Existe una conversación de reserva activa.
- **Flujo principal:** El sistema pregunta solamente los datos pendientes; interpreta nombre, referencias de fecha y expresiones horarias; normaliza los valores para la API.
- **Alternativas:** Los datos ambiguos o inválidos provocan una nueva pregunta concreta y no alteran la agenda.
- **Postcondición:** El sistema dispone de nombre, servicio, fecha y hora validados.
- **Implementación:** `bookingFlowService.js`, `calendarService.js`, `appointmentService.js`.

## UC-08 Recibir confirmación y tarjeta

- **Actor principal:** Cliente.
- **Precondiciones:** La cita se ha creado correctamente.
- **Flujo principal:** La API devuelve el documento de cita; el chatbot muestra el mensaje de confirmación; el frontend representa la tarjeta con los datos esenciales.
- **Alternativas:** Si la persistencia falla, no se muestra una confirmación falsa.
- **Postcondición:** El cliente dispone de una confirmación visible de la reserva.
- **Implementación:** `ChatWidget.jsx`, `format.js`, respuesta de `POST /api/chat`.

## UC-09 Modificar reserva activa por chat

- **Actor principal:** Cliente.
- **Precondiciones:** El navegador conserva `activeAppointmentId` y existe una cita activa.
- **Flujo principal:** El cliente solicita cambiar servicio, nombre, día u hora; el sistema identifica el dato nuevo; vuelve a validar todas las reglas; actualiza la misma cita.
- **Alternativas:** Si falta el nuevo valor, se pregunta de forma dirigida; si la modificación no es válida, se conserva la reserva anterior.
- **Postcondición:** La cita activa queda actualizada sin crear duplicados.
- **Implementación:** `POST /api/chat`, `bookingFlowService.js`, `updateAppointment()`.

## UC-10 Iniciar sesión como administrador

- **Actor principal:** Administrador/Peluquero.
- **Precondiciones:** Existe una cuenta administrativa y el usuario está en `/admin/login`.
- **Flujo principal:** El usuario envía sus credenciales; el backend busca la cuenta, compara el hash con bcrypt y firma un JWT; el frontend guarda el token y navega a `/admin`.
- **Alternativas:** Las credenciales incorrectas producen error y no generan sesión.
- **Postcondición:** El administrador puede acceder a las rutas protegidas.
- **Implementación:** `POST /api/auth/login`, `authController.js`, `adminService.js`, `AdminLogin.jsx`.

## UC-11 Ver dashboard

- **Actor principal:** Administrador/Peluquero.
- **Precondiciones:** La sesión administrativa es válida.
- **Flujo principal:** El frontend solicita estadísticas y próximas citas; el backend calcula citas de hoy, estados, total e ingresos estimados; el dashboard presenta el resumen.
- **Alternativas:** Un JWT inválido o caducado elimina la sesión local y redirige al login.
- **Postcondición:** El administrador obtiene una visión inmediata del estado de la agenda.
- **Implementación:** `/admin`, `GET /api/appointments/stats`, `AdminDashboard.jsx`, `getAppointmentStats()`.

## UC-12 Listar, filtrar y ordenar citas

- **Actor principal:** Administrador/Peluquero.
- **Precondiciones:** La sesión administrativa es válida.
- **Flujo principal:** El administrador entra en `/admin/citas`; selecciona estado, intervalo de fechas u orden; el frontend envía los parámetros; MongoDB devuelve la lista ordenada.
- **Alternativas:** Una consulta sin resultados muestra el estado vacío; un error de API se comunica sin alterar datos.
- **Postcondición:** La agenda visible refleja los filtros elegidos.
- **Implementación:** `GET /api/appointments`, `AdminAppointments.jsx`, `listAppointments()`.

## UC-13 Crear cita manual

- **Actor principal:** Administrador/Peluquero.
- **Precondiciones:** La sesión administrativa es válida y el usuario está en `/admin/crear`.
- **Flujo principal:** El administrador completa nombre, servicio, fecha, hora, estado y notas; el frontend envía la solicitud; el backend valida y persiste la cita con origen `admin`.
- **Alternativas:** Los datos inválidos o el solape devuelven un mensaje y mantienen el formulario para corregirlo.
- **Postcondición:** La nueva cita aparece en la agenda administrativa.
- **Implementación:** `GET /api/services`, `POST /api/appointments`, `serviceApi`, `AdminCreateAppointment.jsx`, `AppointmentForm.jsx`, `createAppointment()`.

## UC-14 Editar cita

- **Actor principal:** Administrador/Peluquero.
- **Precondiciones:** La sesión es válida y la cita existe.
- **Flujo principal:** El administrador abre el formulario modal, modifica datos y guarda; el backend combina los cambios, recalcula servicio y duración y valida el hueco excluyendo la propia cita.
- **Alternativas:** Si la cita no existe o el nuevo horario es inválido, no se guarda el cambio.
- **Postcondición:** La cita queda actualizada y la lista se recarga.
- **Implementación:** `PATCH /api/appointments/:id`, `AppointmentForm.jsx`, `updateAppointment()`.

## UC-15 Marcar cita como completada

- **Actor principal:** Administrador/Peluquero.
- **Precondiciones:** La sesión es válida y la cita no está completada ni cancelada.
- **Flujo principal:** El administrador pulsa la acción de completar; el frontend envía `status: "completed"`; el backend actualiza el documento; la agenda se recarga.
- **Alternativas:** Si la cita ya no existe, la API devuelve error y no modifica otras reservas.
- **Postcondición:** La cita figura como completada y se incluye en las estadísticas correspondientes.
- **Implementación:** `PATCH /api/appointments/:id`, `AdminAppointments.jsx`, `updateAppointment()`.

## UC-16 Eliminar cita

- **Actor principal:** Administrador/Peluquero.
- **Precondiciones:** La sesión es válida y la cita existe.
- **Flujo principal:** El administrador pulsa eliminar; la interfaz solicita confirmación; tras aceptarla, envía la petición; el backend elimina el documento y la lista se recarga.
- **Alternativas:** Si se cancela la confirmación no se envía ninguna petición; si el identificador no es válido, la API rechaza la operación.
- **Postcondición:** La cita deja de existir en MongoDB y en la agenda.
- **Implementación:** `DELETE /api/appointments/:id`, `AdminAppointments.jsx`, `deleteAppointment()`.

## UC-17 Cerrar sesión

- **Actor principal:** Administrador/Peluquero.
- **Precondiciones:** Existe una sesión administrativa activa.
- **Flujo principal:** El administrador pulsa cerrar sesión; el frontend elimina el token local y navega a `/admin/login`.
- **Alternativas:** Una respuesta 401 produce el mismo cierre automático de sesión.
- **Postcondición:** Las rutas privadas vuelven a estar protegidas para ese navegador.
- **Implementación:** `AuthContext.jsx`, `AdminLayout.jsx`, interceptor de `api.js`.

## Relación con la memoria y la exposición

- La memoria resume los casos críticos y aporta diagramas, trazabilidad y criterios de aceptación.
- Este archivo permite consultar las 17 fichas completas y relacionarlas con la implementación.
- La matriz de `RUP/99-seguimiento/trazabilidad-casos-uso.md` enlaza cada ficha con endpoints, vistas, servicios, datos y pruebas reales.
