# Presentación oral del Trabajo Fin de Grado

## Corte Perfecto

**Desarrollo de una plataforma web integral de gestión de citas para una peluquería con asistencia inteligente basada en modelos de lenguaje de ejecución local**

**Autor:** Adrián García Arranz

## 1. Apertura

Buenos días. Soy Adrián García Arranz y presento Corte Perfecto, una plataforma web para gestionar las citas de una peluquería mediante una web pública, un chatbot con inteligencia artificial local y un panel privado de administración.

El reto principal no ha sido únicamente crear un chat. El objetivo ha sido conseguir que una conversación termine en una agenda consistente: sin citas pasadas, fuera de horario o solapadas, y manteniendo el control del profesional.

La idea central del proyecto es que la inteligencia artificial conversa, pero el backend valida y decide.

## 2. Problema y propuesta

En un negocio pequeño, cada llamada o mensaje interrumpe el trabajo. Después hay que interpretar la solicitud, comprobar la agenda y transcribir la información manualmente. Este proceso es repetitivo y propenso a errores.

Las agendas en papel no ofrecen automatización. La mensajería mejora el canal, pero mantiene el trabajo manual. Las plataformas SaaS aportan funcionalidad, aunque añaden coste y dependencia. Un chatbot generativo ofrece flexibilidad, pero no garantiza por sí solo las reglas de la agenda.

Corte Perfecto combina un modelo local para lenguaje natural con servicios deterministas que validan el negocio.

El objetivo general ha sido construir una solución full-stack que permita informar, reservar mediante conversación y administrar una única agenda.

El alcance incluye la consulta de servicios, la reserva, modificación y cancelación, el panel administrativo y la integridad de la agenda. No incluye pagos, notificaciones, varias sedes ni agenda multiempleado.

El desarrollo se ha organizado de forma incremental. Primero se delimitó el problema y se compararon alternativas. Después se modelaron el dominio, los actores y los casos de uso. A partir de esos requisitos se diseñaron la arquitectura, los datos y las colaboraciones. Finalmente se implementó la solución y se verificó su correspondencia con los artefactos anteriores.

Este orden ha permitido que las decisiones técnicas no aparezcan de forma aislada. Por ejemplo, la necesidad de evitar solapes se convierte en un requisito, se representa en los casos de uso de reserva y gestión, se implementa en el servicio de citas y termina cubierta por pruebas automatizadas.

## 3. Requisitos y dominio

El sistema tiene dos actores. El cliente consulta información y gestiona una reserva. El administrador inicia sesión y controla la agenda.

Se han definido 17 casos de uso. Los más representativos son UC-05, reservar mediante chatbot; UC-09, modificar la reserva activa; UC-10, iniciar sesión; y UC-12 a UC-16, gestionar las citas.

La entidad principal es la cita. Guarda el nombre, servicio, precio, duración, fecha y hora, pero también el inicio y el final del intervalo. Esto permite comparar correctamente servicios con distinta duración.

Los estados pendientes y confirmados bloquean horario. Los estados completado y cancelado ya no deben impedir nuevas reservas.

Las reglas principales son: trabajar de lunes a viernes, abrir de diez a veinte horas, terminar el servicio antes del cierre, utilizar el catálogo oficial y evitar solapes.

![Diagrama de contexto](diagramas/capitulo2/imagenes/04_diagrama_contexto.png)

El modelo también distingue entre la fecha y hora que se muestran al usuario y el intervalo real utilizado para calcular disponibilidad. La aplicación conserva `date` y `time` para la interfaz, pero genera `startsAt` y `endsAt` a partir de la duración oficial del servicio. Así, un servicio de sesenta minutos no se trata como si ocupara lo mismo que uno de treinta.

La especificación completa cubre UC-01 a UC-09 para el cliente y UC-10 a UC-17 para el administrador. Además del flujo principal, cada caso documenta precondiciones, alternativas y postcondiciones. Esto permite tratar errores como parte del sistema: una fecha pasada, un servicio inexistente o un token inválido no son situaciones improvisadas, sino escenarios previstos.

## 4. Arquitectura y diseño

El frontend está desarrollado con React y Vite. Consume una API Node.js y Express mediante Axios. El backend separa rutas, controladores, servicios y modelos Mongoose. MongoDB persiste la agenda y LM Studio ejecuta el modelo de lenguaje en local.

Axios es el cliente HTTP utilizado por React para comunicarse con la API. Centraliza las peticiones JSON, permite añadir el token de autenticación y ofrece un tratamiento uniforme de errores. No contiene reglas de negocio: simplemente transporta la información entre interfaz y servidor.

Se ha elegido un monolito modular porque el alcance no justifica la complejidad de microservicios. La separación interna mantiene las responsabilidades aisladas y facilita el mantenimiento.

MongoDB encaja con documentos autocontenidos como las citas, mientras que Mongoose aporta esquemas, validación e índices.

LM Studio permite ejecutar el modelo sin enviar conversaciones a una API externa y elimina el coste por petición.

La decisión más importante es mantener las reglas críticas en el backend. El modelo no calcula disponibilidad, no decide el precio y no escribe directamente en la base de datos.

El catálogo también está centralizado. El servidor recalcula precio y duración y no confía en valores enviados por el cliente.

![Arquitectura técnica](diagramas/capitulo3/imagenes/09_arquitectura_tecnica.png)

Dentro del backend, las rutas definen el contrato HTTP, los controladores coordinan cada petición y los servicios contienen las reglas del dominio. `calendarService` interpreta fechas y horarios; `appointmentService` valida y persiste citas; `bookingFlowService` mantiene el proceso conversacional; y `lmStudioService` encapsula la comunicación con el modelo.

Esta separación reduce el acoplamiento. Cambiar el modelo cargado en LM Studio no obliga a modificar la agenda, y cambiar una pantalla no altera las reglas de disponibilidad. También permite probar los servicios sin arrancar toda la interfaz.

## 5. Trazabilidad

La memoria está conectada con la implementación mediante una matriz que relaciona cada caso de uso con su interfaz, endpoint, controlador, servicio, modelo y prueba.

Por ejemplo, la prevención de solapes afecta a la reserva por chat y a la creación o edición administrativa. Las peticiones llegan a la API, pasan por `appointmentService`, utilizan los intervalos `startsAt` y `endsAt` del modelo y están cubiertas por las pruebas del servicio de citas.

Esta cadena demuestra que los diagramas y requisitos no están aislados del producto construido.

La trazabilidad también evita afirmar funcionalidades que el código no cubre. Los 17 casos de uso tienen una implementación identificada y un estado verificable. En los riesgos más importantes, como solapes, propiedad de una reserva o caída de LM Studio, la cadena llega además hasta una prueba automatizada.

## 6. Solución implementada

La web pública presenta la peluquería, el catálogo y el acceso al asistente. El cliente puede elegir un servicio por número o nombre, aportar sus datos con lenguaje natural y recibir una tarjeta de confirmación.

El backend normaliza la entrada, calcula el intervalo, comprueba calendario, horario y solapes, y persiste la cita. La confirmación solo se genera después de que MongoDB acepte la operación.

El panel administrativo utiliza la misma base de datos. El profesional puede consultar, filtrar, crear, editar, completar y eliminar citas.

El recorrido completo es: el cliente conversa, el backend valida, MongoDB persiste y el administrador recibe la misma reserva sin tener que transcribirla.

![Navegación por casos de uso](diagramas/capitulo4/imagenes/02_contexto_navegacion_casos_uso.png)

| Web pública | Chatbot | Administración |
| --- | --- | --- |
| ![Inicio](diagramas/capitulo4/capturas/01_home.png) | ![Chat](diagramas/capitulo4/capturas/03_chat_abierto.png) | ![Panel](diagramas/capitulo4/capturas/05_admin_dashboard.png) |

En una reserva, el sistema identifica el servicio, solicita únicamente los datos que faltan y normaliza expresiones como “el próximo martes” o “a las cinco y media”. Antes de guardar, obtiene del catálogo el precio y la duración, calcula el intervalo completo y comprueba calendario laboral, horario de apertura y citas activas.

La modificación reutiliza la misma lógica de integridad, pero excluye la propia cita al buscar solapes. Además, las operaciones conversacionales quedan asociadas a un identificador de conversación para impedir que un usuario modifique desde otro contexto una reserva que no le corresponde.

En administración, el token JWT protege el listado y todas las operaciones de escritura. El panel no mantiene una agenda paralela: consulta y modifica exactamente la misma colección utilizada por el chatbot.

## 7. Chatbot

El chatbot utiliza un pipeline híbrido.

En primer lugar se sanean el mensaje, el historial y los identificadores. Después, el flujo determinista intenta resolver reservas, modificaciones y cancelaciones.

Las preguntas conocidas, como servicios, precios u horario, también se contestan sin utilizar el modelo.

Solo las consultas abiertas restantes llegan a LM Studio. El prompt limita la conversación al dominio, incorpora el catálogo y utiliza una temperatura baja. La respuesta se filtra antes de mostrarse.

Si LM Studio no está disponible, las operaciones deterministas continúan funcionando. El sistema devuelve una contingencia útil y nunca confirma una cita que no haya sido persistida.

La entrada está limitada en tamaño y el historial acepta únicamente roles conocidos. También se detectan intentos de revelar el prompt o sustituir las instrucciones internas. Las respuestas del modelo se limpian y se limitan antes de llegar a la interfaz.

Este diseño no pretende afirmar que un modelo generativo nunca pueda responder de manera imperfecta. La garantía real es más concreta: una respuesta abierta puede degradarse, pero no puede saltarse el catálogo, inventar disponibilidad, crear un solape o confirmar datos que MongoDB no haya guardado.

## 8. Calidad y seguridad

El repositorio dispone de un comando único de verificación:

```bash
npm run verify
```

Este comando comprueba la sintaxis del backend, ejecuta 44 pruebas automatizadas y genera el build de producción del frontend.

Las pruebas cubren fechas pasadas, fines de semana, horas naturales, servicios, nombres, solapes, concurrencia local, propiedad de conversación, entradas adversas, caída de LM Studio y filtrado de respuestas.

La seguridad utiliza bcrypt para las contraseñas, JWT para las rutas privadas, Helmet, CORS, rate limiting y validación de entrada. Los secretos quedan fuera del repositorio.

![Estado de los casos de uso](RUP/99-seguimiento/estado-casos-uso.png)

La prevención de solapes incluye una serialización local de las operaciones críticas. Si dos solicitudes intentan reservar simultáneamente el mismo intervalo en una instancia del backend, el servicio las procesa de manera ordenada y la segunda vuelve a comprobar la disponibilidad.

La aplicación incluye además dos comprobaciones de salud. Una separa el estado de la API y MongoDB; la otra comprueba LM Studio de forma independiente. De este modo, una caída del modelo no se confunde con una caída completa del sistema.

## 9. Resultados y limitaciones

El proyecto cubre el recorrido completo entre cliente y administrador. La agenda mantiene una única fuente de datos, las reglas críticas están verificadas y la inferencia puede ejecutarse localmente.

Los objetivos específicos se consideran cumplidos. Los requisitos están formalizados mediante dominio y casos de uso; la arquitectura separa interfaz, API, negocio, datos e IA; el producto incorpora los dos recorridos previstos; y la evaluación dispone de pruebas, build y trazabilidad.

La ejecución local aporta privacidad y elimina el coste por petición a una API externa, aunque no equivale por sí sola a una certificación de protección de datos. Un despliegue real exigiría completar políticas de conservación, copias de seguridad, HTTPS, gestión de secretos y observabilidad.

Las limitaciones principales son la ejecución local, una única agenda, la ausencia de pagos y notificaciones, y una cola de concurrencia válida para una instancia del backend.

Estas limitaciones delimitan lo que ha sido demostrado y permiten priorizar la evolución.

Las siguientes mejoras serían recordatorios, gestión multiempleado, recuperación de reservas, despliegue con HTTPS, concurrencia distribuida y pruebas end-to-end.

## 10. Conclusión

Corte Perfecto demuestra que es posible incorporar inteligencia artificial a un proceso real sin delegarle aquello que exige exactitud.

La aportación principal es combinar conversación local, reglas verificables, persistencia común y administración integrada. El cliente obtiene atención inmediata y el profesional mantiene el control de la agenda.

El modelo ayuda a comprender al usuario; el sistema conserva la responsabilidad sobre la operación.

Muchas gracias.

---

[Capítulo 1](Capitulo_1/README.md) · [Capítulo 2](Capitulo_2/README.md) · [Capítulo 3](Capitulo_3/README.md) · [Capítulo 4](Capitulo_4/README.md) · [Capítulo 5](Capitulo_5/README.md) · [Memoria oficial](entregas/TFG_AdriánGarcíaArranz.pdf)
