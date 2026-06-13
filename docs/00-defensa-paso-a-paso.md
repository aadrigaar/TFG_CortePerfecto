# Defensa paso a paso

Esta es la ruta principal para exponer Corte Perfecto directamente desde GitHub en unos 20 minutos. La memoria oficial es el [PDF final entregado](../entregas/TFG_AdriánGarcíaArranz.pdf); el repositorio aporta la demostración ejecutable y la trazabilidad.

## 1. Idea que debe recordar el tribunal

> Corte Perfecto combina una conversación flexible ejecutada en local con reglas de negocio deterministas. La IA ayuda a entender al cliente, pero el backend decide si una cita es válida y solo la confirma después de guardarla.

Toda la exposición debe reforzar esa idea.

## 2. Qué debes tener abierto

Prepara estas pestañas, en este orden:

1. [README principal](../README.md).
2. [Capítulo 1 navegable](capitulos/01-introduccion-estado-arte-objetivos-metodologia.md).
3. [Capítulo 2 navegable](capitulos/02-requisitos-modelo-dominio.md).
4. [Arquitectura](02-arquitectura-y-decisiones.md).
5. [Trazabilidad UC-código-prueba](../RUP/99-seguimiento/trazabilidad-casos-uso.md).
6. Aplicación pública en `http://localhost:5173`.
7. Panel en `http://localhost:5173/admin/login`.
8. [Calidad y pruebas](06-calidad-seguridad-y-pruebas.md).
9. [Limitaciones](11-limitaciones-y-lineas-futuras.md).

Ten también preparadas las [capturas de respaldo](diagramas-y-capturas.md). No muestres el archivo `.env`, credenciales, correos personales ni datos internos del equipo.

## 3. Comprobación antes de entrar

Ejecuta:

```bash
npm run verify
npm run dev
```

Comprueba:

```text
http://localhost:5000/api/health
http://localhost:5000/api/health/lmstudio
http://localhost:5173
http://localhost:5173/admin/login
```

Verifica además:

- MongoDB conectado.
- LM Studio iniciado y modelo cargado.
- Fecha laborable futura con un hueco disponible para la demo.
- Login administrativo probado.
- Zoom del navegador legible.
- Notificaciones y aplicaciones personales cerradas.

## 4. Distribución de los 20 minutos

| Tiempo | Pantalla | Objetivo |
| ---: | --- | --- |
| 0:00-1:00 | README | Presentar problema, producto y aportación |
| 1:00-3:15 | Capítulo 1 | Justificar necesidad, estado del arte y alcance |
| 3:15-5:30 | Capítulo 2 | Explicar actores, dominio y casos de uso |
| 5:30-8:30 | Arquitectura | Defender diseño, tecnologías y decisiones |
| 8:30-10:00 | Trazabilidad/código | Demostrar correspondencia entre memoria y código |
| 10:00-14:00 | Aplicación | Ejecutar la historia cliente-administrador |
| 14:00-16:15 | Chatbot | Explicar pipeline híbrido y contingencias |
| 16:15-18:00 | Pruebas y seguridad | Presentar evidencia verificable |
| 18:00-19:15 | Resultados y límites | Evaluar el trabajo con criterio |
| 19:15-20:00 | README | Cerrar con aportación y evolución |

## 5. Exposición exacta

### 0:00-1:00. Apertura

**Abre:** [README principal](../README.md).

**Di:**

> “Buenos días. Soy Adrián García Arranz y presento Corte Perfecto, una plataforma web para gestionar las citas de una peluquería mediante una web pública, un chatbot con inteligencia artificial local y un panel privado de administración.”

> “El reto no era únicamente crear un chatbot. Era conseguir que una conversación terminara en una agenda consistente, sin citas pasadas, fuera de horario o solapadas.”

> “La decisión central del proyecto es separar responsabilidades: la IA conversa, pero el backend valida y decide.”

**Señala:** las tres capturas de web, chat y panel. No leas la lista completa de tecnologías.

### 1:00-3:15. Capítulo 1: problema, estado del arte y objetivos

**Abre:** [Capítulo 1](capitulos/01-introduccion-estado-arte-objetivos-metodologia.md).

**Di:**

> “La gestión por llamadas o mensajes interrumpe el trabajo, obliga a interpretar cada solicitud y termina en una transcripción manual. Esto consume tiempo y facilita errores.”

> “Analicé cuatro alternativas: agenda manual, mensajería, plataformas SaaS y chatbots generativos. Las primeras no automatizan completamente; las plataformas externas añaden coste y dependencia; y un LLM por sí solo no garantiza reglas de agenda.”

> “La propuesta combina un modelo local para lenguaje natural con una aplicación full-stack que mantiene las reglas críticas en código.”

Resume los objetivos:

1. Informar mediante una web pública.
2. Reservar, modificar y cancelar mediante conversación.
3. Gestionar la agenda desde un panel autenticado.
4. Verificar integridad, seguridad y comportamiento con pruebas.

**Aclara el alcance:**

> “No se incluyen pagos, recordatorios externos ni agenda multiempleado. Preferí completar y probar el flujo principal antes que simular funciones adicionales.”

### 3:15-5:30. Capítulo 2: requisitos y dominio

**Abre:** [Capítulo 2](capitulos/02-requisitos-modelo-dominio.md).

**Muestra:** el diagrama de contexto, los actores y el modelo de estados.

**Di:**

> “El sistema tiene dos actores: cliente y administrador. El cliente consulta y gestiona su reserva; el administrador supervisa y opera la agenda.”

> “Definí 17 casos de uso. Los más representativos son UC-05, reservar por chatbot; UC-09, modificar la reserva activa; UC-10, iniciar sesión; y UC-12 a UC-16, gestionar citas.”

> “La entidad principal es Appointment. Guarda fecha y hora visibles, pero también `startsAt` y `endsAt`, porque la duración del servicio determina el intervalo real que debe permanecer libre.”

Explica los estados:

```text
pending / confirmed -> bloquean agenda
completed / cancelled -> no bloquean agenda
```

**Frase de transición:**

> “Una vez definido qué debía hacer el sistema, el Capítulo 3 concreta cómo se separan esas responsabilidades.”

### 5:30-8:30. Capítulo 3: análisis, diseño y arquitectura

**Abre:** [Arquitectura y decisiones](02-arquitectura-y-decisiones.md).

**Señala el diagrama por capas y di:**

> “React y Vite implementan la presentación. Axios comunica el frontend con una API Express. El backend separa rutas, controladores, servicios y modelos Mongoose. MongoDB persiste la agenda y LM Studio ejecuta el modelo de lenguaje en local.”

Defiende cuatro decisiones:

1. **IA local**

   > “LM Studio evita enviar la conversación a una API externa, elimina coste por petición y permite trabajar con un contrato compatible con OpenAI.”

2. **Reglas en backend**

   > “El modelo no calcula disponibilidad ni escribe directamente. `appointmentService` comprueba catálogo, fecha, horario, duración, solapes y propiedad de conversación.”

3. **Monolito modular**

   > “Para una aplicación local y un único equipo, los microservicios añadirían despliegue y coordinación sin beneficio suficiente. La modularidad interna ya separa las responsabilidades.”

4. **Catálogo único**

   > “Precio y duración se recalculan en servidor desde una única fuente. El cliente no puede alterar el precio enviado.”

**Muestra si te lo piden:**

- [API y datos](04-api-y-datos.md).
- [`Appointment.js`](../backend/src/models/Appointment.js).
- [`appointmentService.js`](../backend/src/services/appointmentService.js).
- [`serviceCatalog.js`](../backend/src/config/serviceCatalog.js).

### 8:30-10:00. Correspondencia entre memoria y código

**Abre:** [Matriz de trazabilidad](../RUP/99-seguimiento/trazabilidad-casos-uso.md).

**Di:**

> “La memoria no queda separada del producto. Cada caso de uso se relaciona con una entrada, una vista o controlador, un servicio, un modelo y una evidencia de prueba.”

Usa un único ejemplo:

```text
Evitar solapes
-> UC-05, UC-09, UC-13 y UC-14
-> POST/PATCH de citas
-> appointmentService
-> Appointment.startsAt y endsAt
-> appointmentService.test.js
```

Después muestra:

- [`chatController.js`](../backend/src/controllers/chatController.js): orquesta el mensaje.
- [`bookingFlowService.js`](../backend/src/services/bookingFlowService.js): dirige reserva y cambios.
- [`ChatWidget.jsx`](../frontend/src/components/ChatWidget.jsx): conversación del cliente.
- [`AdminAppointments.jsx`](../frontend/src/pages/admin/AdminAppointments.jsx): agenda del profesional.

No recorras todos los archivos. El objetivo es demostrar la cadena completa, no hacer una lectura de código.

### 10:00-14:00. Demostración funcional

**Abre:** `http://localhost:5173`.

#### Paso A. Web pública, 30 segundos

Muestra catálogo y entrada al chat.

> “La web informa al cliente y consume el catálogo que el backend sincroniza. Las descripciones comerciales son contenido de prototipo; la evidencia técnica está en el flujo de reserva.”

#### Paso B. Pregunta determinista, 30 segundos

Escribe:

```text
¿Qué servicios tenéis y cuánto cuestan?
```

> “Esta pregunta se resuelve con reglas y el catálogo oficial. No hace falta confiar en la memoria del modelo para precios o duración.”

#### Paso C. Regla inválida, 30 segundos

Escribe una fecha de sábado:

```text
Quiero reservar un corte el próximo sábado a las cinco.
```

> “El rechazo de fin de semana procede del backend y no crea una cita.”

Si el tiempo va justo, omite este paso.

#### Paso D. Reserva válida, 90 segundos

Usa:

```text
Quiero reservar la opción 4.
Me llamo Adrián Demo.
El próximo martes a las cinco de la tarde.
```

Comprueba antes que ese martes es futuro, laborable y está libre.

> “El flujo conserva contexto, normaliza fecha y hora, calcula la duración, comprueba solapes y confirma únicamente después de persistir.”

#### Paso E. Panel, 60 segundos

Abre `http://localhost:5173/admin/login`, inicia sesión y busca la cita.

> “Chat y administración comparten MongoDB. El profesional recibe la reserva sin transcribir el mensaje y puede editarla, completarla o eliminarla.”

No hagas varias operaciones. Basta con localizar la misma cita y, si hay tiempo, marcarla como completada.

### 14:00-16:15. Diseño del chatbot

**Abre:** [Chatbot y reglas](05-chatbot-y-reglas.md).

**Explica el pipeline:**

```text
Entrada y límites
-> flujo determinista de reserva
-> reglas informativas
-> LM Studio para preguntas abiertas
-> filtrado
-> validación y persistencia
```

**Di:**

> “El servidor limita mensaje, historial e identificadores. Después intenta resolver reserva, corrección o cancelación. Las preguntas conocidas también se contestan sin IA. Solo lo que queda abierto llega a LM Studio.”

> “Si LM Studio no responde, el sistema entra en modo degradado: siguen funcionando horarios, servicios y reservas deterministas, y nunca se genera una confirmación falsa.”

**Componentes clave:**

- [`chatRequestService.js`](../backend/src/services/chatRequestService.js): saneamiento y límites.
- [`chatRuleService.js`](../backend/src/services/chatRuleService.js): preguntas conocidas y defensa de dominio.
- [`bookingFlowService.js`](../backend/src/services/bookingFlowService.js): estado conversacional.
- [`lmStudioService.js`](../backend/src/services/lmStudioService.js): llamada local.
- [`responseParserService.js`](../backend/src/services/responseParserService.js): filtrado.

### 16:15-18:00. Calidad, pruebas y seguridad

**Abre:** [Calidad y pruebas](06-calidad-seguridad-y-pruebas.md).

**Di:**

> “El repositorio dispone de un comando único de verificación. Comprueba sintaxis de backend, ejecuta 44 pruebas automatizadas y genera el build de producción del frontend.”

```bash
npm run verify
```

Destaca únicamente estos riesgos:

- Fecha pasada o fin de semana.
- Servicio que termina después del cierre.
- Dos citas solapadas o simultáneas.
- Modificación desde otra conversación.
- Entrada adversa o intento de revelar el prompt.
- Caída de LM Studio.

Seguridad:

> “Las contraseñas se almacenan con bcrypt; las rutas privadas requieren JWT; Helmet, CORS y rate limiting protegen la API; y los secretos quedan fuera de Git.”

Aclara:

> “Es una base adecuada al alcance académico y local. Un despliegue público exigiría HTTPS, secretos gestionados, auditoría, copias y medidas organizativas de RGPD.”

### 18:00-19:15. Resultados, limitaciones y futuro

**Abre:** [Limitaciones y futuro](11-limitaciones-y-lineas-futuras.md).

**Di:**

> “El resultado cubre el recorrido completo: el cliente consulta y reserva; el backend valida y persiste; y el administrador gestiona la misma agenda.”

> “Las principales limitaciones son la ejecución local, una única agenda, la ausencia de pagos y notificaciones, y una cola de concurrencia válida para una sola instancia.”

Prioriza tres evoluciones:

1. Recordatorios y confirmaciones.
2. Agenda multiempleado.
3. Despliegue con concurrencia distribuida y observabilidad.

> “Estas limitaciones no se ocultan: separan lo que está demostrado de lo que sería una siguiente iteración.”

### 19:15-20:00. Cierre

**Vuelve:** [README principal](../README.md).

**Di:**

> “Corte Perfecto demuestra que se puede incorporar inteligencia artificial a un proceso real sin delegarle aquello que exige exactitud.”

> “La aportación principal es combinar conversación local, reglas verificables y administración integrada. El cliente obtiene atención inmediata y el profesional conserva el control de la agenda.”

> “Como evolución, priorizaría recordatorios, agenda multiempleado y un despliegue preparado para varias instancias. Muchas gracias.”

Detente después de “Muchas gracias”.

## 6. Qué no debes afirmar

No digas:

- “El chatbot nunca falla.”
- “Está preparado para producción.”
- “Cumple automáticamente todo el RGPD por usar IA local.”
- “Las reseñas, dirección o valoración de la portada son métricas verificadas.”
- “Los DOCX por capítulos son idénticos al PDF final.”

Di:

- “Los fallos previsibles están acotados y las operaciones críticas no dependen del modelo.”
- “El alcance es académico y local, con una ruta de evolución documentada.”
- “La inferencia local reduce transferencias a terceros, pero el cumplimiento requiere medidas adicionales.”
- “El contenido comercial de la portada es representativo del prototipo.”
- “El PDF entregado es la fuente oficial; los DOCX conservan etapas intermedias.”

## 7. Contingencias

### LM Studio no responde

Haz una pregunta de horario y una reserva. Di:

> “El modo degradado demuestra que las reglas críticas no dependen del modelo generativo.”

### MongoDB no responde

No repitas la reserva. Abre las [capturas](diagramas-y-capturas.md) y di:

> “La aplicación no confirma porque la persistencia es obligatoria. El endpoint de salud permite aislar la incidencia.”

### La demo consume demasiado tiempo

Omite la prueba de sábado y muestra directamente reserva más panel.

### GitHub o red no están disponibles

Mantén el repositorio clonado y las páginas importantes abiertas previamente. La aplicación funciona en local una vez instaladas las dependencias.

## 8. Respuesta a preguntas

Usa esta fórmula:

```text
Respuesta directa
-> decisión técnica
-> evidencia en código o prueba
-> límite reconocido
```

Ejemplo:

> “MongoDB se eligió porque la cita es un documento autocontenido y Mongoose aporta esquema e índices. La evidencia está en `Appointment.js` y `appointmentService.js`. Una base relacional también sería válida; fue una decisión de adecuación y sencillez local.”

Prepara las [preguntas previsibles del tribunal](10-preguntas-del-tribunal.md).

## 9. Ensayo

Haz tres ensayos:

1. Sin demo, para dominar la explicación.
2. Con demo y cronómetro.
3. Simulando una caída de LM Studio.

Objetivo: terminar entre 18:30 y 19:30. El minuto restante absorbe cambios de pestaña y pequeñas pausas.

## 10. Tarjeta de memoria

```text
Problema: interrupciones y errores manuales
Propuesta: web + chatbot local + panel
Requisitos: 2 actores y 17 casos de uso
Arquitectura: React -> Express -> servicios -> MongoDB / LM Studio
Clave: IA conversa, backend decide
Evidencia: reserva visible en panel + 44 pruebas
Límites: local, una agenda, sin pagos ni avisos
Aportación: flexibilidad conversacional con integridad verificable
```

[Abrir guion oral](09-guion-defensa-20-min.md) · [Abrir demo detallada](08-demo-defensa.md) · [Abrir preguntas](10-preguntas-del-tribunal.md)
