# Presentación oral del Trabajo Fin de Grado

## Corte Perfecto

**Desarrollo de una plataforma web integral de gestión de citas para una peluquería con asistencia inteligente basada en modelos de lenguaje de ejecución local**

**Autor:** Adrián García Arranz<br>
**Duración:** 15 minutos

| Bloque | Tiempo | Evidencia principal |
| --- | ---: | --- |
| Puesta en contexto | 3 minutos | Problema y modelo del dominio |
| Requisitos | 2 minutos | Actores, casos de uso y contexto |
| Caso representativo | 3 minutos | Cascada completa de UC-05 |
| Demostración | 5 minutos | Reserva y administración |
| Conclusiones | 2 minutos | Objetivos, resultados y evolución |

## 1. Puesta en contexto y modelo del dominio

Buenos días. Soy Adrián García Arranz y presento Corte Perfecto, una plataforma web para gestionar las citas de una peluquería mediante una web pública, un chatbot con inteligencia artificial local y un panel privado de administración.

En un negocio pequeño, cada llamada o mensaje interrumpe el trabajo. El profesional debe interpretar la solicitud, consultar la agenda y transcribir manualmente la información. Este proceso es repetitivo, depende de su disponibilidad y puede producir errores.

Las agendas en papel no ofrecen automatización. La mensajería mejora el canal, pero mantiene el trabajo manual. Las plataformas SaaS aportan funcionalidad, aunque añaden coste y dependencia. Por otra parte, un chatbot puramente generativo ofrece flexibilidad, pero no garantiza por sí solo el horario, la disponibilidad ni la integridad de la agenda.

Corte Perfecto combina ambos enfoques: utiliza lenguaje natural para atender al cliente y servicios deterministas para validar las operaciones.

> La inteligencia artificial conversa; el backend valida y decide.

![Modelo del dominio](../../diagramas/capitulo2/imagenes/01_diagrama_clases_dominio.png)

La entidad central es la cita. Está relacionada con el cliente, el servicio, la agenda y la conversación. Además de la fecha y hora visibles, guarda `startsAt` y `endsAt`, que representan el intervalo completo ocupado.

Por ejemplo, un Corte y Peinado comienza a las 17:00 y dura 50 minutos, por lo que termina a las 17:50. Esta representación permite comparar correctamente servicios con duraciones diferentes.

El objetivo general ha sido construir una solución full-stack que permita informar, reservar mediante conversación y administrar una única agenda. El alcance incluye consulta de servicios, reserva, modificación, cancelación y gestión administrativa. No incluye pagos, notificaciones, varias sedes ni agenda multiempleado.

## 2. Requisitos, actores y contexto

El sistema tiene dos actores:

- El cliente consulta información y gestiona su reserva mediante el chatbot.
- El administrador inicia sesión y controla la agenda desde un entorno privado.

Se han definido 17 casos de uso. UC-01 a UC-09 corresponden al recorrido del cliente y UC-10 a UC-17 al panel administrativo.

Los más representativos son UC-05, reservar por chatbot; UC-09, modificar una reserva; UC-10, iniciar sesión; y UC-12 a UC-16, consultar y gestionar citas.

![Diagrama de contexto](../../diagramas/capitulo2/imagenes/04_diagrama_contexto.png)

Las reglas principales son:

- La peluquería abre de lunes a viernes, de 10:00 a 20:00.
- El servicio debe finalizar antes del cierre.
- El nombre y el servicio deben ser válidos.
- Precio y duración proceden del catálogo oficial.
- Las citas activas no pueden solaparse.
- Las rutas administrativas requieren autenticación.

Los estados `pending` y `confirmed` bloquean un hueco. Los estados `completed` y `cancelled` no lo bloquean porque la cita ya ha finalizado o ha sido anulada.

## 3. Caso representativo: UC-05

UC-05, reservar una cita mediante el chatbot, concentra el principal valor y la complejidad técnica del proyecto.

```text
Cliente
-> ChatWidget
-> POST /api/chat
-> chatController
-> bookingFlowService
-> appointmentService
-> Appointment
-> MongoDB
-> panel administrativo
```

![Arquitectura técnica](../../diagramas/capitulo3/imagenes/09_arquitectura_tecnica.png)

El recorrido comienza en `ChatWidget`, desarrollado con React. Axios envía el mensaje, el historial y el identificador de conversación a la API.

Express recibe `POST /api/chat` y dirige la petición a `chatController`. El controlador normaliza la entrada y delega el proceso en los servicios.

`bookingFlowService` identifica la intención y reúne progresivamente nombre, servicio, fecha y hora. Cuando dispone de esos datos, `appointmentService` aplica las reglas críticas:

1. Comprueba que el nombre es válido.
2. Resuelve el servicio contra el catálogo oficial.
3. Recalcula precio y duración.
4. Valida día laborable, fecha futura y horario.
5. Calcula `startsAt` y `endsAt`.
6. Busca conflictos con citas activas.
7. Guarda la cita mediante Mongoose.

Existe solape cuando una cita existente comienza antes de que termine la nueva y termina después de que empiece la nueva:

```text
existente.startsAt < nueva.endsAt
y
existente.endsAt > nueva.startsAt
```

La confirmación solo se devuelve después de que MongoDB haya aceptado la operación. Si la persistencia o alguna validación falla, el sistema no presenta una cita falsa como confirmada.

LM Studio queda encapsulado en `lmStudioService` y se utiliza para consultas abiertas. Los servicios, precios, horarios y operaciones de agenda disponen de resolución determinista. Por ello, una respuesta generativa puede degradarse, pero no puede saltarse las reglas ni escribir directamente en la base de datos.

[Trazabilidad completa de UC-05](../../RUP/99-seguimiento/trazabilidad-casos-uso.md)

## 4. Demostración de la solución

La demostración reproduce UC-05 de extremo a extremo:

1. La web pública presenta Corte Perfecto y el catálogo.
2. El cliente abre el chatbot y consulta los servicios.
3. Selecciona una opción.
4. Introduce nombre, fecha y hora.
5. El backend valida y persiste la cita.
6. React muestra la tarjeta de confirmación.
7. El administrador inicia sesión.
8. La misma cita aparece en el panel.

![Navegación por casos de uso](../../diagramas/capitulo4/imagenes/02_contexto_navegacion_casos_uso.png)

| Web pública | Chatbot | Administración |
| --- | --- | --- |
| ![Inicio](../../diagramas/capitulo4/capturas/01_home.png) | ![Chat](../../diagramas/capitulo4/capturas/03_chat_abierto.png) | ![Panel](../../diagramas/capitulo4/capturas/05_admin_dashboard.png) |

El recorrido técnico completo es:

```text
React
-> Axios
-> Express
-> servicios de dominio
-> validación
-> MongoDB
-> panel administrativo
```

El panel no mantiene una agenda paralela. Después del login, Axios incorpora el JWT y consulta la misma colección de MongoDB utilizada por el chatbot. De esta forma, cliente y administrador comparten una única fuente de datos.

## 5. Conclusiones y evolución

Los cuatro objetivos específicos se consideran cumplidos:

| Objetivo | Resultado |
| --- | --- |
| Requisitos | Dominio, reglas y 17 casos de uso |
| Análisis y diseño | Arquitectura modular, datos e integración local |
| Implementación | Web, chatbot, API, MongoDB y panel |
| Evaluación | Trazabilidad, build y 44 pruebas automatizadas |

```bash
npm run verify
```

La verificación comprueba la sintaxis del backend, ejecuta 44 pruebas y genera el build de producción del frontend. Las pruebas cubren fechas, horarios, servicios, nombres, solapes, concurrencia local, propiedad de conversación, entradas adversas y contingencia de LM Studio.

La inferencia local mediante LM Studio reduce la transferencia de conversaciones a terceros y elimina el coste por petición. En el entorno utilizado, con una RTX 3060 de 6 GB, se observaron tiempos aproximados de 2 a 8 segundos por respuesta generativa. El tiempo depende del modelo, la cuantización, el historial y el hardware.

Las limitaciones principales son la ejecución local, una única agenda, la ausencia de pagos y notificaciones y una cola de concurrencia válida para una sola instancia del backend.

Las líneas de evolución son la agenda multiempleado, los recordatorios, el despliegue con HTTPS, la observabilidad, la concurrencia distribuida y las pruebas end-to-end.

Corte Perfecto demuestra que es posible incorporar inteligencia artificial a un proceso real sin delegarle aquello que exige exactitud. El modelo ayuda a comprender al usuario; el sistema conserva la responsabilidad sobre la operación.

Muchas gracias.

---

[Capítulo 1](Capitulo_1/README.md) · [Capítulo 2](Capitulo_2/README.md) · [Capítulo 3](Capitulo_3/README.md) · [Capítulo 4](Capitulo_4/README.md) · [Capítulo 5](Capitulo_5/README.md) · [Memoria oficial](../../entregas/TFG_AdriánGarcíaArranz.pdf)
